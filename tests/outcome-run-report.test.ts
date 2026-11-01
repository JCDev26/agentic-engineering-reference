import { test, expect } from "vitest";
import { reportOutcome } from "../src/reporting/outcome-run-report.js";
import type { Outcome } from "../src/domain/outcome.js";

const context = { taskId: "task", repository: "example/project", commit: "a".repeat(40),
  observedAt: "2026-11-01T00:00:00Z", environment: { platform: "test", toolVersions: {}, capabilities: ["node"] } };
const base: Outcome = { workflowId: "workflow", status: "completed", summary: "test", evidence: [] };
test("native inconclusive failure is preserved without becoming failed-test evidence", () => {
  const native: Outcome = { ...base, status: "failed", reasonCode: "evaluation-inconclusive" };
  const report = reportOutcome(native, context);
  expect(report.technical).toBe("inconclusive");
  expect(report.native).toEqual(native);
  expect(report.native).not.toBe(native);
});
test("requires-review remains escalated and never grants owner approval", () => {
  const report = reportOutcome({ ...base, status: "escalated", reasonCode: "evaluation-requires-review" }, context);
  expect(report.engineeringReview).toBe("required");
  expect(report.technical).toBe("inconclusive");
  expect(report.native.status).toBe("escalated");
  expect(report.ownerApproval).toBe("pending");
});
test("technical failure and cancellation remain distinct in the native observation", () => {
  expect(reportOutcome({ ...base, status: "failed", reasonCode: "engineering-validation-failed" }, context).technical).toBe("failed");
  const report = reportOutcome({ ...base, status: "cancelled" }, context);
  expect(report.technical).toBe("inconclusive");
  expect(report.native.status).toBe("cancelled");
});

test("engineering review need does not automatically make visual review applicable", () => {
  const native: Outcome = { ...base, status: "escalated", reasonCode: "evaluation-requires-review" };
  const report = reportOutcome(native, context, { applicability: "not-applicable", rationale: "This caller evaluates only a username-validation backend scenario." });
  expect(report.engineeringReview).toBe("required");
  expect(report.visual).toBe("not-applicable");
  expect(report.native).toEqual(native);
});
