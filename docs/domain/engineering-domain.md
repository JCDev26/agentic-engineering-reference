# Engineering Contribution Domain

## Purpose

This document defines the shared domain language used throughout the Agentic Engineering Reference architecture.

The architecture coordinates engineering work across different kinds of contributors without allowing any contributor, vendor, or execution technology to define the engineering workflow itself.

The purpose of this domain model is to create a stable vocabulary for describing:

- what engineering work exists
- what outcome is intended
- how work is organized
- who or what may contribute
- what contributors are allowed to do
- how contributions are validated
- what evidence is produced
- when human judgment is required
- how successful outcomes are determined

This vocabulary should remain useful regardless of whether work is performed by humans, automation, pipelines, AI agents, external systems, or future contributor technologies.

---

# Domain Boundary

The core domain describes **engineering contribution**, not individual implementation technologies.

Concepts belong in the core domain when they remain meaningful independently of a specific:

- AI provider
- IDE
- source control platform
- CI/CD platform
- automation framework
- programming language
- execution environment
- contributor type

Examples such as Cursor, Claude Code, OpenAI Codex, GitHub, GitLab, Docker, Jenkins, and Playwright belong outside the core domain and integrate through adapters or implementations.

A useful test is:

> Would this concept still exist if the current implementation technology were replaced?

If yes, it may belong in the engineering domain.

---

# Domain Model

    EngineeringSystem
          │
          ├── WorkItem
          │      │
          │      ▼
          │ EngineeringIntent
          │      │
          │      ▼
          │   Workflow
          │      │
          │      ▼
          │ ContributionStrategy
          │      │
          │      ▼
          │ Contribution
          │      │
          │      ├──── Contributor
          │      ├──── Capability
          │      ├──── Policy
          │      └──── ExecutionEnvironment
          │
          ▼
       Evidence
          │
          ▼
      Evaluation
          │
          ▼
       Outcome

Cross-cutting concepts include:

- `Handoff`
- `Approval`
- `Skill`
- `Tool`
- `Adapter`

---

# Core Concepts

## `EngineeringSystem`

The system responsible for coordinating engineering work from request through outcome.

The engineering system owns:

- workflow definition
- governance
- contribution boundaries
- validation requirements
- evidence requirements
- approvals
- outcome evaluation

The engineering system does not require a particular contributor type.

---

## `WorkItem`

A normalized representation of engineering work entering the system.

A work item answers:

> What unit of work has entered the engineering system?

Possible sources include:

- product request
- defect
- GitHub issue
- GitLab issue
- Jira ticket
- incident
- support escalation
- CLI request
- API request
- scheduled event
- automated signal

Source-specific representations are normalized before entering the core domain.

A `WorkItem` may contain information such as:

- identifier
- title
- description
- source
- priority
- metadata
- requested outcome
- related artifacts

A work item does not determine who performs the work.

---

## `EngineeringIntent`

A contributor-neutral description of the desired engineering outcome.

Engineering intent answers:

> What does successful engineering look like?

Intent may contain:

- objective
- acceptance criteria
- constraints
- expected behavior
- validation expectations
- evidence requirements
- risk characteristics

Intent should describe the required outcome without prematurely selecting the contributor or implementation strategy.

Example:

> Add validation preventing duplicate usernames and demonstrate that existing user creation behavior remains unaffected.

Intent should not require wording such as:

> Ask Claude to modify this file and run this command.

The first describes engineering.

The second describes one possible implementation.

---

## `Workflow`

The sequence of engineering responsibilities required to satisfy engineering intent.

A workflow answers:

> What engineering activities must occur?

Example responsibilities may include:

- understand
- investigate
- plan
- implement
- validate
- review
- document
- approve
- deploy

A workflow defines responsibilities and required transitions.

It should not assume that a particular contributor type performs each responsibility.

For example:

    Plan
      ↓
    Implement
      ↓
    Validate
      ↓
    Review

could be completed by:

    Human
      ↓
    Human
      ↓
    Automation
      ↓
    Human

or:

    AI Planner
      ↓
    AI Implementer
      ↓
    Pipeline
      ↓
    Human

while remaining the same conceptual engineering workflow.

---

## `Contribution`

A bounded unit of engineering work performed as part of a workflow.

A contribution answers:

> What responsibility is being performed right now?

