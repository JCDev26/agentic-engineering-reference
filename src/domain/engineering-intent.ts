import type { EvidenceRequirement } from "./evaluation.js";

export interface EngineeringIntent {
  id: string;
  objective: string;
  acceptanceCriteria: string[];
  constraints: string[];
  validationRequirements: string[];
  evidenceRequirements: string[];
  /** Executable requirements, authored explicitly rather than inferred from prose. */
  evaluationRequirements: EvidenceRequirement[];

  riskLevel?: string;
  businessContext?: string;
  nonGoals?: string[];
}
