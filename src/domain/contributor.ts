// src/domain/contributor.ts

export type ContributorType =
  | "human"
  | "ai"
  | "automation"
  | "pipeline"
  | "script"
  | "external-service";

export interface Contributor {
  id: string;
  type: ContributorType;
  capabilityIds: string[];
  available: boolean;

  provider?: string;
  metadata?: Record<string, unknown>;
  performanceProfile?: Record<string, unknown>;
}

export interface ContributorProfile {
  id: string;
  role: string;
  responsibilities: string[];
  allowedCapabilityIds: string[];
  requiredPolicyIds: string[];

  guidance?: string[];
  preferredContributorTypes?: ContributorType[];
}