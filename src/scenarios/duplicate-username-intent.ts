import type { EngineeringIntent } from "../domain/engineering-intent.js";

export const duplicateUsernameValidationProducer =
  "duplicate-username-acceptance-validator";

/** Shared engineering meaning; each reference surface adds its own evidence boundary. */
export function createDuplicateUsernameIntent(
  surface: "contribution" | "workflow",
): EngineeringIntent {
  return {
    id: surface === "workflow" ? "intent-workflow-001" : "intent-001",
    objective:
      "Prevent duplicate usernames while preserving valid user creation behavior.",
    acceptanceCriteria: [
      "Unique usernames can be created.",
      "Duplicate usernames are rejected.",
      "Valid creation continues to work after duplicate rejection.",
    ],
    constraints: ["Implementation remains within the reference application."],
    validationRequirements: [
      "Implementation behavior is independently validated.",
    ],
    evidenceRequirements: [
      "capability-result",
      "policy-result",
      "command-output",
      "test-result",
      ...(surface === "workflow" ? ["handoff"] : []),
    ],
    evaluationRequirements: [
      { type: "capability-result", metadata: { granted: true } },
      { type: "policy-result", metadata: { allowed: true } },
      { type: "command-output", metadata: { status: "succeeded" } },
      {
        type: "test-result",
        producer: duplicateUsernameValidationProducer,
        contributionId:
          surface === "workflow"
            ? "contribution-validation-001"
            : "contribution-001",
        metadata: {
          status: "passed",
          uniqueCreationPassed: true,
          duplicateRejectionPassed: true,
          subsequentValidCreationPassed: true,
        },
      },
      ...(surface === "workflow"
        ? [
            {
              type: "handoff" as const,
              metadata: {
                fromStageId: "implementation",
                toStageId: "validation",
              },
            },
          ]
        : []),
    ],
    riskLevel: "low",
    nonGoals: ["Authentication redesign", "Deployment changes"],
  };
}
