import { describe, expect, it, vi } from "vitest";

import { decideEvaluationApplicability } from "../src/core/evaluation-applicability.js";
import { DeterministicEvaluator } from "../src/core/evaluator.js";
import { DeterministicOutcomeResolver } from "../src/core/outcome-resolver.js";
import { DeterministicWorkflowRunner } from "../src/core/workflow-runner.js";
import type {
  ExecutionRequest,
  ExecutionResult,
} from "../src/core/executor.js";
import type { Workflow } from "../src/domain/workflow.js";
import {
  duplicateAcceptingCandidate,
  duplicateSafeCandidate,
  runDuplicateUsernameReferenceScenario,
} from "../src/scenarios/duplicate-username.js";
import {
  duplicateUsernameValidatorCandidate,
  runDuplicateUsernameMultiStageScenario,
} from "../src/scenarios/duplicate-username-workflow.js";
import { DuplicateUsernameAcceptanceValidator } from "../src/scenarios/duplicate-username-validator.js";
import { duplicateUsernameValidationProducer } from "../src/scenarios/duplicate-username-intent.js";
import {
  duplicateAcceptingArtifactReference,
  duplicateSafeArtifactReference,
  userCreatorImplementationArtifactType,
} from "../src/scenarios/duplicate-username-contributors.js";

const cases = [
  {
    name: "successful engineering result",
    mode: "success",
    execution: 1,
    validationAttempt: 1,
    validated: true,
    evaluation: "passed",
    contributionFailure: undefined,
    workflowFailure: undefined,
    outcomeReason: undefined,
  },
  {
    name: "execution succeeds but engineering validation fails",
    mode: "incorrect",
    execution: 1,
    validationAttempt: 1,
    validated: true,
    evaluation: "failed",
    contributionFailure: undefined,
    workflowFailure: "engineering-validation-failed",
    outcomeReason: "engineering-validation-failed",
  },
  {
    name: "capability denial",
    mode: "capability",
    execution: 0,
    validationAttempt: 0,
    validated: false,
    evaluation: "inconclusive",
    contributionFailure: "capability-denied",
    workflowFailure: "governance-denied",
    outcomeReason: "governance-denied",
  },
  {
    name: "policy denial",
    mode: "policy",
    execution: 0,
    validationAttempt: 0,
    validated: false,
    evaluation: "inconclusive",
    contributionFailure: "policy-denied",
    workflowFailure: "governance-denied",
    outcomeReason: "governance-denied",
  },
  {
    name: "contributor selection failure",
    mode: "selection",
    execution: 0,
    validationAttempt: 0,
    validated: false,
    evaluation: "inconclusive",
    contributionFailure: undefined,
    workflowFailure: "contributor-selection-failed",
    outcomeReason: "contributor-selection-failed",
  },
  {
    name: "executor returns failure",
    mode: "executor",
    execution: 1,
    validationAttempt: 0,
    validated: false,
    evaluation: "inconclusive",
    contributionFailure: "execution-failed",
    workflowFailure: "execution-failed",
    outcomeReason: "stage-execution-failed",
  },
  {
    name: "executor throws",
    mode: "throw",
    execution: 1,
    validationAttempt: 0,
    validated: false,
    evaluation: "inconclusive",
    contributionFailure: "execution-failed",
    workflowFailure: "execution-failed",
    outcomeReason: "stage-execution-failed",
  },
  {
    name: "missing implementation artifact",
    mode: "missing-artifact",
    execution: 1,
    validationAttempt: 0,
    validated: false,
    evaluation: "inconclusive",
    contributionFailure: undefined,
    workflowFailure: "execution-failed",
    outcomeReason: "stage-execution-failed",
  },
  {
    name: "unrecognized implementation artifact",
    mode: "unknown-artifact",
    execution: 1,
    validationAttempt: 1,
    validated: false,
    evaluation: "inconclusive",
    contributionFailure: undefined,
    workflowFailure: "execution-failed",
    outcomeReason: "stage-execution-failed",
  },
] as const;

