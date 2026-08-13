import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import { ContributionRunner } from "../src/core/contribution-runner.js";
  import { InMemoryEvidenceRecorder } from "../src/core/evidence-recorder.js";
  import { DeterministicPolicyEngine } from "../src/core/policy-engine.js";
  
  import type { Contribution } from "../src/domain/contribution.js";
  import type { Policy } from "../src/domain/policy.js";
  
  import {
    duplicateAcceptingArtifactReference,
    duplicateSafeArtifactReference,
  } from "../src/scenarios/duplicate-username-contributors.js";
  import { DuplicateUsernameValidationContributorExecutor } from "../src/scenarios/duplicate-username-validation-contributors.js";
  
  function validationContribution(): Contribution {
    return {
      id:
        "contribution-validation-provenance",
      workflowId:
        "workflow-validation-provenance",
      stageId:
        "validation",
      objective:
        "Validate duplicate username behavior.",
      scope: [
        "reference-app:",
      ],
      contributorProfileId:
        "validator",
      capabilityIds: [
        "validation.execute",
      ],
      policyIds: [
        "validation-artifact-scope",
      ],
      evidenceRequirements: [
        "capability-result",
        "policy-result",
        "command-output",
        "test-result",
      ],
      completionCriteria: [
        "Validation completes.",
      ],
    };
  }
  
  function validationPolicy(): Policy {
    return {
      id:
        "validation-artifact-scope",
      rule:
        "Validation may inspect reference application artifacts.",
      scope: [
        "reference-app:",
      ],
      enforcementPoint:
        "capability-request",
      failureBehavior: "deny",
      severity: "high",
    };
  }
  
  function runValidation(
    target: string
  ) {
    return new ContributionRunner(
      new DeterministicPolicyEngine(),
      new InMemoryEvidenceRecorder(),
      new DuplicateUsernameValidationContributorExecutor()
    ).run({
      contribution:
        validationContribution(),
      policies: [
        validationPolicy(),
      ],
      requestedCapabilityId:
        "validation.execute",
      requestedTarget:
        target,
    });
  }
  
  describe("Validation evidence provenance", () => {
    it("preserves passed validator evidence without reconstructing acceptance metadata", () => {
      const result =
        runValidation(
          duplicateSafeArtifactReference
        );
  
      expect(
        result.status
      ).toBe("executed");
  
      const validationEvidence =
        result.evidence.find(
          (evidence) =>
            evidence.type ===
            "test-result"
        );
  
      expect(
        validationEvidence
      ).toBeDefined();
  
      expect(
        validationEvidence
          ?.producer
      ).toBe(
        "duplicate-username-acceptance-validator"
      );
  
      expect(
        validationEvidence
          ?.contentReference
      ).toBe(
        "validation:duplicate-username:contribution-validation-provenance"
      );
  
      expect(
        validationEvidence
          ?.metadata
      ).toEqual({
        status: "passed",
        uniqueCreationPassed:
          true,
        duplicateRejectionPassed:
          true,
        subsequentValidCreationPassed:
          true,
      });
  
      expect(
        result.execution
          ?.evidence?.[0]
      ).toBe(
        validationEvidence
      );
    });
  
    it("preserves failed validator evidence with the original individual findings", () => {
      const result =
        runValidation(
          duplicateAcceptingArtifactReference
        );
  
      expect(
        result.status
      ).toBe("executed");
  
      const validationEvidence =
        result.evidence.find(
          (evidence) =>
            evidence.type ===
            "test-result"
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
      ).toEqual({
        status: "failed",
        uniqueCreationPassed:
          true,
        duplicateRejectionPassed:
          false,
        subsequentValidCreationPassed:
          true,
      });
  
      expect(
        result.execution
          ?.evidence?.[0]
      ).toBe(
        validationEvidence
      );
    });
  
    it("keeps execution success distinct from engineering validation failure", () => {
      const result =
        runValidation(
          duplicateAcceptingArtifactReference
        );
  
      expect(
        result.status
      ).toBe("executed");
  
      expect(
        result.execution?.status
      ).toBe("succeeded");
  
      expect(
        result.evidence.find(
          (evidence) =>
            evidence.type ===
            "command-output"
        )?.metadata
      ).toMatchObject({
        status: "succeeded",
      });
  
      expect(
        result.evidence.find(
          (evidence) =>
            evidence.type ===
            "test-result"
        )?.metadata
      ).toMatchObject({
        status: "failed",
        duplicateRejectionPassed:
          false,
      });
    });
  });