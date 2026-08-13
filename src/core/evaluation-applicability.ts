import type { ContributionRunResult } from "./contribution-runner.js";
import type { WorkflowRunResult } from "./workflow-runner.js";

export type EvaluationApplicabilityDecision =
  | {
      applicable: true;
    }
  | {
      applicable: false;
      reason: string;
    };

export type EvaluationApplicabilitySource =
  | {
      kind: "contribution";
      runResult: ContributionRunResult;
    }
  | {
      kind: "workflow";
      runResult: WorkflowRunResult;
    };

export function decideEvaluationApplicability(
  source: EvaluationApplicabilitySource
): EvaluationApplicabilityDecision {
  if (source.kind === "contribution") {
    return decideContributionApplicability(
      source.runResult
    );
  }

  return decideWorkflowApplicability(
    source.runResult
  );
}

function decideContributionApplicability(
  runResult: ContributionRunResult
): EvaluationApplicabilityDecision {
  if (runResult.status === "executed") {
    return {
      applicable: true,
    };
  }

  return {
    applicable: false,
    reason:
      `Engineering evaluation was not reached because the contribution ended with ${
        runResult.failureReason ??
        runResult.status
      }.`,
  };
}

function decideWorkflowApplicability(
  runResult: WorkflowRunResult
): EvaluationApplicabilityDecision {
  if (
    runResult.status === "completed" ||
    runResult.failureReason ===
      "engineering-validation-failed"
  ) {
    return {
      applicable: true,
    };
  }

  return {
    applicable: false,
    reason:
      `Engineering evaluation was not reached because the workflow ended with ${
        runResult.failureReason ??
        runResult.status
      }.`,
  };
}