import type { Evidence } from "../domain/evidence.js";
import type {
  PolicyContext,
  PolicyDecision,
} from "../domain/policy.js";
import type { ExecutionResult } from "./executor.js";

export interface CapabilityDecision {
  contributionId: string;
  capabilityId: string;
  granted: boolean;
  reason?: string;
}

export interface EvidenceRecorder {
  recordPolicyDecision(
    context: PolicyContext,
    decision: PolicyDecision
  ): Evidence;

  recordCapabilityDecision(
    decision: CapabilityDecision
  ): Evidence;

  recordExecutionResult(
    result: ExecutionResult
  ): Evidence;
}

export class InMemoryEvidenceRecorder implements EvidenceRecorder {
  recordPolicyDecision(
    context: PolicyContext,
    decision: PolicyDecision
  ): Evidence {
    return {
      id: crypto.randomUUID(),
      contributionId: context.contributionId,
      type: "policy-result",
      timestamp: new Date().toISOString(),
      contentReference: `policy:${decision.policyId}`,
      producer: "deterministic-policy-engine",
      metadata: {
        requestedCapabilityId: context.requestedCapabilityId,
        requestedTarget: context.requestedTarget,
        allowed: decision.allowed,
        ...(decision.allowed
          ? {}
          : {
            reason: decision.reason,
            action: decision.action,
          }),
      },
    };
  }

  recordCapabilityDecision(
    decision: CapabilityDecision
  ): Evidence {
    return {
      id: crypto.randomUUID(),
      contributionId: decision.contributionId,
      type: "capability-result",
      timestamp: new Date().toISOString(),
      contentReference: `capability:${decision.capabilityId}`,
      producer: "contribution-runner",
      metadata: {
        capabilityId: decision.capabilityId,
        granted: decision.granted,
        ...(decision.reason !== undefined
          ? { reason: decision.reason }
          : {}),
      },
    };
  }

  recordExecutionResult(
    result: ExecutionResult
  ): Evidence {
    return {
      id: crypto.randomUUID(),
      contributionId: result.contributionId,
      type: "command-output",
      timestamp: new Date().toISOString(),
      contentReference: `execution:${result.contributionId}`,
      producer: "executor",
      metadata: {
        capabilityId: result.capabilityId,
        status: result.status,
        summary: result.summary,
        artifactReferences:
          result.artifacts?.map(
            (artifact) => artifact.contentReference
          ) ?? [],
      },
    };
  }
}