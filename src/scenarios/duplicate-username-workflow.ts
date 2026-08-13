import { ContributionRunner } from "../core/contribution-runner.js";
import type { ContributionFailureReason } from "../core/contribution-runner.js";
import {
  DeterministicContributionStrategy,
  type ContributorCandidate,
} from "../core/contribution-strategy.js";
import { InMemoryEvidenceRecorder } from "../core/evidence-recorder.js";
import { decideEvaluationApplicability } from "../core/evaluation-applicability.js";
import { DeterministicEvaluator } from "../core/evaluator.js";
import { DeterministicOutcomeResolver } from "../core/outcome-resolver.js";
import { DeterministicPolicyEngine } from "../core/policy-engine.js";
import {
  DeterministicWorkflowRunner,
  type WorkflowFailureReason,
  type WorkflowRunResult,
} from "../core/workflow-runner.js";

import type { Contribution } from "../domain/contribution.js";
import type {
  Contributor,
  ContributorProfile,
} from "../domain/contributor.js";
import type { EngineeringIntent } from "../domain/engineering-intent.js";
import type { Evaluation } from "../domain/evaluation.js";
import type { Outcome } from "../domain/outcome.js";
import type { Policy } from "../domain/policy.js";
import type { WorkItem } from "../domain/work-item.js";
import type { Workflow } from "../domain/workflow.js";

import {
  duplicateSafeCandidate,
} from "./duplicate-username.js";
import {
  DuplicateUsernameValidationContributorExecutor,
} from "./duplicate-username-validation-contributors.js";

export interface DuplicateUsernameWorkflowScenarioResult {
  workItem: WorkItem;
  intent: EngineeringIntent;
  workflow: Workflow;
  implementationContribution:
    Contribution;
  validationContribution:
    Contribution;
  selectedImplementationContributor:
    Contributor | undefined;
  selectedValidationContributor:
    Contributor | undefined;
  workflowRun: WorkflowRunResult;
  evaluation: Evaluation;
  outcome: Outcome;
}

export interface DuplicateUsernameWorkflowScenarioOptions {
  implementationCandidates?:
    ContributorCandidate[];
  validationCandidates?:
    ContributorCandidate[];
  implementationTarget?: string;
}

export function duplicateUsernameValidatorCandidate(): ContributorCandidate {
  return {
    contributor: {
      id:
        "duplicate-username-validator",
      type: "automation",
      capabilityIds: [
        "validation.execute",
      ],
      available: true,
      provider:
        "reference-local",
    },
    executor:
      new DuplicateUsernameValidationContributorExecutor(),
  };
}

function mapContributionFailureToWorkflowFailure(
  reason:
    | ContributionFailureReason
    | undefined
): WorkflowFailureReason {
  switch (reason) {
    case "capability-denied":
    case "policy-denied":
      return "governance-denied";

    case "execution-failed":
    default:
      return "execution-failed";
  }
}

