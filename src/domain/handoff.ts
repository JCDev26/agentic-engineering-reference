import type { Evidence } from "./evidence.js";

export interface Handoff {
  id: string;
  workflowId: string;
  fromStageId: string;
  toStageId: string;
  fromContributionId: string;
  timestamp: string;
  summary: string;
  evidence: Evidence[];
  artifactReferences: string[];
}