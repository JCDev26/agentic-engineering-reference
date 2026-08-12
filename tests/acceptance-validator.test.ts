import { describe, expect, it } from "vitest";

import {
  DuplicateAcceptingUserCreatorContributorExecutor,
  DuplicateSafeUserCreatorContributorExecutor,
} from "../src/scenarios/duplicate-username-contributors.js";
import { DuplicateUsernameAcceptanceValidator } from "../src/scenarios/duplicate-username-validator.js";

import type { Contribution } from "../src/domain/contribution.js";

const contribution: Contribution = {
  id: "contribution-001",
  workflowId: "workflow-001",
  stageId: "implementation",
  objective:
    "Modify approved user-management source code.",
  scope: ["src/"],
  contributorProfileId: "implementer",
  capabilityIds: ["source.write"],
  policyIds: ["source-scope"],
  evidenceRequirements: [
    "capability-result",
    "policy-result",
    "command-output",
    "test-result",
  ],
  completionCriteria: [
    "Execution completes successfully.",
  ],
};

describe("DuplicateUsernameAcceptanceValidator", () => {
  it("passes when the contributor produces duplicate-safe behavior", () => {
    const execution =
      new DuplicateSafeUserCreatorContributorExecutor().execute({
        contribution,
        capabilityId: "source.write",
      });

    const validator =
      new DuplicateUsernameAcceptanceValidator();

    const evidence = validator.validate(
      contribution.id,
      execution
    );

    expect(evidence.metadata).toMatchObject({
      status: "passed",
      uniqueCreationPassed: true,
      duplicateRejectionPassed: true,
      subsequentValidCreationPassed: true,
    });
  });

  it("fails when the contributor produces duplicate-accepting behavior", () => {
    const execution =
      new DuplicateAcceptingUserCreatorContributorExecutor().execute({
        contribution,
        capabilityId: "source.write",
      });

    const validator =
      new DuplicateUsernameAcceptanceValidator();

    const evidence = validator.validate(
      contribution.id,
      execution
    );

    expect(execution.status).toBe("succeeded");

    expect(evidence.metadata).toMatchObject({
      status: "failed",
      duplicateRejectionPassed: false,
    });
  });

  it("fails when execution produces no recognized implementation artifact", () => {
    const validator =
      new DuplicateUsernameAcceptanceValidator();

    const evidence = validator.validate(
      contribution.id,
      {
        status: "succeeded",
        contributionId: contribution.id,
        capabilityId: "source.write",
        summary:
          "Execution succeeded without an implementation artifact.",
      }
    );

    expect(evidence.metadata).toMatchObject({
      status: "failed",
      reason:
        "Execution did not produce a recognized user-creator implementation artifact.",
    });
  });
});