# Reference scenario 001: prevent duplicate usernames

The engineering request is: **prevent duplicate usernames while preserving valid user creation**. The small domain lets tests distinguish orchestration success from an actual engineering result.

## What runs

The [reference application](../../src/reference-app/create-user.ts) operates on an in-memory [user store](../../src/reference-app/user-store.ts). [Local contributors](../../src/scenarios/duplicate-username-contributors.ts) return exactly one artifact of type `user-creator-implementation`, with a recognized reference to either correct or deliberately faulty predefined behavior. Other artifact types do not select the implementation; multiple implementation artifacts are ambiguous and make validation unavailable. This is a scenario-specific contract, not a generic artifact framework. Contributors do not modify source files.

The independent [acceptance validator](../../src/scenarios/duplicate-username-validator.ts) resolves that reference and checks:

1. A unique username is created and stored.
2. An existing username is rejected with a clear reason and its stored count does not increase.
3. Another valid username can still be created after duplicate rejection.

Completed validation emits one `test-result` with the overall status and all three individual findings. Missing or unknown input makes validation unavailable; no failed acceptance checks are invented.

## Three reference surfaces

| Surface | Purpose | Entry point and proof |
| --- | --- | --- |
| Compact original scenario | One real workflow stage selects and governs implementation, then independently validates its result. Useful for following the smallest engineering path. | [Scenario](../../src/scenarios/duplicate-username.ts), [tests](../../tests/duplicate-username.test.ts) |
| Multi-stage engineering scenario | Implementation hands an artifact to a separately selected and governed validator contribution. Primary v1 reference. | [Scenario](../../src/scenarios/duplicate-username-workflow.ts), [tests](../../tests/duplicate-username-workflow.test.ts) |
| Fan-in scenario | Out-of-order declarations become dependency-ready; validation consumes implementation and compatibility handoffs. This isolates orchestration, not a second application outcome. | [Scenario](../../src/scenarios/multi-dependency-workflow.ts), [tests](../../tests/multi-dependency-workflow.test.ts) |

Both engineering paths use [the same intent factory](../../src/scenarios/duplicate-username-intent.ts). Callers can supply an `intent` containing structured `evaluationRequirements`; [intent causality tests](../../tests/intent-driven-evaluation.test.ts) change those requirements while leaving evaluator wiring unchanged. Human-readable acceptance criteria are retained and are not parsed.

## Multi-stage boundaries

```text
Implementation: selected contributor + source.write + source policy
    → implementation artifact
    → handoff (data, never capability grants)
Validation: selected contributor + validation.execute + artifact policy
    → original test-result evidence
    → intent-driven Evaluation
    → terminal Outcome
```

A contributor capable of implementation is not automatically eligible to validate. Selection is performed when the stage is reached. Artifact transfer does not transfer the implementer's identity as authority, its policies, or its grants.

The validation contributor returns original evidence through `ExecutionResult.evidence`. A separate `command-output` can report successful execution while `test-result` reports failed acceptance. Evaluation consumes preserved evidence, not the optional validation-result artifact token.

## Observable results

Correct behavior completes. Duplicate-accepting behavior executes successfully but fails independent validation. Capability or policy denial prevents execution. Selection failure, executor failure, missing validation input, dependency deadlock, and missing stage bindings preserve their own terminal causes while engineering evaluation is inconclusive if validation was unreachable.

The executable [v1 failure matrix](../../tests/v1-failure-matrix.test.ts) and [outcome tests](../../tests/outcome-resolver.test.ts) are authoritative for exact reason codes. The original scenario uses actual workflow state rather than inventing a result to satisfy OutcomeResolver. Both implementation policies limit source targets to `src/reference-app/`.

## Deliberate limits

There are no investigate/plan/review/deliver stages, real human contributors, approvals, source diffs, Git operations, CI contributor, deployment, AI calls, or sandbox in this scenario. Those appeared in the initial conceptual design, but they are not v1 behavior.

Handoffs retain upstream stage evidence in memory; the validator consumes artifact references. They are neither a remote transport nor an authority delegation system. Multiple ready stages run sequentially. The fan-in fixture does not imply parallel scheduling.

To run the full reference, use `npm ci`, `npm test`, and `npm run typecheck`. v1 is complete when its bounded claims remain true; expanding the task into an application or platform is not a completion requirement.
