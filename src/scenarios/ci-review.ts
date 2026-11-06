import { ContributionRunner, type ContributionRunResult } from "../core/contribution-runner.js";
import { InMemoryEvidenceRecorder } from "../core/evidence-recorder.js";
import { DeterministicEvaluator } from "../core/evaluator.js";
import type { Executor } from "../core/executor.js";
import { DeterministicOutcomeResolver } from "../core/outcome-resolver.js";
import { DeterministicPolicyEngine } from "../core/policy-engine.js";
import { DeterministicWorkflowRunner, type WorkflowRunResult } from "../core/workflow-runner.js";
import type { Evidence } from "../domain/evidence.js";
import type { Evaluation } from "../domain/evaluation.js";
import type { Handoff } from "../domain/handoff.js";
import type { Outcome } from "../domain/outcome.js";
import { createRunReport, type RunCheck, type RunContext, type RunReport } from "../reporting/run-report.js";
import { currentContext, currentEvidence, revisionMetadata, type ReviewContext } from "./ci-review-context.js";

export const verificationActions = Object.freeze(["unit", "typecheck"] as const);
export type VerificationAction = typeof verificationActions[number];
export const verificationProducer = "ci-review-verifier";
export interface Prerequisite {
  id: string;
  status: "pending" | "satisfied" | "missing" | "failed" | "cancelled";
  evidence: Evidence[];
}
export interface SpecialistAssignment {
  id: string;
  owner: string;
  responsibility: string;
  prerequisiteIds: string[];
  allowedActions: readonly ["context.read", "analysis.return"];
}
export interface Finding {
  claim: string;
  conclusion: "supported" | "refuted" | "uncertain";
  summary: string;
  evidenceIds: string[];
}
export interface SpecialistResult {
  assignmentId: string;
  packetDigest: string;
  durationMs: number;
  evidence: Evidence[];
  findings: Finding[];
}
export interface JoinedFinding {
  claim: string;
  requiresReview: boolean;
  sources: { assignmentId: string; finding: Finding }[];
}
export interface ReviewControl {
  cancelled: boolean;
  elapsedMs: number;
  termination: "confirmed" | "unknown";
}
export type SessionStatus = "review-ready" | "blocked" | "requires-review"
  | "cancelled" | "unknown" | "budget-exhausted";
export interface VerificationAttempt {
  action: string;
  disposition: "recorded" | "blocked" | "duplicate" | "cancelled" | "unknown" | "budget-exhausted";
  reason: string;
  native?: ContributionRunResult;
}

/** Trusted composition supplies grants separately. Neither report nor prompt is an authority input.
 * This is local call gating and per-boundary deduplication, not a host sandbox or durable ledger. */