describe.each(["single", "multi"] as const)(
  "V1 failure matrix: %s-stage reference",
  (surface) => {
    it.each(["unrelated", "ambiguous"] as const)(
      "handles an %s extra artifact with the same reference contract",
      (extraKind) => {
        const candidate = duplicateSafeCandidate();
        const candidates = [
          {
            ...candidate,
            executor: {
              execute: (request: ExecutionRequest): ExecutionResult => {
                const execution = candidate.executor.execute(request);
                return {
                  ...execution,
                  artifacts: [
                    extraKind === "unrelated"
                      ? {
                          type: "log",
                          contentReference: "artifact:unrelated-log",
                        }
                      : {
                          type: userCreatorImplementationArtifactType,
                          contentReference: duplicateAcceptingArtifactReference,
                        },
                    ...(execution.artifacts ?? []),
                  ],
                };
              },
            },
          },
        ];
        const result =
          surface === "single"
            ? runDuplicateUsernameReferenceScenario({ candidates })
            : runDuplicateUsernameMultiStageScenario({
                implementationCandidates: candidates,
              });

        if (extraKind === "unrelated") {
          expect(result.workflowRun.status).toBe("completed");
          expect(result.evaluation.result).toBe("passed");
          expect(result.outcome.status).toBe("completed");
          if (surface === "multi") {
            expect(result.workflowRun.handoffs[0]?.artifactReferences).toEqual([
              duplicateSafeArtifactReference,
            ]);
          }
        } else {
          expect(result.workflowRun.failureReason).toBe("execution-failed");
          expect(
            result.workflowRun.evidence.some(
              (evidence) => evidence.type === "test-result",
            ),
          ).toBe(false);
          expect(result.evaluation.result).toBe("inconclusive");
          expect(result.outcome.reasonCode).toBe("stage-execution-failed");
        }
      },
    );

    it("rejects source work outside the reference application", () => {
      const candidate = duplicateSafeCandidate();
      const execute = vi.fn(
        candidate.executor.execute.bind(candidate.executor),
      );
      const candidates = [{ ...candidate, executor: { execute } }];
      const result =
        surface === "single"
          ? runDuplicateUsernameReferenceScenario({
              candidates,
              requestedTarget: "src/core/outcome-resolver.ts",
            })
          : runDuplicateUsernameMultiStageScenario({
              implementationCandidates: candidates,
              implementationTarget: "src/core/outcome-resolver.ts",
            });

      expect(execute).not.toHaveBeenCalled();
      expect(result.workflowRun.failureReason).toBe("governance-denied");
      expect(result.evaluation.result).toBe("inconclusive");
      expect(result.outcome.reasonCode).toBe("governance-denied");
    });

    it("cannot use an implementer's self-reported passing test to overrule independent validation failure", () => {
      const candidate = duplicateAcceptingCandidate();
      const executor = candidate.executor;
      const candidates = [
        {
          ...candidate,
          executor: {
            execute: (request: ExecutionRequest): ExecutionResult => ({
              ...executor.execute(request),
              evidence: [
                {
                  id: "implementer-self-report",
                  contributionId: request.contribution.id,
                  type: "test-result",
                  timestamp: "2026-10-02T12:00:00Z",
                  contentReference: "test:implementer",
                  producer: "implementation-self-test",
                  metadata: {
                    status: "passed",
                    uniqueCreationPassed: true,
                    duplicateRejectionPassed: true,
                    subsequentValidCreationPassed: true,
                  },
                },
              ],
            }),
          },
        },
      ];
      const result =
        surface === "single"
          ? runDuplicateUsernameReferenceScenario({ candidates })
          : runDuplicateUsernameMultiStageScenario({
              implementationCandidates: candidates,
            });

      expect(
        result.workflowRun.evidence.filter(
          (entry) => entry.type === "test-result",
        ),
      ).toHaveLength(2);
      expect(result.workflowRun.failureReason).toBe(
        "engineering-validation-failed",
      );
      expect(result.evaluation.result).toBe("failed");
      expect(result.outcome.reasonCode).toBe("engineering-validation-failed");
    });

    it.each(cases)("$name preserves the directly observed cause", (row) => {
      const candidate =
        row.mode === "incorrect"
          ? duplicateAcceptingCandidate()
          : duplicateSafeCandidate();
      const executor = candidate.executor;
      const execute = vi.fn((request: ExecutionRequest): ExecutionResult => {
        if (row.mode === "throw")
          throw new Error("Adapter failed before returning.");
        if (
          row.mode === "executor" ||
          row.mode === "missing-artifact" ||
          row.mode === "unknown-artifact"
        ) {
          return {
            status: row.mode === "executor" ? "failed" : "succeeded",
            contributionId: request.contribution.id,
            capabilityId: request.capabilityId,
            summary:
              "Opaque executor result; no caller should parse this text.",
            ...(row.mode === "unknown-artifact"
              ? {
                  artifacts: [
                    {
                      type: userCreatorImplementationArtifactType,
                      contentReference: "reference-app:unknown",
                    },
                  ],
                }
              : {}),
          };
        }
        return executor.execute(request);
      });
      const candidates =
        row.mode === "selection"
          ? []
          : [{ ...candidate, executor: { execute } }];
      const validator = new DuplicateUsernameAcceptanceValidator();
      const validate = vi.fn(validator.validate.bind(validator));
      const validationCandidate = duplicateUsernameValidatorCandidate();
      const validationExecute = vi.fn(
        validationCandidate.executor.execute.bind(validationCandidate.executor),
      );

      const single =
        surface === "single"
          ? runDuplicateUsernameReferenceScenario({
              candidates,
              validator: { validate },
              ...(row.mode === "capability"
                ? { requestedCapabilityId: "deployment.execute" }
                : {}),
              ...(row.mode === "policy"
                ? { requestedTarget: "README.md" }
                : {}),
            })
          : undefined;
      const multi =
        surface === "multi"
          ? runDuplicateUsernameMultiStageScenario({
              implementationCandidates: candidates,
              validationCandidates: [
                {
                  ...validationCandidate,
                  executor: { execute: validationExecute },
                },
              ],
              ...(row.mode === "capability"
                ? { implementationCapabilityId: "deployment.execute" }
                : {}),
              ...(row.mode === "policy"
                ? { implementationTarget: "README.md" }
                : {}),
            })
          : undefined;
      const result = single ?? multi;
      if (result === undefined) throw new Error("Missing scenario result");
      const contributionRun = single?.runResult ?? multi?.implementationRun;

      expect(execute).toHaveBeenCalledTimes(row.execution);
      // The original path lets its validator directly observe missing input;
      // the multi-stage binding observes absence before a handoff is emitted.
      const attempts =
        surface === "single" && row.mode === "missing-artifact"
          ? 1
          : row.validationAttempt;
      expect(
        surface === "single" ? validate : validationExecute,
      ).toHaveBeenCalledTimes(attempts);
      expect(contributionRun?.failureReason).toBe(row.contributionFailure);
      expect(result.workflowRun.failureReason).toBe(row.workflowFailure);
      expect(result.evaluation.result).toBe(row.evaluation);
      expect(result.outcome.status).toBe(
        row.mode === "success" ? "completed" : "failed",
      );
      expect(result.outcome.reasonCode).toBe(row.outcomeReason);
      expect(
        result.workflowRun.evidence.some(
          (evidence) => evidence.type === "test-result",
        ),
      ).toBe(row.validated);

      const implementationTypes =
        contributionRun?.evidence.map((evidence) => evidence.type) ?? [];
      expect(implementationTypes).toEqual(
        row.mode === "selection"
          ? []
          : row.mode === "capability"
            ? ["capability-result"]
            : row.mode === "policy"
              ? ["capability-result", "policy-result"]
              : ["capability-result", "policy-result", "command-output"],
      );
      expect(result.evaluation.evidence).toBe(result.workflowRun.evidence);
      expect(result.outcome.evidence).toBe(result.evaluation.evidence);

      if (surface === "multi" && row.mode === "unknown-artifact") {
        // The validator adapter observed unavailable input and returned a failure;
        // implementation itself completed successfully.
        expect(multi?.validationRun?.failureReason).toBe("execution-failed");
        expect(multi?.validationRun?.execution?.status).toBe("failed");
      }
    });
  },
);

