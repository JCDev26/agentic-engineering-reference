import type { Outcome } from "../domain/outcome.js";
import { createRunReport, type RunContext, type RunReport, type VisualApplicability } from "./run-report.js";

export interface OutcomeRunReport extends RunReport {
  native: Outcome;
  engineeringReview: "required" | "not-required";
}

/** Preserve the reference's native status/reason API; add a portable observation. */
export function reportOutcome(outcome: Outcome, context: RunContext, visual?: VisualApplicability): OutcomeRunReport {
  const inconclusive = outcome.reasonCode === "evaluation-inconclusive";
  const review = outcome.status === "escalated" || outcome.reasonCode === "evaluation-requires-review";
  const status = inconclusive || review || outcome.status === "cancelled" ? "inconclusive"
    : outcome.status === "completed" || outcome.status === "no-change-required" ? "passed" : "failed";
  return {
    ...createRunReport(context, [{ name: "engineering-outcome", status, evidence: [] }], visual),
    native: structuredClone(outcome),
    engineeringReview: review ? "required" : "not-required",
  };
}
