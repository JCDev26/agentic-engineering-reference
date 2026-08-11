import type { Evidence } from "../domain/evidence.js";
import type {
  PolicyContext,
  PolicyDecision,
} from "../domain/policy.js";

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
}