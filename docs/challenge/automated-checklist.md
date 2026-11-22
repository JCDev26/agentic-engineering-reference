# Run the two-pass checklist

The respondent answers the twenty questions for a pinned revision. Save the first response before giving the challenger the [pressure-test instructions](pressure-test-prompt.md). In a chat, two messages suffice. For structured records, use the dependency-free Node script from this reference checkout. The target repository needs no added files or dependencies.

```sh
node scripts/architecture-challenge.mjs questions > answers.json
# Fill in the answer sheet and retain this exact version.
node scripts/architecture-challenge.mjs plan answers.json > challenge-plan.json
```

Keep these files in your review workspace. Use UTF-8. Give each answer a kind: `behavioral`, `documentary`, `unknown` or `not-applicable`. Record the exact claim and its basis, including where you looked if evidence is unavailable. A behavioral answer also names the entry point, prediction and observable effect. The planner checks coverage, copies the answers and records their SHA-256. The digest lets a reviewer compare saved versions. The reviewer supplies the target identity, retains the originals and verifies every observation.

For `classification`, use the original Challenge labels: `conforms`, `intentionally differs`, `partially supported`, `unsupported/unproven`, or `not applicable`. On Windows PowerShell 5.1, pipe each command to `Set-Content -Encoding UTF8` with the desired file path so that the answer sheet can be read back as UTF-8.

The plan includes a common checklist even when the respondent makes few claims. For each behavioral answer it selects a pressure question from the existing C01–C20 checklist. Have the challenger fill in the concrete variation, contrary observation and control *before* inspecting results. Use the second-pass prompt to judge observations. The script generates review material locally. It executes no target commands and issues no automatic pass.

## Worked example · test an overbroad retry claim

- **First-pass C13 answer:** “Retrying a reservation after a lost reply always leaves one booking.” Entry point: `ReservationDesk.reserve`. Prediction: one booking after the retry. Observable: `bookingsFor("studio")`.
- **Positive control:** Retry with the original request ID and room. Confirm that the original booking is returned and exactly one booking exists.
- **Pressure test:** Keep the room and lost reply identical. Give the retry a fresh request ID. Two bookings would contradict “always.”
- **Observation:** The local fixture records two bookings for different IDs. The narrower same-ID guarantee survives. Keep the broad original claim in the record with verdict **contradicted**. If the desk cannot be exercised or its bookings cannot be inspected, the behavioral verdict is **inconclusive**.
- **Replay:** On the reference revision containing these tests, run `npm test -- tests/operational-examples.test.ts` in the authorized reference checkout and retain the result for your review. [Reservation exercise](../scenarios/operational-examples.md)

A target may use any language or framework. Its reviewer chooses the corresponding service call, state read and control. The example's outcome applies to the local reservation fixture.

To measure how a reviewer handles a known defect and controls, run the [blind reviewer calibration](reviewer-calibration.md). To pressure-test a target's claims about saved context, permission changes or intervention during a job, use the [checkpoint and steering exercises](../scenarios/checkpoint-swarm.md#try-the-same-questions-on-your-repository).
