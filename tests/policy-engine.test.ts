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
  it.each([
    undefined,
    "",
    "src-evil/file.ts",
    "src/../README.md",
    "src/./file.ts",
    "src\\..\\README.md",
    "src/%2e%2e/README.md",
    "/src/file.ts",
    "src//file.ts",
  ])("denies a missing, ambiguous, or escaping scoped target: %s", (target) => {
    const decisions = engine.evaluate([policy], {
      contributionId: "contribution-001",
      ...(target !== undefined ? { requestedTarget: target } : {}),
    });
    expect(decisions[0]?.allowed).toBe(false);
  });

  it("matches boundaries even when a scope has no trailing delimiter", () => {
    const boundedPolicy = { ...policy, scope: ["src/users"] };
    for (const target of ["src/users", "src/users/create.ts"]) {
      expect(
        engine.evaluate([boundedPolicy], {
          contributionId: "c",
          requestedTarget: target,
        })[0]?.allowed,
      ).toBe(true);
    }
    expect(
      engine.evaluate([boundedPolicy], {
        contributionId: "c",
        requestedTarget: "src/users-other/create.ts",
      })[0]?.allowed,
    ).toBe(false);
  });

  it("supports explicit resource namespaces without granting sibling namespaces", () => {
    const resourcePolicy = { ...policy, scope: ["reference-app:"] };
    expect(
      engine.evaluate([resourcePolicy], {
        contributionId: "c",
        requestedTarget: "reference-app:user-creator:safe",
      })[0]?.allowed,
    ).toBe(true);
    expect(
      engine.evaluate([resourcePolicy], {
        contributionId: "c",
        requestedTarget: "reference-app-other:user",
      })[0]?.allowed,
    ).toBe(false);
  });

  it("permits targetless operations only when the policy declares no target scope", () => {
    expect(
      engine.evaluate([{ ...policy, scope: [] }], { contributionId: "c" })[0]
        ?.allowed,
    ).toBe(true);
  });

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
