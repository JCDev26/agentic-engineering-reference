import type { Contribution } from "../domain/contribution.js";
import type { Evidence } from "../domain/evidence.js";
import type { Policy, PolicyContext } from "../domain/policy.js";

import type { EvidenceRecorder } from "./evidence-recorder.js";
import type {
  ExecutionResult,
  Executor,
} from "./executor.js";
import type { PolicyEngine } from "./policy-engine.js";

export type ContributionRunStatus =
  | "blocked"
  | "executed"
  | "execution-failed";

export type ContributionFailureReason =
  | "capability-denied"
  | "policy-denied"
  | "execution-failed";

export interface ContributionRunResult {
  status: ContributionRunStatus;
  contributionId: string;
  evidence: Evidence[];
  execution?: ExecutionResult;
  failureReason?: ContributionFailureReason;
}

export interface ContributionExecutionRequest {
  contribution: Contribution;
  policies: Policy[];
  requestedCapabilityId: string;
  requestedTarget?: string;
}

export class ContributionRunner {
  constructor(
    private readonly policyEngine: PolicyEngine,
    private readonly evidenceRecorder: EvidenceRecorder,
    private readonly executor: Executor
  ) {}

  run(
    request: ContributionExecutionRequest
  ): ContributionRunResult {
    const capabilityGranted =
      request.contribution.capabilityIds.includes(
        request.requestedCapabilityId
      );

    const capabilityEvidence =
      this.evidenceRecorder.recordCapabilityDecision({
        contributionId: request.contribution.id,
        capabilityId: request.requestedCapabilityId,
        granted: capabilityGranted,
        ...(!capabilityGranted
          ? {
              reason:
                "Capability is not granted to this contribution.",
            }
          : {}),
      });

    if (!capabilityGranted) {
      return {
        status: "blocked",
        contributionId: request.contribution.id,
        failureReason: "capability-denied",
        evidence: [capabilityEvidence],
      };
    }

    const context: PolicyContext = {
      contributionId: request.contribution.id,
      requestedCapabilityId:
        request.requestedCapabilityId,
      ...(request.requestedTarget !== undefined
        ? {
            requestedTarget:
              request.requestedTarget,
          }
        : {}),
    };

    const decisions =
      this.policyEngine.evaluate(
        request.policies,
        context
      );

    const policyEvidence =
      decisions.map((decision) =>
        this.evidenceRecorder.recordPolicyDecision(
          context,
          decision
        )
      );

    const preExecutionEvidence = [
      capabilityEvidence,
      ...policyEvidence,
    ];

    const blocked = decisions.some(
      (decision) => !decision.allowed
    );

    if (blocked) {
      return {
        status: "blocked",
        contributionId: request.contribution.id,
        failureReason: "policy-denied",
        evidence: preExecutionEvidence,
      };
    }

    const execution =
      this.executor.execute({
        contribution: request.contribution,
        capabilityId:
          request.requestedCapabilityId,
        ...(request.requestedTarget !==
        undefined
          ? {
              target:
                request.requestedTarget,
            }
          : {}),
      });

    const executionEvidence =
      this.evidenceRecorder.recordExecutionResult(
        execution
      );

    if (execution.status === "failed") {
      return {
        status: "execution-failed",
        contributionId: request.contribution.id,
        failureReason: "execution-failed",
        evidence: [
          ...preExecutionEvidence,
          executionEvidence,
        ],
        execution,
      };
    }

    return {
      status: "executed",
      contributionId: request.contribution.id,
      evidence: [
        ...preExecutionEvidence,
        executionEvidence,
      ],
      execution,
    };
  }
}