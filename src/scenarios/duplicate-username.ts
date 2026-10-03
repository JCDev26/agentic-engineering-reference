import { createDuplicateUsernameIntent } from "./duplicate-username-intent.js";
import type {
  AcceptanceValidator,
  AcceptanceValidationResult,
} from "../core/acceptance-validator.js";
import { ContributionRunner } from "../core/contribution-runner.js";
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
  type WorkflowRunResult,
} from "../core/workflow-runner.js";

import type { ContributionRunResult } from "../core/contribution-runner.js";
import type { Contribution } from "../domain/contribution.js";
import type { Contributor, ContributorProfile } from "../domain/contributor.js";
import type { EngineeringIntent } from "../domain/engineering-intent.js";
import type { Evaluation } from "../domain/evaluation.js";
import type { Evidence } from "../domain/evidence.js";
import type { Outcome } from "../domain/outcome.js";
import type { Policy } from "../domain/policy.js";
import type { WorkItem } from "../domain/work-item.js";
import type { Workflow } from "../domain/workflow.js";

import {
  DuplicateAcceptingUserCreatorContributorExecutor,
  DuplicateSafeUserCreatorContributorExecutor,
} from "./duplicate-username-contributors.js";
import {
  DuplicateUsernameAcceptanceValidator,
  hasCompleteAcceptanceResult,
  acceptanceResultPassed,
  isAcceptanceResultFrom,
} from "./duplicate-username-validator.js";

export interface DuplicateUsernameScenarioResult {
  workItem: WorkItem;
  intent: EngineeringIntent;
  workflow: Workflow;
  contribution: Contribution;
  contributorProfile: ContributorProfile;
  selectedContributor: Contributor | undefined;
  runResult: ContributionRunResult | undefined;
  workflowRun: WorkflowRunResult;
  evidence: Evidence[];
  evaluation: Evaluation;
  outcome: Outcome;
}

export interface DuplicateUsernameScenarioOptions {
  intent?: EngineeringIntent;
  requestedTarget?: string;
  requestedCapabilityId?: string;
  candidates?: ContributorCandidate[];
  validator?: AcceptanceValidator;
}

export function duplicateSafeCandidate(): ContributorCandidate {
  return {
    contributor: {
      id: "duplicate-safe-contributor",
      type: "automation",
      capabilityIds: ["source.write"],
      available: true,
      provider: "reference-local",
    },
    executor: new DuplicateSafeUserCreatorContributorExecutor(),
  };
}

export function duplicateAcceptingCandidate(): ContributorCandidate {
  return {
    contributor: {
      id: "duplicate-accepting-contributor",
      type: "external-service",
      capabilityIds: ["source.write"],
      available: true,
      provider: "reference-simulated",
    },
    executor: new DuplicateAcceptingUserCreatorContributorExecutor(),
  };
}

function defaultContributorCandidates(): ContributorCandidate[] {
  return [duplicateSafeCandidate(), duplicateAcceptingCandidate()];
}

