import type { Evidence } from "../domain/evidence.js";
import {
  createUser,
  type UserCreator,
} from "../reference-app/create-user.js";
import { InMemoryUserStore } from "../reference-app/user-store.js";

export interface AcceptanceValidator {
  validate(contributionId: string): Evidence;
}

export class DuplicateUsernameAcceptanceValidator
  implements AcceptanceValidator
{
  constructor(
    private readonly userCreator: UserCreator = createUser
  ) {}

  validate(contributionId: string): Evidence {
    const store = new InMemoryUserStore([
      "existing-user",
    ]);

    const uniqueCreation =
      this.userCreator(store, "new-user");

    const existingUserCountBeforeDuplicate =
      store.count("existing-user");

    const duplicateCreation =
      this.userCreator(store, "existing-user");

    const existingUserCountAfterDuplicate =
      store.count("existing-user");

    const subsequentValidCreation =
      this.userCreator(store, "another-user");

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
      producer: "duplicate-username-acceptance-validator",
      metadata: {
        status: passed ? "passed" : "failed",
        uniqueCreationPassed,
        duplicateRejectionPassed,
        subsequentValidCreationPassed,
      },
    };
  }
}