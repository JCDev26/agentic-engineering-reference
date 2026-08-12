import {
    describe,
    expect,
    it,
    vi,
  } from "vitest";
  
  import { DeterministicWorkflowRunner } from "../src/core/workflow-runner.js";
  
  import type { Workflow } from "../src/domain/workflow.js";
  
  describe("DeterministicWorkflowRunner", () => {
    it("executes stages based on dependency readiness rather than array order", () => {
      const executionOrder: string[] = [];
  
      const workflow: Workflow = {
        id: "workflow-readiness-001",
        intentId: "intent-001",
        stages: [
          {
            id: "validation",
            responsibility:
              "Validate upstream outputs.",
            expectedContribution:
              "Validation result.",
            dependencies: [
              "implementation",
              "compatibility",
            ],
            policyIds: [],
            evidenceRequirements: [],
            completionCriteria: [],
          },
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
            id: "compatibility",
            responsibility:
              "Produce compatibility evidence.",
            expectedContribution:
              "Compatibility result.",
            dependencies: [],
            policyIds: [],
            evidenceRequirements: [],
            completionCriteria: [],
          },
        ],
        completionCriteria: [],
      };
  
      const runner =
        new DeterministicWorkflowRunner();
  
      const result = runner.run(
        workflow,
        [
          {
            stageId: "implementation",
            handler: {
              execute: () => {
                executionOrder.push(
                  "implementation"
                );
  
                return {
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
                };
              },
            },
          },
          {
            stageId: "compatibility",
            handler: {
              execute: () => {
                executionOrder.push(
                  "compatibility"
                );
  
                return {
                  stageId:
                    "compatibility",
                  contributionId:
                    "contribution-compatibility",
                  status:
                    "completed",
                  summary:
                    "Compatibility completed.",
                  evidence: [],
                  artifactReferences: [
                    "artifact:compatibility",
                  ],
                };
              },
            },
          },
          {
            stageId: "validation",
            handler: {
              execute: (
                incomingHandoffs
              ) => {
                executionOrder.push(
                  "validation"
                );
  
                expect(
                  incomingHandoffs
                ).toHaveLength(2);
  
                expect(
                  incomingHandoffs.flatMap(
                    (handoff) =>
                      handoff.artifactReferences
                  )
                ).toEqual(
                  expect.arrayContaining([
                    "artifact:implementation",
                    "artifact:compatibility",
                  ])
                );
  
                return {
                  stageId:
                    "validation",
                  contributionId:
                    "contribution-validation",
                  status:
                    "completed",
                  summary:
                    "Validation completed.",
                  evidence: [],
                };
              },
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
        "compatibility",
        "validation",
      ]);
  
      expect(executionOrder).toEqual([
        "implementation",
        "compatibility",
        "validation",
      ]);
  
      expect(
        result.handoffs
      ).toHaveLength(2);
    });
  
    it("does not execute downstream stages when an upstream stage fails", () => {
      const validationHandler =
        vi.fn();
  
      const workflow: Workflow = {
        id: "workflow-failure-001",
        intentId: "intent-001",
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
  
      const result =
        new DeterministicWorkflowRunner().run(
          workflow,
          [
            {
              stageId:
                "implementation",
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
        result.failureReason
      ).toBe("stage-failed");
  
      expect(
        result.failedStageId
      ).toBe("implementation");
  
      expect(
        validationHandler
      ).not.toHaveBeenCalled();
    });
  
    it("reports a dependency deadlock when no remaining stage can become ready", () => {
      const workflow: Workflow = {
        id: "workflow-deadlock-001",
        intentId: "intent-001",
        stages: [
          {
            id: "stage-a",
            responsibility:
              "Stage A",
            expectedContribution:
              "A",
            dependencies: [
              "stage-b",
            ],
            policyIds: [],
            evidenceRequirements: [],
            completionCriteria: [],
          },
          {
            id: "stage-b",
            responsibility:
              "Stage B",
            expectedContribution:
              "B",
            dependencies: [
              "stage-a",
            ],
            policyIds: [],
            evidenceRequirements: [],
            completionCriteria: [],
          },
        ],
        completionCriteria: [],
      };
  
      const result =
        new DeterministicWorkflowRunner().run(
          workflow,
          []
        );
  
      expect(result.status).toBe(
        "failed"
      );
  
      expect(
        result.failureReason
      ).toBe(
        "dependency-deadlock"
      );
  
      expect(
        result.failedStageId
      ).toBeUndefined();
  
      expect(
        result.completedStageIds
      ).toEqual([]);
  
      expect(
        result.unresolvedStageIds
      ).toEqual([
        "stage-a",
        "stage-b",
      ]);
    });
  });