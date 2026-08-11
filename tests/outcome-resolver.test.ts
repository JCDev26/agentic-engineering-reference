import { describe, expect, it } from "vitest";

import { DeterministicOutcomeResolver } from "../src/core/outcome-resolver.js";

import type { Evaluation } from "../src/domain/evaluation.js";
import type { Evidence } from "../src/domain/evidence.js";

const executionEvidence: Evidence = {
  id: "evidence-execution-001",
  contributionId: "contribution-001",
  type: "command-output",
  timestamp: "2026-08-11T16:00:00.000Z",
  contentReference: "execution:contribution-001",
  producer: "executor",
  metadata: {
    capabilityId: "source.write",
    status: "succeeded",
  },
};

describe("DeterministicOutcomeResolver", () => {
  it("resolves a passed evaluation to a completed outcome", () => {
    const resolver = new DeterministicOutcomeResolver();

    const evaluation: Evaluation = {
      id: "evaluation-001",
      targetId: "contribution-001",
      targetType: "contribution",
      criteria: [
        'Evidence of type "command-output" with status="succeeded" is required.',
      ],
      evidence: [executionEvidence],
      result: "passed",
      evaluator: "deterministic-evaluator",
      confidence: 1,
      findings: [
        "All evidence requirements are satisfied.",
      ],
    };

    const outcome = resolver.resolve({
      workflowId: "workflow-001",
      evaluation,
    });

    expect(outcome.workflowId).toBe("workflow-001");
    expect(outcome.status).toBe("completed");
    expect(outcome.evidence).toEqual([
      executionEvidence,
    ]);

    expect(outcome.summary).toBe(
      "Workflow completed with satisfied evaluation criteria."
    );
  });

  it("resolves a failed evaluation to a failed outcome", () => {
    const resolver = new DeterministicOutcomeResolver();

    const evaluation: Evaluation = {
      id: "evaluation-002",
      targetId: "contribution-001",
      targetType: "contribution",
      criteria: [
        'Evidence of type "command-output" with status="succeeded" is required.',
      ],
      evidence: [executionEvidence],
      result: "failed",
      evaluator: "deterministic-evaluator",
      confidence: 1,
      findings: [
        "Required execution evidence did not satisfy the evaluation criteria.",
      ],
    };

    const outcome = resolver.resolve({
      workflowId: "workflow-001",
      evaluation,
    });

    expect(outcome.workflowId).toBe("workflow-001");
    expect(outcome.status).toBe("failed");
    expect(outcome.evidence).toEqual([
      executionEvidence,
    ]);

    expect(outcome.summary).toBe(
      "Workflow failed because evaluation criteria were not satisfied."
    );
  });
});