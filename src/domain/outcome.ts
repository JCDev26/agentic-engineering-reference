import type { Evidence } from "./evidence.js";

export type OutcomeStatus =
  | "completed"
  | "failed"
  | "rejected"
  | "escalated"
  | "cancelled"
  | "no-change-required";

export type OutcomeReasonCode =
  | "governance-denied"
  | "contributor-selection-failed"
  | "stage-execution-failed"
  | "engineering-validation-failed"
  | "dependency-deadlock"
  | "missing-stage-binding"
  | "evaluation-failed";

export interface Outcome {
  workflowId: string;
  status: OutcomeStatus;
  summary: string;
  evidence: Evidence[];

  reasonCode?: OutcomeReasonCode;
  failedStageId?: string;
  unresolvedStageIds?: string[];

  deliveredArtifacts?: string[];
  followUpWork?: string[];
}