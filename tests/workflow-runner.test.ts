import {
    describe,
    expect,
    it,
    vi,
  } from "vitest";
  
  import { DeterministicWorkflowRunner } from "../src/core/workflow-runner.js";
  
  import type { Workflow } from "../src/domain/workflow.js";
  
  const workflow: Workflow = {
    id: "workflow-test-001",
    intentId: "intent-test-001",
    stages: [
      {
        id: "implementation",
        responsibility:
          "Produce implementation.",
        expectedContribution:
          "Implementation artifact.",
        dependencies: [],
        policyIds: [],
        evidenceRequirements: [],
        completionCriteria: [],
      },
      {
        id: "validation",
        responsibility:
          "Validate implementation.",
        expectedContribution:
          "Validation result.",
        dependencies: [
          "implementation",
        ],
        policyIds: [],
        evidenceRequirements: [],
        completionCriteria: [],
      },
    ],
    completionCriteria: [],
  };
  
  describe("DeterministicWorkflowRunner", () => {
    it("progresses through dependent stages and creates a handoff", () => {
      const validationHandler = vi.fn(
        (handoffs) => ({
          stageId: "validation",
          contributionId:
            "contribution-validation",
          status:
            "completed" as const,
          summary:
            "Validation completed.",
          evidence: [],
        })
      );
  
      const runner =
        new DeterministicWorkflowRunner();
  
      const result = runner.run(
        workflow,
        [
          {
            stageId: "implementation",
            handler: {
              execute: () => ({
                stageId:
                  "implementation",
                contributionId:
                  "contribution-implementation",
                status:
                  "completed",
                summary:
                  "Implementation completed.",
                evidence: [],
                artifactReferences: [
                  "artifact:implementation",
                ],
              }),
            },
          },
          {
            stageId: "validation",
            handler: {
              execute:
                validationHandler,
            },
          },
        ]
      );
  
      expect(result.status).toBe(
        "completed"
      );
  
      expect(
        result.completedStageIds
      ).toEqual([
        "implementation",
        "validation",
      ]);
  
      expect(result.handoffs).toHaveLength(
        1
      );
  
      expect(
        result.handoffs[0]
      ).toMatchObject({
        fromStageId:
          "implementation",
        toStageId: "validation",
        artifactReferences: [
          "artifact:implementation",
        ],
      });
  
      expect(
        validationHandler
      ).toHaveBeenCalledOnce();
  
      const receivedHandoffs =
        validationHandler.mock.calls[0]?.[0];
  
      expect(
        receivedHandoffs?.[0]
          ?.artifactReferences
      ).toEqual([
        "artifact:implementation",
      ]);
  
      expect(
        result.evidence.some(
          (evidence) =>
            evidence.type === "handoff"
        )
      ).toBe(true);
    });
  
    it("does not execute downstream stages when an upstream stage fails", () => {
      const validationHandler =
        vi.fn();
  
      const runner =
        new DeterministicWorkflowRunner();
  
      const result = runner.run(
        workflow,
        [
          {
            stageId: "implementation",
            handler: {
              execute: () => ({
                stageId:
                  "implementation",
                contributionId:
                  "contribution-implementation",
                status: "failed",
                summary:
                  "Implementation failed.",
                evidence: [],
              }),
            },
          },
          {
            stageId: "validation",
            handler: {
              execute:
                validationHandler,
            },
          },
        ]
      );
  
      expect(result.status).toBe(
        "failed"
      );
  
      expect(
        result.failedStageId
      ).toBe("implementation");
  
      expect(
        result.completedStageIds
      ).toEqual([]);
  
      expect(result.handoffs).toEqual(
        []
      );
  
      expect(
        validationHandler
      ).not.toHaveBeenCalled();
    });
  });