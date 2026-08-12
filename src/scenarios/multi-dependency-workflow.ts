import {
    DeterministicWorkflowRunner,
    type WorkflowRunResult,
  } from "../core/workflow-runner.js";
  
  import type { Evidence } from "../domain/evidence.js";
  import type { Workflow } from "../domain/workflow.js";
  
  export interface MultiDependencyWorkflowScenarioResult {
    workflow: Workflow;
    workflowRun: WorkflowRunResult;
    executionOrder: string[];
  }
  
  function createEvidence(
    contributionId: string,
    contentReference: string
  ): Evidence {
    return {
      id: crypto.randomUUID(),
      contributionId,
      type: "command-output",
      timestamp:
        new Date().toISOString(),
      contentReference,
      producer:
        "multi-dependency-reference-scenario",
      metadata: {
        status: "succeeded",
      },
    };
  }
  
  export function runMultiDependencyWorkflowScenario(): MultiDependencyWorkflowScenarioResult {
    const executionOrder: string[] = [];
  
    const workflow: Workflow = {
      id: "workflow-readiness-reference-001",
      intentId:
        "intent-readiness-reference-001",
      stages: [
        {
          id: "validation",
          responsibility:
            "Validate implementation and compatibility results.",
          expectedContribution:
            "Combined validation result.",
          dependencies: [
            "implementation",
            "compatibility",
          ],
          policyIds: [],
          evidenceRequirements: [
            "handoff",
          ],
          completionCriteria: [
            "Both upstream results are available.",
          ],
        },
        {
          id: "compatibility",
          responsibility:
            "Check compatibility.",
          expectedContribution:
            "Compatibility evidence.",
          dependencies: [],
          policyIds: [],
          evidenceRequirements: [
            "command-output",
          ],
          completionCriteria: [
            "Compatibility check completes.",
          ],
        },
        {
          id: "implementation",
          responsibility:
            "Produce implementation.",
          expectedContribution:
            "Implementation artifact.",
          dependencies: [],
          policyIds: [],
          evidenceRequirements: [
            "command-output",
          ],
          completionCriteria: [
            "Implementation completes.",
          ],
        },
      ],
      completionCriteria: [
        "All stages complete.",
      ],
    };
  
    const workflowRun =
      new DeterministicWorkflowRunner().run(
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
                    "contribution-readiness-implementation",
                  status:
                    "completed",
                  summary:
                    "Implementation completed.",
                  evidence: [
                    createEvidence(
                      "contribution-readiness-implementation",
                      "implementation:complete"
                    ),
                  ],
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
                    "contribution-readiness-compatibility",
                  status:
                    "completed",
                  summary:
                    "Compatibility completed.",
                  evidence: [
                    createEvidence(
                      "contribution-readiness-compatibility",
                      "compatibility:complete"
                    ),
                  ],
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
  
                const references =
                  incomingHandoffs.flatMap(
                    (handoff) =>
                      handoff.artifactReferences
                  );
  
                const hasRequiredArtifacts =
                  references.includes(
                    "artifact:implementation"
                  ) &&
                  references.includes(
                    "artifact:compatibility"
                  );
  
                return {
                  stageId:
                    "validation",
                  contributionId:
                    "contribution-readiness-validation",
                  status:
                    hasRequiredArtifacts
                      ? "completed"
                      : "failed",
                  summary:
                    hasRequiredArtifacts
                      ? "Validation received all required upstream artifacts."
                      : "Validation was missing required upstream artifacts.",
                  evidence: [
                    {
                      id: crypto.randomUUID(),
                      contributionId:
                        "contribution-readiness-validation",
                      type:
                        "test-result",
                      timestamp:
                        new Date().toISOString(),
                      contentReference:
                        "validation:combined-upstream",
                      producer:
                        "multi-dependency-reference-scenario",
                      metadata: {
                        status:
                          hasRequiredArtifacts
                            ? "passed"
                            : "failed",
                      },
                    },
                  ],
                };
              },
            },
          },
        ]
      );
  
    return {
      workflow,
      workflowRun,
      executionOrder,
    };
  }