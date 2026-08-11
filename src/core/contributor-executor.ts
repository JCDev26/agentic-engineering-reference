import type { Contribution } from "../domain/contribution.js";
import type {
  ExecutionResult,
  Executor,
} from "./executor.js";

export interface ContributorExecutionRequest {
  contribution: Contribution;
  capabilityId: string;
  target?: string;
}

export interface ContributorExecutor {
  execute(
    request: ContributorExecutionRequest
  ): ExecutionResult;
}

export class DeterministicContributorExecutor
  implements ContributorExecutor
{
  constructor(
    private readonly executor: Executor
  ) {}

  execute(
    request: ContributorExecutionRequest
  ): ExecutionResult {
    return this.executor.execute({
      contribution: request.contribution,
      capabilityId: request.capabilityId,
      ...(request.target !== undefined
        ? { target: request.target }
        : {}),
    });
  }
}

export class SimulatedContributorExecutor
  implements ContributorExecutor
{
  execute(
    request: ContributorExecutionRequest
  ): ExecutionResult {
    return {
      status: "succeeded",
      contributionId: request.contribution.id,
      capabilityId: request.capabilityId,
      summary:
        "Simulated contributor completed the assigned contribution.",
    };
  }
}