import type { ContributorExecutor } from "../core/contributor-executor.js";
import type { ExecutionArtifact, ExecutionResult } from "../core/executor.js";

const DUPLICATE_SAFE_ARTIFACT = "reference-app:user-creator:duplicate-safe";

const DUPLICATE_ACCEPTING_ARTIFACT =
  "reference-app:user-creator:duplicate-accepting";

export const duplicateSafeArtifactReference = DUPLICATE_SAFE_ARTIFACT;

export const duplicateAcceptingArtifactReference = DUPLICATE_ACCEPTING_ARTIFACT;

export const userCreatorImplementationArtifactType =
  "user-creator-implementation";

function implementationArtifact(contentReference: string): ExecutionArtifact {
  return {
    type: userCreatorImplementationArtifactType,
    contentReference,
  };
}

export class DuplicateSafeUserCreatorContributorExecutor implements ContributorExecutor {
  execute(
    request: Parameters<ContributorExecutor["execute"]>[0],
  ): ExecutionResult {
    return {
      status: "succeeded",
      contributionId: request.contribution.id,
      capabilityId: request.capabilityId,
      summary: "Contributor produced duplicate-safe user creation behavior.",
      artifacts: [implementationArtifact(DUPLICATE_SAFE_ARTIFACT)],
    };
  }
}

export class DuplicateAcceptingUserCreatorContributorExecutor implements ContributorExecutor {
  execute(
    request: Parameters<ContributorExecutor["execute"]>[0],
  ): ExecutionResult {
    return {
      status: "succeeded",
      contributionId: request.contribution.id,
      capabilityId: request.capabilityId,
      summary:
        "Contributor produced user creation behavior that still accepts duplicates.",
      artifacts: [implementationArtifact(DUPLICATE_ACCEPTING_ARTIFACT)],
    };
  }
}
