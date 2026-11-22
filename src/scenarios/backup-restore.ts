import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import type { RunCheck } from "../reporting/run-report.js";

/** The drill promises byte-for-byte restoration of one small, trusted export. */
export function verifyRestore(
  requestedCheckpoint: string,
  manifest: { checkpoint: string; sha256: string },
  archive: Buffer | undefined,
): RunCheck {
  const name = "restore requested checkpoint";
  if (archive === undefined || manifest.checkpoint !== requestedCheckpoint) {
    return { name, status: "inconclusive", evidence: ["Archive or independent manifest unavailable for this checkpoint."] };
  }
  let restored: Buffer;
  try {
    restored = gunzipSync(archive);
  } catch {
    return { name, status: "failed", evidence: ["The supplied archive could not be decompressed."] };
  }
  const actual = createHash("sha256").update(restored).digest("hex");
  return { name, status: actual === manifest.sha256 ? "passed" : "failed",
    evidence: [requestedCheckpoint, "expected sha256 " + manifest.sha256, "restored sha256 " + actual] };
}
