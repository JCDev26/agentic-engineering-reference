# Per-Stage Contributor Selection 001 Review

## Purpose

This review records the architectural findings from extending contributor selection across multiple workflow stages.

Previous workflow experiments selected an implementation contributor but used a fixed executor for validation.

That meant the workflow demonstrated bounded contributions across stages, but not fully selected contributors across both sides of the handoff.

This experiment closes that gap.

---

## Workflow

The executable path is now:

```
Engineering Intent
       ↓
Implementation Contribution
       ↓
Implementer Profile
       ↓
Contribution Strategy
       ↓
Selected Implementer
       ↓
Implementation Artifact
       ↓
     Handoff
       ↓
Validation Contribution
       ↓
Validator Profile
       ↓
Contribution Strategy
       ↓
Selected Validator
       ↓
Validation Result
       ↓
Workflow Evaluation
       ↓
     Outcome
```

---

## Separate Contributor Roles

Implementation and validation are represented through separate contributor profiles.

### Implementer

Granted capability:

```
source.write
```

Applicable policy:

```
implementation-source-scope
```

### Validator

Granted capability:

```
validation.execute
```

Applicable policy:

```
validation-artifact-scope
```

The capabilities are intentionally different.

Being eligible to implement does not make a contributor eligible to validate.

---

## Selection Boundary

Both stages now use the same contributor-selection abstraction.

Selection considers:

* contribution profile
* allowed profile capabilities
* candidate availability
* candidate capabilities
* contributor-type preference

The workflow does not hardcode a validation executor.

---

## Handoff Does Not Transfer Authority

The implementation handoff transfers an implementation artifact reference.

It does not transfer:

* `source.write`
* implementation policy authority
* contributor identity as execution authority
* capability grants

The validation contributor receives its own contribution containing:

```
validation.execute
```

and must independently pass selection and policy enforcement.

---

## Validation Contributor Behavior

The selected validation contributor consumes the implementation artifact and produces a normalized validation-result artifact.

A validation contributor may successfully execute while determining that the implementation is invalid.

Therefore:

```
Validator execution = succeeded
```

can coexist with:

```
Acceptance result = failed
```

The workflow uses the acceptance result rather than validator execution status alone to determine stage and workflow success.

---

## Negative Selection Path

The experiment includes a candidate that supports only:

```
source.read
```

while the validation contribution requires:

```
validation.execute
```

The candidate is rejected by `ContributionStrategy`.

This demonstrates that contributor eligibility is stage-specific.

---

## Architectural Finding

A workflow handoff connects engineering responsibilities without implicitly connecting contributor authority.

Each stage independently resolves:

* responsibility
* contributor profile
* eligible contributor
* capabilities
* policies
* execution

This strengthens the contributor-neutral model because contributor choice remains local to each bounded contribution rather than becoming a workflow-wide identity.

---

## What Is Now Defensible

The reference implementation now demonstrates:

* selected contributors on both sides of a workflow handoff
* distinct contributor profiles for implementation and validation
* stage-specific capability requirements
* stage-specific policy boundaries
* contributor selection failure for an ineligible validator
* implementation artifacts consumed by an independently selected validator
* validation outcome independent from implementation self-reporting

---

## What Is Still Not Proven

The experiment does not yet demonstrate:

* human contributors
* AI contributors
* persistent contributor identity
* contributor workload management
* dynamic reselection after failure
* retries
* approvals
* asynchronous contributor availability
* real source-control or CI integrations

Those remain future experiments.

---

## Conclusion

The multi-stage workflow now demonstrates handoff between independently selected contributors rather than only between stage handlers.

Artifact transfer connects the work.

Capability and policy boundaries remain local to each contribution.
