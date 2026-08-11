// src/core/policy-engine.ts

import type {
    Policy,
    PolicyContext,
    PolicyDecision,
  } from "../domain/policy.js";
  
  export interface PolicyEngine {
    evaluate(
      policies: Policy[],
      context: PolicyContext
    ): PolicyDecision[];
  }
  
  export class DeterministicPolicyEngine implements PolicyEngine {
    evaluate(
      policies: Policy[],
      context: PolicyContext
    ): PolicyDecision[] {
      return policies.map((policy) => {
        const inScope =
          policy.scope.length === 0 ||
          !context.requestedTarget ||
          policy.scope.some((scope) =>
            context.requestedTarget!.startsWith(scope)
          );
  
        if (!inScope) {
          return {
            allowed: false,
            policyId: policy.id,
            reason: `Requested target is outside policy scope.`,
            action: policy.failureBehavior,
          };
        }
  
        return {
          allowed: true,
          policyId: policy.id,
        };
      });
    }
  }