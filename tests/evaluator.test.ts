import { describe, expect, it } from "vitest";

import { DeterministicEvaluator } from "../src/core/evaluator.js";

import type { Evidence } from "../src/domain/evidence.js";

const capabilityEvidence: Evidence = {
  id: "evidence-capability-001",
  contributionId: "contribution-001",
  type: "capability-result",
  timestamp: "2026-08-11T16:00:00.000Z",
  contentReference: "capability:source.write",
  producer: "contribution-runner",
  metadata: {
    capabilityId: "source.write",
    granted: true,
  },
};

const policyEvidence: Evidence = {
  id: "evidence-policy-001",
  contributionId: "contribution-001",
  type: "policy-result",
  timestamp: "2026-08-11T16:00:01.000Z",
  contentReference: "policy:source-scope",
  producer: "deterministic-policy-engine",
  metadata: {
    allowed: true,
  },
};

const executionEvidence: Evidence = {
  id: "evidence-execution-001",
  contributionId: "contribution-001",
  type: "command-output",
  timestamp: "2026-08-11T16:00:02.000Z",
  contentReference: "execution:contribution-001",
  producer: "executor",
  metadata: {
    capabilityId: "source.write",
    status: "succeeded",
  },
};

describe("DeterministicEvaluator", () => {
  it("passes when all required evidence types are present", () => {
    const evaluator = new DeterministicEvaluator();

    const evaluation = evaluator.evaluate({
      id: "evaluation-001",
      targetId: "contribution-001",
      targetType: "contribution",
      requiredEvidenceTypes: [
        "capability-result",
        "policy-result",
        "command-output",
      ],
      evidence: [
        capabilityEvidence,
        policyEvidence,
        executionEvidence,
      ],
    });

    expect(evaluation.result).toBe("passed");
    expect(evaluation.confidence).toBe(1);
    expect(evaluation.findings).toEqual([
      "All required evidence types are present.",
    ]);
  });

  it("fails when required evidence is missing", () => {
    const evaluator = new DeterministicEvaluator();

    const evaluation = evaluator.evaluate({
      id: "evaluation-002",
      targetId: "contribution-001",
      targetType: "contribution",
      requiredEvidenceTypes: [
        "capability-result",
        "policy-result",
        "command-output",
      ],
      evidence: [
        capabilityEvidence,
        policyEvidence,
      ],
    });

    expect(evaluation.result).toBe("failed");

    expect(evaluation.findings).toEqual([
      "Missing required evidence: command-output.",
    ]);
  });
});