import {
  describe,
  expect,
  it,
} from "vitest";

import { DeterministicOutcomeResolver } from "../src/core/outcome-resolver.js";

import type { Evaluation } from "../src/domain/evaluation.js";
import type { Evidence } from "../src/domain/evidence.js";
import type { WorkflowRunResult } from "../src/core/workflow-runner.js";

const executionEvidence: Evidence = {
  id: "evidence-execution-001",
  contributionId: "contribution-001",
  type: "command-output",
  timestamp:
    "2026-08-12T12:00:00.000Z",
  contentReference:
    "execution:contribution-001",
  producer: "executor",
  metadata: {
    status: "succeeded",
  },
};

function evaluation(
  result: "passed" | "failed"
): Evaluation {
  return {
    id: "evaluation-001",
    targetId: "workflow-001",
    targetType: "workflow",
    criteria: [],
    evidence: [executionEvidence],
    result,
    evaluator:
      "deterministic-evaluator",
    confidence: 1,
  };
}

describe("DeterministicOutcomeResolver", () => {
  it("resolves a passed evaluation and completed workflow to a completed outcome", () => {
    const outcome =
      new DeterministicOutcomeResolver().resolve({
        workflowId:
          "workflow-001",
        evaluation:
          evaluation("passed"),
        workflowRun: {
          workflowId:
            "workflow-001",
          status: "completed",
          completedStageIds: [
            "implementation",
          ],
          evidence: [
            executionEvidence,
          ],
          handoffs: [],
        },
      });

    expect(outcome.status).toBe(
      "completed"
    );

    expect(
      outcome.reasonCode
    ).toBeUndefined();
  });

  it("preserves governance denial in the terminal outcome", () => {
    const workflowRun: WorkflowRunResult = {
      workflowId:
        "workflow-001",
      status: "failed",
      completedStageIds: [],
      evidence: [
        executionEvidence,
      ],
      handoffs: [],
      failedStageId:
        "implementation",
      failureReason:
        "governance-denied",
    };

    const outcome =
      new DeterministicOutcomeResolver().resolve({
        workflowId:
          "workflow-001",
        evaluation:
          evaluation("failed"),
        workflowRun,
      });

    expect(outcome).toMatchObject({
      status: "failed",
      reasonCode:
        "governance-denied",
      failedStageId:
        "implementation",
    });
  });

  it("preserves engineering validation failure in the terminal outcome", () => {
    const outcome =
      new DeterministicOutcomeResolver().resolve({
        workflowId:
          "workflow-001",
        evaluation:
          evaluation("failed"),
        workflowRun: {
          workflowId:
            "workflow-001",
          status: "failed",
          completedStageIds: [
            "implementation",
          ],
          evidence: [
            executionEvidence,
          ],
          handoffs: [],
          failedStageId:
            "validation",
          failureReason:
            "engineering-validation-failed",
        },
      });

    expect(outcome).toMatchObject({
      status: "failed",
      reasonCode:
        "engineering-validation-failed",
      failedStageId:
        "validation",
    });
  });

  it("preserves dependency deadlock without falsely assigning a failed stage", () => {
    const outcome =
      new DeterministicOutcomeResolver().resolve({
        workflowId:
          "workflow-001",
        evaluation:
          evaluation("failed"),
        workflowRun: {
          workflowId:
            "workflow-001",
          status: "failed",
          completedStageIds: [],
          evidence: [],
          handoffs: [],
          failureReason:
            "dependency-deadlock",
          unresolvedStageIds: [
            "stage-a",
            "stage-b",
          ],
        },
      });

    expect(outcome).toMatchObject({
      status: "failed",
      reasonCode:
        "dependency-deadlock",
      unresolvedStageIds: [
        "stage-a",
        "stage-b",
      ],
    });

    expect(
      outcome.failedStageId
    ).toBeUndefined();
  });

  it("falls back to evaluation failure when the workflow itself completed", () => {
    const outcome =
      new DeterministicOutcomeResolver().resolve({
        workflowId:
          "workflow-001",
        evaluation:
          evaluation("failed"),
      });

    expect(outcome).toMatchObject({
      status: "failed",
      reasonCode:
        "evaluation-failed",
    });
  });
});