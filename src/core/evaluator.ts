import type { Evaluation } from "../domain/evaluation.js";
import type {
  Evidence,
  EvidenceType,
} from "../domain/evidence.js";

export interface EvaluationRequest {
  id: string;
  targetId: string;
  targetType: "contribution" | "stage" | "workflow";
  requiredEvidenceTypes: EvidenceType[];
  evidence: Evidence[];
}

export interface Evaluator {
  evaluate(request: EvaluationRequest): Evaluation;
}

export class DeterministicEvaluator implements Evaluator {
  evaluate(request: EvaluationRequest): Evaluation {
    const missingEvidenceTypes =
      request.requiredEvidenceTypes.filter(
        (requiredType) =>
          !request.evidence.some(
            (evidence) => evidence.type === requiredType
          )
      );

    const passed = missingEvidenceTypes.length === 0;

    return {
      id: request.id,
      targetId: request.targetId,
      targetType: request.targetType,
      criteria: request.requiredEvidenceTypes.map(
        (type) => `Evidence of type "${type}" is required.`
      ),
      evidence: request.evidence,
      result: passed ? "passed" : "failed",
      evaluator: "deterministic-evaluator",
      confidence: 1,
      findings: passed
        ? ["All required evidence types are present."]
        : [
            `Missing required evidence: ${missingEvidenceTypes.join(
              ", "
            )}.`,
          ],
    };
  }
}