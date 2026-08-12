import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import {
    duplicateAcceptingCandidate,
    duplicateSafeCandidate,
  } from "../src/scenarios/duplicate-username.js";
  import { runDuplicateUsernameMultiStageScenario } from "../src/scenarios/duplicate-username-workflow.js";
  
  describe("Reference Scenario 001 multi-stage workflow", () => {
    it("completes implementation, handoff, and validation for a correct contributor result", () => {
      const result =
        runDuplicateUsernameMultiStageScenario({
          implementationCandidates: [
            duplicateSafeCandidate(),
          ],
        });
  
      expect(
        result.workflowRun.status
      ).toBe("completed");
  
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
  
      expect(
        result.workflowRun
          .handoffs[0]
          ?.artifactReferences
      ).toContain(
        "reference-app:user-creator:duplicate-safe"
      );
  
      const validationEvidence =
        result.workflowRun.evidence.find(
          (evidence) =>
            evidence.type ===
            "test-result"
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
  
    it("allows implementation to complete and hand off before independent validation rejects a bad contributor result", () => {
      const result =
        runDuplicateUsernameMultiStageScenario({
          implementationCandidates: [
            duplicateAcceptingCandidate(),
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
  
      expect(
        result.workflowRun
          .handoffs[0]
          ?.artifactReferences
      ).toContain(
        "reference-app:user-creator:duplicate-accepting"
      );
  
      const validationEvidence =
        result.workflowRun.evidence.find(
          (evidence) =>
            evidence.type ===
            "test-result"
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
  
    it("stops before handoff when implementation governance blocks execution", () => {
      const result =
        runDuplicateUsernameMultiStageScenario({
          implementationCandidates: [
            duplicateSafeCandidate(),
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