import type { Evidence } from "../domain/evidence.js";
import type {
  PolicyContext,
  PolicyDecision,
} from "../domain/policy.js";

export interface EvidenceRecorder {
  recordPolicyDecision(
    context: PolicyContext,
    decision: PolicyDecision
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
}