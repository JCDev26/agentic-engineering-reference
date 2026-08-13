import {
  describe,
  expect,
  it,
} from "vitest";

import { decideEvaluationApplicability } from "../src/core/evaluation-applicability.js";
import { DeterministicEvaluator } from "../src/core/evaluator.js";
import { DeterministicOutcomeResolver } from "../src/core/outcome-resolver.js";
import { DeterministicWorkflowRunner } from "../src/core/workflow-runner.js";

import type { ContributorCandidate } from "../src/core/contribution-strategy.js";
import { DeterministicContributorExecutor } from "../src/core/contributor-executor.js";
import { DeterministicExecutor } from "../src/core/executor.js";
import type { Workflow } from "../src/domain/workflow.js";

import {
  duplicateAcceptingCandidate,
  duplicateSafeCandidate,
} from "../src/scenarios/duplicate-username.js";
import {
  duplicateUsernameValidatorCandidate,
  runDuplicateUsernameMultiStageScenario,
} from "../src/scenarios/duplicate-username-workflow.js";

function incapableValidatorCandidate(): ContributorCandidate {
  return {
    contributor: {
      id:
        "incapable-validator",
      type: "automation",
      capabilityIds: [
        "source.read",
      ],
      available: true,
    },
    executor:
      new DeterministicContributorExecutor(
        new DeterministicExecutor()
      ),
  };
}

describe("Terminal failure semantics", () => {
  it("keeps governance, selection, engineering, and dependency failures distinguishable without misclassifying unreachable engineering evaluation", () => {
    const governance =
      runDuplicateUsernameMultiStageScenario({
        implementationCandidates: [
          duplicateSafeCandidate(),
        ],
        validationCandidates: [
          duplicateUsernameValidatorCandidate(),
        ],
        implementationTarget:
          "README.md",
      });

    const selection =
      runDuplicateUsernameMultiStageScenario({
        implementationCandidates: [
          duplicateSafeCandidate(),
        ],
        validationCandidates: [
          incapableValidatorCandidate(),
        ],
      });

    const engineering =
      runDuplicateUsernameMultiStageScenario({
        implementationCandidates: [
          duplicateAcceptingCandidate(),
        ],
        validationCandidates: [
          duplicateUsernameValidatorCandidate(),
        ],
      });

    const deadlockedWorkflow:
      Workflow = {
        id:
          "workflow-terminal-deadlock",
        intentId:
          "intent-terminal-deadlock",
        stages: [
          {
            id: "stage-a",
            responsibility:
              "A",
            expectedContribution:
              "A",
            dependencies: [
              "stage-b",
            ],
            policyIds: [],
            evidenceRequirements: [],
            completionCriteria: [],
          },
          {
            id: "stage-b",
            responsibility:
              "B",
            expectedContribution:
              "B",
            dependencies: [
              "stage-a",
            ],
            policyIds: [],
            evidenceRequirements: [],
            completionCriteria: [],
          },
        ],
        completionCriteria: [],
      };

    const deadlockRun =
      new DeterministicWorkflowRunner().run(
        deadlockedWorkflow,
        []
      );

    const deadlockApplicability =
      decideEvaluationApplicability({
        kind: "workflow",
        runResult:
          deadlockRun,
      });

    const deadlockEvaluation =
      new DeterministicEvaluator().evaluate({
        id:
          "evaluation-deadlock",
        targetId:
          deadlockedWorkflow.id,
        targetType: "workflow",
        requirements: [
          {
            type:
              "command-output",
          },
        ],
        evidence:
          deadlockRun.evidence,
        applicable:
          deadlockApplicability.applicable,
        ...(!deadlockApplicability.applicable
          ? {
              inapplicableReason:
                deadlockApplicability.reason,
            }
          : {}),
      });

    const deadlock =
      new DeterministicOutcomeResolver().resolve({
        workflowId:
          deadlockedWorkflow.id,
        evaluation:
          deadlockEvaluation,
        workflowRun:
          deadlockRun,
      });

    expect(
      governance.evaluation.result
    ).toBe("inconclusive");

    expect(
      governance.outcome.reasonCode
    ).toBe(
      "governance-denied"
    );

    expect(
      selection.evaluation.result
    ).toBe("inconclusive");

    expect(
      selection.outcome.reasonCode
    ).toBe(
      "contributor-selection-failed"
    );

    expect(
      engineering.evaluation.result
    ).toBe("failed");

    expect(
      engineering.outcome.reasonCode
    ).toBe(
      "engineering-validation-failed"
    );

    expect(
      deadlockApplicability
        .applicable
    ).toBe(false);

    expect(
      deadlockEvaluation.result
    ).toBe("inconclusive");

    expect(
      deadlock.reasonCode
    ).toBe(
      "dependency-deadlock"
    );

    expect(
      new Set([
        governance.outcome
          .reasonCode,
        selection.outcome
          .reasonCode,
        engineering.outcome
          .reasonCode,
        deadlock.reasonCode,
      ]).size
    ).toBe(4);
  });
});