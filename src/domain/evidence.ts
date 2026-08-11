// src/domain/evidence.ts

export type EvidenceType =
  | "test-result"
  | "source-diff"
  | "log"
  | "screenshot"
  | "recording"
  | "command-output"
  | "policy-result"
  | "capability-result"
  | "approval"
  | "handoff"
  | "evaluation-result";

export interface Evidence {
  id: string;
  contributionId: string;
  type: EvidenceType;
  timestamp: string;
  contentReference: string;

  producer?: string;
  metadata?: Record<string, unknown>;
  integrity?: {
    checksum?: string;
    provenance?: string;
  };
}