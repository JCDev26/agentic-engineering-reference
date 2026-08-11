import { describe, expect, it, vi } from "vitest";

import { ContributionRunner } from "../src/core/contribution-runner.js";
import { InMemoryEvidenceRecorder } from "../src/core/evidence-recorder.js";
import { DeterministicExecutor } from "../src/core/executor.js";
import { DeterministicPolicyEngine } from "../src/core/policy-engine.js";

import type { Contribution } from "../src/domain/contribution.js";
import type { Policy } from "../src/domain/policy.js";

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

const sourceScopePolicy: Policy = {
    id: "source-scope",
    rule: "Contribution may modify only files within src/",
    scope: ["src/"],
    enforcementPoint: "capability-request",
    failureBehavior: "deny",
    severity: "high",
};

describe("ContributionRunner", () => {
    it("executes a contribution after policy allows the action", () => {
        const executor = new DeterministicExecutor();

        const executeSpy = vi.spyOn(executor, "execute");

        const runner = new ContributionRunner(
            new DeterministicPolicyEngine(),
            new InMemoryEvidenceRecorder(),
            executor
        );

        const result = runner.run({
            contribution,
            policies: [sourceScopePolicy],
            requestedCapabilityId: "source.write",
            requestedTarget: "src/domain/work-item.ts",
        });

        expect(result.status).toBe("executed");
        expect(executeSpy).toHaveBeenCalledOnce();

        expect(result.execution).toMatchObject({
            status: "succeeded",
            contributionId: "contribution-001",
            capabilityId: "source.write",
        });

        expect(result.evidence).toHaveLength(1);
        expect(result.evidence[0]?.metadata).toMatchObject({
            allowed: true,
        });
    });

    it("never reaches execution when policy blocks the action", () => {
        const executor = new DeterministicExecutor();

        const executeSpy = vi.spyOn(executor, "execute");

        const runner = new ContributionRunner(
            new DeterministicPolicyEngine(),
            new InMemoryEvidenceRecorder(),
            executor
        );

        const result = runner.run({
            contribution,
            policies: [sourceScopePolicy],
            requestedCapabilityId: "source.write",
            requestedTarget: "README.md",
        });

        expect(result.status).toBe("blocked");

        expect(executeSpy).not.toHaveBeenCalled();

        expect(result.execution).toBeUndefined();

        expect(result.evidence).toHaveLength(1);
        expect(result.evidence[0]?.metadata).toMatchObject({
            allowed: false,
            action: "deny",
        });
    });
    
    it("blocks execution when the requested capability is not granted", () => {
        const executor = new DeterministicExecutor();

        const executeSpy = vi.spyOn(executor, "execute");

        const runner = new ContributionRunner(
            new DeterministicPolicyEngine(),
            new InMemoryEvidenceRecorder(),
            executor
        );

        const result = runner.run({
            contribution,
            policies: [sourceScopePolicy],
            requestedCapabilityId: "deployment.execute",
            requestedTarget: "src/domain/work-item.ts",
        });

        expect(result.status).toBe("blocked");

        expect(executeSpy).not.toHaveBeenCalled();

        expect(result.execution).toBeUndefined();

        expect(result.evidence).toHaveLength(0);
    });
});