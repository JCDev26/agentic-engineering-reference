export interface WorkItem {
    id: string;
    title: string;
    description: string;
    source: string;
  
    intentId?: string;
    priority?: string;
    metadata?: Record<string, unknown>;
    artifacts?: string[];
    relationships?: string[];
  }