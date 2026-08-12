import { describe, expect, it } from "vitest";

import { DuplicateUsernameAcceptanceValidator } from "../src/core/acceptance-validator.js";

import type { UserCreator } from "../src/reference-app/create-user.js";

const brokenUserCreator: UserCreator = (
  store,
  username
) => {
  store.add(username);

  return {
    username,
    created: true,
  };
};

describe("DuplicateUsernameAcceptanceValidator", () => {
  it("produces passing evidence when duplicate usernames are rejected", () => {
    const validator =
      new DuplicateUsernameAcceptanceValidator();

    const evidence = validator.validate(
      "contribution-001"
    );

    expect(evidence.type).toBe("test-result");

    expect(evidence.producer).toBe(
      "duplicate-username-acceptance-validator"
    );

    expect(evidence.metadata).toMatchObject({
      status: "passed",
      uniqueCreationPassed: true,
      duplicateRejectionPassed: true,
      subsequentValidCreationPassed: true,
    });
  });

  it("produces failing evidence when duplicate usernames are still accepted", () => {
    const validator =
      new DuplicateUsernameAcceptanceValidator(
        brokenUserCreator
      );

    const evidence = validator.validate(
      "contribution-001"
    );

    expect(evidence.type).toBe("test-result");

    expect(evidence.metadata).toMatchObject({
      status: "failed",
      duplicateRejectionPassed: false,
    });
  });
});