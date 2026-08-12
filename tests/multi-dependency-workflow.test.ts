import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import { runMultiDependencyWorkflowScenario } from "../src/scenarios/multi-dependency-workflow.js";
  
  describe("Multi-dependency workflow readiness", () => {
    it("executes a stage only after all dependencies complete even when the workflow array is out of order", () => {
      const result =
        runMultiDependencyWorkflowScenario();
  
      expect(
        result.workflow.stages.map(
          (stage) => stage.id
        )
      ).toEqual([
        "validation",
        "compatibility",
        "implementation",
      ]);
  
      expect(
        result.workflowRun.status
      ).toBe("completed");
  
      expect(
        result.executionOrder
      ).toEqual([
        "compatibility",
        "implementation",
        "validation",
      ]);
  
      expect(
        result.workflowRun
          .completedStageIds
      ).toEqual([
        "compatibility",
        "implementation",
        "validation",
      ]);
  
      expect(
        result.workflowRun.handoffs
      ).toHaveLength(2);
  
      const validationHandoffs =
        result.workflowRun.handoffs.filter(
          (handoff) =>
            handoff.toStageId ===
            "validation"
        );
  
      expect(
        validationHandoffs
      ).toHaveLength(2);
  
      expect(
        validationHandoffs.flatMap(
          (handoff) =>
            handoff.artifactReferences
        )
      ).toEqual(
        expect.arrayContaining([
          "artifact:implementation",
          "artifact:compatibility",
        ])
      );
    });
  });