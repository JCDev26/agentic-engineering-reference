# Two operational decisions to review

Run the exercises from the repository root after installing the locked dependencies on a supported Node version.

```sh
npm test -- tests/operational-examples.test.ts
```

Both examples run locally with synthetic records. The external sources explain the operational problems that motivated them. Each exercise asks the reviewer to identify what can be concluded at a particular decision point. [Executable cases](../../tests/operational-examples.test.ts)

## 1. Can the operator certify this backup as recoverable?

GitLab’s account of its January 2017 database outage describes the difficulty of finding usable recovery data during an incident. For the exercise, narrow the promise to something a reviewer can check: restore the exact bytes of a small orders export from a named checkpoint. A missing order matters to the customer even when decompression succeeds. [GitLab incident postmortem](https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/)

The export owner supplies a digest of the source bytes before archiving. A separate restore check opens a supplied gzip archive, hashes the restored bytes and compares them with that manifest. The reader can change the archive without changing the manifest. [Restore check](../../src/scenarios/backup-restore.ts)

| Try this | Evidence and decision |
| --- | --- |
| Restore the complete export | Matching digests support the byte-level recovery claim for this checkpoint. |
| Archive only the first order | Decompression succeeds. The independent comparison fails. A job that checks only decompression would certify an incomplete export. |
| Supply damaged bytes | The validator attempted restoration and observed a failure. |
| Remove the archive or request another checkpoint | The requested test lacks its inputs. The result is inconclusive. |

**Review C01, C08, C09 and C11.** Who chooses the expected checkpoint? Could the backup job silently regenerate the expected digest from its own incomplete output? This exercise trusts the manifest supplier. A production database recovery claim would also need coverage for consistency, application queries and recovery time. The local result authorizes no production restore.

## 2. May an agent retry a reservation after losing the reply?

AWS documents an API design that lets callers identify one intended operation across retries. It also describes rejecting reuse of a request token with different parameters. The exercise uses that decision in a reservation desk: a caller wants one booking, the desk records it, and the caller loses the acknowledgment. A timeout leaves the caller uncertain even though the desk already knows what happened. [AWS Builders’ Library](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)

Run the same two invocations with different identifiers, then read the booking list. This independent read reveals the side effect that the client’s transcript cannot establish. [Reservation desk](../../src/scenarios/reservation-retry.ts)

| Try this | Evidence and decision |
| --- | --- |
| Retry with the original ID and room | The desk returns the first reservation number. The list contains one booking. |
| Assign a fresh ID when retrying | Both calls succeed. The list contains two bookings for one intended action. |
| Keep the ID and change the room | The desk rejects the request. The original booking remains, and the new room has no booking. |

**Review C05, C10, C13 and C18.** A retry policy needs to know which action it may repeat and who can reconcile an uncertain result. The exercise covers one caller and one process lifetime. If the desk restarts or another caller can reuse its IDs, this evidence no longer establishes the same guarantee. A human decision to cancel a booking would require its own authority.
