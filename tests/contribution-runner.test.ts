import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { ContributionRunner } from "../src/core/contribution-runner.js";
import { InMemoryEvidenceRecorder } from "../src/core/evidence-recorder.js";
import type {
  ExecutionRequest,
  ExecutionResult,
  Executor,
} from "../src/core/executor.js";
import { DeterministicExecutor } from "../src/core/executor.js";
import { DeterministicPolicyEngine } from "../src/core/policy-engine.js";

import type { Contribution } from "../src/domain/contribution.js";
import type { Policy } from "../src/domain/policy.js";

function contribution(): Contribution {
  return {
    id: "contribution-001",
    workflowId: "workflow-001",
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
      "Execution succeeds.",
    ],
  };
}

function sourcePolicy(): Policy {
  return {
    id: "source-scope",
    rule:
      "Source writes must remain within src.",
    scope: ["src/"],
    enforcementPoint:
      "capability-request",
    failureBehavior: "deny",
    severity: "high",
  };
}

describe("ContributionRunner", () => {
  it("executes an allowed contribution without a failure reason", () => {
    const runner =
      new ContributionRunner(
        new DeterministicPolicyEngine(),
        new InMemoryEvidenceRecorder(),
        new DeterministicExecutor()
      );

    const result =
      runner.run({
        contribution:
          contribution(),
        policies: [
          sourcePolicy(),
        ],
        requestedCapabilityId:
          "source.write",
        requestedTarget:
          "src/example.ts",
      });

    expect(
      result.status
    ).toBe("executed");

    expect(
      result.failureReason
    ).toBeUndefined();

    expect(
      result.execution?.status
    ).toBe("succeeded");

    expect(
      result.evidence.map(
        (evidence) =>
          evidence.type
      )
    ).toEqual([
      "capability-result",
      "policy-result",
      "command-output",
    ]);
  });

  it("returns policy-denied when deterministic policy prevents execution", () => {
    const execute = vi.fn(
      (
        request: ExecutionRequest
      ): ExecutionResult => ({
        status: "succeeded",
        contributionId:
          request.contribution.id,
        capabilityId:
          request.capabilityId,
        summary:
          "Should not execute.",
      })
    );

    const executor: Executor = {
      execute,
    };

    const runner =
      new ContributionRunner(
        new DeterministicPolicyEngine(),
        new InMemoryEvidenceRecorder(),
        executor
      );

    const result =
      runner.run({
        contribution:
          contribution(),
        policies: [
          sourcePolicy(),
        ],
        requestedCapabilityId:
          "source.write",
        requestedTarget:
          "README.md",
      });

    expect(
      result.status
    ).toBe("blocked");

    expect(
      result.failureReason
    ).toBe(
      "policy-denied"
    );

    expect(
      execute
    ).not.toHaveBeenCalled();

    expect(
      result.evidence.map(
        (evidence) =>
          evidence.type
      )
    ).toEqual([
      "capability-result",
      "policy-result",
    ]);
  });

  it("returns capability-denied when the requested capability is not granted", () => {
    const execute = vi.fn(
      (
        request: ExecutionRequest
      ): ExecutionResult => ({
        status: "succeeded",
        contributionId:
          request.contribution.id,
        capabilityId:
          request.capabilityId,
        summary:
          "Should not execute.",
      })
    );

    const executor: Executor = {
      execute,
    };

    const runner =
      new ContributionRunner(
        new DeterministicPolicyEngine(),
        new InMemoryEvidenceRecorder(),
        executor
      );

    const result =
      runner.run({
        contribution:
          contribution(),
        policies: [
          sourcePolicy(),
        ],
        requestedCapabilityId:
          "deployment.execute",
        requestedTarget:
          "src/example.ts",
      });

    expect(
      result.status
    ).toBe("blocked");

    expect(
      result.failureReason
    ).toBe(
      "capability-denied"
    );

    expect(
      execute
    ).not.toHaveBeenCalled();

    expect(
      result.evidence.map(
        (evidence) =>
          evidence.type
      )
    ).toEqual([
      "capability-result",
    ]);
  });

  it("returns execution-failed when the executor fails", () => {
    const executor: Executor = {
      execute: (
        request
      ): ExecutionResult => ({
        status: "failed",
        contributionId:
          request.contribution.id,
        capabilityId:
          request.capabilityId,
        summary:
          "Execution failed.",
      }),
    };

    const runner =
      new ContributionRunner(
        new DeterministicPolicyEngine(),
        new InMemoryEvidenceRecorder(),
        executor
      );

    const result =
      runner.run({
        contribution:
          contribution(),
        policies: [
          sourcePolicy(),
        ],
        requestedCapabilityId:
          "source.write",
        requestedTarget:
          "src/example.ts",
      });

    expect(
      result.status
    ).toBe(
      "execution-failed"
    );

    expect(
      result.failureReason
    ).toBe(
      "execution-failed"
    );

    expect(
      result.evidence.map(
        (evidence) =>
          evidence.type
      )
    ).toEqual([
      "capability-result",
      "policy-result",
      "command-output",
    ]);
  });

  it("preserves structured evidence produced directly by the executor", () => {
    const executor: Executor = {
      execute: (
        request
      ): ExecutionResult => ({
        status: "succeeded",
        contributionId:
          request.contribution.id,
        capabilityId:
          request.capabilityId,
        summary:
          "Validation completed.",
        evidence: [
          {
            id:
              "validation-evidence-001",
            contributionId:
              request.contribution.id,
            type:
              "test-result",
            timestamp:
              "2026-08-13T12:00:00.000Z",
            contentReference:
              "validation:duplicate-username:test",
            producer:
              "reference-validator",
            metadata: {
              status: "passed",
              uniqueCreationPassed:
                true,
              duplicateRejectionPassed:
                true,
              subsequentValidCreationPassed:
                true,
            },
          },
        ],
      }),
    };

    const runner =
      new ContributionRunner(
        new DeterministicPolicyEngine(),
        new InMemoryEvidenceRecorder(),
        executor
      );

    const result =
      runner.run({
        contribution:
          contribution(),
        policies: [
          sourcePolicy(),
        ],
        requestedCapabilityId:
          "source.write",
        requestedTarget:
          "src/example.ts",
      });

    expect(
      result.status
    ).toBe("executed");

    expect(
      result.evidence.map(
        (evidence) =>
          evidence.type
      )
    ).toEqual([
      "capability-result",
      "policy-result",
      "command-output",
      "test-result",
    ]);

    const producedEvidence =
      result.evidence.find(
        (evidence) =>
          evidence.type ===
          "test-result"
      );

    expect(
      producedEvidence
    ).toMatchObject({
      id:
        "validation-evidence-001",
      producer:
        "reference-validator",
      metadata: {
        status: "passed",
        uniqueCreationPassed:
          true,
        duplicateRejectionPassed:
          true,
        subsequentValidCreationPassed:
          true,
      },
    });
  });
});