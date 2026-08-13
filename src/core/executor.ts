import type { Contribution } from "../domain/contribution.js";
import type { Evidence } from "../domain/evidence.js";

export interface ExecutionArtifact {
  type: string;
  contentReference: string;
}

export interface ExecutionRequest {
  contribution: Contribution;
  capabilityId: string;
  target?: string;
}

export type ExecutionStatus =
  | "succeeded"
  | "failed";

export interface ExecutionResult {
  status: ExecutionStatus;
  contributionId: string;
  capabilityId: string;
  summary: string;
  artifacts?: ExecutionArtifact[];

  /**
   * Structured evidence produced directly by the executor
   * while performing the contribution.
   *
   * This allows contributor-specific validation or execution
   * evidence to remain first-class evidence rather than being
   * reconstructed later from artifacts or logs.
   */
  evidence?: Evidence[];
}

export interface Executor {
  execute(
    request: ExecutionRequest
  ): ExecutionResult;
}

export class DeterministicExecutor
  implements Executor
{
  execute(
    request: ExecutionRequest
  ): ExecutionResult {
    return {
      status: "succeeded",
      contributionId:
        request.contribution.id,
      capabilityId:
        request.capabilityId,
      summary:
        `Deterministic execution completed for ${request.capabilityId}.`,
    };
  }
}