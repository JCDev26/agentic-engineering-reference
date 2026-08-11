// src/domain/outcome.ts

import type { Evidence } from "./evidence.js";

export type OutcomeStatus =
  | "completed"
  | "failed"
  | "rejected"
  | "escalated"
  | "cancelled"
  | "no-change-required";

export interface Outcome {
  workflowId: string;
  status: OutcomeStatus;
  summary: string;
  evidence: Evidence[];

  deliveredArtifacts?: string[];
  followUpWork?: string[];
}