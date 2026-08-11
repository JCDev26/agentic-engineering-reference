// src/domain/capability.ts

export interface Capability {
    id: string;
    action: string;
    scope: string[];
  
    conditions?: string[];
    resourceLimits?: {
      maxInvocations?: number;
      maxDurationMs?: number;
      maxCost?: number;
    };
  }