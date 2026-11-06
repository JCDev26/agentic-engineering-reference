import { describe, expect, it, vi } from "vitest";
import { createCiReviewFixture } from "../src/scenarios/ci-review-fixtures.js";
import { createReviewContext, revisionMetadata } from "../src/scenarios/ci-review-context.js";
import { createVerificationBoundary, replayCiReview, runCiReview } from "../src/scenarios/ci-review.js";
import type { ExecutionRequest, ExecutionResult } from "../src/core/executor.js";
import type { Outcome } from "../src/domain/outcome.js";

describe("CI review fixture scenario: deterministic contracts, not an agent benchmark", () => {
  it.each(["action-duration", "session-duration", "invalid-clock", "backwards-clock"] as const)(
    "keeps the boundary stopped after %s exhaustion even if the host clock recovers", fault => {
      const fixture = createCiReviewFixture({ limits: { maxActionMs: 1 } });
      const execute = fixture.executor.execute;
      fixture.control.elapsedMs = 10;
      fixture.executor.execute = request => {
        const result = execute(request);
        if (fault === "session-duration") fixture.control.elapsedMs = fixture.input.context.limits.maxSessionMs;
        if (fault === "invalid-clock") fixture.control.elapsedMs = NaN;
        if (fault === "backwards-clock") fixture.control.elapsedMs = 0;
        return result;
      };
      const first = fixture.boundary.verify("unit", fixture.input.context);
      expect(first.disposition).toBe("budget-exhausted");
      expect(first.native?.execution?.status).toBe("succeeded");
      fixture.control.elapsedMs = 0;
      const next = fixture.boundary.verify("typecheck", fixture.input.context);
      expect(next.disposition).toBe("budget-exhausted");
      expect(next.native).toBeUndefined();
      expect(fixture.calls).toEqual(["unit"]);
    });

  it("keeps a pre-invocation session stop after the clock is reset", () => {
    const fixture = createCiReviewFixture();
    fixture.control.elapsedMs = fixture.input.context.limits.maxSessionMs;
    expect(fixture.boundary.verify("unit", fixture.input.context).disposition).toBe("budget-exhausted");
    fixture.control.elapsedMs = 0;
    expect(fixture.boundary.verify("typecheck", fixture.input.context).disposition).toBe("budget-exhausted");
    expect(fixture.calls).toEqual([]);
  });

  it.each(["cancelled", "unknown"] as const)("keeps pre-invocation %s terminal after control values recover", disposition => {
    const fixture = createCiReviewFixture();
    fixture.control.cancelled = disposition === "cancelled";
    fixture.control.termination = disposition === "unknown" ? "unknown" : "confirmed";
    expect(fixture.boundary.verify("unit", fixture.input.context).disposition).toBe(disposition);
    fixture.control.cancelled = false;
    fixture.control.termination = "confirmed";
    expect(fixture.boundary.verify("typecheck", fixture.input.context).disposition).toBe(disposition);
    expect(fixture.calls).toEqual([]);
  });

  it.each(["confirmed", "unknown"] as const)("keeps %s interruption terminal after cancellation is cleared", termination => {
    const fixture = createCiReviewFixture();
    const execute = fixture.executor.execute;
    fixture.executor.execute = request => {
      const result = execute(request);
      fixture.control.cancelled = true;
      fixture.control.termination = termination;
      return result;
    };
    const disposition = termination === "confirmed" ? "cancelled" : "unknown";
    const first = fixture.boundary.verify("unit", fixture.input.context);
    expect(first.disposition).toBe(disposition);
    expect(first.native?.execution?.status).toBe("succeeded");
    fixture.control.cancelled = false;
    expect(fixture.boundary.verify("typecheck", fixture.input.context).disposition).toBe(disposition);
    expect(fixture.calls).toEqual(["unit"]);
  });

  it("joins bounded specialists with attribution, verifies once per action and leaves human acceptance pending", () => {
    const fixture = createCiReviewFixture();
    const result = runCiReview(fixture.input, fixture.boundary);
    expect(result.session.status).toBe("review-ready");
    expect(result.handoffs.map(h => [h.fromStageId, h.toStageId])).toEqual([["ci", "join"], ["contracts", "join"]]);
    expect(result.joined).toHaveLength(1);
    expect(result.joined[0]?.sources.map(s => s.assignmentId)).toEqual(["ci", "contracts"]);
    expect(fixture.calls).toEqual(["unit", "typecheck"]);
    expect(result.attempts.every(a => a.native?.status === "executed")).toBe(true);
    expect(result.evaluation.result).toBe("passed");
    expect(result.outcome.status).toBe("completed");
    expect(result.report.technical).toBe("passed");
    expect(result.report.ownerApproval).toBe("pending");
    expect(result.usage.status).toBe("not-measured");
    fixture.input.assignments.reverse(); fixture.input.specialists.reverse();
    const freshBoundary = createCiReviewFixture().boundary;
    expect(runCiReview(fixture.input, freshBoundary).joined).toEqual(result.joined);
  });

  it.each(["pending", "missing", "failed", "cancelled"] as const)("blocks an upstream prerequisite marked %s without invoking verification", status => {
    const fixture = createCiReviewFixture();
    fixture.input.prerequisites[0]!.status = status;
    const result = runCiReview(fixture.input, fixture.boundary);
    expect(result.session.status).toBe("blocked");
    expect(result.prerequisites[0]?.status).toBe(status);
    expect(result.handoffs).toEqual([]);
    expect(result.attempts).toEqual([]);
    expect(result.evaluation.result).toBe("inconclusive");
    expect(result.outcome.reasonCode).toBe("evaluation-inconclusive");
    expect(result.report.technical).toBe("inconclusive");
    expect(fixture.calls).toEqual([]);
  });

  it("waits for every required specialist and rejects ambiguous prerequisite/results", () => {
    for (const fault of ["missing-result", "duplicate-result", "missing-prerequisite", "duplicate-prerequisite", "empty-evidence"] as const) {
      const fixture = createCiReviewFixture();
      if (fault === "missing-result") fixture.input.specialists.pop();
      if (fault === "duplicate-result") fixture.input.specialists[1] = fixture.input.specialists[0]!;
      if (fault === "missing-prerequisite") fixture.input.prerequisites.pop();
      if (fault === "duplicate-prerequisite") fixture.input.prerequisites.push(fixture.input.prerequisites[0]!);
      if (fault === "empty-evidence") fixture.input.prerequisites[0]!.evidence = [];
      expect(runCiReview(fixture.input, fixture.boundary).session.status).toBe("blocked");
      expect(fixture.calls).toEqual([]);
    }
  });

  it.each(["repository", "commit", "runId", "attempt", "packetDigest"] as const)("rejects stale %s in prerequisite and specialist evidence", key => {
    for (const location of ["prerequisite", "specialist"] as const) {
      const fixture = createCiReviewFixture();
      const evidence = location === "prerequisite" ? fixture.input.prerequisites[0]!.evidence[0]! : fixture.input.specialists[0]!.evidence[0]!;
      evidence.metadata![key] = key === "attempt" ? 2 : "stale";
      expect(runCiReview(fixture.input, fixture.boundary).session.status).toBe("blocked");
      expect(evidence.metadata![key]).toBe(key === "attempt" ? 2 : "stale");
      expect(fixture.calls).toEqual([]);
    }
  });

  it("rejects changed context and old result/grant bindings before execution", () => {
    const fixture = createCiReviewFixture();
    fixture.input.specialists[0]!.packetDigest = "old-packet";
    expect(runCiReview(fixture.input, fixture.boundary).session.status).toBe("blocked");
    fixture.input.context.files[0]!.content = "modified after packet assembly";
    expect(fixture.boundary.verify("unit", fixture.input.context).disposition).toBe("blocked");
    const other = createCiReviewFixture();
    const changed = createReviewContext({ ...other.input.context, source: { ...other.input.context.source, attempt: 2 } });
    expect(other.boundary.verify("unit", changed).disposition).toBe("blocked");
    expect(fixture.calls).toEqual([]); expect(other.calls).toEqual([]);
  });

  it.each(["refuted", "uncertain"] as const)("escalates %s findings with both sources, without voting or execution", conclusion => {
    const fixture = createCiReviewFixture();
    fixture.input.specialists[0]!.findings[0]!.conclusion = conclusion;
    const result = runCiReview(fixture.input, fixture.boundary);
    expect(result.session.status).toBe("requires-review");
    expect(result.joined[0]?.requiresReview).toBe(true);
    expect(result.joined[0]?.sources).toHaveLength(2);
    expect(result.evaluation.result).toBe("requires-review");
    expect(result.outcome).toMatchObject({ status: "escalated", reasonCode: "evaluation-requires-review" });
    expect(result.report.technical).toBe("inconclusive");
    expect(fixture.calls).toEqual([]);
  });

  it("rejects findings without evidence, excess assignments and expanded specialist actions", () => {
    for (const fault of ["uncited", "count", "actions", "ownership"] as const) {
      const fixture = createCiReviewFixture();
      if (fault === "uncited") fixture.input.specialists[0]!.findings[0]!.evidenceIds = ["invented"];
      if (fault === "count") fixture.input.assignments.push({ ...fixture.input.assignments[0]!, id: "extra" });
      if (fault === "actions") Object.assign(fixture.input.assignments[0]!, { allowedActions: ["verification.unit"] });
      if (fault === "ownership") fixture.input.assignments[0]!.owner = "";
      expect(runCiReview(fixture.input, fixture.boundary).session.status).toBe("blocked");
      expect(fixture.calls).toEqual([]);
    }
  });

  it("bounds the entire specialist handoff in bytes, including evidence and summaries", () => {
    const fixture = createCiReviewFixture();
    fixture.input.specialists[0]!.findings[0]!.summary = "界".repeat(3_000);
    expect(runCiReview(fixture.input, fixture.boundary).session.status).toBe("blocked");
    expect(fixture.calls).toEqual([]);
  });

  it("cancels before handoff and again immediately before invocation", () => {
    const fixture = createCiReviewFixture(); fixture.control.cancelled = true;
    const result = runCiReview(fixture.input, fixture.boundary);
    expect(result.session.status).toBe("cancelled");
    expect(result.handoffs).toEqual([]);
    expect(result.evaluation.result).toBe("inconclusive");
    expect(fixture.boundary.verify("unit", fixture.input.context).disposition).toBe("cancelled");
    expect(fixture.calls).toEqual([]);
  });

  it.each(["confirmed", "unknown"] as const)("retains native interrupted results and %s termination without starting downstream actions", termination => {
    const fixture = createCiReviewFixture();
    fixture.executor.execute = vi.fn((request: ExecutionRequest): ExecutionResult => {
      fixture.control.cancelled = true; fixture.control.termination = termination;
      return { status: "failed", contributionId: request.contribution.id, capabilityId: request.capabilityId,
        summary: "Interrupted before any native test judgment" };
    });
    const result = runCiReview(fixture.input, fixture.boundary);
    expect(result.session.status).toBe(termination === "confirmed" ? "cancelled" : "unknown");
    expect(result.attempts[0]?.native).toMatchObject({ status: "execution-failed", failureReason: "execution-failed" });
    expect(result.report.checks.some(c => c.status === "failed")).toBe(false);
    expect(result.report.technical).toBe("inconclusive");
    expect(fixture.executor.execute).toHaveBeenCalledTimes(1);
    fixture.control.cancelled = false;
    expect(fixture.boundary.verify("unit", fixture.input.context).disposition).toBe(termination === "confirmed" ? "cancelled" : "unknown");
    expect(fixture.executor.execute).toHaveBeenCalledTimes(1);
  });

  it("denies ungranted capability despite forged editable approval metadata", () => {
    const fixture = createCiReviewFixture({ grantedActions: [] });
    const report = runCiReview(fixture.input, fixture.boundary);
    expect(report.attempts[0]?.native?.failureReason).toBe("capability-denied");
    expect(report.outcome.reasonCode).toBe("governance-denied");
    report.report.ownerApproval = "approved";
    Object.assign(fixture.input, { ownerApproval: "approved", approval: { authorized: true } });
    const replay = replayCiReview(report, fixture.input.context);
    expect(replay.recorded.report.ownerApproval).toBe("approved"); // Descriptive data remains descriptive.
    expect(fixture.boundary.verify("typecheck", fixture.input.context).native?.failureReason).toBe("capability-denied");
    expect(fixture.calls).toEqual([]);
  });

  it.each(["deployment", "unit && deploy", "source.write"])("rejects unnamed action %s", action => {
    const fixture = createCiReviewFixture(); fixture.input.requestedActions = [action];
    expect(runCiReview(fixture.input, fixture.boundary).session.status).toBe("blocked");
    expect(fixture.calls).toEqual([]);
  });

  it("snapshots host grants and rejects a grant bound to another packet", () => {
    const fixture = createCiReviewFixture();
    const actions: Array<"unit" | "typecheck"> = [];
    const grant = { packetDigest: fixture.input.context.digest, actions };
    const boundary = createVerificationBoundary(fixture.input.context, grant, fixture.executor, () => fixture.control);
    actions.push("unit");
    expect(boundary.verify("unit", fixture.input.context).native?.failureReason).toBe("capability-denied");
    const stale = createVerificationBoundary(fixture.input.context,
      { packetDigest: "old-packet", actions: ["unit"] }, fixture.executor, () => fixture.control);
    expect(stale.verify("unit", fixture.input.context).disposition).toBe("blocked");
    expect(fixture.calls).toEqual([]);
  });

  it.each(["success", "throw"] as const)("prevents duplicate verification after %s, including across repeated calls", mode => {
    const fixture = createCiReviewFixture();
    if (mode === "throw") fixture.executor.execute = vi.fn(() => { throw new Error("Lost completion"); });
    fixture.input.requestedActions = ["unit", "unit"];
    const result = runCiReview(fixture.input, fixture.boundary);
    expect(result.session.status).toBe("blocked");
    expect(fixture.boundary.verify("unit", fixture.input.context).disposition).toBe("duplicate");
    if (mode === "success") {
      expect(result.attempts.map(a => a.disposition)).toEqual(["recorded", "duplicate"]);
      expect(fixture.calls).toEqual(["unit"]);
    } else expect(fixture.executor.execute).toHaveBeenCalledTimes(1);
  });

  it("preserves the executor failure as the primary native outcome cause", () => {
    const fixture = createCiReviewFixture();
    fixture.executor.execute = () => { throw new Error("Executor unavailable"); };
    const result = runCiReview(fixture.input, fixture.boundary);
    expect(result.attempts[0]?.native?.failureReason).toBe("execution-failed");
    expect(result.verificationWorkflow?.failureReason).toBe("execution-failed");
    expect(result.outcome.reasonCode).toBe("stage-execution-failed");
    expect(result.evaluation.result).toBe("inconclusive");
    expect(result.report.technical).toBe("inconclusive");
  });

  it("does not turn exit success or stale/ambiguous verification evidence into passing tests", () => {
    for (const fault of ["absent", "stale", "ambiguous"] as const) {
      const fixture = createCiReviewFixture(); const execute = fixture.executor.execute;
      fixture.executor.execute = request => {
        const result = execute(request);
        if (fault === "absent") result.evidence = [];
        if (fault === "stale") result.evidence![0]!.metadata!.attempt = 2;
        if (fault === "ambiguous") result.evidence!.push({ ...result.evidence![0]!, id: "extra" });
        return result;
      };
      const result = runCiReview(fixture.input, fixture.boundary);
      expect(result.attempts[0]?.native?.execution?.status).toBe("succeeded");
      expect(result.evaluation.result).toBe("inconclusive");
      expect(result.report.technical).toBe("inconclusive");
      expect(result.report.checks[0]?.status).toBe("inconclusive");
      expect(fixture.calls).toEqual(["unit"]);
    }
  });

  it("retains an actual failed test judgment independently of successful execution", () => {
    const fixture = createCiReviewFixture(); const execute = fixture.executor.execute;
    fixture.executor.execute = request => {
      const result = execute(request);
      if (request.capabilityId === "verification.unit") result.evidence![0]!.metadata!.status = "failed";
      return result;
    };
    const result = runCiReview(fixture.input, fixture.boundary);
    expect(result.attempts[0]?.native?.execution?.status).toBe("succeeded");
    expect(result.report.checks[0]?.status).toBe("failed");
    expect(result.evaluation.result).toBe("failed");
    expect(result.outcome.status).toBe("failed");
  });

  it("cannot infer complete verification from a single named passing action", () => {
    const fixture = createCiReviewFixture(); fixture.input.requestedActions = ["unit"];
    const result = runCiReview(fixture.input, fixture.boundary);
    expect(result.session.status).toBe("blocked");
    expect(result.report.checks[0]?.status).toBe("passed");
    expect(result.evaluation.result).toBe("inconclusive");
    expect(result.report.technical).toBe("inconclusive");
    expect(fixture.calls).toEqual(["unit"]);
  });

  it("rechecks context freshness when verification returns and before starting another action", () => {
    const fixture = createCiReviewFixture(); const execute = fixture.executor.execute;
    fixture.executor.execute = request => {
      const native = execute(request);
      fixture.input.context.prompts[0]!.content = "changed during verification";
      return native;
    };
    const result = runCiReview(fixture.input, fixture.boundary);
    expect(result.evaluation.result).toBe("inconclusive");
    expect(result.attempts[0]?.native?.execution?.evidence?.[0]?.metadata?.status).toBe("passed");
    expect(result.report.technical).toBe("inconclusive");
    expect(fixture.calls).toEqual(["unit"]);
  });

  it.each(["completed", "failed", "escalated", "cancelled"] as const)("preserves an upstream native %s outcome without promoting it to authority", status => {
    const fixture = createCiReviewFixture({ grantedActions: [] });
    const source: Outcome = { workflowId: "source", status, summary: "Original native observation", evidence: [],
      ...(status === "failed" ? { reasonCode: "evaluation-inconclusive" as const } : {}) };
    fixture.input.sourceOutcome = source;
    const result = runCiReview(fixture.input, fixture.boundary);
    expect(result.sourceOutcome).toEqual(source);
    expect(result.sourceOutcome).not.toBe(source);
    expect(result.outcome.reasonCode).toBe("governance-denied");
    expect(fixture.calls).toEqual([]);
  });

  it("enforces lowered count/time limits without erasing native observations", () => {
    const specialist = createCiReviewFixture({ limits: { maxSpecialistMs: 1 } });
    expect(runCiReview(specialist.input, specialist.boundary).session.status).toBe("budget-exhausted");
    expect(specialist.calls).toEqual([]);
    const requests = createCiReviewFixture({ limits: { maxVerificationAttempts: 1 } });
    expect(runCiReview(requests.input, requests.boundary).session.status).toBe("budget-exhausted");
    expect(requests.calls).toEqual([]);
    const action = createCiReviewFixture({ limits: { maxActionMs: 1 } });
    const result = runCiReview(action.input, action.boundary);
    expect(result.session.status).toBe("budget-exhausted");
    expect(result.attempts[0]?.native?.execution?.evidence?.[0]?.metadata?.status).toBe("passed");
    expect(result.report.technical).toBe("inconclusive");
    expect(action.calls).toEqual(["unit"]);
    const session = createCiReviewFixture(); session.control.elapsedMs = NaN;
    expect(runCiReview(session.input, session.boundary).session.status).toBe("budget-exhausted");
    expect(session.calls).toEqual([]);
  });

  it("checks action duration even when the host observer returns a mutable clock object", () => {
    const fixture = createCiReviewFixture({ limits: { maxActionMs: 1 } });
    const boundary = createVerificationBoundary(fixture.input.context,
      { packetDigest: fixture.input.context.digest, actions: ["unit"] }, fixture.executor, () => fixture.control);
    expect(boundary.verify("unit", fixture.input.context).disposition).toBe("budget-exhausted");
    expect(fixture.calls).toEqual(["unit"]);
  });

  it("replays serialized evidence without an execution dependency and marks other revisions historical", () => {
    const fixture = createCiReviewFixture();
    const source: Outcome = { workflowId: "source", status: "failed", reasonCode: "evaluation-inconclusive",
      summary: "The source had no trustworthy test judgment", evidence: [] };
    fixture.input.sourceOutcome = source;
    const recorded = runCiReview(fixture.input, fixture.boundary);
    expect(recorded.sourceOutcome).toEqual(source);
    fixture.executor.execute = vi.fn(() => { throw new Error("Replay must never execute"); });
    const restored = JSON.parse(JSON.stringify(recorded)) as typeof recorded;
    const current = replayCiReview(restored, fixture.input.context);
    expect(current.applicability).toBe("current");
    expect(current.recorded).toEqual(recorded);
    const target = createReviewContext({ ...fixture.input.context, source: { ...fixture.input.context.source, commit: "b".repeat(40) } });
    const historical = replayCiReview(restored, target);
    expect(historical.applicability).toBe("historical");
    expect(historical.technical).toBe("inconclusive");
    expect(historical.recorded.report.technical).toBe("passed");
    expect(historical.recorded.sourceOutcome).toEqual(source);
    expect(fixture.executor.execute).not.toHaveBeenCalled();
    expect(fixture.calls).toEqual(["unit", "typecheck"]);
    expect(revisionMetadata(target).packetDigest).not.toBe(recorded.context.digest);
  });
});
