import { describe, expect, it } from "vitest";

import {
  DeterministicContributorExecutor,
  SimulatedContributorExecutor,
} from "../src/core/contributor-executor.js";
import { DeterministicExecutor } from "../src/core/executor.js";
import { runDuplicateUsernameReferenceScenario } from "../src/scenarios/duplicate-username.js";

describe("Reference Scenario 001: Prevent Duplicate Usernames", () => {
  it("produces a completed outcome when governed execution satisfies evaluation requirements", () => {
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

    expect(result.runResult.status).toBe(
      "executed"
    );

    expect(result.runResult.evidence).toHaveLength(
      3
    );

    expect(
      result.runResult.evidence.map(
        (evidence) => evidence.type
      )
    ).toEqual([
      "capability-result",
      "policy-result",
      "command-output",
    ]);

    expect(result.evaluation.result).toBe("passed");
    expect(result.outcome.status).toBe("completed");
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
      result.runResult.evidence.some(
        (evidence) =>
          evidence.type === "command-output"
      )
    ).toBe(false);

    expect(result.evaluation.result).toBe(
      "failed"
    );

    expect(result.outcome.status).toBe("failed");
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

    expect(result.runResult.evidence).toHaveLength(
      1
    );

    expect(
      result.runResult.evidence[0]?.type
    ).toBe("capability-result");

    expect(
      result.runResult.evidence[0]?.metadata
    ).toMatchObject({
      capabilityId: "deployment.execute",
      granted: false,
    });

    expect(result.evaluation.result).toBe(
      "failed"
    );

    expect(result.outcome.status).toBe("failed");
  });

  it("preserves engineering contracts across contributor implementations", () => {
    const deterministicResult =
      runDuplicateUsernameReferenceScenario({
        contributorExecutor:
          new DeterministicContributorExecutor(
            new DeterministicExecutor()
          ),
      });

    const simulatedResult =
      runDuplicateUsernameReferenceScenario({
        contributorExecutor:
          new SimulatedContributorExecutor(),
      });

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
      deterministicResult.evaluation.result
    ).toBe(simulatedResult.evaluation.result);

    expect(
      deterministicResult.outcome.status
    ).toBe(simulatedResult.outcome.status);

    expect(
      deterministicResult.outcome.status
    ).toBe("completed");
  });
});