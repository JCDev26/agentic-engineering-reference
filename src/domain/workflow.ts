// src/domain/workflow.ts

export interface WorkflowStage {
    id: string;
    responsibility: string;
    expectedContribution: string;
    dependencies: string[];
    policyIds: string[];
    evidenceRequirements: string[];
    completionCriteria: string[];
  }
  
  export interface Workflow {
    id: string;
    intentId: string;
    stages: WorkflowStage[];
    completionCriteria: string[];
  }