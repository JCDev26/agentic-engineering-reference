import { describe, expect, it } from "vitest";

import {
  duplicateAcceptingCandidate,
  duplicateSafeCandidate,
  runDuplicateUsernameReferenceScenario,
} from "../src/scenarios/duplicate-username.js";

describe("Reference Scenario 001: Prevent Duplicate Usernames", () => {
  it("completes when the selected contributor produces behavior that satisfies engineering intent", () => {
    const result =
      runDuplicateUsernameReferenceScenario({
        candidates: [duplicateSafeCandidate()],
      });

    expect(result.runResult.status).toBe(
      "executed"
    );

    expect(
      result.runResult.execution?.status
    ).toBe("succeeded");

    expect(
      result.runResult.execution?.artifacts?.[0]
        ?.contentReference
    ).toBe(
      "reference-app:user-creator:duplicate-safe"
    );

    expect(
      result.evidence.find(
        (evidence) =>
          evidence.type === "test-result"
      )?.metadata
    ).toMatchObject({
      status: "passed",
      duplicateRejectionPassed: true,
    });

    expect(result.evaluation.result).toBe(
      "passed"
    );

    expect(result.outcome.status).toBe(
      "completed"
    );
  });

  it("fails when a different contributor successfully executes but produces behavior that violates engineering intent", () => {
    const result =
      runDuplicateUsernameReferenceScenario({
        candidates: [
          duplicateAcceptingCandidate(),
        ],
      });

    expect(result.runResult.status).toBe(
      "executed"
    );

    expect(
      result.runResult.execution?.status
    ).toBe("succeeded");

    expect(
      result.runResult.execution?.artifacts?.[0]
        ?.contentReference
    ).toBe(
      "reference-app:user-creator:duplicate-accepting"
    );

    expect(
      result.evidence.find(
        (evidence) =>
          evidence.type === "test-result"
      )?.metadata
    ).toMatchObject({
      status: "failed",
      duplicateRejectionPassed: false,
    });

    expect(result.evaluation.result).toBe(
      "failed"
    );

    expect(result.outcome.status).toBe(
      "failed"
    );
  });

  it("preserves engineering contracts across contributors that produce different outcomes", () => {
    const successful =
      runDuplicateUsernameReferenceScenario({
        candidates: [duplicateSafeCandidate()],
      });

    const unsuccessful =
      runDuplicateUsernameReferenceScenario({
        candidates: [
          duplicateAcceptingCandidate(),
        ],
      });

    expect(successful.workItem).toEqual(
      unsuccessful.workItem
    );

    expect(successful.intent).toEqual(
      unsuccessful.intent
    );

    expect(successful.workflow).toEqual(
      unsuccessful.workflow
    );

    expect(successful.contribution).toEqual(
      unsuccessful.contribution
    );

    expect(
      successful.contributorProfile
    ).toEqual(
      unsuccessful.contributorProfile
    );

    expect(
      successful.selectedContributor.id
    ).not.toBe(
      unsuccessful.selectedContributor.id
    );

    expect(successful.outcome.status).toBe(
      "completed"
    );

    expect(unsuccessful.outcome.status).toBe(
      "failed"
    );
  });

  it("still blocks execution when policy prevents the contribution", () => {
    const result =
      runDuplicateUsernameReferenceScenario({
        candidates: [duplicateSafeCandidate()],
        requestedTarget: "README.md",
      });

    expect(result.runResult.status).toBe(
      "blocked"
    );

    expect(result.runResult.execution).toBeUndefined();

    expect(
      result.evidence.some(
        (evidence) =>
          evidence.type === "test-result"
      )
    ).toBe(false);

    expect(result.outcome.status).toBe("failed");
  });

  it("still blocks execution when the requested capability is not granted", () => {
    const result =
      runDuplicateUsernameReferenceScenario({
        candidates: [duplicateSafeCandidate()],
        requestedCapabilityId:
          "deployment.execute",
      });

    expect(result.runResult.status).toBe(
      "blocked"
    );

    expect(result.runResult.execution).toBeUndefined();

    expect(result.outcome.status).toBe("failed");
  });
});