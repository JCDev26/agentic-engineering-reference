import type { Evaluation } from "../domain/evaluation.js";
import type {
  Outcome,
  OutcomeStatus,
} from "../domain/outcome.js";

export interface OutcomeResolutionRequest {
  workflowId: string;
  evaluation: Evaluation;
}

export interface OutcomeResolver {
  resolve(request: OutcomeResolutionRequest): Outcome;
}

export class DeterministicOutcomeResolver
  implements OutcomeResolver
{
  resolve(request: OutcomeResolutionRequest): Outcome {
    const status: OutcomeStatus =
      request.evaluation.result === "passed"
        ? "completed"
        : "failed";

    return {
      workflowId: request.workflowId,
      status,
      summary:
        status === "completed"
          ? "Workflow completed with satisfied evaluation criteria."
          : "Workflow failed because evaluation criteria were not satisfied.",
      evidence: request.evaluation.evidence,
    };
  }
}