// src/domain/policy.ts

export type PolicyEnforcementPoint =
  | "preflight"
  | "capability-request"
  | "tool-invocation"
  | "workflow-transition"
  | "delivery"
  | "deployment";

export type PolicyFailureBehavior =
  | "deny"
  | "require-approval"
  | "escalate"
  | "retry"
  | "terminate-workflow";

export interface Policy {
  id: string;
  rule: string;
  scope: string[];
  enforcementPoint: PolicyEnforcementPoint;
  failureBehavior: PolicyFailureBehavior;

  severity?: "low" | "medium" | "high" | "critical";
  evidenceRequirement?: string;
}

export interface PolicyContext {
  contributionId: string;
  requestedCapabilityId?: string;
  requestedTarget?: string;
  metadata?: Record<string, unknown>;
}

export type PolicyDecision =
  | {
      allowed: true;
      policyId: string;
    }
  | {
      allowed: false;
      policyId: string;
      reason: string;
      action: PolicyFailureBehavior;
    };