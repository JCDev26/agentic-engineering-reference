import { describe, expect, it } from "vitest";

import {
  DeterministicContributorExecutor,
  SimulatedContributorExecutor,
} from "../src/core/contributor-executor.js";
import type { ContributorCandidate } from "../src/core/contribution-strategy.js";
import { DeterministicExecutor } from "../src/core/executor.js";
import { runDuplicateUsernameReferenceScenario } from "../src/scenarios/duplicate-username.js";

import type { UserCreator } from "../src/reference-app/create-user.js";

function deterministicCandidate(): ContributorCandidate {
  return {
    contributor: {
      id: "local-automation",
      type: "automation",
      capabilityIds: ["source.write"],
      available: true,
      provider: "reference-local",
    },
    executor:
      new DeterministicContributorExecutor(
        new DeterministicExecutor()
      ),
  };
}

function simulatedCandidate(): ContributorCandidate {
  return {
    contributor: {
      id: "simulated-contributor",
      type: "external-service",
      capabilityIds: ["source.write"],
      available: true,
      provider: "reference-simulated",
    },
    executor: new SimulatedContributorExecutor(),
  };
}

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

describe("Reference Scenario 001: Prevent Duplicate Usernames", () => {
  it("produces a completed outcome when governed execution satisfies engineering acceptance criteria", () => {
    const result =
      runDuplicateUsernameReferenceScenario();

    expect(result.workItem.intentId).toBe(
      result.intent.id
    );

    expect(result.workflow.intentId).toBe(
      result.intent.id
    );

    expect(result.contribution.workflowId).toBe(
      result.workflow.id
    );

    expect(result.selectedContributor.id).toBe(
      "local-automation"
    );

    expect(result.runResult.status).toBe(
      "executed"
    );

    expect(
      result.evidence.map(
        (evidence) => evidence.type
      )
    ).toEqual([
      "capability-result",
      "policy-result",
      "command-output",
      "test-result",
    ]);

    expect(
      result.evidence[3]?.metadata
    ).toMatchObject({
      status: "passed",
      uniqueCreationPassed: true,
      duplicateRejectionPassed: true,
      subsequentValidCreationPassed: true,
    });

    expect(result.evaluation.result).toBe(
      "passed"
    );

    expect(result.outcome.status).toBe(
      "completed"
    );
  });

  it("produces a failed outcome when policy prevents execution", () => {
    const result =
      runDuplicateUsernameReferenceScenario({
        requestedTarget: "README.md",
      });

    expect(result.runResult.status).toBe(
      "blocked"
    );

    expect(
      result.evidence.some(
        (evidence) =>
          evidence.type === "command-output"
      )
    ).toBe(false);

    expect(
      result.evidence.some(
        (evidence) =>
          evidence.type === "test-result"
      )
    ).toBe(false);

    expect(result.evaluation.result).toBe(
      "failed"
    );

    expect(result.outcome.status).toBe(
      "failed"
    );
  });

  it("produces a failed outcome when the contribution lacks the requested capability", () => {
    const result =
      runDuplicateUsernameReferenceScenario({
        requestedCapabilityId:
          "deployment.execute",
      });

    expect(result.runResult.status).toBe(
      "blocked"
    );

    expect(result.evidence).toHaveLength(1);

    expect(
      result.evidence[0]?.metadata
    ).toMatchObject({
      capabilityId: "deployment.execute",
      granted: false,
    });

    expect(result.evaluation.result).toBe(
      "failed"
    );

    expect(result.outcome.status).toBe(
      "failed"
    );
  });

  it("preserves engineering contracts when contributor selection changes", () => {
    const deterministicResult =
      runDuplicateUsernameReferenceScenario({
        candidates: [deterministicCandidate()],
      });

    const simulatedResult =
      runDuplicateUsernameReferenceScenario({
        candidates: [simulatedCandidate()],
      });

    expect(
      deterministicResult.selectedContributor.id
    ).not.toBe(
      simulatedResult.selectedContributor.id
    );

    expect(deterministicResult.workItem).toEqual(
      simulatedResult.workItem
    );

    expect(deterministicResult.intent).toEqual(
      simulatedResult.intent
    );

    expect(deterministicResult.workflow).toEqual(
      simulatedResult.workflow
    );

    expect(
      deterministicResult.contribution
    ).toEqual(simulatedResult.contribution);

    expect(
      deterministicResult.contributorProfile
    ).toEqual(
      simulatedResult.contributorProfile
    );

    expect(
      deterministicResult.evaluation.result
    ).toBe(
      simulatedResult.evaluation.result
    );

    expect(
      deterministicResult.outcome.status
    ).toBe(
      simulatedResult.outcome.status
    );

    expect(
      deterministicResult.outcome.status
    ).toBe("completed");
  });

  it("fails the engineering outcome even when execution succeeds if acceptance criteria are not satisfied", () => {
    const result =
      runDuplicateUsernameReferenceScenario({
        userCreator: brokenUserCreator,
      });

    expect(result.runResult.status).toBe(
      "executed"
    );

    expect(
      result.runResult.execution?.status
    ).toBe("succeeded");

    const validationEvidence =
      result.evidence.find(
        (evidence) =>
          evidence.type === "test-result"
      );

    expect(validationEvidence).toBeDefined();

    expect(
      validationEvidence?.metadata
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
});