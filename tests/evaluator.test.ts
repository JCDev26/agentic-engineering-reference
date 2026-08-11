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

const successfulExecutionEvidence: Evidence = {
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

const failedExecutionEvidence: Evidence = {
    id: "evidence-execution-002",
    contributionId: "contribution-001",
    type: "command-output",
    timestamp: "2026-08-11T16:00:02.000Z",
    contentReference: "execution:contribution-001",
    producer: "executor",
    metadata: {
        capabilityId: "source.write",
        status: "failed",
    },
};

describe("DeterministicEvaluator", () => {
    it("passes when all evidence requirements are satisfied", () => {
        const evaluator = new DeterministicEvaluator();

        const evaluation = evaluator.evaluate({
            id: "evaluation-001",
            targetId: "contribution-001",
            targetType: "contribution",
            requirements: [
                {
                    type: "capability-result",
                    metadata: {
                        granted: true,
                    },
                },
                {
                    type: "policy-result",
                    metadata: {
                        allowed: true,
                    },
                },
                {
                    type: "command-output",
                    metadata: {
                        status: "succeeded",
                    },
                },
            ],
            evidence: [
                capabilityEvidence,
                policyEvidence,
                successfulExecutionEvidence,
            ],
        });

        expect(evaluation.result).toBe("passed");
        expect(evaluation.confidence).toBe(1);

        expect(evaluation.findings).toEqual([
            "All evidence requirements are satisfied.",
        ]);
    });

    it("fails when required evidence is missing", () => {
        const evaluator = new DeterministicEvaluator();

        const evaluation = evaluator.evaluate({
            id: "evaluation-002",
            targetId: "contribution-001",
            targetType: "contribution",
            requirements: [
                {
                    type: "command-output",
                    metadata: {
                        status: "succeeded",
                    },
                },
            ],
            evidence: [],
        });

        expect(evaluation.result).toBe("failed");
        expect(evaluation.findings).toHaveLength(1);
    });

    it("fails when evidence exists but does not satisfy the required result", () => {
        const evaluator = new DeterministicEvaluator();

        const evaluation = evaluator.evaluate({
            id: "evaluation-003",
            targetId: "contribution-001",
            targetType: "contribution",
            requirements: [
                {
                    type: "command-output",
                    metadata: {
                        status: "succeeded",
                    },
                },
            ],
            evidence: [failedExecutionEvidence],
        });

        expect(evaluation.result).toBe("failed");

        expect(evaluation.findings?.[0]).toContain(
            "Unsatisfied evidence requirement"
        );
    });
});