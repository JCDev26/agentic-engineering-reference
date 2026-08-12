import { describe, expect, it } from "vitest";

import { InMemoryEvidenceRecorder } from "../src/core/evidence-recorder.js";

import type {
  PolicyContext,
  PolicyDecision,
} from "../src/domain/policy.js";
import type { ExecutionResult } from "../src/core/executor.js";

describe("InMemoryEvidenceRecorder", () => {
  const recorder = new InMemoryEvidenceRecorder();

  it("records evidence for an allowed policy decision", () => {
    const context: PolicyContext = {
      contributionId: "contribution-001",
      requestedCapabilityId: "source.write",
      requestedTarget: "src/domain/work-item.ts",
    };

    const decision: PolicyDecision = {
      allowed: true,
      policyId: "source-scope",
    };

    const evidence = recorder.recordPolicyDecision(
      context,
      decision
    );

    expect(evidence.contributionId).toBe(
      "contribution-001"
    );
    expect(evidence.type).toBe("policy-result");
    expect(evidence.contentReference).toBe(
      "policy:source-scope"
    );
    expect(evidence.producer).toBe(
      "deterministic-policy-engine"
    );

    expect(evidence.metadata).toMatchObject({
      requestedCapabilityId: "source.write",
      requestedTarget: "src/domain/work-item.ts",
      allowed: true,
    });
  });

  it("records denial details for a denied policy decision", () => {
    const context: PolicyContext = {
      contributionId: "contribution-001",
      requestedCapabilityId: "source.write",
      requestedTarget: "README.md",
    };

    const decision: PolicyDecision = {
      allowed: false,
      policyId: "source-scope",
      reason: "Requested target is outside policy scope.",
      action: "deny",
    };

    const evidence = recorder.recordPolicyDecision(
      context,
      decision
    );

    expect(evidence.metadata).toMatchObject({
      requestedCapabilityId: "source.write",
      requestedTarget: "README.md",
      allowed: false,
      reason: "Requested target is outside policy scope.",
      action: "deny",
    });
  });

  it("records evidence for a denied capability request", () => {
    const evidence = recorder.recordCapabilityDecision({
      contributionId: "contribution-001",
      capabilityId: "deployment.execute",
      granted: false,
      reason:
        "Capability is not granted to this contribution.",
    });

    expect(evidence.contributionId).toBe(
      "contribution-001"
    );
    expect(evidence.type).toBe("capability-result");
    expect(evidence.contentReference).toBe(
      "capability:deployment.execute"
    );
    expect(evidence.producer).toBe(
      "contribution-runner"
    );

    expect(evidence.metadata).toMatchObject({
      capabilityId: "deployment.execute",
      granted: false,
      reason:
        "Capability is not granted to this contribution.",
    });
  });

  it("records structured evidence for a successful execution", () => {
    const result: ExecutionResult = {
      status: "succeeded",
      contributionId: "contribution-001",
      capabilityId: "source.write",
      summary:
        "Deterministic execution completed for source.write.",
    };

    const evidence =
      recorder.recordExecutionResult(result);

    expect(evidence.contributionId).toBe(
      "contribution-001"
    );

    expect(evidence.type).toBe("command-output");

    expect(evidence.contentReference).toBe(
      "execution:contribution-001"
    );

    expect(evidence.producer).toBe("executor");

    expect(evidence.metadata).toMatchObject({
      capabilityId: "source.write",
      status: "succeeded",
      summary:
        "Deterministic execution completed for source.write.",
    });
  });

  it("records structured evidence for a failed execution", () => {
    const result: ExecutionResult = {
      status: "failed",
      contributionId: "contribution-001",
      capabilityId: "source.write",
      summary: "Deterministic execution failed.",
    };

    const evidence =
      recorder.recordExecutionResult(result);

    expect(evidence.type).toBe("command-output");

    expect(evidence.metadata).toMatchObject({
      capabilityId: "source.write",
      status: "failed",
      summary: "Deterministic execution failed.",
    });
  });

  it("records contributor-produced artifact references in execution evidence", () => {
    const evidence =
      recorder.recordExecutionResult({
        status: "succeeded",
        contributionId: "contribution-001",
        capabilityId: "source.write",
        summary:
          "Contributor produced an implementation artifact.",
        artifacts: [
          {
            type: "user-creator-implementation",
            contentReference:
              "reference-app:user-creator:duplicate-safe",
          },
        ],
      });
  
    expect(evidence.metadata).toMatchObject({
      status: "succeeded",
      artifactReferences: [
        "reference-app:user-creator:duplicate-safe",
      ],
    });
  });
});