import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import { DeterministicEvaluator } from "../src/core/evaluator.js";
  
  describe("Evaluation applicability", () => {
    it("returns inconclusive when engineering evaluation was unreachable", () => {
      const evaluation =
        new DeterministicEvaluator().evaluate({
          id:
            "evaluation-inapplicable-001",
          targetId: "workflow-001",
          targetType: "workflow",
          requirements: [
            {
              type: "test-result",
              metadata: {
                status: "passed",
              },
            },
          ],
          evidence: [],
          applicable: false,
          inapplicableReason:
            "Governance prevented the workflow from reaching engineering validation.",
        });
  
      expect(
        evaluation.result
      ).toBe("inconclusive");
  
      expect(
        evaluation.findings
      ).toEqual([
        "Governance prevented the workflow from reaching engineering validation.",
      ]);
    });
  
    it("still fails when engineering evaluation is applicable but required evidence does not satisfy the criteria", () => {
      const evaluation =
        new DeterministicEvaluator().evaluate({
          id:
            "evaluation-failed-001",
          targetId: "workflow-001",
          targetType: "workflow",
          requirements: [
            {
              type: "test-result",
              metadata: {
                status: "passed",
              },
            },
          ],
          evidence: [
            {
              id: "evidence-001",
              contributionId:
                "contribution-validation-001",
              type: "test-result",
              timestamp:
                "2026-08-13T12:00:00.000Z",
              contentReference:
                "validation:failed",
              metadata: {
                status: "failed",
              },
            },
          ],
        });
  
      expect(
        evaluation.result
      ).toBe("failed");
    });
  
    it("still passes when engineering evaluation is applicable and evidence satisfies the criteria", () => {
      const evaluation =
        new DeterministicEvaluator().evaluate({
          id:
            "evaluation-passed-001",
          targetId: "workflow-001",
          targetType: "workflow",
          requirements: [
            {
              type: "test-result",
              metadata: {
                status: "passed",
              },
            },
          ],
          evidence: [
            {
              id: "evidence-001",
              contributionId:
                "contribution-validation-001",
              type: "test-result",
              timestamp:
                "2026-08-13T12:00:00.000Z",
              contentReference:
                "validation:passed",
              metadata: {
                status: "passed",
              },
            },
          ],
        });
  
      expect(
        evaluation.result
      ).toBe("passed");
    });
  
    it("uses a neutral default finding when evaluation is explicitly inapplicable without a custom reason", () => {
      const evaluation =
        new DeterministicEvaluator().evaluate({
          id:
            "evaluation-inapplicable-default-001",
          targetId: "workflow-001",
          targetType: "workflow",
          requirements: [
            {
              type: "test-result",
            },
          ],
          evidence: [],
          applicable: false,
        });
  
      expect(
        evaluation.result
      ).toBe("inconclusive");
  
      expect(
        evaluation.findings
      ).toEqual([
        "Engineering evaluation was not applicable because the workflow did not reach the required validation boundary.",
      ]);
    });
  });