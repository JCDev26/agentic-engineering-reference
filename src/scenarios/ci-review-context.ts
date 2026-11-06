import { createHash } from "node:crypto";
import type { Evidence } from "../domain/evidence.js";

/** Scenario ceilings, not a general resource-control API. Lower values are allowed. */
export interface ReviewLimits {
  maxFiles: number;
  maxPacketBytes: number;
  maxSpecialists: number;
  maxHandoffBytes: number;
  maxFindingsPerSpecialist: number;
  maxSessionMs: number;
  maxSpecialistMs: number;
  maxActionMs: number;
  maxVerificationAttempts: number;
}
export const reviewLimitCeilings: Readonly<ReviewLimits> = Object.freeze({
  maxFiles: 12,
  maxPacketBytes: 24 * 1024,
  maxSpecialists: 2,
  maxHandoffBytes: 8 * 1024,
  maxFindingsPerSpecialist: 8,
  maxSessionMs: 120_000,
  maxSpecialistMs: 45_000,
  maxActionMs: 20_000,
  maxVerificationAttempts: 2,
});

export function reviewLimits(overrides: Partial<ReviewLimits> = {}): ReviewLimits {
  const limits = { ...reviewLimitCeilings };
  for (const [key, value] of Object.entries(overrides)) {
    const name = key as keyof ReviewLimits;
    if (!Object.hasOwn(reviewLimitCeilings, name) || !Number.isSafeInteger(value)
        || value < 1 || value > reviewLimitCeilings[name]) {
      throw new Error(`Invalid or unsafe review limit: ${key}`);
    }
    limits[name] = value;
  }
  return limits;
}

export interface ReviewSource {
  repository: string;
  commit: string;
  runId: string;
  attempt: number;
}
export interface ContextInput {
  taskId: string;
  owner: string;
  objective: string;
  source: ReviewSource;
  files: { path: string; content: string }[];
  prompts: { path: string; content: string }[];
  limits: ReviewLimits;
}
export interface ReviewContext extends ContextInput { digest: string }

function digest(input: ContextInput): string {
  return createHash("sha256").update(JSON.stringify({
    taskId: input.taskId, owner: input.owner, objective: input.objective,
    source: { repository: input.source.repository, commit: input.source.commit,
      runId: input.source.runId, attempt: input.source.attempt },
    files: input.files, prompts: input.prompts, limits: input.limits,
  })).digest("hex");
}

export function createReviewContext(input: ContextInput): ReviewContext {
  if (!input.taskId.trim() || !input.owner.trim() || !input.objective.trim()
      || !/^[^/\s]+\/[^/\s]+$/.test(input.source.repository)
      || !/^[a-f0-9]{40}$/.test(input.source.commit) || !input.source.runId.trim()
      || !Number.isSafeInteger(input.source.attempt) || input.source.attempt < 1) {
    throw new Error("A context needs an owner, task and exact repository/revision/run attempt.");
  }
  const limits = reviewLimits(input.limits);
  const ordered = (entries: ContextInput["files"]) => {
    const paths = entries.map(file => file.path);
    if (new Set(paths).size !== paths.length || paths.some(path =>
      !/^[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)*$/.test(path)
      || path.split("/").some(part => part === "." || part === ".."))) {
      throw new Error("Context paths must be unique, canonical relative identifiers.");
    }
    return structuredClone(entries).sort((a, b) => a.path.localeCompare(b.path));
  };
  const snapshot: ContextInput = { taskId: input.taskId, owner: input.owner, objective: input.objective,
    source: structuredClone(input.source), limits,
    files: ordered(input.files), prompts: ordered(input.prompts) };
  const packet = { ...snapshot, digest: digest(snapshot) };
  if (snapshot.files.length === 0 || snapshot.files.length > limits.maxFiles
      || snapshot.prompts.length === 0 || snapshot.prompts.length > 2
      || Buffer.byteLength(JSON.stringify(packet), "utf8") > limits.maxPacketBytes) {
    throw new Error("Context exceeds its packet budget or lacks source/prompts.");
  }
  return packet;
}

export function currentContext(context: ReviewContext): boolean {
  try { return createReviewContext(context).digest === context.digest; }
  catch { return false; }
}

export function revisionMetadata(context: ReviewContext) {
  return { ...context.source, packetDigest: context.digest };
}

/** Binding checks supply freshness within trusted fixtures; they do not authenticate a producer. */
export function currentEvidence(evidence: Evidence, context: ReviewContext): boolean {
  return currentContext(context) && Object.entries(revisionMetadata(context))
    .every(([key, value]) => evidence.metadata?.[key] === value);
}
