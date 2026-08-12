import type { AcceptanceValidator } from "../core/acceptance-validator.js";
import type { Evidence } from "../domain/evidence.js";
import type { ExecutionResult } from "../core/executor.js";

import {
  createUser,
  type UserCreator,
} from "../reference-app/create-user.js";
import { InMemoryUserStore } from "../reference-app/user-store.js";

import {
  duplicateAcceptingArtifactReference,
  duplicateSafeArtifactReference,
} from "./duplicate-username-contributors.js";

const duplicateAcceptingUserCreator: UserCreator = (
  store,
  username
) => {
  store.add(username);

  return {
    username,
    created: true,
  };
};

export class DuplicateUsernameAcceptanceValidator
  implements AcceptanceValidator
{
  validate(
    contributionId: string,
    execution: ExecutionResult
  ): Evidence {
    const userCreator =
      this.resolveUserCreator(execution);

    if (userCreator === undefined) {
      return {
        id: crypto.randomUUID(),
        contributionId,
        type: "test-result",
        timestamp: new Date().toISOString(),
        contentReference:
          `validation:duplicate-username:${contributionId}`,
        producer:
          "duplicate-username-acceptance-validator",
        metadata: {
          status: "failed",
          uniqueCreationPassed: false,
          duplicateRejectionPassed: false,
          subsequentValidCreationPassed: false,
          reason:
            "Execution did not produce a recognized user-creator implementation artifact.",
        },
      };
    }

    const store = new InMemoryUserStore([
      "existing-user",
    ]);

    const uniqueCreation =
      userCreator(store, "new-user");

    const existingUserCountBeforeDuplicate =
      store.count("existing-user");

    const duplicateCreation =
      userCreator(store, "existing-user");

    const existingUserCountAfterDuplicate =
      store.count("existing-user");

    const subsequentValidCreation =
      userCreator(store, "another-user");

    const uniqueCreationPassed =
      uniqueCreation.created &&
      store.has("new-user");

    const duplicateRejectionPassed =
      !duplicateCreation.created &&
      duplicateCreation.reason ===
        "duplicate-username" &&
      existingUserCountAfterDuplicate ===
        existingUserCountBeforeDuplicate;

    const subsequentValidCreationPassed =
      subsequentValidCreation.created &&
      store.has("another-user");

    const passed =
      uniqueCreationPassed &&
      duplicateRejectionPassed &&
      subsequentValidCreationPassed;

    return {
      id: crypto.randomUUID(),
      contributionId,
      type: "test-result",
      timestamp: new Date().toISOString(),
      contentReference:
        `validation:duplicate-username:${contributionId}`,
      producer:
        "duplicate-username-acceptance-validator",
      metadata: {
        status: passed ? "passed" : "failed",
        uniqueCreationPassed,
        duplicateRejectionPassed,
        subsequentValidCreationPassed,
      },
    };
  }

  private resolveUserCreator(
    execution: ExecutionResult
  ): UserCreator | undefined {
    const implementation =
      execution.artifacts?.find(
        (artifact) =>
          artifact.type ===
          "user-creator-implementation"
      );

    if (implementation === undefined) {
      return undefined;
    }

    if (
      implementation.contentReference ===
      duplicateSafeArtifactReference
    ) {
      return createUser;
    }

    if (
      implementation.contentReference ===
      duplicateAcceptingArtifactReference
    ) {
      return duplicateAcceptingUserCreator;
    }

    return undefined;
  }
}