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

export interface ContributionRunResult {
    status: ContributionRunStatus;
    contributionId: string;
    evidence: Evidence[];
    execution?: ExecutionResult;
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
    ) { }

    run(request: ContributionExecutionRequest): ContributionRunResult {
        const capabilityGranted =
            request.contribution.capabilityIds.includes(
                request.requestedCapabilityId
            );

        if (!capabilityGranted) {
            return {
                status: "blocked",
                contributionId: request.contribution.id,
                evidence: [],
            };
        }

        const context: PolicyContext = {
            contributionId: request.contribution.id,
            requestedCapabilityId: request.requestedCapabilityId,
            ...(request.requestedTarget !== undefined
                ? { requestedTarget: request.requestedTarget }
                : {}),
        };

        const decisions = this.policyEngine.evaluate(
            request.policies,
            context
        );

        const evidence = decisions.map((decision) =>
            this.evidenceRecorder.recordPolicyDecision(context, decision)
        );

        const blocked = decisions.some((decision) => !decision.allowed);

        if (blocked) {
            return {
                status: "blocked",
                contributionId: request.contribution.id,
                evidence,
            };
        }

        const execution = this.executor.execute({
            contribution: request.contribution,
            capabilityId: request.requestedCapabilityId,
            ...(request.requestedTarget !== undefined
                ? { target: request.requestedTarget }
                : {}),
        });

        return {
            status:
                execution.status === "succeeded"
                    ? "executed"
                    : "execution-failed",
            contributionId: request.contribution.id,
            evidence,
            execution,
        };
    }
}