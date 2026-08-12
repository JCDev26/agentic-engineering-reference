import type { Contribution } from "../domain/contribution.js";

export interface ExecutionArtifact {
  type: string;
  contentReference: string;
}

export interface ExecutionRequest {
  contribution: Contribution;
  capabilityId: string;
  target?: string;
}

export type ExecutionStatus = "succeeded" | "failed";

export interface ExecutionResult {
  status: ExecutionStatus;
  contributionId: string;
  capabilityId: string;
  summary: string;
  artifacts?: ExecutionArtifact[];
}

export interface Executor {
  execute(request: ExecutionRequest): ExecutionResult;
}

export class DeterministicExecutor implements Executor {
  execute(request: ExecutionRequest): ExecutionResult {
    return {
      status: "succeeded",
      contributionId: request.contribution.id,
      capabilityId: request.capabilityId,
      summary: `Deterministic execution completed for ${request.capabilityId}.`,
    };
  }
}