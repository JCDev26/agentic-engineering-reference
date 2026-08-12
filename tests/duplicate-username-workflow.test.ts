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
        result.selectedImplementationContributor.id
      ).toBe(
        "duplicate-safe-contributor"
      );
  
      expect(
        result.selectedValidationContributor.id
      ).toBe(
        "duplicate-username-validator"
      );
  
      expect(
        result.selectedImplementationContributor.id
      ).not.toBe(
        result.selectedValidationContributor.id
      );
  
      expect(
        result.implementationContribution
          .capabilityIds
      ).toEqual([
        "source.write",
      ]);
  
      expect(
        result.validationContribution
          .capabilityIds
      ).toEqual([
        "validation.execute",
      ]);
  
      expect(
        result.workflowRun.status
      ).toBe("completed");
  
      expect(
        result.outcome.status
      ).toBe("completed");
    });
  
    it("completes implementation, handoff, selected validation, and workflow outcome for a correct implementation", () => {
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
        result.workflowRun
          .completedStageIds
      ).toEqual([
        "implementation",
        "validation",
      ]);
  
      expect(
        result.workflowRun.handoffs
      ).toHaveLength(1);
  
      const validationEvidence =
        result.workflowRun.evidence.find(
          (evidence) =>
            evidence.type ===
            "test-result"
        );
  
      expect(
        validationEvidence?.producer
      ).toBe(
        "duplicate-username-validator"
      );
  
      expect(
        validationEvidence?.metadata
      ).toMatchObject({
        status: "passed",
        duplicateRejectionPassed:
          true,
      });
  
      expect(
        result.evaluation.result
      ).toBe("passed");
  
      expect(
        result.outcome.status
      ).toBe("completed");
    });
  
    it("allows a selected validator to reject a bad implementation produced by a different contributor", () => {
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
          .completedStageIds
      ).toEqual([
        "implementation",
      ]);
  
      expect(
        result.workflowRun
          .failedStageId
      ).toBe("validation");
  
      expect(
        result.workflowRun.handoffs
      ).toHaveLength(1);
  
      const validationEvidence =
        result.workflowRun.evidence.find(
          (evidence) =>
            evidence.type ===
            "test-result"
        );
  
      expect(
        validationEvidence?.producer
      ).toBe(
        "duplicate-username-validator"
      );
  
      expect(
        validationEvidence?.metadata
      ).toMatchObject({
        status: "failed",
        duplicateRejectionPassed:
          false,
      });
  
      expect(
        result.evaluation.result
      ).toBe("failed");
  
      expect(
        result.outcome.status
      ).toBe("failed");
    });
  
    it("rejects workflow construction when no validation contributor satisfies validation capabilities", () => {
      expect(() =>
        runDuplicateUsernameMultiStageScenario({
          implementationCandidates: [
            duplicateSafeCandidate(),
          ],
          validationCandidates: [
            incapableValidatorCandidate(),
          ],
        })
      ).toThrow(
        "Unable to select validation contributor: No available contributor satisfies the contribution capability requirements."
      );
    });
  
    it("still stops before handoff when implementation governance blocks execution", () => {
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
          .failedStageId
      ).toBe("implementation");
  
      expect(
        result.workflowRun.handoffs
      ).toHaveLength(0);
  
      expect(
        result.workflowRun.evidence.some(
          (evidence) =>
            evidence.type ===
            "test-result"
        )
      ).toBe(false);
  
      expect(
        result.outcome.status
      ).toBe("failed");
    });
  });