# Contributor Selection 001 Review

## Purpose

This review records the architectural findings from introducing deterministic contributor selection into the first reference scenario.

The objective was to test whether contributor selection could occur independently from engineering intent, workflow definition, governance, evidence requirements, evaluation, and outcome resolution.

---

## What Was Added

The implementation introduced a `ContributionStrategy` boundary responsible for selecting an eligible contributor for an already-defined contribution.

Selection currently considers:

- contributor availability
- contributor capabilities
- contributor profile capability boundaries
- contributor type preferences

Contributor selection does not redefine the engineering contribution.

---

## What Was Validated

### Contributor Selection Is Separate from Engineering Intent

The engineering intent remains identical regardless of the selected contributor.

### Contributor Selection Is Separate from Workflow

The workflow does not contain contributor-specific execution instructions.

### Contributor Capability Does Not Grant Contribution Authority

A contributor may support a capability without automatically receiving authority to use it.

The `Contribution` still defines the capabilities granted for the bounded unit of work.

### Contributor Profiles Constrain Eligible Contributions

A contributor profile can prevent selection when the contribution requires capabilities outside the profile's allowed boundary.

### Contributor Preference Is Not Architectural Coupling

The strategy may prefer one contributor type over another without requiring the workflow itself to depend on that contributor type.

### Contributor Implementations Remain Substitutable

The reference scenario can execute with different contributor implementations while preserving:

- WorkItem
- EngineeringIntent
- Workflow
- Contribution
- ContributorProfile
- Policy
- Evidence requirements
- Evaluation requirements
- Outcome semantics

---

## Current Selection Model

The current deterministic strategy follows this conceptual path:

    Contribution
         ↓
    ContributorProfile
         ↓
    Available Candidates
         ↓
    Capability Eligibility
         ↓
    Profile Eligibility
         ↓
    Contributor Preference
         ↓
    Selected Contributor

Selection occurs before governed execution.

The selected contributor remains subject to:

- contribution capability grants
- deterministic policy
- evidence requirements
- evaluation

Selection does not bypass governance.

---

## What Is Intentionally Not Implemented

The current strategy does not yet consider:

- historical contributor performance
- model quality
- monetary cost
- latency
- confidence
- workload
- reliability history
- security classification
- dynamic risk
- token budgets
- routing across multiple contributors

These may become valid selection signals later.

They are not required to validate the architectural boundary.

---

## Architectural Finding

The implementation supports the distinction between:

> Who can perform the work?

and:

> What is the work?

Contributor strategy answers the first question.

Engineering intent, workflow, and contribution contracts answer the second.

Keeping these responsibilities separate allows contributor technology to evolve without redefining engineering work.

---

## Related Decisions

- ADR-0001: Keep the Core Architecture Contributor- and Vendor-Neutral
- ADR-0002: Separate Engineering Intent from Engineering Contribution

## Related Reviews

- Vertical Slice 001 Review