import { describe, expect, it } from "vitest";
import { createReviewContext, currentContext, reviewLimits, reviewLimitCeilings } from "../src/scenarios/ci-review-context.js";
import { createCiReviewFixture } from "../src/scenarios/ci-review-fixtures.js";

describe("CI review context: deterministic revision binding and bounded configuration", () => {
  it("accepts a complete packet at its byte limit and rejects one byte more", () => {
    const { digest: _digest, ...input } = createCiReviewFixture().input.context;
    const initial = createReviewContext(input);
    input.files[0]!.content += "x".repeat(input.limits.maxPacketBytes
      - Buffer.byteLength(JSON.stringify(initial), "utf8"));
    const exact = createReviewContext(input);
    expect(Buffer.byteLength(JSON.stringify(exact), "utf8")).toBe(input.limits.maxPacketBytes);
    expect(currentContext(exact)).toBe(true);
    expect(createReviewContext(exact)).toEqual(exact);
    input.files[0]!.content += "x";
    expect(() => createReviewContext(input)).toThrow(/packet budget/);
  });

  it("binds the revision, run attempt, source, owner, prompts and configuration", () => {
    const { input } = createCiReviewFixture();
    const original = input.context;
    const variants = [
      { ...original, source: { ...original.source, commit: "b".repeat(40) } },
      { ...original, source: { ...original.source, attempt: 2 } },
      { ...original, source: { ...original.source, runId: "another-run" } },
      { ...original, source: { ...original.source, repository: "example/other" } },
      { ...original, owner: "another-owner" },
      { ...original, files: [{ path: "package.json", content: "changed source" }] },
      { ...original, prompts: [{ path: "prompt.md", content: "changed instructions" }] },
      { ...original, limits: reviewLimits({ maxSessionMs: 1_000 }) },
    ];
    for (const variant of variants) {
      expect(createReviewContext(variant).digest).not.toBe(original.digest);
      expect(currentContext(variant)).toBe(false);
    }
    expect(createReviewContext({ ...original, files: [...original.files].reverse() }).digest).toBe(original.digest);
  });

  it("snapshots inputs and rejects ambiguous paths, symbolic revisions and oversized packets", () => {
    const { input } = createCiReviewFixture();
    const original = structuredClone(input.context);
    const snapshot = createReviewContext(original);
    original.files[0]!.content = "later mutation";
    expect(currentContext(snapshot)).toBe(true);
    expect(() => createReviewContext({ ...snapshot, source: { ...snapshot.source, commit: "HEAD" } })).toThrow();
    for (const path of ["../escape", "/absolute", "src\\file.ts", "src//file.ts"]) {
      expect(() => createReviewContext({ ...snapshot, files: [{ path, content: "x" }] })).toThrow();
    }
    expect(() => createReviewContext({ ...snapshot, files: [snapshot.files[0]!, snapshot.files[0]!] })).toThrow();
    expect(() => createReviewContext({ ...snapshot, files: [{ path: "large.txt", content: "界".repeat(9_000) }] })).toThrow();
    expect(() => createReviewContext({ ...snapshot, limits: reviewLimits({ maxFiles: 1 }) })).toThrow();
  });

  it.each(Object.entries(reviewLimitCeilings))("allows tightening %s, but never bypassing its ceiling", (key, ceiling) => {
    expect(reviewLimits({ [key]: 1 })[key as keyof typeof reviewLimitCeilings]).toBe(1);
    for (const value of [0, -1, 0.5, NaN, Infinity, ceiling + 1]) {
      expect(() => reviewLimits({ [key]: value })).toThrow();
    }
  });

  it("rejects unknown and inherited option names rather than treating configuration as authority", () => {
    expect(() => reviewLimits(JSON.parse('{"toString":1}'))).toThrow();
    expect(() => reviewLimits(JSON.parse('{"allowDeployment":1}'))).toThrow();
  });
});
