import { describe, expect, it, vi } from "vitest";

import { ContributionRunner } from "../src/core/contribution-runner.js";
import { InMemoryEvidenceRecorder } from "../src/core/evidence-recorder.js";
import { DeterministicExecutor } from "../src/core/executor.js";
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
  completionCriteria: ["execution completed"],
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
  it("executes a contribution and records execution evidence after governance allows it", () => {
    const executor = new DeterministicExecutor();

    const executeSpy = vi.spyOn(executor, "execute");

    const runner = new ContributionRunner(
      new DeterministicPolicyEngine(),
      new InMemoryEvidenceRecorder(),
      executor
    );

    const result = runner.run({
      contribution,
      policies: [sourceScopePolicy],
      requestedCapabilityId: "source.write",
      requestedTarget: "src/domain/work-item.ts",
    });

    expect(result.status).toBe("executed");
    expect(executeSpy).toHaveBeenCalledOnce();

    expect(result.execution).toMatchObject({
      status: "succeeded",
      contributionId: "contribution-001",
      capabilityId: "source.write",
    });

    expect(result.evidence).toHaveLength(3);

    expect(result.evidence[0]?.type).toBe(
      "capability-result"
    );
    expect(result.evidence[0]?.metadata).toMatchObject({
      capabilityId: "source.write",
      granted: true,
    });

    expect(result.evidence[1]?.type).toBe(
      "policy-result"
    );
    expect(result.evidence[1]?.metadata).toMatchObject({
      allowed: true,
    });

    expect(result.evidence[2]?.type).toBe(
      "command-output"
    );
    expect(result.evidence[2]?.metadata).toMatchObject({
      capabilityId: "source.write",
      status: "succeeded",
    });
  });

  it("never reaches execution or records execution evidence when policy blocks the action", () => {
    const executor = new DeterministicExecutor();

    const executeSpy = vi.spyOn(executor, "execute");

    const runner = new ContributionRunner(
      new DeterministicPolicyEngine(),
      new InMemoryEvidenceRecorder(),
      executor
    );

    const result = runner.run({
      contribution,
      policies: [sourceScopePolicy],
      requestedCapabilityId: "source.write",
      requestedTarget: "README.md",
    });

    expect(result.status).toBe("blocked");

    expect(executeSpy).not.toHaveBeenCalled();
    expect(result.execution).toBeUndefined();

    expect(result.evidence).toHaveLength(2);

    expect(result.evidence[0]?.type).toBe(
      "capability-result"
    );
    expect(result.evidence[0]?.metadata).toMatchObject({
      capabilityId: "source.write",
      granted: true,
    });

    expect(result.evidence[1]?.type).toBe(
      "policy-result"
    );
    expect(result.evidence[1]?.metadata).toMatchObject({
      allowed: false,
      action: "deny",
    });

    expect(
      result.evidence.some(
        (evidence) =>
          evidence.type === "command-output"
      )
    ).toBe(false);
  });

  it("blocks execution and records only capability evidence when the capability is not granted", () => {
    const executor = new DeterministicExecutor();

    const executeSpy = vi.spyOn(executor, "execute");

    const runner = new ContributionRunner(
      new DeterministicPolicyEngine(),
      new InMemoryEvidenceRecorder(),
      executor
    );

    const result = runner.run({
      contribution,
      policies: [sourceScopePolicy],
      requestedCapabilityId: "deployment.execute",
      requestedTarget: "src/domain/work-item.ts",
    });

    expect(result.status).toBe("blocked");

    expect(executeSpy).not.toHaveBeenCalled();
    expect(result.execution).toBeUndefined();

    expect(result.evidence).toHaveLength(1);

    expect(result.evidence[0]?.type).toBe(
      "capability-result"
    );
    expect(result.evidence[0]?.metadata).toMatchObject({
      capabilityId: "deployment.execute",
      granted: false,
      reason:
        "Capability is not granted to this contribution.",
    });

    expect(
      result.evidence.some(
        (evidence) =>
          evidence.type === "command-output"
      )
    ).toBe(false);
  });
});