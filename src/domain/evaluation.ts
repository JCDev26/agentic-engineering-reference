// src/domain/evaluation.ts

import type { Evidence, EvidenceType } from "./evidence.js";

/** Deterministic evidence matching; metadata values use scalar equality. */
export interface EvidenceRequirement {
  type: EvidenceType;
  /** Select the intended source; these labels are not authenticated identities. */
  producer?: string;
  contributionId?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export type EvaluationResult =
  "passed" | "failed" | "inconclusive" | "requires-review";

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
