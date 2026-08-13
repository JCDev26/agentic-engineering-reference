import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import { decideEvaluationApplicability } from "../src/core/evaluation-applicability.js";
  
  import type { ContributionRunResult } from "../src/core/contribution-runner.js";
  import type { WorkflowRunResult } from "../src/core/workflow-runner.js";
  
  function contributionRun(
    overrides: Partial<ContributionRunResult>
  ): ContributionRunResult {
    return {
      status: "executed",
      contributionId:
        "contribution-001",
      evidence: [],
      ...overrides,
    };
  }
  
  function workflowRun(
    overrides: Partial<WorkflowRunResult>
  ): WorkflowRunResult {
    return {
      workflowId: "workflow-001",
      status: "completed",
      completedStageIds: [],
      evidence: [],
      handoffs: [],
      ...overrides,
    };
  }
  
  describe("Evaluation applicability decision", () => {
    it("makes evaluation applicable after successful contribution execution", () => {
      const decision =
        decideEvaluationApplicability({
          kind: "contribution",
          runResult:
            contributionRun({
              status: "executed",
            }),
        });
  
      expect(decision).toEqual({
        applicable: true,
      });
    });
  
    it("makes evaluation inconclusive after capability denial", () => {
      const decision =
        decideEvaluationApplicability({
          kind: "contribution",
          runResult:
            contributionRun({
              status: "blocked",
              failureReason:
                "capability-denied",
            }),
        });
  
      expect(decision).toEqual({
        applicable: false,
        reason:
          "Engineering evaluation was not reached because the contribution ended with capability-denied.",
      });
    });
  
    it("makes evaluation inconclusive after policy denial", () => {
      const decision =
        decideEvaluationApplicability({
          kind: "contribution",
          runResult:
            contributionRun({
              status: "blocked",
              failureReason:
                "policy-denied",
            }),
        });
  
      expect(decision).toEqual({
        applicable: false,
        reason:
          "Engineering evaluation was not reached because the contribution ended with policy-denied.",
      });
    });
  
    it("makes evaluation inconclusive after contribution execution failure", () => {
      const decision =
        decideEvaluationApplicability({
          kind: "contribution",
          runResult:
            contributionRun({
              status:
                "execution-failed",
              failureReason:
                "execution-failed",
            }),
        });
  
      expect(decision).toEqual({
        applicable: false,
        reason:
          "Engineering evaluation was not reached because the contribution ended with execution-failed.",
      });
    });
  
    it("makes evaluation applicable after completed workflow execution", () => {
      const decision =
        decideEvaluationApplicability({
          kind: "workflow",
          runResult:
            workflowRun({
              status: "completed",
            }),
        });
  
      expect(decision).toEqual({
        applicable: true,
      });
    });
  
    it("keeps evaluation applicable when engineering validation actually ran and failed", () => {
      const decision =
        decideEvaluationApplicability({
          kind: "workflow",
          runResult:
            workflowRun({
              status: "failed",
              failedStageId:
                "validation",
              failureReason:
                "engineering-validation-failed",
            }),
        });
  
      expect(decision).toEqual({
        applicable: true,
      });
    });
  
    it("makes evaluation inconclusive after workflow governance denial", () => {
      const decision =
        decideEvaluationApplicability({
          kind: "workflow",
          runResult:
            workflowRun({
              status: "failed",
              failedStageId:
                "implementation",
              failureReason:
                "governance-denied",
            }),
        });
  
      expect(decision).toEqual({
        applicable: false,
        reason:
          "Engineering evaluation was not reached because the workflow ended with governance-denied.",
      });
    });
  
    it("makes evaluation inconclusive after contributor selection failure", () => {
      const decision =
        decideEvaluationApplicability({
          kind: "workflow",
          runResult:
            workflowRun({
              status: "failed",
              failedStageId:
                "validation",
              failureReason:
                "contributor-selection-failed",
            }),
        });
  
      expect(decision).toEqual({
        applicable: false,
        reason:
          "Engineering evaluation was not reached because the workflow ended with contributor-selection-failed.",
      });
    });
  
    it("makes evaluation inconclusive after dependency deadlock", () => {
      const decision =
        decideEvaluationApplicability({
          kind: "workflow",
          runResult:
            workflowRun({
              status: "failed",
              failureReason:
                "dependency-deadlock",
              unresolvedStageIds: [
                "stage-a",
                "stage-b",
              ],
            }),
        });
  
      expect(decision).toEqual({
        applicable: false,
        reason:
          "Engineering evaluation was not reached because the workflow ended with dependency-deadlock.",
      });
    });
  });