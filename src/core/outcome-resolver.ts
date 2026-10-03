import type { Evaluation } from "../domain/evaluation.js";
import type {
  Outcome,
  OutcomeReasonCode,
  OutcomeStatus,
} from "../domain/outcome.js";
import type {
  WorkflowFailureReason,
  WorkflowRunResult,
} from "./workflow-runner.js";

export interface OutcomeResolutionRequest {
  workflowId: string;
  evaluation: Evaluation;
  workflowRun?: WorkflowRunResult;
}

export interface OutcomeResolver {
  resolve(request: OutcomeResolutionRequest): Outcome;
}

export class DeterministicOutcomeResolver implements OutcomeResolver {
  resolve(request: OutcomeResolutionRequest): Outcome {
    const workflowFailure =
      request.workflowRun?.status === "failed"
        ? request.workflowRun
        : undefined;

    if (workflowFailure !== undefined) {
      const reasonCode = this.mapWorkflowFailureReason(
        workflowFailure.failureReason,
      );

      return {
        workflowId: request.workflowId,
        status: "failed",
        reasonCode,
        summary: this.describeFailure(reasonCode),
        evidence: request.evaluation.evidence,
        ...(workflowFailure.failedStageId !== undefined
          ? {
              failedStageId: workflowFailure.failedStageId,
            }
          : {}),
        ...(workflowFailure.unresolvedStageIds !== undefined
          ? {
              unresolvedStageIds: workflowFailure.unresolvedStageIds,
            }
          : {}),
      };
    }

    if (request.evaluation.result === "requires-review") {
      return {
        workflowId: request.workflowId,
        status: "escalated",
        reasonCode: "evaluation-requires-review",
        summary: this.describeFailure("evaluation-requires-review"),
        evidence: request.evaluation.evidence,
      };
    }

    const status: OutcomeStatus =
      request.evaluation.result === "passed" ? "completed" : "failed";

    if (status === "completed") {
      return {
        workflowId: request.workflowId,
        status,
        summary: "Workflow completed with satisfied evaluation criteria.",
        evidence: request.evaluation.evidence,
      };
    }

    const reasonCode =
      request.evaluation.result === "inconclusive"
        ? "evaluation-inconclusive"
        : "evaluation-failed";

    return {
      workflowId: request.workflowId,
      status,
      reasonCode,
      summary: this.describeFailure(reasonCode),
      evidence: request.evaluation.evidence,
    };
  }

  private mapWorkflowFailureReason(
    reason: WorkflowFailureReason | undefined,
  ): OutcomeReasonCode {
    switch (reason) {
      case "governance-denied":
        return "governance-denied";

      case "contributor-selection-failed":
        return "contributor-selection-failed";

      case "engineering-validation-failed":
        return "engineering-validation-failed";

      case "dependency-deadlock":
        return "dependency-deadlock";

      case "missing-stage-binding":
        return "missing-stage-binding";

      case "execution-failed":
      case "stage-failed":
      default:
        return "stage-execution-failed";
    }
  }

  private describeFailure(reasonCode: OutcomeReasonCode): string {
    switch (reasonCode) {
      case "governance-denied":
        return "Workflow failed because governance denied a required contribution.";

      case "contributor-selection-failed":
        return "Workflow failed because no eligible contributor could be selected.";

      case "stage-execution-failed":
        return "Workflow failed because a stage could not execute successfully.";

      case "engineering-validation-failed":
        return "Workflow failed because independent engineering validation rejected the produced result.";

      case "dependency-deadlock":
        return "Workflow failed because remaining stage dependencies could not be satisfied.";

      case "missing-stage-binding":
        return "Workflow failed because a ready stage had no execution binding.";

      case "evaluation-failed":
        return "Workflow failed because evaluation criteria were not satisfied.";

      case "evaluation-inconclusive":
        return "Workflow could not be completed because engineering evaluation was inconclusive.";

      case "evaluation-requires-review":
        return "Engineering evaluation requires review before a terminal engineering judgment can be made.";
    }
  }
}
