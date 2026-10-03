import { describe, expect, it } from "vitest";
import { createDuplicateUsernameIntent } from "../src/scenarios/duplicate-username-intent.js";
import { runDuplicateUsernameReferenceScenario } from "../src/scenarios/duplicate-username.js";
import { runDuplicateUsernameMultiStageScenario } from "../src/scenarios/duplicate-username-workflow.js";

describe.each([
  {
    surface: "contribution" as const,
    run: runDuplicateUsernameReferenceScenario,
  },
  { surface: "workflow" as const, run: runDuplicateUsernameMultiStageScenario },
])("Intent-driven evaluation: $surface", ({ surface, run }) => {
  it("changes evaluation by changing only structured intent requirements", () => {
    const intent = createDuplicateUsernameIntent(surface);
    const baseline = run({ intent });
    expect(baseline.evaluation.result).toBe("passed");

    const strongerIntent = {
      ...intent,
      evaluationRequirements: [
        ...intent.evaluationRequirements,
        {
          type: "test-result" as const,
          metadata: { compatibilityChecked: true },
        },
      ],
    };
    const result = run({ intent: strongerIntent });
    expect(result.intent).toBe(strongerIntent);
    expect(result.workflow.intentId).toBe(strongerIntent.id);
    expect(result.workItem.intentId).toBe(strongerIntent.id);
    expect(result.evaluation.result).toBe("failed");
    expect(result.evaluation.findings).toEqual([
      'Unsatisfied evidence requirement: Evidence of type "test-result" with compatibilityChecked=true is required.',
    ]);
    expect(result.outcome).toMatchObject({
      status: "failed",
      reasonCode: "evaluation-failed",
    });
    expect(
      result.evaluation.evidence.find((e) => e.type === "test-result")?.metadata
        ?.status,
    ).toBe("passed");
  });

  it("keeps human prose distinct from deterministic requirements", () => {
    const intent = createDuplicateUsernameIntent(surface);
    intent.acceptanceCriteria = [
      "A human-authored criterion requiring separate operationalization.",
    ];
    expect(run({ intent }).evaluation.result).toBe("passed");
  });

  it("cannot declare success with no structured requirements", () => {
    const intent = createDuplicateUsernameIntent(surface);
    intent.evaluationRequirements = [];
    const result = run({ intent });
    expect(result.evaluation.result).toBe("inconclusive");
    expect(result.outcome.status).not.toBe("completed");
  });
});
