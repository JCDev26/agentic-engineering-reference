import { DuplicateUsernameAcceptanceValidator } from "../core/acceptance-validator.js";
import { ContributionRunner } from "../core/contribution-runner.js";
import {
  DeterministicContributorExecutor,
  SimulatedContributorExecutor,
} from "../core/contributor-executor.js";
import {
  DeterministicContributionStrategy,
  type ContributorCandidate,
} from "../core/contribution-strategy.js";
import { InMemoryEvidenceRecorder } from "../core/evidence-recorder.js";
import { DeterministicEvaluator } from "../core/evaluator.js";
import { DeterministicExecutor } from "../core/executor.js";
import { DeterministicOutcomeResolver } from "../core/outcome-resolver.js";
import { DeterministicPolicyEngine } from "../core/policy-engine.js";

import type { ContributionRunResult } from "../core/contribution-runner.js";
import type { Contribution } from "../domain/contribution.js";
import type {
  Contributor,
  ContributorProfile,
} from "../domain/contributor.js";
import type { EngineeringIntent } from "../domain/engineering-intent.js";
import type { Evaluation } from "../domain/evaluation.js";
import type { Evidence } from "../domain/evidence.js";
import type { Outcome } from "../domain/outcome.js";
import type { Policy } from "../domain/policy.js";
import type { WorkItem } from "../domain/work-item.js";
import type { Workflow } from "../domain/workflow.js";

import {
  createUser,
  type UserCreator,
} from "../reference-app/create-user.js";

export interface DuplicateUsernameScenarioResult {
  workItem: WorkItem;
  intent: EngineeringIntent;
  workflow: Workflow;
  contribution: Contribution;
  contributorProfile: ContributorProfile;
  selectedContributor: Contributor;
  runResult: ContributionRunResult;
  evidence: Evidence[];
  evaluation: Evaluation;
  outcome: Outcome;
}

export interface DuplicateUsernameScenarioOptions {
  requestedTarget?: string;
  requestedCapabilityId?: string;
  candidates?: ContributorCandidate[];
  userCreator?: UserCreator;
}

function defaultContributorCandidates(): ContributorCandidate[] {
  return [
    {
      contributor: {
        id: "local-automation",
        type: "automation",
        capabilityIds: ["source.write"],
        available: true,
        provider: "reference-local",
      },
      executor:
        new DeterministicContributorExecutor(
          new DeterministicExecutor()
        ),
    },
    {
      contributor: {
        id: "simulated-contributor",
        type: "external-service",
        capabilityIds: ["source.write"],
        available: true,
        provider: "reference-simulated",
      },
      executor: new SimulatedContributorExecutor(),
    },
  ];
}

export function runDuplicateUsernameReferenceScenario(
  options: DuplicateUsernameScenarioOptions = {}
): DuplicateUsernameScenarioResult {
  const intent: EngineeringIntent = {
    id: "intent-001",
    objective:
      "Prevent duplicate usernames while preserving existing valid user creation behavior.",
    acceptanceCriteria: [
      "Unique usernames can be created.",
      "Duplicate usernames are rejected.",
      "Existing valid user creation behavior remains unchanged.",
    ],
    constraints: [
      "Changes remain within the user-management source scope.",
      "No unrelated refactoring is introduced.",
    ],
    validationRequirements: [
      "Unique username creation succeeds.",
      "Duplicate username creation is rejected.",
      "Valid creation continues to work after duplicate rejection.",
    ],
    evidenceRequirements: [
      "capability-result",
      "policy-result",
      "command-output",
      "test-result",
    ],
    riskLevel: "low",
    nonGoals: [
      "Authentication redesign",
      "Deployment changes",
    ],
  };

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
        responsibility:
          "Implement duplicate username validation.",
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
    objective:
      "Modify approved user-management source code.",
    scope: ["src/"],
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
    responsibilities: [
      "Perform bounded source implementation.",
    ],
    allowedCapabilityIds: ["source.write"],
    requiredPolicyIds: ["source-scope"],
    preferredContributorTypes: [
      "automation",
      "external-service",
    ],
  };

  const sourceScopePolicy: Policy = {
    id: "source-scope",
    rule:
      "Implementation contributions may modify only approved source files.",
    scope: ["src/"],
    enforcementPoint: "capability-request",
    failureBehavior: "deny",
    severity: "high",
  };

  const strategy =
    new DeterministicContributionStrategy();

  const selection = strategy.select({
    contribution,
    contributorProfile,
    candidates:
      options.candidates ??
      defaultContributorCandidates(),
  });

  if (!selection.selected) {
    throw new Error(
      `Unable to select contributor: ${selection.reason}`
    );
  }

  const selectedContributor =
    selection.candidate.contributor;

  const runner = new ContributionRunner(
    new DeterministicPolicyEngine(),
    new InMemoryEvidenceRecorder(),
    selection.candidate.executor
  );

  const runResult = runner.run({
    contribution,
    policies: [sourceScopePolicy],
    requestedCapabilityId:
      options.requestedCapabilityId ??
      "source.write",
    requestedTarget:
      options.requestedTarget ??
      "src/reference-app/create-user.ts",
  });

  const validationEvidence: Evidence[] =
    runResult.status === "executed"
      ? [
          new DuplicateUsernameAcceptanceValidator(
            options.userCreator ?? createUser
          ).validate(contribution.id),
        ]
      : [];

  const evidence = [
    ...runResult.evidence,
    ...validationEvidence,
  ];

  const evaluator = new DeterministicEvaluator();

  const evaluation = evaluator.evaluate({
    id: "evaluation-001",
    targetId: contribution.id,
    targetType: "contribution",
    requirements: [
      {
        type: "capability-result",
        metadata: {
          granted: true,
        },
      },
      {
        type: "policy-result",
        metadata: {
          allowed: true,
        },
      },
      {
        type: "command-output",
        metadata: {
          status: "succeeded",
        },
      },
      {
        type: "test-result",
        metadata: {
          status: "passed",
          uniqueCreationPassed: true,
          duplicateRejectionPassed: true,
          subsequentValidCreationPassed: true,
        },
      },
    ],
    evidence,
  });

  const outcomeResolver =
    new DeterministicOutcomeResolver();

  const outcome = outcomeResolver.resolve({
    workflowId: workflow.id,
    evaluation,
  });

  return {
    workItem,
    intent,
    workflow,
    contribution,
    contributorProfile,
    selectedContributor,
    runResult,
    evidence,
    evaluation,
    outcome,
  };
}