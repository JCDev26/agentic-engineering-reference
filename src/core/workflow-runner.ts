import type { Evidence } from "../domain/evidence.js";
import type { Handoff } from "../domain/handoff.js";
import type {
  Workflow,
  WorkflowStage,
} from "../domain/workflow.js";

export type WorkflowStageRunStatus =
  | "completed"
  | "failed";

export interface WorkflowStageRunResult {
  stageId: string;
  contributionId: string;
  status: WorkflowStageRunStatus;
  summary: string;
  evidence: Evidence[];
  artifactReferences?: string[];
}

export interface WorkflowStageHandler {
  execute(
    incomingHandoffs: Handoff[]
  ): WorkflowStageRunResult;
}

export interface WorkflowStageBinding {
  stageId: string;
  handler: WorkflowStageHandler;
}

export type WorkflowRunStatus =
  | "completed"
  | "failed";

export interface WorkflowRunResult {
  workflowId: string;
  status: WorkflowRunStatus;
  completedStageIds: string[];
  evidence: Evidence[];
  handoffs: Handoff[];
  failedStageId?: string;
}

export class DeterministicWorkflowRunner {
  run(
    workflow: Workflow,
    bindings: WorkflowStageBinding[]
  ): WorkflowRunResult {
    const completedStageIds: string[] = [];
    const evidence: Evidence[] = [];
    const handoffs: Handoff[] = [];

    for (const stage of workflow.stages) {
      const dependenciesSatisfied =
        stage.dependencies.every(
          (dependencyId) =>
            completedStageIds.includes(dependencyId)
        );

      if (!dependenciesSatisfied) {
        return {
          workflowId: workflow.id,
          status: "failed",
          completedStageIds,
          evidence,
          handoffs,
          failedStageId: stage.id,
        };
      }

      const binding = bindings.find(
        (candidate) =>
          candidate.stageId === stage.id
      );

      if (binding === undefined) {
        return {
          workflowId: workflow.id,
          status: "failed",
          completedStageIds,
          evidence,
          handoffs,
          failedStageId: stage.id,
        };
      }

      const incomingHandoffs =
        handoffs.filter(
          (handoff) =>
            handoff.toStageId === stage.id
        );

      const stageResult =
        binding.handler.execute(
          incomingHandoffs
        );

      if (stageResult.stageId !== stage.id) {
        throw new Error(
          `Stage handler returned "${stageResult.stageId}" while executing "${stage.id}".`
        );
      }

      evidence.push(...stageResult.evidence);

      if (stageResult.status === "failed") {
        return {
          workflowId: workflow.id,
          status: "failed",
          completedStageIds,
          evidence,
          handoffs,
          failedStageId: stage.id,
        };
      }

      completedStageIds.push(stage.id);

      const downstreamStages =
        this.findDependentStages(
          workflow.stages,
          stage.id
        );

      for (
        const downstreamStage of downstreamStages
      ) {
        const handoff =
          this.createHandoff(
            workflow.id,
            stage,
            downstreamStage,
            stageResult
          );

        handoffs.push(handoff);

        evidence.push(
          this.createHandoffEvidence(handoff)
        );
      }
    }

    return {
      workflowId: workflow.id,
      status: "completed",
      completedStageIds,
      evidence,
      handoffs,
    };
  }

  private findDependentStages(
    stages: WorkflowStage[],
    completedStageId: string
  ): WorkflowStage[] {
    return stages.filter((stage) =>
      stage.dependencies.includes(
        completedStageId
      )
    );
  }

  private createHandoff(
    workflowId: string,
    fromStage: WorkflowStage,
    toStage: WorkflowStage,
    result: WorkflowStageRunResult
  ): Handoff {
    return {
      id: crypto.randomUUID(),
      workflowId,
      fromStageId: fromStage.id,
      toStageId: toStage.id,
      fromContributionId:
        result.contributionId,
      timestamp: new Date().toISOString(),
      summary:
        `Handoff from ${fromStage.id} to ${toStage.id}.`,
      evidence: result.evidence,
      artifactReferences:
        result.artifactReferences ?? [],
    };
  }

  private createHandoffEvidence(
    handoff: Handoff
  ): Evidence {
    return {
      id: crypto.randomUUID(),
      contributionId:
        handoff.fromContributionId,
      type: "handoff",
      timestamp: handoff.timestamp,
      contentReference:
        `handoff:${handoff.id}`,
      producer:
        "deterministic-workflow-runner",
      metadata: {
        fromStageId: handoff.fromStageId,
        toStageId: handoff.toStageId,
        artifactReferences:
          handoff.artifactReferences,
      },
    };
  }
}