Examples include:

- produce an implementation plan
- modify application code
- review a change
- execute regression tests
- investigate a failure
- produce documentation
- validate an environment
- deploy an artifact

A contribution should have:

- defined objective
- defined scope
- contributor
- permitted capabilities
- applicable policies
- expected evidence
- completion criteria

Contributions should be small enough to reason about, observe, validate, and hand off.

---

## `Contributor`

An actor capable of performing an engineering contribution.

Contributor types may include:

- human
- AI agent
- automation framework
- script
- CI/CD pipeline
- external service
- future execution technology

The architecture does not assume that one contributor type is inherently superior.

Contributor selection should depend on the characteristics of the contribution.

---

## `ContributorProfile`

A description of the role, responsibilities, capabilities, and boundaries assigned to a contributor.

A profile may describe responsibilities such as:

- planning
- implementation
- validation
- review
- documentation
- deployment
- investigation

A contributor and contributor profile are intentionally separate.

For example, the `Reviewer` profile could potentially be fulfilled by:

- a human engineer
- an AI reviewer
- static analysis
- a combination of contributors

This allows roles to remain stable while implementations evolve.

---

## `ContributionStrategy`

The mechanism used to determine how a contribution should be fulfilled.

Contribution strategy answers:

> What contributor or combination of contributors is appropriate for this responsibility?

Selection may consider:

- capability
- risk
- policy
- availability
- cost
- confidence
- execution environment
- required approvals
- historical performance

Possible strategies include:

- human-only
- deterministic automation
- pipeline execution
- AI-assisted human contribution
- autonomous AI contribution
- multi-contributor collaboration

Contribution strategy is intentionally separate from engineering intent.

---

## `Capability`

An action a contributor is permitted and able to perform.

Examples include:

- read source files
- modify source files
- execute tests
- access an API
- interact with a browser
- create a branch
- create a pull request
- deploy software

Capabilities should be explicit and bounded.

A contributor should not receive capabilities simply because the underlying platform supports them.

---

## `Tool`

A mechanism through which a capability may be exercised.

Examples include:

- shell
- filesystem
- Git
- Playwright
- browser
- API client
- MCP server
- deployment CLI

The distinction is important:

`Capability` describes what the contributor may do.

`Tool` describes how that capability is made available.

---

## `Skill`

Reusable knowledge or procedural guidance that helps a contributor perform a contribution.

Examples may include:

- repository conventions
- testing procedures
- deployment procedures
- coding standards
- investigation techniques
- domain-specific knowledge

A skill is guidance.

It is not an enforcement mechanism.

Deterministic requirements belong in `Policy`.

---

## `Policy`

A deterministic constraint governing engineering work.

Policy answers:

> What must or must not happen regardless of contributor reasoning?

Examples include:

- permitted repositories
- branch restrictions
- required validation
- credential restrictions
- deployment boundaries
- approval requirements
- destructive-action restrictions
- retry limits

Policies should be enforced outside probabilistic contributor reasoning whenever practical.

---

## `ExecutionEnvironment`

The environment in which a contribution performs executable work.

Examples include:

- developer workstation
- isolated workspace
- CI runner
- Docker container
- virtual machine
- cloud sandbox
- external execution service

Execution environments should expose only the capabilities required by the contribution.

---

## `Evidence`

Structured proof describing what occurred during engineering work.

Evidence answers:

> What demonstrates that the contribution occurred and what resulted from it?

Examples include:

- source diff
- test results
- command output
- logs
- screenshots
- recordings
- policy decisions
- contributor activity
- tool usage
- handoffs
- approval records
- runtime metadata

Evidence should support:

- validation
- review
- auditability
- observability
- debugging
- continuous improvement

---

## `Evaluation`

The assessment of whether a contribution or workflow satisfied its expected outcome.

Evaluation should focus on engineering success rather than contributor behavior alone.

Possible signals include:

- acceptance criteria
- automated tests
- static analysis
- runtime validation
- policy compliance
- evidence completeness
- review outcome

Evaluation may be deterministic, probabilistic, human, or composed from several mechanisms.

---

## `Outcome`

The final engineering state resulting from a workflow.

Examples may include:

- completed change
- rejected change
- validated release
- documented investigation
- deployment
- escalation
- no-op determination