export function createVerificationBoundary(context: ReviewContext,
  grant: { packetDigest: string; actions: readonly VerificationAction[] },
  executor: Executor, observe: () => ReviewControl) {
  const approved = structuredClone(context);
  const capabilities = [...grant.actions].map(action => `verification.${action}`);
  const grantedDigest = grant.packetDigest;
  const attempted = new Set<string>();
  let terminal: { disposition: "cancelled" | "unknown" | "budget-exhausted"; reason: string } | undefined;
  const runner = new ContributionRunner(new DeterministicPolicyEngine(), new InMemoryEvidenceRecorder(), executor);
  return {
    observe,
    verify(action: string, requested: ReviewContext): VerificationAttempt {
      const stop = (disposition: VerificationAttempt["disposition"], reason: string): VerificationAttempt =>
        ({ action, disposition, reason });
      const halt = (disposition: "cancelled" | "unknown" | "budget-exhausted", reason: string): VerificationAttempt => {
        terminal = { disposition, reason };
        return stop(disposition, reason);
      };
      if (terminal) return stop(terminal.disposition, terminal.reason);
      const before = { ...observe() };
      if (before.cancelled || before.termination === "unknown") return halt(
        before.termination === "unknown" ? "unknown" : "cancelled", "Cancellation or unknown termination prevents a new invocation.");
      if (!Number.isFinite(before.elapsedMs) || before.elapsedMs < 0
          || before.elapsedMs >= approved.limits.maxSessionMs) return halt("budget-exhausted", "Session budget unavailable or exhausted.");
      if (!currentContext(requested) || requested.digest !== approved.digest || grantedDigest !== approved.digest) {
        return stop("blocked", "Stale context or revision-bound grant.");
      }
      if (!(verificationActions as readonly string[]).includes(action)) return stop("blocked", "Action is not named verification.");
      if (attempted.has(action)) return stop("duplicate", "Already attempted; no automatic repeat, including after failure.");
      if (attempted.size >= approved.limits.maxVerificationAttempts) return halt("budget-exhausted", "Verification attempt budget exhausted.");
      const target = `review:${approved.digest}:${action}`;
      // Reserve before entering an executor: exceptions and ambiguous completion cannot enable a retry.
      attempted.add(action);
      const native = runner.run({
        contribution: { id: `${approved.taskId}:verify:${action}`, workflowId: approved.taskId,
          stageId: "verification", objective: `Run named ${action} verification`, scope: [target],
          contributorProfileId: "fixture-verifier", capabilityIds: capabilities,
          policyIds: ["revision-target"], evidenceRequirements: ["test-result"], completionCriteria: ["Native judgment recorded"] },
        policies: [{ id: "revision-target", rule: "Verify only this revision-bound action", scope: [target],
          enforcementPoint: "tool-invocation", failureBehavior: "deny" }],
        requestedCapabilityId: `verification.${action}`, requestedTarget: target,
      });
      const after = observe();
      if (after.cancelled || after.termination === "unknown") return { ...halt(
        after.termination === "confirmed" ? "cancelled" : "unknown",
        "Interrupted invocation; retain the native result and reconcile before any new attempt."), native };
      if (!Number.isFinite(after.elapsedMs) || after.elapsedMs < before.elapsedMs
          || after.elapsedMs >= approved.limits.maxSessionMs
          || after.elapsedMs - before.elapsedMs > approved.limits.maxActionMs) {
        return { ...halt("budget-exhausted", "Observed duration exceeded its budget; no further action."), native };
      }
      return { action, native, disposition: native.status === "blocked" ? "blocked" : "recorded",
        reason: native.failureReason ?? "Native verification result recorded." };
    },
  };
}
export type VerificationBoundary = ReturnType<typeof createVerificationBoundary>;

export interface ReviewInput {
  context: ReviewContext;
  observation: Pick<RunContext, "observedAt" | "environment">;
  prerequisites: Prerequisite[];
  assignments: SpecialistAssignment[];
  specialists: SpecialistResult[];
  requestedActions: string[];
  /** An already observed native outcome, retained without reinterpretation. */
  sourceOutcome?: Outcome;
}
export interface ReviewPacket {
  schemaVersion: 1;
  mode: "fixture";
  context: ReviewContext;
  prerequisites: Prerequisite[];
  assignments: SpecialistAssignment[];
  specialists: SpecialistResult[];
  handoffs: Handoff[];
  joined: JoinedFinding[];
  session: { status: SessionStatus; reason: string };
  attempts: VerificationAttempt[];
  verificationWorkflow?: WorkflowRunResult;
  evaluation: Evaluation;
  outcome: Outcome;
  sourceOutcome?: Outcome;
  report: RunReport;
  usage: { status: "not-measured"; reason: string };
}

function join(specialists: SpecialistResult[]): JoinedFinding[] {
  const claims = [...new Set(specialists.flatMap(result => result.findings.map(finding => finding.claim)))].sort();
  return claims.map(claim => {
    const sources = specialists.flatMap(result => result.findings.filter(finding => finding.claim === claim)
      .map(finding => ({ assignmentId: result.assignmentId, finding })))
      .sort((a, b) => a.assignmentId.localeCompare(b.assignmentId));
    const conclusions = new Set(sources.map(source => source.finding.conclusion));
    return { claim, requiresReview: conclusions.size > 1 || conclusions.has("uncertain"), sources };
  });
}

