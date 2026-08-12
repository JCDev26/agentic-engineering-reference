import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import {
    DuplicateUsernameValidationContributorExecutor,
    validationFailedArtifactReference,
    validationPassedArtifactReference,
  } from "../src/scenarios/duplicate-username-validation-contributors.js";
  
  import type { Contribution } from "../src/domain/contribution.js";
  
  const validationContribution: Contribution = {
    id: "contribution-validation-001",
    workflowId: "workflow-001",
    stageId: "validation",
    objective:
      "Validate duplicate username behavior.",
    scope: ["reference-app:"],
    contributorProfileId: "validator",
    capabilityIds: [
      "validation.execute",
    ],
    policyIds: [
      "validation-artifact-scope",
    ],
    evidenceRequirements: [
      "command-output",
      "test-result",
    ],
    completionCriteria: [
      "Validation completes.",
    ],
  };
  
  describe("DuplicateUsernameValidationContributorExecutor", () => {
    it("produces a passing validation artifact for duplicate-safe behavior", () => {
      const executor =
        new DuplicateUsernameValidationContributorExecutor();
  
      const result = executor.execute({
        contribution:
          validationContribution,
        capabilityId:
          "validation.execute",
        target:
          "reference-app:user-creator:duplicate-safe",
      });
  
      expect(result.status).toBe(
        "succeeded"
      );
  
      expect(
        result.artifacts?.[0]
          ?.contentReference
      ).toBe(
        validationPassedArtifactReference
      );
    });
  
    it("successfully executes validation but produces a failing validation artifact for bad behavior", () => {
      const executor =
        new DuplicateUsernameValidationContributorExecutor();
  
      const result = executor.execute({
        contribution:
          validationContribution,
        capabilityId:
          "validation.execute",
        target:
          "reference-app:user-creator:duplicate-accepting",
      });
  
      expect(result.status).toBe(
        "succeeded"
      );
  
      expect(
        result.artifacts?.[0]
          ?.contentReference
      ).toBe(
        validationFailedArtifactReference
      );
    });
  
    it("fails execution when no implementation artifact is supplied", () => {
      const executor =
        new DuplicateUsernameValidationContributorExecutor();
  
      const result = executor.execute({
        contribution:
          validationContribution,
        capabilityId:
          "validation.execute",
      });
  
      expect(result.status).toBe(
        "failed"
      );
  
      expect(result.artifacts).toBeUndefined();
    });
  });