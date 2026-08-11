import { describe, expect, it } from "vitest";
import { DeterministicPolicyEngine } from "../src/core/policy-engine.js";
import type { Policy, PolicyContext } from "../src/domain/policy.js";

const engine = new DeterministicPolicyEngine();

const policy: Policy = {
  id: "source-scope",
  rule: "Contribution may modify only files within src/",
  scope: ["src/"],
  enforcementPoint: "capability-request",
  failureBehavior: "deny",
  severity: "high",
};

describe("DeterministicPolicyEngine", () => {
  it("allows a requested target within policy scope", () => {
    const context: PolicyContext = {
      contributionId: "contribution-001",
      requestedTarget: "src/domain/work-item.ts",
    };

    const decisions = engine.evaluate([policy], context);

    expect(decisions).toEqual([
      {
        allowed: true,
        policyId: "source-scope",
      },
    ]);
  });

  it("denies a requested target outside policy scope", () => {
    const context: PolicyContext = {
      contributionId: "contribution-001",
      requestedTarget: "README.md",
    };

    const decisions = engine.evaluate([policy], context);

    expect(decisions).toEqual([
      {
        allowed: false,
        policyId: "source-scope",
        reason: "Requested target is outside policy scope.",
        action: "deny",
      },
    ]);
  });
});