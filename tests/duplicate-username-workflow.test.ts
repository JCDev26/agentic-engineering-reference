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
      id: "incapable-validator",
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

    expect(
      result.outcome.status
    ).toBe("completed");
  });

  it("preserves engineering validation failure through the terminal outcome", () => {
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

  it("preserves contributor selection failure instead of throwing outside the workflow", () => {
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
      result.outcome
    ).toMatchObject({
      status: "failed",
      reasonCode:
        "contributor-selection-failed",
      failedStageId:
        "validation",
    });
  });

  it("maps contribution policy denial into terminal governance denial without inspecting evidence metadata", () => {
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
      result.workflowRun
        .handoffs
    ).toHaveLength(0);

    expect(
      result.outcome
    ).toMatchObject({
      status: "failed",
      reasonCode:
        "governance-denied",
      failedStageId:
        "implementation",
    });

    const policyEvidence =
      result.workflowRun.evidence.find(
        (evidence) =>
          evidence.type ===
          "policy-result"
      );

    expect(
      policyEvidence?.metadata
    ).toMatchObject({
      allowed: false,
    });
  });
});