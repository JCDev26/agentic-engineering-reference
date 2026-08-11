import { describe, expect, it } from "vitest";

import {
  DeterministicContributorExecutor,
  SimulatedContributorExecutor,
} from "../src/core/contributor-executor.js";
import { DeterministicExecutor } from "../src/core/executor.js";

import type { Contribution } from "../src/domain/contribution.js";

const contribution: Contribution = {
  id: "contribution-001",
  workflowId: "workflow-001",
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
  ],
};

describe("ContributorExecutor", () => {
  it("allows a deterministic contributor implementation to satisfy the execution contract", () => {
    const contributorExecutor =
      new DeterministicContributorExecutor(
        new DeterministicExecutor()
      );

    const result = contributorExecutor.execute({
      contribution,
      capabilityId: "source.write",
      target: "src/user-management/create-user.ts",
    });

    expect(result).toMatchObject({
      status: "succeeded",
      contributionId: "contribution-001",
      capabilityId: "source.write",
    });
  });

  it("allows a simulated contributor implementation to satisfy the same execution contract", () => {
    const contributorExecutor =
      new SimulatedContributorExecutor();

    const result = contributorExecutor.execute({
      contribution,
      capabilityId: "source.write",
      target: "src/user-management/create-user.ts",
    });

    expect(result).toEqual({
      status: "succeeded",
      contributionId: "contribution-001",
      capabilityId: "source.write",
      summary:
        "Simulated contributor completed the assigned contribution.",
    });
  });

  it("keeps the normalized execution contract stable across contributor implementations", () => {
    const deterministic =
      new DeterministicContributorExecutor(
        new DeterministicExecutor()
      );

    const simulated =
      new SimulatedContributorExecutor();

    const request = {
      contribution,
      capabilityId: "source.write",
      target: "src/user-management/create-user.ts",
    };

    const deterministicResult =
      deterministic.execute(request);

    const simulatedResult =
      simulated.execute(request);

    expect(deterministicResult.status).toBe(
      simulatedResult.status
    );

    expect(
      deterministicResult.contributionId
    ).toBe(simulatedResult.contributionId);

    expect(
      deterministicResult.capabilityId
    ).toBe(simulatedResult.capabilityId);
  });
});