import { ContributionRunner } from "../core/contribution-runner.js";
import {
  DeterministicContributorExecutor,
  type ContributorExecutor,
} from "../core/contributor-executor.js";
import { InMemoryEvidenceRecorder } from "../core/evidence-recorder.js";
import { DeterministicEvaluator } from "../core/evaluator.js";
import { DeterministicExecutor } from "../core/executor.js";
import { DeterministicOutcomeResolver } from "../core/outcome-resolver.js";
import { DeterministicPolicyEngine } from "../core/policy-engine.js";

import type { ContributionRunResult } from "../core/contribution-runner.js";
import type { Contribution } from "../domain/contribution.js";
import type { EngineeringIntent } from "../domain/engineering-intent.js";
import type { Evaluation } from "../domain/evaluation.js";
import type { Outcome } from "../domain/outcome.js";
import type { Policy } from "../domain/policy.js";
import type { WorkItem } from "../domain/work-item.js";
import type { Workflow } from "../domain/workflow.js";

export interface DuplicateUsernameScenarioResult {
  workItem: WorkItem;
  intent: EngineeringIntent;
  workflow: Workflow;
  contribution: Contribution;
  runResult: ContributionRunResult;
  evaluation: Evaluation;
  outcome: Outcome;
}

export interface DuplicateUsernameScenarioOptions {
  requestedTarget?: string;
  requestedCapabilityId?: string;
  contributorExecutor?: ContributorExecutor;
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
      "Governed execution completes successfully.",
    ],
    evidenceRequirements: [
      "capability-result",
      "policy-result",
      "command-output",
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
        ],
        completionCriteria: [
          "Governed execution completes.",
          "Required evidence is available.",
        ],
      },
    ],
    completionCriteria: [
      "Required contribution evidence satisfies evaluation requirements.",
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
    ],
    completionCriteria: [
      "Execution completes successfully.",
      "Required evidence is produced.",
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

  const contributorExecutor =
    options.contributorExecutor ??
    new DeterministicContributorExecutor(
      new DeterministicExecutor()
    );

  const runner = new ContributionRunner(
    new DeterministicPolicyEngine(),
    new InMemoryEvidenceRecorder(),
    contributorExecutor
  );

  const runResult = runner.run({
    contribution,
    policies: [sourceScopePolicy],
    requestedCapabilityId:
      options.requestedCapabilityId ?? "source.write",
    requestedTarget:
      options.requestedTarget ??
      "src/user-management/create-user.ts",
  });

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
    ],
    evidence: runResult.evidence,
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
    runResult,
    evaluation,
    outcome,
  };
}