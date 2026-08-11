import { describe, expect, it } from "vitest";

import { ContributionRunner } from "../src/core/contribution-runner.js";
import { InMemoryEvidenceRecorder } from "../src/core/evidence-recorder.js";
import { DeterministicPolicyEngine } from "../src/core/policy-engine.js";

import type { Contribution } from "../src/domain/contribution.js";
import type { Policy } from "../src/domain/policy.js";

const contribution: Contribution = {
  id: "contribution-001",
  workflowId: "workflow-001",
  stageId: "implementation",
  objective: "Modify approved source code",
  scope: ["src/"],
  contributorProfileId: "implementer",
  capabilityIds: ["source.write"],
  policyIds: ["source-scope"],
  evidenceRequirements: ["policy-result"],
  completionCriteria: ["policy evaluation completed"],
};

const sourceScopePolicy: Policy = {
  id: "source-scope",
  rule: "Contribution may modify only files within src/",
  scope: ["src/"],
  enforcementPoint: "capability-request",
  failureBehavior: "deny",
  severity: "high",
};

describe("ContributionRunner", () => {
  it("allows a contribution when all policies allow the requested action", () => {
    const runner = new ContributionRunner(
      new DeterministicPolicyEngine(),
      new InMemoryEvidenceRecorder()
    );

    const result = runner.run({
      contribution,
      policies: [sourceScopePolicy],
      requestedCapabilityId: "source.write",
      requestedTarget: "src/domain/work-item.ts",
    });

    expect(result.status).toBe("allowed");
    expect(result.contributionId).toBe("contribution-001");
    expect(result.evidence).toHaveLength(1);
    expect(result.evidence[0]?.type).toBe("policy-result");
    expect(result.evidence[0]?.metadata).toMatchObject({
      allowed: true,
    });
  });

  it("blocks a contribution when any policy denies the requested action", () => {
    const runner = new ContributionRunner(
      new DeterministicPolicyEngine(),
      new InMemoryEvidenceRecorder()
    );

    const result = runner.run({
      contribution,
      policies: [sourceScopePolicy],
      requestedCapabilityId: "source.write",
      requestedTarget: "README.md",
    });

    expect(result.status).toBe("blocked");
    expect(result.evidence).toHaveLength(1);
    expect(result.evidence[0]?.metadata).toMatchObject({
      allowed: false,
      action: "deny",
    });
  });
});