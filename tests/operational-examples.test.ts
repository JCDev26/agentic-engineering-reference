import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { verifyRestore } from "../src/scenarios/backup-restore.js";
import { ReservationDesk } from "../src/scenarios/reservation-retry.js";

describe("restore drill", () => {
  const source = Buffer.from('{"orders":[41,42]}');
  const checkpoint = "orders-before-import";
  const manifest = { checkpoint, sha256: createHash("sha256").update(source).digest("hex") };

  it("reads the archive and verifies the restored bytes against the source manifest", () => {
    expect(verifyRestore(checkpoint, manifest, gzipSync(source)).status).toBe("passed");
  });
  it("detects a readable archive that silently omitted an order, and an unreadable archive", () => {
    expect(verifyRestore(checkpoint, manifest, gzipSync('{"orders":[41]}')).status).toBe("failed");
    expect(verifyRestore(checkpoint, manifest, Buffer.from("damaged")).status).toBe("failed");
  });
  it("leaves the drill inconclusive when evidence is absent or belongs to another checkpoint", () => {
    expect(verifyRestore(checkpoint, manifest, undefined).status).toBe("inconclusive");
    expect(verifyRestore("after-import", manifest, gzipSync(source)).status).toBe("inconclusive");
  });
});

describe("reservation retry after a lost reply", () => {
  it("returns the original booking for the same intent after the client loses its first reply", () => {
    const desk = new ReservationDesk();
    desk.reserve("request-7", "studio"); // The service commits. The transport discards this reply.
    const replayed = desk.reserve("request-7", "studio");
    expect(desk.bookingsFor("studio")).toEqual([replayed]);
  });
  it("shows the duplicate side effect when the retry looks like a new intent", () => {
    const desk = new ReservationDesk();
    desk.reserve("request-7", "studio");
    desk.reserve("request-8", "studio");
    expect(desk.bookingsFor("studio")).toHaveLength(2);
  });
  it("rejects reuse of a key for changed intent before another booking is created", () => {
    const desk = new ReservationDesk();
    desk.reserve("request-7", "studio");
    expect(() => desk.reserve("request-7", "hall")).toThrow("different reservation intent");
    expect(desk.bookingsFor("hall")).toEqual([]);
    expect(desk.bookingsFor("studio")).toHaveLength(1);
  });
});
