import {
  describe,
  expect,
  it,
} from "vitest";

import {
  duplicateAcceptingCandidate,
  duplicateSafeCandidate,
} from "../src/scenarios/duplicate-username.js";
import {
  duplicateUsernameValidatorCandidate,
  runDuplicateUsernameMultiStageScenario,
} from "../src/scenarios/duplicate-username-workflow.js";

import type { ContributorCandidate } from "../src/core/contribution-strategy.js";
import { DeterministicContributorExecutor } from "../src/core/contributor-executor.js";
import { DeterministicExecutor } from "../src/core/executor.js";

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

describe("Reference Scenario 001 multi-stage workflow", () => {
  it("selects separate contributors for implementation and validation", () => {
    const result =
      runDuplicateUsernameMultiStageScenario({
        implementationCandidates: [
          duplicateSafeCandidate(),
        ],
        validationCandidates: [
          duplicateUsernameValidatorCandidate(),
        ],
      });

    expect(
      result
        .selectedImplementationContributor
        ?.id
    ).toBe(
      "duplicate-safe-contributor"
    );

    expect(
      result
        .selectedValidationContributor
        ?.id
    ).toBe(
      "duplicate-username-validator"
    );

    expect(
      result.workflowRun.status
    ).toBe("completed");

    const validationEvidence =
      result.workflowRun.evidence.find(
        (evidence) =>
          evidence.type ===
            "test-result" &&
          evidence.contributionId ===
            result
              .validationContribution
              .id
      );

    expect(
      validationEvidence
        ?.producer
    ).toBe(
      "duplicate-username-acceptance-validator"
    );

    expect(
      validationEvidence
        ?.metadata
    ).toMatchObject({
      status: "passed",
      uniqueCreationPassed:
        true,
      duplicateRejectionPassed:
        true,
      subsequentValidCreationPassed:
        true,
    });

    expect(
      result.evaluation.result
    ).toBe("passed");

    expect(
      result.outcome.status
    ).toBe("completed");

    expect(
      result.outcome.reasonCode
    ).toBeUndefined();
  });

  it("preserves validator-produced failure findings through evaluation and terminal outcome", () => {
    const result =
      runDuplicateUsernameMultiStageScenario({
        implementationCandidates: [
          duplicateAcceptingCandidate(),
        ],
        validationCandidates: [
          duplicateUsernameValidatorCandidate(),
        ],
      });

    expect(
      result.workflowRun.status
    ).toBe("failed");

    expect(
      result.workflowRun
        .failureReason
    ).toBe(
      "engineering-validation-failed"
    );

    expect(
      result.workflowRun
        .failedStageId
    ).toBe("validation");

    const validationEvidence =
      result.workflowRun.evidence.find(
        (evidence) =>
          evidence.type ===
            "test-result" &&
          evidence.contributionId ===
            result
              .validationContribution
              .id
      );

    expect(
      validationEvidence
        ?.producer
    ).toBe(
      "duplicate-username-acceptance-validator"
    );

    expect(
      validationEvidence
        ?.metadata
    ).toMatchObject({
      status: "failed",
      uniqueCreationPassed:
        true,
      duplicateRejectionPassed:
        false,
      subsequentValidCreationPassed:
        true,
    });

    expect(
      result.evaluation.result
    ).toBe("failed");

    expect(
      result.outcome
    ).toMatchObject({
      status: "failed",
      reasonCode:
        "engineering-validation-failed",
      failedStageId:
        "validation",
    });
  });

  it("makes engineering evaluation inconclusive when contributor selection prevents validation", () => {
    const result =
      runDuplicateUsernameMultiStageScenario({
        implementationCandidates: [
          duplicateSafeCandidate(),
        ],
        validationCandidates: [
          incapableValidatorCandidate(),
        ],
      });

    expect(
      result.workflowRun.status
    ).toBe("failed");

    expect(
      result.workflowRun
        .failureReason
    ).toBe(
      "contributor-selection-failed"
    );

    expect(
      result.workflowRun
        .failedStageId
    ).toBe("validation");

    expect(
      result
        .selectedValidationContributor
    ).toBeUndefined();

    expect(
      result.evaluation.result
    ).toBe("inconclusive");

    expect(
      result.evaluation
        .findings?.[0]
    ).toContain(
      "contributor-selection-failed"
    );

    expect(
      result.outcome
    ).toMatchObject({
      status: "failed",
      reasonCode:
        "contributor-selection-failed",
      failedStageId:
        "validation",
    });
  });

  it("makes engineering evaluation inconclusive when policy denial prevents validation", () => {
    const result =
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

    expect(
      result.workflowRun.status
    ).toBe("failed");

    expect(
      result.workflowRun
        .failureReason
    ).toBe(
      "governance-denied"
    );

    expect(
      result.workflowRun
        .failedStageId
    ).toBe(
      "implementation"
    );

    expect(
      result.workflowRun.handoffs
    ).toHaveLength(0);

    expect(
      result.evaluation.result
    ).toBe("inconclusive");

    expect(
      result.outcome
    ).toMatchObject({
      status: "failed",
      reasonCode:
        "governance-denied",
      failedStageId:
        "implementation",
    });
  });
});