export function runCiReview(input: ReviewInput, boundary: VerificationBoundary): ReviewPacket {
  const { context } = input;
  const attempts: VerificationAttempt[] = [];
  const handoffs: Handoff[] = [];
  let joined: JoinedFinding[] = [];
  let session: ReviewPacket["session"] = { status: "review-ready", reason: "Fixture verification reached human review; acceptance remains pending." };
  const checks: RunCheck[] = [];
  const evidence: Evidence[] = [];
  let verificationWorkflow: WorkflowRunResult | undefined;
  const stop = (status: SessionStatus, reason: string) => { session = { status, reason }; };
  const control = boundary.observe();
  const required = new Set(["source-snapshot", "locked-toolchain", ...input.assignments.flatMap(a => a.prerequisiteIds)]);
  if (!currentContext(context)) stop("blocked", "Context digest is invalid or stale.");
  else if (control.cancelled) stop("cancelled", "Cancelled before handoff.");
  else if (!Number.isFinite(control.elapsedMs) || control.elapsedMs < 0 || control.elapsedMs >= context.limits.maxSessionMs) {
    stop("budget-exhausted", "Session duration is unavailable or exhausted.");
  } else if (input.assignments.length < 1 || input.assignments.length > context.limits.maxSpecialists
      || new Set(input.assignments.map(a => a.id)).size !== input.assignments.length
      || input.assignments.some(a => !a.id.trim() || !a.owner.trim() || !a.responsibility.trim()
        || a.allowedActions.join(",") !== "context.read,analysis.return")) {
    stop("blocked", "Specialist ownership, actions or count violate the bounded assignment contract.");
  } else if ([...required].some(id => {
    const matches = input.prerequisites.filter(p => p.id === id);
    return matches.length !== 1 || matches[0]?.status !== "satisfied"
      || matches[0].evidence.length === 0 || matches[0].evidence.some(e => !currentEvidence(e, context));
  })) stop("blocked", "A prerequisite is missing, unsatisfied, ambiguous or stale.");
  else if (input.specialists.length !== input.assignments.length
      || input.assignments.some(a => input.specialists.filter(s => s.assignmentId === a.id).length !== 1)) {
    stop("blocked", "Join waits for exactly one result from each assigned specialist.");
  } else if (input.specialists.some(s => Buffer.byteLength(JSON.stringify(s), "utf8") > context.limits.maxHandoffBytes
      || s.packetDigest !== context.digest
      || s.evidence.length === 0 || s.evidence.some(e => !currentEvidence(e, context))
      || s.findings.length === 0 || s.findings.length > context.limits.maxFindingsPerSpecialist
      || new Set(s.findings.map(f => f.claim)).size !== s.findings.length
      || s.findings.some(f => !f.claim.trim() || !f.summary.trim()
        || !["supported", "refuted", "uncertain"].includes(f.conclusion)
        || f.evidenceIds.length === 0 || f.evidenceIds.some(id => !s.evidence.some(e => e.id === id))))) {
    stop("blocked", "Specialist evidence or findings are incomplete, stale or ambiguous.");
  } else if (input.specialists.some(s => !Number.isFinite(s.durationMs) || s.durationMs < 0
      || s.durationMs > context.limits.maxSpecialistMs)) stop("budget-exhausted", "Specialist fixture exceeded its declared duration budget.");
  else if (input.requestedActions.length > context.limits.maxVerificationAttempts) stop("budget-exhausted", "Too many verification requests.");

  if (session.status === "review-ready") {
    for (const specialist of [...input.specialists].sort((a, b) => a.assignmentId.localeCompare(b.assignmentId))) {
      evidence.push(...specialist.evidence);
      handoffs.push({ id: `${context.taskId}:${specialist.assignmentId}:join`, workflowId: context.taskId,
        fromStageId: specialist.assignmentId, toStageId: "join", fromContributionId: specialist.assignmentId,
        timestamp: input.observation.observedAt, summary: "Bounded fixture analysis; no execution authority transferred.",
        evidence: specialist.evidence, artifactReferences: [`fixture:${specialist.assignmentId}`] });
    }
    joined = join(input.specialists);
    if (joined.some(finding => finding.requiresReview)) stop("requires-review", "Conflicting or uncertain findings require human review.");
  }
  if (session.status === "review-ready") {
    verificationWorkflow = new DeterministicWorkflowRunner().run({ id: context.taskId,
      intentId: `${context.taskId}:intent`, completionCriteria: ["Record both named verification judgments"],
      stages: [{ id: "verification", responsibility: "Govern named verification after the dependency join",
        expectedContribution: "Native verification evidence", dependencies: [], policyIds: ["revision-target"],
        evidenceRequirements: ["test-result"], completionCriteria: ["Both judgments recorded"] }],
    }, [{ stageId: "verification", handler: { execute: () => {
    for (const action of input.requestedActions) {
      const attempt = boundary.verify(action, context);
      attempts.push(attempt);
      if (attempt.native) evidence.push(...attempt.native.evidence);
      if (attempt.disposition !== "recorded") {
        stop(attempt.disposition === "duplicate" ? "blocked" : attempt.disposition, attempt.reason);
        break;
      }
      const native = attempt.native;
      const results = native?.execution?.evidence?.filter(e => e.type === "test-result"
        && e.producer === verificationProducer && e.contributionId === native.contributionId
        && e.metadata?.action === action && currentEvidence(e, context)) ?? [];
      const status = results.length === 1 ? results[0]?.metadata?.status : undefined;
      const observed = status === "passed" || status === "failed";
      checks.push({ name: action, status: observed ? status : "inconclusive",
        evidence: results.map(e => e.contentReference) });
      if (native?.status !== "executed" || !observed) {
        stop("blocked", "Verification did not return a trustworthy native judgment; no automatic retry.");
        break;
      }
    }
    if (session.status === "review-ready" && verificationActions.some(action => !checks.some(check => check.name === action))) {
      stop("blocked", "Both named verification judgments are required.");
    }
    const last = attempts.at(-1);
    return { stageId: "verification", contributionId: `${context.taskId}:verification`,
      status: session.status === "review-ready" ? "completed" : "failed", summary: session.reason,
      evidence: attempts.flatMap(attempt => attempt.native?.evidence ?? []),
      ...(session.status === "review-ready" ? {} : { failureReason:
        last?.disposition === "blocked" ? "governance-denied" as const
          : last?.native?.failureReason === "execution-failed" ? "execution-failed" as const : "stage-failed" as const }),
    };
    } } }]);
  }

  let evaluation = new DeterministicEvaluator().evaluate({ id: `${context.taskId}:evaluation`,
    targetId: context.taskId, targetType: "workflow", evidence,
    applicable: session.status === "review-ready", inapplicableReason: session.reason,
    requirements: verificationActions.map(action => ({ type: "test-result", producer: verificationProducer,
      contributionId: `${context.taskId}:verify:${action}`, metadata: { ...revisionMetadata(context), action, status: "passed" } })),
  });
  if (session.status === "requires-review") evaluation = { ...evaluation, result: "requires-review",
    evaluator: "ci-review-join", findings: [session.reason] };
  const outcome = new DeterministicOutcomeResolver().resolve({ workflowId: context.taskId, evaluation,
    ...(verificationWorkflow ? { workflowRun: verificationWorkflow } : {}) });
  const resultStatus = evaluation.result === "passed" ? "passed" : evaluation.result === "failed" ? "failed" : "inconclusive";
  const report = createRunReport({ taskId: context.taskId, repository: context.source.repository,
    commit: context.source.commit, ...input.observation },
    [...checks, { name: "review-packet", status: resultStatus, evidence: evidence.map(e => e.contentReference) }],
    { applicability: "not-applicable", rationale: "This fixture scenario produces no visual product." });
  return structuredClone({ schemaVersion: 1, mode: "fixture", context, prerequisites: input.prerequisites,
    assignments: input.assignments, specialists: input.specialists, handoffs, joined, session, attempts,
    evaluation, outcome, ...(verificationWorkflow ? { verificationWorkflow } : {}),
    ...(input.sourceOutcome ? { sourceOutcome: input.sourceOutcome } : {}), report,
    usage: { status: "not-measured", reason: "Fixture durations are declared inputs. No agent, model usage or cost was measured." } });
}

/** Read/reinterpret evidence only. No boundary, executor, network or retry path is accepted. */
export function replayCiReview(recorded: ReviewPacket, target: ReviewContext) {
  const current = currentContext(recorded.context) && currentContext(target)
    && recorded.context.digest === target.digest;
  return { recorded: structuredClone(recorded), applicability: current ? "current" as const : "historical" as const,
    technical: current ? recorded.report.technical : "inconclusive" as const };
}
