# ADR-0002: Separate Engineering Intent from Engineering Contribution

- **Status:** Accepted
- **Date:** 2026-08-07
- **Decision Owners:** Project Maintainer

---

# Context

Software engineering has traditionally been performed by humans following established development processes.

Today, engineering work may also be performed by:

- AI contributors
- automation frameworks
- CI/CD pipelines
- scripts
- cloud services
- future execution technologies

While contributor capabilities continue to evolve rapidly, the desired engineering outcome usually does not.

A feature request remains a feature request.

A bug fix remains a bug fix.

A production incident remains a production incident.

The engineering organization defines **what** must be accomplished.

Contributors determine **how** that work is performed.

Many current AI implementations combine these responsibilities into a single execution layer.

The contributor receives an instruction, determines the engineering approach, executes the work, validates the outcome, and delivers the result.

Although this can be effective for isolated tasks, it couples engineering behavior directly to contributor implementation.

As contributor technologies evolve, engineering workflows must also evolve.

This architecture intentionally separates those responsibilities.

---

# Decision

Engineering intent shall remain independent from engineering contribution.

The engineering system owns:

- desired outcomes
- engineering workflows
- governance
- validation requirements
- evidence requirements
- approval requirements
- delivery expectations

Contributors own only the bounded work assigned to them.

A contributor may recommend changes to the workflow.

A contributor may not redefine the workflow.

---

# Engineering Intent

Engineering intent defines:

- what problem is being solved
- desired outcome
- engineering constraints
- acceptance criteria
- governance requirements
- validation expectations
- required evidence

Engineering intent does not define:

- which contributor performs the work
- which AI model is used
- which IDE is used
- which execution technology performs the implementation

Intent describes engineering.

Not execution.

---

# Engineering Contribution

A contribution is a bounded engineering activity performed by a contributor.

Examples include:

- planning
- implementation
- review
- testing
- investigation
- documentation
- deployment

Contributions exist to satisfy engineering intent.

They do not define engineering intent.

---

# Why This Decision Was Made

## Preserve Engineering Ownership

Engineering standards should remain stable even as contributors evolve.

Organizations should not redesign engineering processes every time a new AI platform appears.

---

## Improve Governance

Policies become easier to enforce when they are attached to engineering workflows instead of contributor implementations.

Examples include:

- required reviews
- validation gates
- deployment restrictions
- approval requirements
- audit expectations

---

## Improve Contributor Interchangeability

A workflow should be executable by different contributor types.

Examples:

- Human engineer
- Automation
- Pipeline
- AI contributor

without redefining the engineering workflow.

---

## Improve Evaluation

Engineering success should be evaluated against engineering intent.

Not contributor implementation.

Different contributors may produce different implementations while still satisfying the same engineering objective.

---

## Reduce Architectural Coupling

Engineering systems should not inherit the lifecycle of individual contributors.

Contributors will change.

Engineering principles should not.

---

# Reference Model

Engineering Request

↓

Engineering Intent

↓

Engineering Workflow

↓

Contribution Strategy

↓

Engineering Contribution

↓

Validation

↓

Evidence

↓

Delivery

Engineering intent remains constant.

Contribution strategies may evolve.

---

# Alternatives Considered

## Contributor Owns Workflow

Examples include:

- AI determines engineering approach
- AI selects validation
- AI defines workflow
- AI determines evidence
- AI controls delivery

### Advantages

- rapid implementation
- minimal orchestration
- fewer architectural components

### Disadvantages

- engineering behavior varies by contributor
- governance becomes inconsistent
- workflows become difficult to compare
- engineering standards become contributor dependent

This architecture rejects this approach.

---

## Duplicate Workflows Per Contributor

Examples:

Human workflow

Pipeline workflow

Cursor workflow

Claude workflow

Automation workflow

### Advantages

- highly optimized implementations

### Disadvantages

- duplicated engineering knowledge
- inconsistent governance
- higher maintenance cost
- fragmented observability

This architecture also rejects this approach.

---

# Consequences

## Positive

- engineering owns engineering
- contributors remain interchangeable
- workflows become reusable
- governance remains consistent
- evaluation becomes normalized
- architecture survives contributor evolution

## Negative

- additional abstraction
- contributor adapters require implementation effort
- workflows require stronger upfront definition

These tradeoffs are intentional.

---

# Architectural Rule

Engineering systems define work.

Contributors perform work.

Contributors may improve engineering.

They must never become engineering.

---

# Validation

This decision will be considered successful when the same engineering intent can be satisfied by different contributor types without changing:

- governance
- workflow
- validation
- evidence
- approval requirements

Only the contributor implementation should vary.

---

# Future Considerations

Future ADRs should define:

- contribution strategies
- contributor contracts
- orchestration
- deterministic governance
- execution boundaries
- evidence collection
- evaluation
- contributor specialization
- workflow composition
