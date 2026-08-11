import type { Contribution } from "../domain/contribution.js";
import type { Evidence } from "../domain/evidence.js";
import type { Policy, PolicyContext } from "../domain/policy.js";
import type { DeterministicPolicyEngine } from "./policy-engine.js";
import type { EvidenceRecorder } from "./evidence-recorder.js";

export type ContributionRunStatus = "allowed" | "blocked";

export interface ContributionRunResult {
    status: ContributionRunStatus;
    contributionId: string;
    evidence: Evidence[];
}

export interface ContributionExecutionRequest {
    contribution: Contribution;
    policies: Policy[];
    requestedCapabilityId?: string;
    requestedTarget?: string;
}

export class ContributionRunner {
    constructor(
        private readonly policyEngine: DeterministicPolicyEngine,
        private readonly evidenceRecorder: EvidenceRecorder
    ) { }

    run(request: ContributionExecutionRequest): ContributionRunResult {
        const context: PolicyContext = {
            contributionId: request.contribution.id,
            ...(request.requestedCapabilityId !== undefined
                ? { requestedCapabilityId: request.requestedCapabilityId }
                : {}),
            ...(request.requestedTarget !== undefined
                ? { requestedTarget: request.requestedTarget }
                : {}),
        };

        const decisions = this.policyEngine.evaluate(
            request.policies,
            context
        );

        const evidence = decisions.map((decision) =>
            this.evidenceRecorder.recordPolicyDecision(context, decision)
        );

        const blocked = decisions.some((decision) => !decision.allowed);

        return {
            status: blocked ? "blocked" : "allowed",
            contributionId: request.contribution.id,
            evidence,
        };
    }
}