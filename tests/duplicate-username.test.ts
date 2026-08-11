import { describe, expect, it } from "vitest";

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

    expect(result.outcome.workflowId).toBe(
      "workflow-001"
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
});