An outcome should describe what happened from the engineering system's perspective rather than merely whether a contributor completed execution.

---

# Supporting Concepts

## `Handoff`

A transfer of responsibility, context, or evidence between contributors.

A handoff should preserve sufficient context for the receiving contributor to continue without reconstructing the entire workflow history.

---

## `Approval`

Explicit authorization required before controlled work may continue.

Approvals may be required based on:

- risk
- policy
- contribution type
- environment
- capability
- deployment target

Human approval is one implementation.

Future systems may also support deterministic approval policies where appropriate.

---

## `Adapter`

A boundary translating an external implementation into core domain concepts.

Adapters may connect:

- work management systems
- source control systems
- AI platforms
- CI/CD systems
- automation frameworks
- execution environments

Examples could include:

    GitHub Issue
        ↓
    GitHub Adapter
        ↓
    WorkItem

or:

    AI Agent
        ↓
    Contributor Adapter
        ↓
    Contributor

Adapters prevent external implementation models from defining the core architecture.

---

# Important Distinctions

## Work Item vs. Engineering Intent

`WorkItem` represents the request entering the system.

`EngineeringIntent` represents the normalized engineering outcome the system intends to achieve.

A poorly written ticket may become a well-defined engineering intent after normalization or clarification.

---

## Workflow vs. Contribution

`Workflow` describes the sequence of engineering responsibilities.

`Contribution` represents one bounded responsibility being performed.

---

## Contributor vs. Contributor Profile

`Contributor` identifies who or what performs work.

`ContributorProfile` defines the role and boundaries under which that contributor operates.

---

## Capability vs. Tool

`Capability` describes what may be done.

`Tool` describes the mechanism through which it is done.

---

## Skill vs. Policy

`Skill` provides guidance.

`Policy` provides enforcement.

This distinction is especially important for AI contributors.

Instructions should not be expected to enforce requirements that can be deterministically controlled.

---

## Evidence vs. Evaluation

`Evidence` records what happened.

`Evaluation` determines whether what happened was successful.

---

## Execution vs. Outcome

Execution completion does not imply engineering success.

A contributor may successfully execute every assigned action while still producing an unsuccessful engineering outcome.

The architecture therefore evaluates outcomes independently from contributor execution status.

---

# Domain Invariants

The following rules should remain true throughout future implementations.

### The contributor is not the workflow.

Workflows exist independently from whoever performs them.

### The platform is not the architecture.

External systems integrate through boundaries.

### Engineering intent is independent from engineering contribution.

Desired outcomes should not change because contributor technology changes.

### Skills do not replace policies.

Guidance and deterministic enforcement serve different responsibilities.

### Execution does not prove success.

Engineering outcomes require validation and evidence.

### Autonomy does not eliminate accountability.

More autonomous contributors require stronger observability, governance, and evaluation rather than less.

---

# Example

Consider the engineering intent:

> Prevent duplicate usernames from being created while preserving existing user creation behavior.

A workflow might be:

    Investigate
        ↓
    Implement
        ↓
    Validate
        ↓
    Review
        ↓
    Deliver

One implementation could be:

    Human Engineer
        ↓
    Human Engineer
        ↓
    CI Pipeline
        ↓
    Human Reviewer
        ↓
    GitHub

Another could be:

    AI Investigator
        ↓
    AI Implementer
        ↓
    Automation
        ↓
    Human Reviewer
        ↓
    GitLab

The contributor implementation changed.

The engineering intent and conceptual workflow did not.

That separation is a foundational property of this architecture.

---

# Evolution

This domain model is expected to evolve as the reference implementation exposes missing concepts or incorrect assumptions.

Changes should be driven by demonstrated architectural need rather than by terminology introduced by individual vendors or tools.

If a new concept is proposed for the core domain, ask:

1. Does this represent an engineering concept rather than an implementation detail?
2. Would it remain meaningful if the current vendor or technology disappeared?
3. Does an existing concept already represent this responsibility?
4. Does introducing it make the architecture clearer or merely more complex?

The goal is not to model every possible engineering activity.

The goal is to establish the smallest useful language capable of supporting contributor-neutral engineering systems.

---

# Related Decisions

- ADR-0001: Keep the Core Architecture Contributor- and Vendor-Neutral
- ADR-0002: Separate Engineering Intent from Engineering Contribution
