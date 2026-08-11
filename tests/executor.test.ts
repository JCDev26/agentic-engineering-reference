import { describe, expect, it } from "vitest";

import {
  DeterministicExecutor,
  type ExecutionRequest,
} from "../src/core/executor.js";

import type { Contribution } from "../src/domain/contribution.js";

const contribution: Contribution = {
  id: "contribution-001",
  workflowId: "workflow-001",
  stageId: "implementation",
  objective: "Modify approved source code",
  scope: ["src/"],
  contributorProfileId: "implementer",
  capabilityIds: ["source.write"],
  policyIds: ["source-scope"],
  evidenceRequirements: ["policy-result"],
  completionCriteria: ["execution completed"],
};

describe("DeterministicExecutor", () => {
  it("returns a successful execution result", () => {
    const executor = new DeterministicExecutor();

    const request: ExecutionRequest = {
      contribution,
      capabilityId: "source.write",
      target: "src/domain/work-item.ts",
    };

    const result = executor.execute(request);

    expect(result).toEqual({
      status: "succeeded",
      contributionId: "contribution-001",
      capabilityId: "source.write",
      summary: "Deterministic execution completed for source.write.",
    });
  });
});