describe("V1 workflow-only terminal failures", () => {
  it.each(["producer", "contributionId"] as const)(
    "ignores an unrelated failed validation result with a different %s before the designated passing result",
    (differentField) => {
      const candidate = duplicateUsernameValidatorCandidate();
      const result = runDuplicateUsernameMultiStageScenario({
        validationCandidates: [
          {
            ...candidate,
            executor: {
              execute: (request) => {
                const execution = candidate.executor.execute(request);
                return {
                  ...execution,
                  evidence: [
                    {
                      id: "unrelated-failed-result",
                      type: "test-result",
                      contributionId:
                        differentField === "contributionId"
                          ? "unrelated-contribution"
                          : request.contribution.id,
                      producer:
                        differentField === "producer"
                          ? "unrelated-validator"
                          : duplicateUsernameValidationProducer,
                      timestamp: "2026-10-02T12:00:00Z",
                      contentReference: "test:unrelated",
                      metadata: {
                        status: "failed",
                        uniqueCreationPassed: true,
                        duplicateRejectionPassed: false,
                        subsequentValidCreationPassed: true,
                      },
                    },
                    ...(execution.evidence ?? []),
                  ],
                };
              },
            },
          },
        ],
      });

      expect(
        result.workflowRun.evidence.filter(
          (entry) => entry.type === "test-result",
        ),
      ).toHaveLength(2);
      expect(result.workflowRun.status).toBe("completed");
      expect(result.evaluation.result).toBe("passed");
      expect(result.outcome.status).toBe("completed");
    },
  );

  it.each(["producer", "contributionId"] as const)(
    "treats a single-stage acceptance result with a different %s as unavailable for judgment",
    (differentField) => {
      const validator = new DuplicateUsernameAcceptanceValidator();
      const result = runDuplicateUsernameReferenceScenario({
        validator: {
          validate: (contributionId, execution) => {
            const validation = validator.validate(contributionId, execution);
            if (validation.status !== "completed") return validation;
            return {
              status: "completed",
              evidence: {
                ...validation.evidence,
                ...(differentField === "producer"
                  ? { producer: "unrelated-validator" }
                  : { contributionId: "unrelated-contribution" }),
              },
            };
          },
        },
      });

      expect(result.runResult?.status).toBe("executed");
      expect(result.workflowRun.failureReason).toBe("execution-failed");
      expect(result.evaluation.result).toBe("inconclusive");
      expect(result.outcome.reasonCode).toBe("stage-execution-failed");
    },
  );

  it("preserves contribution evidence when the original path's validator throws", () => {
    const result = runDuplicateUsernameReferenceScenario({
      validator: {
        validate: () => {
          throw new Error("Validation runtime unavailable");
        },
      },
    });

    expect(result.runResult?.status).toBe("executed");
    expect(result.workflowRun.evidence).toEqual(result.runResult?.evidence);
    expect(result.workflowRun.evidence.map((entry) => entry.type)).toEqual([
      "capability-result",
      "policy-result",
      "command-output",
    ]);
    expect(result.workflowRun.failureReason).toBe("execution-failed");
    expect(result.evaluation.result).toBe("inconclusive");
    expect(result.outcome.reasonCode).toBe("stage-execution-failed");
  });

  it.each([
    "dependency-deadlock",
    "missing-stage-binding",
    "handler-throws",
    "mismatched-stage",
  ] as const)("preserves %s without claiming validation ran", (mode) => {
    const workflow: Workflow = {
      id: "matrix-workflow",
      intentId: "matrix-intent",
      stages: [
        {
          id: "implementation",
          responsibility: "Produce an artifact.",
          expectedContribution: "Artifact",
          dependencies: mode === "dependency-deadlock" ? ["unresolvable"] : [],
          policyIds: [],
          evidenceRequirements: [],
          completionCriteria: [],
        },
      ],
      completionCriteria: [],
    };
    const execute = vi.fn(() => {
      if (mode === "handler-throws") throw new Error("Opaque stage exception");
      return {
        stageId: "wrong-stage",
        contributionId: "contribution",
        status: "completed" as const,
        summary: "Opaque",
        evidence: [],
      };
    });
    const workflowRun = new DeterministicWorkflowRunner().run(
      workflow,
      mode === "missing-stage-binding"
        ? []
        : [{ stageId: "implementation", handler: { execute } }],
    );
    const applicability = decideEvaluationApplicability({
      kind: "workflow",
      runResult: workflowRun,
    });
    const evaluation = new DeterministicEvaluator().evaluate({
      id: "matrix-evaluation",
      targetId: workflow.id,
      targetType: "workflow",
      requirements: [{ type: "test-result", metadata: { status: "passed" } }],
      evidence: workflowRun.evidence,
      applicable: applicability.applicable,
    });
    const outcome = new DeterministicOutcomeResolver().resolve({
      workflowId: workflow.id,
      workflowRun,
      evaluation,
    });

    expect(execute).toHaveBeenCalledTimes(
      mode === "handler-throws" || mode === "mismatched-stage" ? 1 : 0,
    );
    expect(workflowRun.failureReason).toBe(
      mode === "handler-throws" || mode === "mismatched-stage"
        ? "execution-failed"
        : mode,
    );
    expect(workflowRun.completedStageIds).toEqual([]);
    expect(workflowRun.evidence).toEqual([]);
    expect(evaluation.result).toBe("inconclusive");
    expect(outcome.status).toBe("failed");
    expect(outcome.reasonCode).toBe(
      mode === "handler-throws" || mode === "mismatched-stage"
        ? "stage-execution-failed"
        : mode,
    );
    if (mode === "dependency-deadlock") {
      expect(outcome.failedStageId).toBeUndefined();
      expect(outcome.unresolvedStageIds).toEqual(["implementation"]);
    } else {
      expect(outcome.failedStageId).toBe("implementation");
    }
  });

  it("does not label a validator executor with missing acceptance evidence as failed engineering", () => {
    const result = runDuplicateUsernameMultiStageScenario({
      validationCandidates: [
        {
          ...duplicateUsernameValidatorCandidate(),
          executor: {
            execute: (request) => ({
              status: "succeeded",
              contributionId: request.contribution.id,
              capabilityId: request.capabilityId,
              summary:
                "No acceptance evidence produced, despite an artifact claiming success.",
              artifacts: [
                {
                  type: "acceptance-validation-result",
                  contentReference:
                    "reference-validation:duplicate-username:passed",
                },
              ],
            }),
          },
        },
      ],
    });

    expect(result.validationRun?.status).toBe("executed");
    expect(result.validationRun?.failureReason).toBeUndefined();
    expect(result.workflowRun.failureReason).toBe("execution-failed");
    expect(result.workflowRun.failedStageId).toBe("validation");
    expect(
      result.workflowRun.evidence.some(
        (evidence) => evidence.type === "test-result",
      ),
    ).toBe(false);
    expect(result.evaluation.result).toBe("inconclusive");
    expect(result.outcome.reasonCode).toBe("stage-execution-failed");
  });

  it("does not transfer implementation authority with the handoff", () => {
    const candidate = duplicateUsernameValidatorCandidate();
    const execute = vi.fn(candidate.executor.execute.bind(candidate.executor));
    const result = runDuplicateUsernameMultiStageScenario({
      validationCapabilityId: "source.write",
      validationCandidates: [
        {
          ...candidate,
          contributor: {
            ...candidate.contributor,
            capabilityIds: ["validation.execute", "source.write"],
          },
          executor: { execute },
        },
      ],
    });

    expect(result.workflowRun.handoffs).toHaveLength(1);
    expect(
      result.workflowRun.handoffs[0]?.evidence.some(
        (evidence) =>
          evidence.type === "capability-result" &&
          evidence.metadata?.capabilityId === "source.write" &&
          evidence.metadata?.granted === true,
      ),
    ).toBe(true);
    expect(result.validationContribution.capabilityIds).toEqual([
      "validation.execute",
    ]);
    expect(execute).not.toHaveBeenCalled();
    expect(result.validationRun?.failureReason).toBe("capability-denied");
    expect(result.workflowRun.failureReason).toBe("governance-denied");
    expect(result.evaluation.result).toBe("inconclusive");
    expect(result.outcome.reasonCode).toBe("governance-denied");
  });
});
