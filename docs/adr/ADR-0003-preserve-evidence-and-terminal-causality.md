# ADR-0003: Preserve evidence and terminal causality at their source

- **Status:** Accepted
- **Date:** 2026-10-02
- **Decision owner:** Project maintainer

## Context

Successive executable experiments exposed three related losses of meaning. Scenario code reconstructed contribution failure by inspecting policy telemetry; it recreated validation findings from a pass/fail artifact; and unreachable validation could become an evaluation failure that obscured the primary terminal cause.

These were boundary defects rather than a need for more orchestration infrastructure. The system already had the observation at the layer capable of making it. Downstream reconstruction weakened provenance and could produce a claim stronger than the available evidence.

## Decision

1. The layer directly observing a failure emits its structured cause. Higher layers consume it or deliberately normalize it. Telemetry and human-readable summaries are supporting evidence, not a cause-transport protocol.
2. Evidence produced by a validator remains first-class evidence through execution, contribution, workflow, and evaluation. Artifact references identify outputs; they do not replace richer observations that already exist.
3. Engineering evaluation has an explicit applicability boundary derived from run state. Validation that could not run is inconclusive, not a failed acceptance test. Missing structured requirements also cannot prove success.
4. Evaluation judges evidence against structured intent requirements. Outcome preserves terminal run disposition and its primary cause before considering evaluation. Neither takes over the other's responsibility.

The concrete v1 seam is optional `ExecutionResult.evidence`, together with typed contribution/workflow failures and a shared applicability decision. No event bus, generic error registry, natural-language evaluator, or distributed evidence system is introduced.

## Consequences

Successful validator execution can report failed engineering findings without contradiction. Governance denial, missing input, selection failure, execution failure, and orchestration failure remain distinguishable from actual acceptance rejection. The original and multi-stage scenario surfaces follow the same terminal meaning.

Trusted composition must report causes and applicability honestly. Preserving an object does not authenticate its author, prove it is fresh, or prevent a malicious producer from forging it. Evidence trust, persistence, and external identity remain separate future boundaries.

An applicable evaluation may fail because required evidence is unsatisfied. That means the declared evidence contract was not met; it does not justify inventing individual acceptance failures that no validator observed.

## Alternatives considered

- **Infer everything from logs/evidence later:** couples consumers to producer formatting and loses direct causes.
- **Let Evaluation narrate all failures:** turns unavailable validation into unsupported engineering judgments and conceals the terminal cause.
- **Introduce a generic event/causality platform:** unnecessary for the exercised synchronous reference; it does not itself correct responsibility ownership.

## Executable support

[Contribution causality](../../tests/contribution-failure-causality.test.ts), [evidence provenance](../../tests/validation-evidence-provenance.test.ts), [applicability decisions](../../tests/evaluation-applicability-decision.test.ts), [intent causality](../../tests/intent-driven-evaluation.test.ts), [v1 failure matrix](../../tests/v1-failure-matrix.test.ts), and [outcome resolution](../../tests/outcome-resolver.test.ts).

This decision complements [ADR-0001](ADR-0001-contributor-and-vendor-neutral-core.md) and [ADR-0002](ADR-0002-separate-engineering-intent-from-engineering-contribution.md). The earlier experiment reviews remain historical evidence, not separate durable commitments.
