// src/domain/contribution.ts

import type { Capability } from "./capability";

export interface Contribution {
  id: string;
  workflowId: string;
  stageId: string;
  objective: string;
  scope: string[];
  contributorProfileId: string;
  capabilityIds: string[];
  policyIds: string[];
  evidenceRequirements: string[];
  completionCriteria: string[];

  timeoutMs?: number;
  retryLimit?: number;
  resourceBudget?: {
    maxCost?: number;
    maxTokens?: number;
    maxDurationMs?: number;
  };
  executionEnvironmentId?: string;
}