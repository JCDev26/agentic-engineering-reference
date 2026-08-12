# Workflow Readiness 001 Review

## Purpose

This review records the architectural findings from replacing array-order workflow sequencing with explicit dependency readiness.

The previous workflow implementation checked dependencies while iterating stages in array order.

That meant a stage encountered before its dependencies could be incorrectly treated as a workflow failure even though it was simply not ready to execute.

This experiment corrects that behavior.

---

## Readiness Model

The workflow runner now repeatedly evaluates remaining stages.

A stage is ready when all of its declared dependencies are present in the completed-stage set.

Conceptually:

```
Remaining Stages
      ↓
Determine Ready Stages
      ↓
Execute Ready Stages
      ↓
Record Completion
      ↓
Recalculate Readiness
```

A stage that is not ready is deferred.

It is not considered failed.

---

## Out-of-Order Workflow

The reference workflow deliberately declares stages in an order that cannot be executed directly:

```
Validation
Compatibility
Implementation
```

Validation depends on both Compatibility and Implementation.

The executable order becomes:

```
Compatibility
     ↓
Implementation
     ↓
  Validation
```

Validation executes only after both dependencies complete.

This demonstrates that stage progression is driven by dependency readiness rather than array position.

---

## Multiple Upstream Dependencies

The validation stage requires two upstream stages.

Each completed upstream stage creates its own handoff.

Validation therefore receives multiple normalized handoffs containing the artifacts required for the downstream responsibility.

This demonstrates basic fan-in behavior.

---

## Failure Semantics

The runner now distinguishes different workflow failure classes.

### Stage Failure

A stage executes and returns a failed result.

The workflow records:

```
failureReason = stage-failed
failedStageId = <executed stage>
```

### Missing Binding

A ready stage has no executable handler.

The workflow records:

```
failureReason = missing-stage-binding
```

### Dependency Deadlock

Stages remain, but none can become ready.

Examples include circular dependencies.

The workflow records:

```
failureReason = dependency-deadlock
unresolvedStageIds = [...]
```

No stage is incorrectly reported as having executed and failed.

---

## Architectural Finding

Workflow dependency state is not equivalent to stage execution state.

A stage can be:

* unresolved
* ready
* executed successfully
* executed unsuccessfully

The current implementation does not persist these as explicit lifecycle states, but the orchestration behavior now respects the distinction.

Additional stage-state abstractions should be introduced only if future scenarios require persistent or externally observable workflow state.

---

## Execution Ordering

Multiple stages may become ready simultaneously.

The current implementation still executes ready stages sequentially.

This is intentional.

Dependency readiness and parallel execution are separate concerns.

The architecture now supports the former without prematurely introducing concurrency.

---

## What Is Now Defensible

The reference workflow runner can now demonstrate:

* dependency-driven stage readiness
* execution independent from workflow array order
* multiple upstream dependencies
* multiple handoffs into one downstream stage
* stage failure distinct from dependency deadlock
* deferred stages that are not incorrectly marked failed

---

## What Is Still Not Proven

The workflow system does not yet demonstrate:

* parallel execution
* persistent stage state
* retries
* dynamic workflow mutation
* branching based on evaluation
* contributor reselection
* approval gates
* human intervention
* suspension and resumption

These remain future experiments.

---

## Next Pressure Point

With readiness semantics established, future workflow experiments can safely build on dependency-driven progression.

The next architectural capability should be chosen based on a concrete workflow need rather than added because it appears in the conceptual model.

Potential future pressure includes:

* contributor selection for validation stages
* narrower handoff evidence boundaries
* approval/review transitions
* retry or contributor reselection after failure

---

## Conclusion

The workflow runner is no longer dependent on pre-sorted stage arrays.

Stages progress because their declared dependencies are satisfied.

This establishes a stronger foundation for future orchestration capabilities without introducing unnecessary concurrency or workflow infrastructure.
