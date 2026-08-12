import type { ContributorExecutor } from "../core/contributor-executor.js";
import type {
  ExecutionArtifact,
  ExecutionResult,
} from "../core/executor.js";

import { DuplicateUsernameAcceptanceValidator } from "./duplicate-username-validator.js";

export const validationPassedArtifactReference =
  "reference-validation:duplicate-username:passed";

export const validationFailedArtifactReference =
  "reference-validation:duplicate-username:failed";

export class DuplicateUsernameValidationContributorExecutor
  implements ContributorExecutor
{
  execute(
    request: Parameters<ContributorExecutor["execute"]>[0]
  ): ExecutionResult {
    const implementationArtifactReference =
      request.target;

    if (implementationArtifactReference === undefined) {
      return {
        status: "failed",
        contributionId: request.contribution.id,
        capabilityId: request.capabilityId,
        summary:
          "Validation contributor did not receive an implementation artifact.",
      };
    }

    const validationEvidence =
      new DuplicateUsernameAcceptanceValidator()
        .validateArtifactReferences(
          request.contribution.id,
          [implementationArtifactReference]
        );

    const validationPassed =
      validationEvidence.metadata?.status ===
      "passed";

    const artifact: ExecutionArtifact = {
      type: "acceptance-validation-result",
      contentReference: validationPassed
        ? validationPassedArtifactReference
        : validationFailedArtifactReference,
    };

    return {
      status: "succeeded",
      contributionId: request.contribution.id,
      capabilityId: request.capabilityId,
      summary: validationPassed
        ? "Validation contributor confirmed the implementation satisfies acceptance criteria."
        : "Validation contributor completed validation and found unmet acceptance criteria.",
      artifacts: [artifact],
    };
  }
}