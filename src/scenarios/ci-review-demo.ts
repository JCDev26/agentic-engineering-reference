import { readFileSync } from "node:fs";
import { createCiReviewFixture } from "./ci-review-fixtures.js";
import { createReviewContext } from "./ci-review-context.js";
import { replayCiReview, runCiReview, type ReviewPacket } from "./ci-review.js";

// Intentionally fixture-only. This entry point cannot dispatch an agent or execute verification commands.
const args = process.argv.slice(2);
if (args[0] === "--replay" && (args.length === 2 || args.length === 4)) {
  const recorded = JSON.parse(readFileSync(args[1]!, "utf8")) as ReviewPacket;
  if (recorded.schemaVersion !== 1 || recorded.mode !== "fixture") throw new Error("Expected a fixture review packet.");
  if (args.length === 4 && args[2] !== "--commit") throw new Error("Expected --commit <full-sha>.");
  const target = args.length === 4 ? createReviewContext({ ...recorded.context,
    source: { ...recorded.context.source, commit: args[3]! } }) : recorded.context;
  console.log(JSON.stringify(replayCiReview(recorded, target), null, 2));
} else {
  if (args.length > 0 && (args.length !== 2 || args[0] !== "--case")) throw new Error("Use --case <fixture> or --replay <packet.json> [--commit <sha>].");
  const name = args[1] ?? "healthy";
  if (!["healthy", "blocked", "stale", "conflict", "cancelled", "unauthorized", "duplicate", "interrupted"].includes(name)) throw new Error("Unknown fixture case.");
  const fixture = createCiReviewFixture(name === "unauthorized" ? { grantedActions: [] } : {});
  if (name === "blocked") fixture.input.prerequisites[0]!.status = "missing";
  if (name === "stale") fixture.input.specialists[0]!.evidence[0]!.metadata!.commit = "b".repeat(40);
  if (name === "conflict") fixture.input.specialists[0]!.findings[0]!.conclusion = "refuted";
  if (name === "cancelled") fixture.control.cancelled = true;
  if (name === "duplicate") fixture.input.requestedActions = ["unit", "unit"];
  if (name === "interrupted") fixture.executor.execute = request => {
    fixture.calls.push("unit"); fixture.control.cancelled = true; fixture.control.termination = "unknown";
    return { status: "failed", contributionId: request.contribution.id, capabilityId: request.capabilityId,
      summary: "Fixture interrupted before a native test judgment; completion is unknown." };
  };
  console.log(JSON.stringify(runCiReview(fixture.input, fixture.boundary), null, 2));
}
