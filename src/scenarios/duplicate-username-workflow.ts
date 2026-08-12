import { ContributionRunner } from "../core/contribution-runner.js";
import {
  DeterministicContributionStrategy,
  type ContributorCandidate,
} from "../core/contribution-strategy.js";
import { InMemoryEvidenceRecorder } from "../core/evidence-recorder.js";
import { DeterministicEvaluator } from "../core/evaluator.js";
import { DeterministicExecutor } from "../core/executor.js";
import { DeterministicOutcomeResolver } from "../core/outcome-resolver.js";
import { DeterministicPolicyEngine } from "../core/policy-engine.js";
import {
  DeterministicWorkflowRunner,
  type WorkflowRunResult,
} from "../core/workflow-runner.js";

import type { Contribution } from "../domain/contribution.js";
import type {
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
import { DuplicateUsernameAcceptanceValidator } from "./duplicate-username-validator.js";

export interface DuplicateUsernameWorkflowScenarioResult {
  workItem: WorkItem;
  intent: EngineeringIntent;
  workflow: Workflow;
  implementationContribution: Contribution;
  validationContribution: Contribution;
  workflowRun: WorkflowRunResult;
  evaluation: Evaluation;
  outcome: Outcome;
}

export interface DuplicateUsernameWorkflowScenarioOptions {
  implementationCandidates?: ContributorCandidate[];
  implementationTarget?: string;
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
    source: "reference-scenario",
    intentId: intent.id,
    priority: "medium",
  };

  const workflow: Workflow = {
    id: "workflow-multi-stage-001",
    intentId: intent.id,
    stages: [
      {
        id: "implementation",
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
          "Acceptance validation evidence.",
        dependencies: [
          "implementation",
        ],
        policyIds: [
          "validation-artifact-scope",
        ],
        evidenceRequirements: [
          "handoff",
          "test-result",
        ],
        completionCriteria: [
          "Acceptance validation passes.",
        ],
      },
    ],
    completionCriteria: [
      "Implementation and validation stages complete.",
      "Acceptance evidence satisfies engineering intent.",
    ],
  };

  const implementationContribution: Contribution = {
    id: "contribution-implementation-001",
    workflowId: workflow.id,
    stageId: "implementation",
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

  const validationContribution: Contribution = {
    id: "contribution-validation-001",
    workflowId: workflow.id,
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
      "Acceptance test-result is produced.",
    ],
  };

  const implementerProfile: ContributorProfile = {
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

  const implementationPolicy: Policy = {
    id: "implementation-source-scope",
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

  const validationPolicy: Policy = {
    id: "validation-artifact-scope",
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

  const implementationSelection =
    strategy.select({
      contribution:
        implementationContribution,
      contributorProfile:
        implementerProfile,
      candidates:
        options.implementationCandidates ??
        [duplicateSafeCandidate()],
    });

  if (!implementationSelection.selected) {
    throw new Error(
      `Unable to select implementation contributor: ${implementationSelection.reason}`
    );
  }

  const implementationRunner =
    new ContributionRunner(
      new DeterministicPolicyEngine(),
      new InMemoryEvidenceRecorder(),
      implementationSelection
        .candidate.executor
    );

  const validationRunner =
    new ContributionRunner(
      new DeterministicPolicyEngine(),
      new InMemoryEvidenceRecorder(),
      new DeterministicExecutor()
    );

  const validator =
    new DuplicateUsernameAcceptanceValidator();

  const workflowRunner =
    new DeterministicWorkflowRunner();

  const workflowRun =
    workflowRunner.run(
      workflow,
      [
        {
          stageId: "implementation",
          handler: {
            execute: () => {
              const runResult =
                implementationRunner.run({
                  contribution:
                    implementationContribution,
                  policies: [
                    implementationPolicy,
                  ],
                  requestedCapabilityId:
                    "source.write",
                  requestedTarget:
                    options.implementationTarget ??
                    "src/reference-app/create-user.ts",
                });

              const artifactReferences =
                runResult.execution
                  ?.artifacts?.map(
                    (artifact) =>
                      artifact.contentReference
                  ) ?? [];

              return {
                stageId:
                  "implementation",
                contributionId:
                  implementationContribution.id,
                status:
                  runResult.status ===
                    "executed" &&
                  artifactReferences.length > 0
                    ? "completed"
                    : "failed",
                summary:
                  runResult.status ===
                  "executed"
                    ? "Implementation contribution executed."
                    : "Implementation contribution was blocked or failed.",
                evidence:
                  runResult.evidence,
                artifactReferences,
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
              const artifactReferences =
                incomingHandoffs.flatMap(
                  (handoff) =>
                    handoff.artifactReferences
                );

              const validationTarget =
                artifactReferences[0] ??
                "missing-artifact";

              const validationRun =
                validationRunner.run({
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
                return {
                  stageId:
                    "validation",
                  contributionId:
                    validationContribution.id,
                  status: "failed",
                  summary:
                    "Validation contribution was blocked or failed.",
                  evidence:
                    validationRun.evidence,
                };
              }

              const validationEvidence =
                validator.validateArtifactReferences(
                  validationContribution.id,
                  artifactReferences
                );

              const validationPassed =
                validationEvidence
                  .metadata?.status ===
                "passed";

              return {
                stageId:
                  "validation",
                contributionId:
                  validationContribution.id,
                status:
                  validationPassed
                    ? "completed"
                    : "failed",
                summary:
                  validationPassed
                    ? "Independent validation passed."
                    : "Independent validation failed.",
                evidence: [
                  ...validationRun.evidence,
                  validationEvidence,
                ],
              };
            },
          },
        },
      ]
    );

  const evaluator =
    new DeterministicEvaluator();

  const evaluation =
    evaluator.evaluate({
      id: "evaluation-workflow-001",
      targetId: workflow.id,
      targetType: "workflow",
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
          type: "test-result",
          metadata: {
            status: "passed",
            duplicateRejectionPassed:
              true,
          },
        },
      ],
      evidence:
        workflowRun.evidence,
    });

  const outcome =
    new DeterministicOutcomeResolver().resolve({
      workflowId: workflow.id,
      evaluation,
    });

  return {
    workItem,
    intent,
    workflow,
    implementationContribution,
    validationContribution,
    workflowRun,
    evaluation,
    outcome,
  };
}