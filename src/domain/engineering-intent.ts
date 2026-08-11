export interface EngineeringIntent {
    id: string;
    objective: string;
    acceptanceCriteria: string[];
    constraints: string[];
    validationRequirements: string[];
    evidenceRequirements: string[];
  
    riskLevel?: string;
    businessContext?: string;
    nonGoals?: string[];
  }