export function runDuplicateUsernameReferenceScenario(
  options: DuplicateUsernameScenarioOptions = {},
): DuplicateUsernameScenarioResult {
  const intent =
    options.intent ?? createDuplicateUsernameIntent("contribution");

  const workItem: WorkItem = {
    id: "WI-001",
    title: "Prevent duplicate usernames",
    description:
      "Reject duplicate username creation while preserving existing valid user creation behavior.",
    source: "reference-scenario",
    intentId: intent.id,
    priority: "medium",
  };

  const workflow: Workflow = {
    id: "workflow-001",
    intentId: intent.id,
    stages: [
      {
        id: "implementation",
        responsibility: "Implement duplicate username validation.",
        expectedContribution:
          "Bounded source change within the approved user-management scope.",
        dependencies: [],
        policyIds: ["source-scope"],
        evidenceRequirements: [
          "capability-result",
          "policy-result",
          "command-output",
          "test-result",
        ],
        completionCriteria: [
          "Governed execution completes.",
          "Required engineering validation passes.",
        ],
      },
    ],
    completionCriteria: [
      "Required contribution evidence satisfies engineering evaluation requirements.",
    ],
  };

  const contribution: Contribution = {
    id: "contribution-001",
    workflowId: workflow.id,
    stageId: "implementation",
    objective: "Modify approved user-management source code.",
    scope: ["src/reference-app/"],
    contributorProfileId: "implementer",
    capabilityIds: ["source.write"],
    policyIds: ["source-scope"],
    evidenceRequirements: [
      "capability-result",
      "policy-result",
      "command-output",
      "test-result",
    ],
    completionCriteria: [
      "Execution completes successfully.",
      "Duplicate username validation passes.",
      "Existing valid behavior remains functional.",
    ],
  };

  const contributorProfile: ContributorProfile = {
    id: "implementer",
    role: "implementer",
    responsibilities: ["Perform bounded source implementation."],
    allowedCapabilityIds: ["source.write"],
    requiredPolicyIds: ["source-scope"],
    preferredContributorTypes: ["automation", "external-service"],
  };

  const sourceScopePolicy: Policy = {
    id: "source-scope",
    rule: "Implementation contributions may modify only approved source files.",
    scope: ["src/reference-app/"],
    enforcementPoint: "capability-request",
    failureBehavior: "deny",
    severity: "high",
  };

  const strategy = new DeterministicContributionStrategy();

  let selectedContributor: Contributor | undefined;
  let runResult: ContributionRunResult | undefined;

  const workflowRun = new DeterministicWorkflowRunner().run(workflow, [
    {
      stageId: contribution.stageId,
      handler: {
        execute: () => {
          const selection = strategy.select({
            contribution,
            contributorProfile,
            candidates: options.candidates ?? defaultContributorCandidates(),
          });

          if (!selection.selected) {
            return {
              stageId: contribution.stageId,
              contributionId: contribution.id,
              status: "failed",
              failureReason: "contributor-selection-failed",
              summary: selection.reason,
              evidence: [],
            };
          }

          selectedContributor = selection.candidate.contributor;
          runResult = new ContributionRunner(
            new DeterministicPolicyEngine(),
            new InMemoryEvidenceRecorder(),
            selection.candidate.executor,
          ).run({
            contribution,
            policies: [sourceScopePolicy],
            requestedCapabilityId:
              options.requestedCapabilityId ?? "source.write",
            requestedTarget:
              options.requestedTarget ?? "src/reference-app/create-user.ts",
          });

          if (
            runResult.status !== "executed" ||
            runResult.execution === undefined
          ) {
            return {
              stageId: contribution.stageId,
              contributionId: contribution.id,
              status: "failed",
              failureReason:
                runResult.status === "blocked"
                  ? "governance-denied"
                  : "execution-failed",
              summary: `Contribution ended with ${runResult.failureReason ?? runResult.status}.`,
              evidence: runResult.evidence,
            };
          }

          const validator =
            options.validator ?? new DuplicateUsernameAcceptanceValidator();
          let validation: AcceptanceValidationResult;
          try {
            validation = validator.validate(
              contribution.id,
              runResult.execution,
            );
          } catch {
            return {
              stageId: contribution.stageId,
              contributionId: contribution.id,
              status: "failed",
              failureReason: "execution-failed",
              summary: "Acceptance validator could not complete execution.",
              evidence: runResult.evidence,
            };
          }
          if (validation.status === "unavailable") {
            return {
              stageId: contribution.stageId,
              contributionId: contribution.id,
              status: "failed",
              failureReason: "execution-failed",
              summary: validation.reason,
              evidence: runResult.evidence,
            };
          }

          const evidence = [...runResult.evidence, validation.evidence];
          if (
            !isAcceptanceResultFrom(validation.evidence, contribution.id) ||
            !hasCompleteAcceptanceResult(validation.evidence)
          ) {
            return {
              stageId: contribution.stageId,
              contributionId: contribution.id,
              status: "failed",
              failureReason: "execution-failed",
              summary:
                "Validator did not produce a complete acceptance result from the designated source.",
              evidence,
            };
          }

          const passed = acceptanceResultPassed(validation.evidence);
          return {
            stageId: contribution.stageId,
            contributionId: contribution.id,
            status: passed ? "completed" : "failed",
            ...(!passed
              ? { failureReason: "engineering-validation-failed" as const }
              : {}),
            summary: passed
              ? "Implementation passed independent acceptance validation."
              : "Independent acceptance validation rejected the implementation.",
            evidence,
          };
        },
      },
    },
  ]);

  const evidence = workflowRun.evidence;

  const applicability = decideEvaluationApplicability({
    kind: "workflow",
    runResult: workflowRun,
  });

  const evaluator = new DeterministicEvaluator();

  const evaluation = evaluator.evaluate({
    id: "evaluation-001",
    targetId: contribution.id,
    targetType: "contribution",
    requirements: intent.evaluationRequirements,
    evidence,
    applicable: applicability.applicable,
    ...(!applicability.applicable
      ? {
          inapplicableReason: applicability.reason,
        }
      : {}),
  });

  const outcomeResolver = new DeterministicOutcomeResolver();

  const outcome = outcomeResolver.resolve({
    workflowId: workflow.id,
    evaluation,
    workflowRun,
  });

  return {
    workItem,
    intent,
    workflow,
    contribution,
    contributorProfile,
    selectedContributor,
    runResult,
    workflowRun,
    evidence,
    evaluation,
    outcome,
  };
}