export function runDuplicateUsernameMultiStageScenario(
  options: DuplicateUsernameWorkflowScenarioOptions = {}
): DuplicateUsernameWorkflowScenarioResult {
  const intent: EngineeringIntent = {
    id: "intent-workflow-001",
    objective:
      "Prevent duplicate usernames while preserving valid user creation behavior.",
    acceptanceCriteria: [
      "Unique usernames can be created.",
      "Duplicate usernames are rejected.",
      "Valid user creation remains functional.",
    ],
    constraints: [
      "Implementation remains within the reference application.",
    ],
    validationRequirements: [
      "Implementation artifact is independently validated.",
    ],
    evidenceRequirements: [
      "command-output",
      "handoff",
      "test-result",
    ],
    riskLevel: "low",
  };

  const workItem: WorkItem = {
    id: "WI-WORKFLOW-001",
    title:
      "Prevent duplicate usernames through multi-stage workflow",
    description:
      "Implement and independently validate duplicate username prevention.",
    source:
      "reference-scenario",
    intentId: intent.id,
    priority: "medium",
  };

  const workflow: Workflow = {
    id:
      "workflow-multi-stage-001",
    intentId: intent.id,
    stages: [
      {
        id:
          "implementation",
        responsibility:
          "Produce user-creation implementation behavior.",
        expectedContribution:
          "Implementation artifact.",
        dependencies: [],
        policyIds: [
          "implementation-source-scope",
        ],
        evidenceRequirements: [
          "capability-result",
          "policy-result",
          "command-output",
        ],
        completionCriteria: [
          "Implementation execution succeeds.",
          "Implementation artifact is produced.",
        ],
      },
      {
        id: "validation",
        responsibility:
          "Independently validate the implementation artifact.",
        expectedContribution:
          "Acceptance validation result.",
        dependencies: [
          "implementation",
        ],
        policyIds: [
          "validation-artifact-scope",
        ],
        evidenceRequirements: [
          "capability-result",
          "policy-result",
          "command-output",
          "test-result",
        ],
        completionCriteria: [
          "Validation executes.",
          "Acceptance criteria are satisfied.",
        ],
      },
    ],
    completionCriteria: [
      "Implementation and validation stages complete.",
      "Acceptance evidence satisfies engineering intent.",
    ],
  };

  const implementationContribution:
    Contribution = {
      id:
        "contribution-implementation-001",
      workflowId:
        workflow.id,
      stageId:
        "implementation",
      objective:
        "Produce user-creation implementation behavior.",
      scope: [
        "src/reference-app/",
      ],
      contributorProfileId:
        "implementer",
      capabilityIds: [
        "source.write",
      ],
      policyIds: [
        "implementation-source-scope",
      ],
      evidenceRequirements: [
        "capability-result",
        "policy-result",
        "command-output",
      ],
      completionCriteria: [
        "Execution succeeds.",
        "Implementation artifact is produced.",
      ],
    };

  const validationContribution:
    Contribution = {
      id:
        "contribution-validation-001",
      workflowId:
        workflow.id,
      stageId: "validation",
      objective:
        "Validate the implementation against duplicate username acceptance criteria.",
      scope: [
        "reference-app:",
      ],
      contributorProfileId:
        "validator",
      capabilityIds: [
        "validation.execute",
      ],
      policyIds: [
        "validation-artifact-scope",
      ],
      evidenceRequirements: [
        "capability-result",
        "policy-result",
        "command-output",
        "test-result",
      ],
      completionCriteria: [
        "Validation execution succeeds.",
        "Acceptance result is produced.",
      ],
    };

  const implementerProfile:
    ContributorProfile = {
      id: "implementer",
      role: "implementer",
      responsibilities: [
        "Produce bounded implementation artifacts.",
      ],
      allowedCapabilityIds: [
        "source.write",
      ],
      requiredPolicyIds: [
        "implementation-source-scope",
      ],
      preferredContributorTypes: [
        "automation",
        "external-service",
      ],
    };

  const validatorProfile:
    ContributorProfile = {
      id: "validator",
      role: "validator",
      responsibilities: [
        "Independently validate implementation artifacts.",
      ],
      allowedCapabilityIds: [
        "validation.execute",
      ],
      requiredPolicyIds: [
        "validation-artifact-scope",
      ],
      preferredContributorTypes: [
        "automation",
        "pipeline",
        "external-service",
      ],
    };

  const implementationPolicy:
    Policy = {
      id:
        "implementation-source-scope",
      rule:
        "Implementation may affect only the reference application source scope.",
      scope: [
        "src/reference-app/",
      ],
      enforcementPoint:
        "capability-request",
      failureBehavior: "deny",
      severity: "high",
    };

  const validationPolicy:
    Policy = {
      id:
        "validation-artifact-scope",
      rule:
        "Validation may inspect only reference application artifacts.",
      scope: [
        "reference-app:",
      ],
      enforcementPoint:
        "capability-request",
      failureBehavior: "deny",
      severity: "high",
    };

  const strategy =
    new DeterministicContributionStrategy();

  let selectedImplementationContributor:
    Contributor | undefined;

  let selectedValidationContributor:
    Contributor | undefined;

  const workflowRun =
    new DeterministicWorkflowRunner().run(
      workflow,
      [
        {
          stageId:
            "implementation",
          handler: {
            execute: () => {
              const selection =
                strategy.select({
                  contribution:
                    implementationContribution,
                  contributorProfile:
                    implementerProfile,
                  candidates:
                    options
                      .implementationCandidates ??
                    [
                      duplicateSafeCandidate(),
                    ],
                });

              if (
                !selection.selected
              ) {
                return {
                  stageId:
                    "implementation",
                  contributionId:
                    implementationContribution.id,
                  status: "failed",
                  failureReason:
                    "contributor-selection-failed",
                  summary:
                    selection.reason,
                  evidence: [],
                };
              }

              selectedImplementationContributor =
                selection.candidate
                  .contributor;

              const runner =
                new ContributionRunner(
                  new DeterministicPolicyEngine(),
                  new InMemoryEvidenceRecorder(),
                  selection.candidate
                    .executor
                );

              const runResult =
                runner.run({
                  contribution:
                    implementationContribution,
                  policies: [
                    implementationPolicy,
                  ],
                  requestedCapabilityId:
                    "source.write",
                  requestedTarget:
                    options
                      .implementationTarget ??
                    "src/reference-app/create-user.ts",
                });

              if (
                runResult.status !==
                "executed"
              ) {
                const failureReason =
                  mapContributionFailureToWorkflowFailure(
                    runResult
                      .failureReason
                  );

                return {
                  stageId:
                    "implementation",
                  contributionId:
                    implementationContribution.id,
                  status: "failed",
                  failureReason,
                  summary:
                    `Implementation contribution failed: ${
                      runResult
                        .failureReason ??
                      "unknown"
                    }.`,
                  evidence:
                    runResult.evidence,
                };
              }

              const artifactReferences =
                runResult.execution
                  ?.artifacts?.map(
                    (artifact) =>
                      artifact
                        .contentReference
                  ) ?? [];

              if (
                artifactReferences.length ===
                0
              ) {
                return {
                  stageId:
                    "implementation",
                  contributionId:
                    implementationContribution.id,
                  status: "failed",
                  failureReason:
                    "execution-failed",
                  summary:
                    "Implementation execution produced no artifact.",
                  evidence:
                    runResult.evidence,
                };
              }

              return {
                stageId:
                  "implementation",
                contributionId:
                  implementationContribution.id,
                status:
                  "completed",
                summary:
                  "Selected implementation contributor executed.",
                evidence:
                  runResult.evidence,
                artifactReferences,
              };
            },
          },
        },
        {
          stageId:
            "validation",
          handler: {
            execute: (
              incomingHandoffs
            ) => {
              const implementationArtifacts =
                incomingHandoffs.flatMap(
                  (handoff) =>
                    handoff
                      .artifactReferences
                );

              const validationTarget =
                implementationArtifacts[0];

              if (
                validationTarget ===
                undefined
              ) {
                return {
                  stageId:
                    "validation",
                  contributionId:
                    validationContribution.id,
                  status: "failed",
                  failureReason:
                    "execution-failed",
                  summary:
                    "Validation did not receive an implementation artifact.",
                  evidence: [],
                };
              }

              const selection =
                strategy.select({
                  contribution:
                    validationContribution,
                  contributorProfile:
                    validatorProfile,
                  candidates:
                    options
                      .validationCandidates ??
                    [
                      duplicateUsernameValidatorCandidate(),
                    ],
                });

              if (
                !selection.selected
              ) {
                return {
                  stageId:
                    "validation",
                  contributionId:
                    validationContribution.id,
                  status: "failed",
                  failureReason:
                    "contributor-selection-failed",
                  summary:
                    selection.reason,
                  evidence: [],
                };
              }

              selectedValidationContributor =
                selection.candidate
                  .contributor;

              const runner =
                new ContributionRunner(
                  new DeterministicPolicyEngine(),
                  new InMemoryEvidenceRecorder(),
                  selection.candidate
                    .executor
                );

              const validationRun =
                runner.run({
                  contribution:
                    validationContribution,
                  policies: [
                    validationPolicy,
                  ],
                  requestedCapabilityId:
                    "validation.execute",
                  requestedTarget:
                    validationTarget,
                });

              if (
                validationRun.status !==
                "executed"
              ) {
                const failureReason =
                  mapContributionFailureToWorkflowFailure(
                    validationRun
                      .failureReason
                  );

                return {
                  stageId:
                    "validation",
                  contributionId:
                    validationContribution.id,
                  status: "failed",
                  failureReason,
                  summary:
                    `Validation contribution failed: ${
                      validationRun
                        .failureReason ??
                      "unknown"
                    }.`,
                  evidence:
                    validationRun.evidence,
                };
              }

              const validationEvidence =
                validationRun.evidence.find(
                  (evidence) =>
                    evidence.type ===
                    "test-result"
                );

              const validationPassed =
                validationEvidence
                  ?.metadata
                  ?.status ===
                  "passed" &&
                validationEvidence
                  ?.metadata
                  ?.uniqueCreationPassed ===
                  true &&
                validationEvidence
                  ?.metadata
                  ?.duplicateRejectionPassed ===
                  true &&
                validationEvidence
                  ?.metadata
                  ?.subsequentValidCreationPassed ===
                  true;

              return {
                stageId:
                  "validation",
                contributionId:
                  validationContribution.id,
                status:
                  validationPassed
                    ? "completed"
                    : "failed",
                ...(validationPassed
                  ? {}
                  : {
                      failureReason:
                        "engineering-validation-failed" as const,
                    }),
                summary:
                  validationPassed
                    ? "Selected validation contributor confirmed the implementation."
                    : "Selected validation contributor found unmet acceptance criteria.",
                evidence:
                  validationRun.evidence,
                artifactReferences:
                  validationRun.execution
                    ?.artifacts?.map(
                      (artifact) =>
                        artifact
                          .contentReference
                    ) ?? [],
              };
            },
          },
        },
      ]
    );

  const applicability =
    decideEvaluationApplicability({
      kind: "workflow",
      runResult:
        workflowRun,
    });

  const evaluation =
    new DeterministicEvaluator().evaluate({
      id:
        "evaluation-workflow-001",
      targetId:
        workflow.id,
      targetType:
        "workflow",
      requirements: [
        {
          type: "handoff",
          metadata: {
            fromStageId:
              "implementation",
            toStageId:
              "validation",
          },
        },
        {
          type:
            "test-result",
          metadata: {
            status: "passed",
            uniqueCreationPassed:
              true,
            duplicateRejectionPassed:
              true,
            subsequentValidCreationPassed:
              true,
          },
        },
      ],
      evidence:
        workflowRun.evidence,
      applicable:
        applicability.applicable,
      ...(!applicability.applicable
        ? {
            inapplicableReason:
              applicability.reason,
          }
        : {}),
    });

  const outcome =
    new DeterministicOutcomeResolver().resolve({
      workflowId:
        workflow.id,
      evaluation,
      workflowRun,
    });

  return {
    workItem,
    intent,
    workflow,
    implementationContribution,
    validationContribution,
    selectedImplementationContributor,
    selectedValidationContributor,
    workflowRun,
    evaluation,
    outcome,
  };
}