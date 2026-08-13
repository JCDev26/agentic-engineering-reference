# Validation Evidence Provenance 001 Review

## Purpose

This review records the architectural findings from preserving validator-produced evidence through the multi-stage workflow.

Previous experiments established:

- structured contribution failure causality
- workflow failure causality
- terminal Outcome causality
- engineering-evaluation applicability
- centralized applicability ownership

A remaining weakness existed between independent validation and Evaluation.

The duplicate-username validator already produced structured `test-result` evidence containing individual acceptance findings.

However, the validation contributor executor reduced that result to a pass/fail artifact token.

The multi-stage scenario then reconstructed a new `test-result` by interpreting that token.

This experiment removes that reconstruction.

---

## Architectural Question

Can evidence produced directly by an independent validator survive through contributor execution and workflow orchestration until Evaluation without being recreated by scenario code?

Yes.

---

## Previous Flow

The previous multi-stage validation flow was:

    Validator
        ↓
    structured test-result
        ↓
    Validation Executor
        ↓
    pass/fail artifact token
        ↓
    ContributionRunner
        ↓
    command-output evidence
        ↓
    Scenario
        ↓
    reconstructed test-result
        ↓
    Evaluation

The original validator findings were discarded.

The scenario later inferred:

- overall status
- duplicate rejection status

from the artifact reference.

The following original findings were not preserved:

- `uniqueCreationPassed`
- `subsequentValidCreationPassed`

This made the multi-stage evidence contract weaker than the single-stage reference scenario.

---

## Current Flow

The validation path now preserves the original evidence:

    Validator
        ↓
    structured test-result Evidence
        ↓
    Validation Executor
        ↓
    ExecutionResult.evidence
        ↓
    ContributionRunner
        ↓
    ContributionRunResult.evidence
        ↓
    Workflow stage evidence
        ↓
    Evaluation

The scenario no longer creates a replacement `test-result`.

---

## Execution Evidence Contract

`ExecutionResult` can now contain structured evidence produced by the executor.

This is intentionally small.

It is not a generic event bus or telemetry framework.

It means only:

> an executor may return first-class evidence produced while performing its contribution

`ContributionRunner` preserves that evidence alongside:

- capability evidence
- policy evidence
- command-output evidence

---

## Execution Success vs Engineering Success

The validation contributor may execute successfully while engineering validation fails.

For example:

    ExecutionResult.status
        = succeeded

while validator evidence reports:

    metadata.status
        = failed

This distinction is intentional.

Execution success means the validation operation completed.

Engineering validation failure means the implementation did not satisfy the required acceptance checks.

The workflow interprets those separately.

---

## Preserved Findings

The multi-stage path now preserves all validator findings:

    status
    uniqueCreationPassed
    duplicateRejectionPassed
    subsequentValidCreationPassed

Evaluation requires the same acceptance findings used by the single-stage reference scenario.

---

## Provenance

The final `test-result` retains the validator as its producer:

    duplicate-username-acceptance-validator

The scenario does not replace that producer or synthesize new validation metadata.

This keeps evidence observational rather than reconstructed after execution.

---

## Artifact Role

The validation executor may continue producing an acceptance-validation artifact.

That artifact is no longer used to reconstruct engineering evidence.

Artifacts and evidence therefore serve distinct roles:

### Artifact

A reference to a product or output of execution.

### Evidence

Structured information supporting an engineering judgment.

Evaluation consumes evidence rather than interpreting an artifact token.

---

## Handoff Scope

This experiment does not redesign workflow handoffs.

The implementation artifact remains the input transferred to the validation stage.

That handoff is sufficient for the current scenario.

The validation-evidence causality break occurred after validation execution, not during the implementation-to-validation handoff.

---

## Architectural Finding

Evidence that already exists should remain evidence.

A scenario should not reconstruct structured engineering findings from a weaker execution artifact when the original producer already emitted those findings.

---

## What Is Now Defensible

The multi-stage reference path now demonstrates:

- independent validator execution
- structured validator-produced evidence
- preserved evidence provenance
- execution success distinct from engineering validation success
- full acceptance findings reaching Evaluation
- engineering Outcome driven by preserved validation evidence

---

## Remaining Limitations

This experiment does not address:

- deriving evaluation requirements from `EngineeringIntent`
- narrowing handoff contents
- approval or human-review semantics
- retries
- contributor reselection
- isolated execution
- persistence
- SDLC adapters
- real contributor technologies
- generic evidence transport infrastructure

Those remain separate architectural questions.

---

## Conclusion

Independent validation evidence now survives from its producing validator to Evaluation without scenario reconstruction.

The architecture no longer asks a downstream scenario to infer engineering findings from a pass/fail artifact token.