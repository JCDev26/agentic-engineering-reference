import type {
  AcceptanceValidator,
  AcceptanceValidationResult,
} from "../core/acceptance-validator.js";
import type { ExecutionResult } from "../core/executor.js";
import type { Evidence } from "../domain/evidence.js";

import { createUser, type UserCreator } from "../reference-app/create-user.js";
import { InMemoryUserStore } from "../reference-app/user-store.js";
import { duplicateUsernameValidationProducer } from "./duplicate-username-intent.js";

import {
  duplicateAcceptingArtifactReference,
  duplicateSafeArtifactReference,
  userCreatorImplementationArtifactType,
} from "./duplicate-username-contributors.js";

const duplicateAcceptingUserCreator: UserCreator = (store, username) => {
  store.add(username);

  return {
    username,
    created: true,
  };
};

// These are the reference validator's output contract, not evaluation requirements.
export function isAcceptanceResultFrom(
  evidence: Evidence,
  contributionId: string,
): boolean {
  return (
    evidence.type === "test-result" &&
    evidence.producer === duplicateUsernameValidationProducer &&
    evidence.contributionId === contributionId
  );
}

export function hasCompleteAcceptanceResult(evidence: Evidence): boolean {
  const metadata = evidence.metadata;
  return (
    evidence.type === "test-result" &&
    (metadata?.status === "passed" || metadata?.status === "failed") &&
    typeof metadata.uniqueCreationPassed === "boolean" &&
    typeof metadata.duplicateRejectionPassed === "boolean" &&
    typeof metadata.subsequentValidCreationPassed === "boolean"
  );
}

export function acceptanceResultPassed(evidence: Evidence): boolean {
  return (
    evidence.metadata?.status === "passed" &&
    evidence.metadata.uniqueCreationPassed === true &&
    evidence.metadata.duplicateRejectionPassed === true &&
    evidence.metadata.subsequentValidCreationPassed === true
  );
}

export class DuplicateUsernameAcceptanceValidator implements AcceptanceValidator {
  validate(
    contributionId: string,
    execution: ExecutionResult,
  ): AcceptanceValidationResult {
    const artifactReferences =
      execution.artifacts
        ?.filter(
          (artifact) => artifact.type === userCreatorImplementationArtifactType,
        )
        .map((artifact) => artifact.contentReference) ?? [];

    return this.validateArtifactReferences(contributionId, artifactReferences);
  }

  validateArtifactReferences(
    contributionId: string,
    artifactReferences: string[],
  ): AcceptanceValidationResult {
    const userCreator = this.resolveUserCreator(artifactReferences);

    if (userCreator === undefined) {
      return {
        status: "unavailable",
        reason:
          "No recognized user-creator implementation artifact was provided.",
      };
    }

    const store = new InMemoryUserStore(["existing-user"]);

    const uniqueCreation = userCreator(store, "new-user");

    const existingUserCountBeforeDuplicate = store.count("existing-user");

    const duplicateCreation = userCreator(store, "existing-user");

    const existingUserCountAfterDuplicate = store.count("existing-user");

    const subsequentValidCreation = userCreator(store, "another-user");

    const uniqueCreationPassed =
      uniqueCreation.created && store.has("new-user");

    const duplicateRejectionPassed =
      !duplicateCreation.created &&
      duplicateCreation.reason === "duplicate-username" &&
      existingUserCountAfterDuplicate === existingUserCountBeforeDuplicate;

    const subsequentValidCreationPassed =
      subsequentValidCreation.created && store.has("another-user");

    const passed =
      uniqueCreationPassed &&
      duplicateRejectionPassed &&
      subsequentValidCreationPassed;

    return {
      status: "completed",
      evidence: {
        id: crypto.randomUUID(),
        contributionId,
        type: "test-result",
        timestamp: new Date().toISOString(),
        contentReference: `validation:duplicate-username:${contributionId}`,
        producer: duplicateUsernameValidationProducer,
        metadata: {
          status: passed ? "passed" : "failed",
          uniqueCreationPassed,
          duplicateRejectionPassed,
          subsequentValidCreationPassed,
        },
      },
    };
  }

  private resolveUserCreator(
    artifactReferences: string[],
  ): UserCreator | undefined {
    if (artifactReferences.length !== 1) {
      return undefined;
    }

    if (artifactReferences.includes(duplicateSafeArtifactReference)) {
      return createUser;
    }

    if (artifactReferences.includes(duplicateAcceptingArtifactReference)) {
      return duplicateAcceptingUserCreator;
    }

    return undefined;
  }
}
