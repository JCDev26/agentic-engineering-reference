import type { Evaluation } from "../domain/evaluation.js";
import type {
    Evidence,
    EvidenceType,
} from "../domain/evidence.js";

export interface EvidenceRequirement {
    type: EvidenceType;
    metadata?: Record<string, unknown>;
}

export interface EvaluationRequest {
    id: string;
    targetId: string;
    targetType: "contribution" | "stage" | "workflow";
    requirements: EvidenceRequirement[];
    evidence: Evidence[];
}

export interface Evaluator {
    evaluate(request: EvaluationRequest): Evaluation;
}

export class DeterministicEvaluator implements Evaluator {
    evaluate(request: EvaluationRequest): Evaluation {
        const failedRequirements = request.requirements.filter(
            (requirement) =>
                !request.evidence.some((evidence) =>
                    this.satisfiesRequirement(evidence, requirement)
                )
        );

        const passed = failedRequirements.length === 0;

        return {
            id: request.id,
            targetId: request.targetId,
            targetType: request.targetType,
            criteria: request.requirements.map((requirement) =>
                this.describeRequirement(requirement)
            ),
            evidence: request.evidence,
            result: passed ? "passed" : "failed",
            evaluator: "deterministic-evaluator",
            confidence: 1,
            findings: passed
                ? ["All evidence requirements are satisfied."]
                : failedRequirements.map(
                    (requirement) =>
                        `Unsatisfied evidence requirement: ${this.describeRequirement(
                            requirement
                        )}`
                ),
        };
    }

    private satisfiesRequirement(
        evidence: Evidence,
        requirement: EvidenceRequirement
    ): boolean {
        if (evidence.type !== requirement.type) {
            return false;
        }

        if (requirement.metadata === undefined) {
            return true;
        }

        if (evidence.metadata === undefined) {
            return false;
        }

        return Object.entries(requirement.metadata).every(
            ([key, expectedValue]) =>
                evidence.metadata?.[key] === expectedValue
        );
    }

    private describeRequirement(
        requirement: EvidenceRequirement
    ): string {
        if (requirement.metadata === undefined) {
            return `Evidence of type "${requirement.type}" is required.`;
        }

        const metadataRequirements = Object.entries(
            requirement.metadata
        )
            .map(
                ([key, value]) =>
                    `${key}=${JSON.stringify(value)}`
            )
            .join(", ");

        return `Evidence of type "${requirement.type}" with ${metadataRequirements} is required.`;
    }
}