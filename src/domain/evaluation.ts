// src/domain/evaluation.ts

import type { Evidence } from "./evidence.js";

export type EvaluationResult =
  | "passed"
  | "failed"
  | "inconclusive"
  | "requires-review";

export interface Evaluation {
  id: string;
  targetId: string;
  targetType: "contribution" | "stage" | "workflow";
  criteria: string[];
  evidence: Evidence[];
  result: EvaluationResult;

  evaluator?: string;
  confidence?: number;
  findings?: string[];
}