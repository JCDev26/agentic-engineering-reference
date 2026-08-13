import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import { ContributionRunner } from "../src/core/contribution-runner.js";
  import { InMemoryEvidenceRecorder } from "../src/core/evidence-recorder.js";
  import type { Executor } from "../src/core/executor.js";
  import { DeterministicExecutor } from "../src/core/executor.js";
  import { DeterministicPolicyEngine } from "../src/core/policy-engine.js";
  
  import type { Contribution } from "../src/domain/contribution.js";
  import type { Policy } from "../src/domain/policy.js";
  
  const contribution: Contribution = {
    id:
      "contribution-causality-001",
    workflowId:
      "workflow-causality-001",
    stageId: "implementation",
    objective:
      "Perform bounded source work.",
    scope: ["src/"],
    contributorProfileId:
      "implementer",
    capabilityIds: [
      "source.write",
    ],
    policyIds: [
      "source-scope",
    ],
    evidenceRequirements: [
      "capability-result",
      "policy-result",
      "command-output",
    ],
    completionCriteria: [
      "Execution completes.",
    ],
  };
  
  const sourceScopePolicy: Policy = {
    id: "source-scope",
    rule:
      "Contribution may operate only within src/.",
    scope: ["src/"],
    enforcementPoint:
      "capability-request",
    failureBehavior: "deny",
    severity: "high",
  };
  
  function runner(
    executor: Executor
  ): ContributionRunner {
    return new ContributionRunner(
      new DeterministicPolicyEngine(),
      new InMemoryEvidenceRecorder(),
      executor
    );
  }
  
  describe("Contribution failure causality", () => {
    it("keeps capability, policy, and execution failures distinguishable at the contribution boundary", () => {
      const capabilityFailure =
        runner(
          new DeterministicExecutor()
        ).run({
          contribution,
          policies: [
            sourceScopePolicy,
          ],
          requestedCapabilityId:
            "deployment.execute",
          requestedTarget:
            "src/example.ts",
        });
  
      const policyFailure =
        runner(
          new DeterministicExecutor()
        ).run({
          contribution,
          policies: [
            sourceScopePolicy,
          ],
          requestedCapabilityId:
            "source.write",
          requestedTarget:
            "README.md",
        });
  
      const failingExecutor:
        Executor = {
          execute: (
            request
          ) => ({
            status: "failed",
            contributionId:
              request.contribution.id,
            capabilityId:
              request.capabilityId,
            summary:
              "Executor failed.",
          }),
        };
  
      const executionFailure =
        runner(
          failingExecutor
        ).run({
          contribution,
          policies: [
            sourceScopePolicy,
          ],
          requestedCapabilityId:
            "source.write",
          requestedTarget:
            "src/example.ts",
        });
  
      expect(
        capabilityFailure
          .failureReason
      ).toBe(
        "capability-denied"
      );
  
      expect(
        policyFailure
          .failureReason
      ).toBe(
        "policy-denied"
      );
  
      expect(
        executionFailure
          .failureReason
      ).toBe(
        "execution-failed"
      );
  
      expect(
        new Set([
          capabilityFailure
            .failureReason,
          policyFailure
            .failureReason,
          executionFailure
            .failureReason,
        ]).size
      ).toBe(3);
    });
  
    it("preserves evidence while exposing structured failure causes", () => {
      const capabilityFailure =
        runner(
          new DeterministicExecutor()
        ).run({
          contribution,
          policies: [
            sourceScopePolicy,
          ],
          requestedCapabilityId:
            "deployment.execute",
          requestedTarget:
            "src/example.ts",
        });
  
      const policyFailure =
        runner(
          new DeterministicExecutor()
        ).run({
          contribution,
          policies: [
            sourceScopePolicy,
          ],
          requestedCapabilityId:
            "source.write",
          requestedTarget:
            "README.md",
        });
  
      expect(
        capabilityFailure.evidence.map(
          (evidence) =>
            evidence.type
        )
      ).toEqual([
        "capability-result",
      ]);
  
      expect(
        policyFailure.evidence.map(
          (evidence) =>
            evidence.type
        )
      ).toEqual([
        "capability-result",
        "policy-result",
      ]);
  
      expect(
        capabilityFailure
          .failureReason
      ).toBeDefined();
  
      expect(
        policyFailure
          .failureReason
      ).toBeDefined();
    });
  });