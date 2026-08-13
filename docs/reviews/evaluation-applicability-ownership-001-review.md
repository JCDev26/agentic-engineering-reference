# Evaluation Applicability Ownership 001 Review

## Purpose

This review records the architectural findings from moving engineering-evaluation applicability out of individual scenario conventions and into a reusable core decision.

The previous experiment allowed `DeterministicEvaluator` to return `inconclusive` when an evaluation request declared itself not applicable.

That corrected evaluation semantics in the multi-stage reference scenario.

However, applicability remained a caller-authored boolean.

The original reference scenario continued to omit the decision and therefore still reported engineering failure after governance prevented validation from occurring.

This experiment addresses that inconsistency.

---

## Architectural Question

Who decides whether engineering evaluation is meaningful?

The Evaluator should not inspect workflow or contribution failure semantics.

Its responsibility remains:

> evaluate evidence against requirements when the engineering question is applicable

The applicability decision therefore belongs outside the Evaluator.

However, it should not be reimplemented independently by every scenario.

---

## Reusable Applicability Decision

The core now exposes a reusable decision:

    decideEvaluationApplicability(...)

The decision accepts either:

- a `ContributionRunResult`
- a `WorkflowRunResult`

and returns:

    applicable = true

or:

    applicable = false
    reason = ...

The decision does not inspect evidence metadata.

---

## Contribution Applicability

A contribution is evaluable when its governed execution completed.

### Executed

    ContributionRunResult
        status = executed

    Evaluation
        applicable = true

Engineering validation may now judge the produced result.

### Capability Denied

    ContributionRunResult
        status = blocked
        failureReason = capability-denied

    Evaluation
        applicable = false
        result = inconclusive

### Policy Denied

    ContributionRunResult
        status = blocked
        failureReason = policy-denied

    Evaluation
        applicable = false
        result = inconclusive

### Execution Failed

    ContributionRunResult
        status = execution-failed

    Evaluation
        applicable = false
        result = inconclusive

---

## Workflow Applicability

A workflow-level engineering evaluation is applicable when:

- the workflow completed, or
- independent engineering validation actually ran and rejected the engineering result

Therefore:

    workflow completed
        → applicable

    engineering-validation-failed
        → applicable

while:

    governance-denied
        → not applicable

    contributor-selection-failed
        → not applicable

    execution-failed
        → not applicable

    dependency-deadlock
        → not applicable

---

## Original Reference Scenario

The original single-contribution scenario now consumes the same applicability decision as the multi-stage workflow.

A policy denial no longer produces:

    Evaluation = failed

Instead:

    Contribution failure
        = policy-denied

    Evaluation
        = inconclusive

The same is true for capability denial.

This removes the contradictory behavior identified between the two reference scenarios.

---

## Multi-Stage Reference Scenario

The multi-stage scenario no longer contains its own rule:

    workflow completed
    OR
    engineering-validation-failed

That rule is now centralized.

The scenario consumes the applicability decision and passes the result to the Evaluator.

---

## Dependency Deadlock

The terminal deadlock test also consumes the same reusable decision.

Deadlock no longer requires a test-specific manually authored:

    applicable = false

The core applicability decision derives that result from workflow state.

---

## Responsibility Boundaries

### ContributionRunner

Owns contribution execution and contribution-level failure causality.

### WorkflowRunner

Owns stage readiness, progression, handoffs, and workflow failure state.

### Evaluation Applicability Decision

Determines whether available run state reached a point where engineering evaluation is meaningful.

### Evaluator

Judges evidence against requirements when evaluation is applicable.

### OutcomeResolver

Preserves terminal workflow disposition and primary workflow cause.

---

## Architectural Finding

Evaluation applicability is neither evidence interpretation nor workflow execution.

It is a boundary decision derived from run state.

Centralizing that decision prevents individual scenarios from silently redefining when an engineering failure may be claimed.

---

## What Is Now Defensible

Both current reference scenarios now consistently distinguish:

- engineering validation passed
- engineering validation failed
- engineering evaluation was unreachable

Capability and policy blocks no longer become engineering failures simply because success evidence is missing.

Workflow deadlock uses the same applicability decision rather than manually setting evaluation applicability.

---

## Remaining Limitations

This experiment does not address:

- deriving evaluation requirements from `EngineeringIntent`
- narrowing handoff contents
- preserving richer validation evidence in the multi-stage scenario
- contributor reselection
- retries
- approvals
- isolated execution
- persistence
- SDLC adapters
- real contributor technologies

The multi-stage validation path still reconstructs a reduced `test-result` from a validation artifact reference.

That remains a separate causality issue.

---

## Conclusion

Engineering-evaluation applicability is now a reusable architectural decision rather than a scenario-specific courtesy.

The Evaluator remains workflow-neutral while both current reference scenarios share the same rule for deciding whether an engineering judgment can honestly be made.