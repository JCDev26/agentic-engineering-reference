import type {
  Policy,
  PolicyContext,
  PolicyDecision,
} from "../domain/policy.js";

export interface PolicyEngine {
  evaluate(policies: Policy[], context: PolicyContext): PolicyDecision[];
}

/**
 * Logical targets use canonical relative slash paths or colon-delimited resource
 * names. No decoding or filesystem resolution occurs here. Real executors must
 * separately enforce filesystem, symlink, identity, and network boundaries.
 */
function canonicalTarget(value: string): boolean {
  return (
    value.length > 0 &&
    value.trim() === value &&
    !/[\\%\u0000-\u001f\u007f]/.test(value) &&
    !value.startsWith("/") &&
    !/^[A-Za-z]:\//.test(value) &&
    !value.includes("//") &&
    !value.split("/").some((segment) => segment === "." || segment === "..")
  );
}

function withinScope(target: string, scope: string): boolean {
  if (!canonicalTarget(target) || !canonicalTarget(scope)) return false;
  if (scope.endsWith("/") || scope.endsWith(":")) {
    return target.startsWith(scope) && target.length > scope.length;
  }
  return (
    target === scope ||
    target.startsWith(`${scope}/`) ||
    target.startsWith(`${scope}:`)
  );
}

export class DeterministicPolicyEngine implements PolicyEngine {
  evaluate(policies: Policy[], context: PolicyContext): PolicyDecision[] {
    return policies.map((policy) => {
      const inScope =
        policy.scope.length === 0 ||
        (context.requestedTarget !== undefined &&
          policy.scope.some((scope) =>
            withinScope(context.requestedTarget!, scope),
          ));

      return inScope
        ? { allowed: true, policyId: policy.id }
        : {
            allowed: false,
            policyId: policy.id,
            reason: "Requested target is outside policy scope.",
            action: policy.failureBehavior,
          };
    });
  }
}
