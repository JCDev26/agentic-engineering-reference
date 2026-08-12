# Terminal Failure Semantics 001 Review

## Purpose

This review records the architectural findings from preserving failure causality through the terminal workflow outcome.

Previous experiments already distinguished several failure modes during contribution and workflow execution.

However, distinct failures eventually collapsed into a generic failed outcome.

Contributor selection failure also escaped the workflow model through an exception.

This experiment closes those gaps.

---

## Status and Reason

Terminal workflow results now distinguish:

> What happened?

from:

> Why did it happen?

`Outcome.status` represents lifecycle disposition.

`Outcome.reasonCode` represents the causal failure category.

For example:

```
status = failed
reasonCode = governance-denied
```

is distinct from:

```
status = failed
reasonCode = engineering-validation-failed
```

---

## Failure Modes Under Test

### Governance Denial

```
Implementation Contribution
       ↓
  Policy Denied
       ↓
  No Execution
       ↓
  No Handoff
       ↓
Workflow Failed
       ↓
Outcome
  status = failed
  reasonCode = governance-denied
  failedStageId = implementation
```

### Contributor Selection Failure

```
Validation Contribution
       ↓
No Eligible Contributor
       ↓
Validation Never Executes
       ↓
Workflow Failed
       ↓
Outcome
  status = failed
  reasonCode = contributor-selection-failed
  failedStageId = validation
```

Selection failure no longer escapes the architecture as an exception.

### Engineering Validation Failure

```
Implementation Executes
       ↓
Artifact Produced
       ↓
   Handoff
       ↓
Validator Executes Successfully
       ↓
Engineering Result Rejected
       ↓
Workflow Failed
       ↓
Outcome
  status = failed
  reasonCode = engineering-validation-failed
  failedStageId = validation
```

### Dependency Deadlock

```
Remaining Stages
       ↓
No Stage Can Become Ready
       ↓
Workflow Failed
       ↓
Outcome
  status = failed
  reasonCode = dependency-deadlock
  unresolvedStageIds = [...]
```

No stage is falsely reported as having executed and failed.

---

## Contributor Selection Is Now Stage-Entry Behavior

Contributor selection now occurs when the relevant workflow stage executes.

This is stronger than eagerly selecting every contributor before the workflow begins.

A downstream contributor does not need to exist or be eligible until the workflow actually reaches that responsibility.

Selection failure is therefore represented as a workflow-stage failure rather than workflow construction failure.

---

## Failure Causality

The terminal result now preserves information already discovered by lower architectural layers.

The system does not require consumers to reconstruct the cause by parsing logs or human-readable summaries.

Consumers can inspect:

* `status`
* `reasonCode`
* `failedStageId`
* `unresolvedStageIds`
* evidence

This supports later observability without coupling terminal consumers to implementation-specific logs.

---

## Architectural Finding

Observability is weakened if failure causality is lost at the final boundary.

A system that distinguishes failure internally but reports every terminal result as simply `failed` does not fully preserve its own evidence model.

Failure semantics must survive orchestration.

---

## What Is Now Defensible

The reference architecture now demonstrates distinct terminal handling for:

* governance denial
* contributor selection failure
* stage execution failure
* engineering validation failure
* dependency deadlock
* missing stage bindings
* evaluation failure

Not every category has a dedicated reference scenario yet, but the terminal model can represent them without changing lifecycle status semantics.

---

## What Is Still Not Proven

The architecture does not yet demonstrate:

* retries after failure
* contributor reselection
* recovery from failed stages
* workflow suspension
* human review
* approval boundaries
* persistent workflow state
* external observability backends

Those remain future experiments.

---

## Conclusion

A terminal outcome now communicates both the workflow disposition and the causal reason for failure.

Different failure modes remain distinguishable from their point of origin through the final outcome boundary.
