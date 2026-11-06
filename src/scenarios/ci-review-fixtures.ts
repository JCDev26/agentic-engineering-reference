import { readFileSync } from "node:fs";
import type { Evidence } from "../domain/evidence.js";
import type { Executor } from "../core/executor.js";
import { createReviewContext, reviewLimits, revisionMetadata, type ReviewLimits } from "./ci-review-context.js";
import { createVerificationBoundary, verificationActions, verificationProducer,
  type ReviewControl, type ReviewInput, type VerificationAction } from "./ci-review.js";

/** File access and fixture execution live outside policy. No GitHub/provider/shell adapter exists. */
export function createCiReviewFixture(options: {
  limits?: Partial<ReviewLimits>;
  grantedActions?: readonly VerificationAction[];
} = {}) {
  const configuration = JSON.parse(readFileSync("config/ci-review-fixtures.json", "utf8")) as { limits: ReviewLimits };
  const context = createReviewContext({ taskId: "ci-review-fixture", owner: "repository-owner",
    objective: "Diagnose one CI result and collect named verification for human review",
    source: { repository: "example/personal-workflow", commit: "a".repeat(40), runId: "fixture-run", attempt: 1 },
    files: [{ path: "package.json", content: '{"scripts":{"test":"vitest run","typecheck":"tsc --noEmit"}}' },
      { path: ".github/workflows/ci.yml", content: "permissions:\n  contents: read\n" }],
    prompts: ["prompts/ci-review-owner-v1.md", "prompts/ci-review-specialist-v1.md"]
      .map(path => ({ path, content: readFileSync(path, "utf8") })),
    limits: reviewLimits({ ...configuration.limits, ...options.limits }),
  });
  const evidence = (id: string, producer: string, extra: Record<string, unknown> = {}): Evidence => ({
    id, contributionId: producer, type: "log", producer,
    timestamp: "2026-11-01T00:00:00Z", contentReference: `fixture:${id}`,
    metadata: { ...revisionMetadata(context), ...extra },
  });
  const input: ReviewInput = { context,
    observation: { observedAt: "2026-11-01T00:00:00Z", environment: {
      platform: "fixture", toolVersions: {}, capabilities: ["fixture-analysis", "fixture-verification"] } },
    prerequisites: ["source-snapshot", "locked-toolchain"].map(id => ({ id, status: "satisfied", evidence: [evidence(id, "fixture-preflight")] })),
    assignments: [
      { id: "ci", owner: "ci-specialist", responsibility: "Inspect CI prerequisites and runtime evidence",
        prerequisiteIds: ["source-snapshot", "locked-toolchain"], allowedActions: ["context.read", "analysis.return"] },
      { id: "contracts", owner: "contract-specialist", responsibility: "Inspect result semantics and verification requirements",
        prerequisiteIds: ["source-snapshot"], allowedActions: ["context.read", "analysis.return"] },
    ],
    specialists: ["ci", "contracts"].map((assignmentId, index) => ({ assignmentId,
      packetDigest: context.digest, durationMs: 400 + index * 100,
      evidence: [evidence(`${assignmentId}-observation`, assignmentId)],
      findings: [{ claim: "verification-readiness", conclusion: "supported",
        summary: `${assignmentId} fixture found its declared prerequisites satisfied`, evidenceIds: [`${assignmentId}-observation`] }],
    })),
    requestedActions: [...verificationActions],
  };
  const control: ReviewControl = { cancelled: false, elapsedMs: 0, termination: "confirmed" };
  const calls: string[] = [];
  const executor: Executor = { execute(request) {
    const action = request.capabilityId.replace("verification.", "");
    calls.push(action);
    control.elapsedMs += 2; // Declared fixture time, never an agent performance measurement.
    return { status: "succeeded", contributionId: request.contribution.id,
      capabilityId: request.capabilityId, summary: "Fixture returned a native judgment; no command executed.",
      evidence: [{ ...evidence(`verification-${action}`, verificationProducer, { action, status: "passed" }),
        contributionId: request.contribution.id, type: "test-result" }] };
  } };
  const boundary = createVerificationBoundary(context, {
    packetDigest: context.digest, actions: options.grantedActions ?? verificationActions,
  }, executor, () => ({ ...control }));
  return { input, control, executor, calls, boundary };
}
