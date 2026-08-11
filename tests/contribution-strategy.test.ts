import { describe, expect, it } from "vitest";

import {
  DeterministicContributionStrategy,
  type ContributorCandidate,
} from "../src/core/contribution-strategy.js";
import {
  DeterministicContributorExecutor,
  SimulatedContributorExecutor,
} from "../src/core/contributor-executor.js";
import { DeterministicExecutor } from "../src/core/executor.js";

import type { Contribution } from "../src/domain/contribution.js";
import type {
  ContributorProfile,
} from "../src/domain/contributor.js";

const contribution: Contribution = {
  id: "contribution-001",
  workflowId: "workflow-001",
  stageId: "implementation",
  objective: "Modify approved source code",
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

function deterministicCandidate(
  available = true
): ContributorCandidate {
  return {
    contributor: {
      id: "local-automation",
      type: "automation",
      capabilityIds: ["source.write"],
      available,
      provider: "reference-local",
    },
    executor: new DeterministicContributorExecutor(
      new DeterministicExecutor()
    ),
  };
}

function simulatedCandidate(): ContributorCandidate {
  return {
    contributor: {
      id: "simulated-contributor",
      type: "external-service",
      capabilityIds: ["source.write"],
      available: true,
      provider: "reference-simulated",
    },
    executor: new SimulatedContributorExecutor(),
  };
}

describe("DeterministicContributionStrategy", () => {
  it("selects an available contributor with the required capabilities", () => {
    const strategy =
      new DeterministicContributionStrategy();

    const result = strategy.select({
      contribution,
      contributorProfile,
      candidates: [deterministicCandidate()],
    });

    expect(result.selected).toBe(true);

    if (result.selected) {
      expect(result.candidate.contributor.id).toBe(
        "local-automation"
      );
    }
  });

  it("does not select an unavailable contributor", () => {
    const strategy =
      new DeterministicContributionStrategy();

    const result = strategy.select({
      contribution,
      contributorProfile,
      candidates: [deterministicCandidate(false)],
    });

    expect(result).toEqual({
      selected: false,
      reason:
        "No available contributor satisfies the contribution capability requirements.",
    });
  });

  it("uses contributor profile preferences when multiple contributors are eligible", () => {
    const strategy =
      new DeterministicContributionStrategy();

    const result = strategy.select({
      contribution,
      contributorProfile,
      candidates: [
        simulatedCandidate(),
        deterministicCandidate(),
      ],
    });

    expect(result.selected).toBe(true);

    if (result.selected) {
      expect(result.candidate.contributor.type).toBe(
        "automation"
      );

      expect(result.candidate.contributor.id).toBe(
        "local-automation"
      );
    }
  });

  it("rejects selection when the contributor lacks a granted capability", () => {
    const strategy =
      new DeterministicContributionStrategy();

    const incapableCandidate: ContributorCandidate = {
      contributor: {
        id: "read-only-contributor",
        type: "automation",
        capabilityIds: ["source.read"],
        available: true,
      },
      executor: new DeterministicContributorExecutor(
        new DeterministicExecutor()
      ),
    };

    const result = strategy.select({
      contribution,
      contributorProfile,
      candidates: [incapableCandidate],
    });

    expect(result.selected).toBe(false);
  });

  it("rejects selection when the contributor profile does not permit the contribution capabilities", () => {
    const strategy =
      new DeterministicContributionStrategy();

    const restrictedProfile: ContributorProfile = {
      ...contributorProfile,
      allowedCapabilityIds: ["source.read"],
    };

    const result = strategy.select({
      contribution,
      contributorProfile: restrictedProfile,
      candidates: [deterministicCandidate()],
    });

    expect(result).toEqual({
      selected: false,
      reason:
        "Contributor profile does not allow all capabilities granted to the contribution.",
    });
  });
});