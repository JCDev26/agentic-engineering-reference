# Reference Architecture

## Purpose

This document provides a high-level view of the Engineering Contribution Architecture.

The architecture coordinates engineering work across multiple contributor types while preserving a stable separation between:

- engineering intent
- workflow definition
- contributor selection
- execution
- governance
- evidence
- evaluation
- delivery

The architecture is intentionally contributor- and vendor-neutral.

Humans, automation, pipelines, AI agents, and external systems may all participate in the same engineering workflow without redefining the workflow itself.

---

## High-Level Architecture

    ┌──────────────────────────────────────────────────────────────┐
    │                      Request Sources                         │
    │                                                              │
    │   GitHub   GitLab   Jira   Slack   CLI   API   Events       │
    └──────────────────────────────┬───────────────────────────────┘
                                   │
                                   ▼
                     ┌──────────────────────────┐
                     │      Source Adapter      │
                     │                          │
                     │ Normalize external work  │
                     │ into core contracts      │
                     └─────────────┬────────────┘
                                   │
                                   ▼
                     ┌──────────────────────────┐
                     │        WorkItem          │
                     └─────────────┬────────────┘
                                   │
                                   ▼
                     ┌──────────────────────────┐
                     │   EngineeringIntent      │
                     │                          │
                     │ objective                │
                     │ acceptance criteria      │
                     │ constraints              │
                     │ validation requirements  │
                     │ evidence requirements    │
                     └─────────────┬────────────┘
                                   │
                                   ▼
                     ┌──────────────────────────┐
                     │        Workflow          │
                     │                          │
                     │ engineering stages       │
                     │ dependencies             │
                     │ completion criteria      │
                     └─────────────┬────────────┘
                                   │
                                   ▼
                     ┌──────────────────────────┐
                     │  Contribution Strategy   │
                     │                          │
                     │ capability               │
                     │ risk                     │
                     │ policy                   │
                     │ availability             │
                     │ cost                     │
                     │ confidence               │
                     └─────────────┬────────────┘
                                   │
                     ┌─────────────┼─────────────┐
                     │             │             │
                     ▼             ▼             ▼
                ┌─────────┐   ┌──────────┐   ┌──────────┐
                │  Human  │   │Automation│   │ AI Agent │
                └────┬────┘   └────┬─────┘   └────┬─────┘
                     │             │              │
                     └─────────────┼──────────────┘
                                   │
                                   ▼
                     ┌──────────────────────────┐
                     │      Contribution        │
                     │                          │
                     │ objective                │
                     │ scope                    │
                     │ contributor profile      │
                     │ capabilities             │
                     │ policies                 │
                     │ completion criteria      │
                     └─────────────┬────────────┘
                                   │
                                   ▼
                 ┌────────────────────────────────────┐
                 │         Governance Boundary        │
                 │                                    │
                 │ policy checks                      │
                 │ capability authorization           │
                 │ approval requirements              │
                 │ retry / resource limits            │
                 │ destructive-action controls        │
                 └────────────────┬───────────────────┘
                                  │
                                  ▼
                 ┌────────────────────────────────────┐
                 │       Execution Environment        │
                 │                                    │
                 │ local workspace                    │
                 │ CI runner                          │
                 │ Docker container                   │
                 │ virtual machine                    │
                 │ cloud sandbox                      │
                 │ external service                   │
                 └────────────────┬───────────────────┘
                                  │
                                  ▼
                 ┌────────────────────────────────────┐
                 │               Tools                │
                 │                                    │
                 │ source control                     │
                 │ filesystem                         │
                 │ APIs                               │
                 │ browser automation                 │
                 │ test execution                     │
                 │ MCP                                │
                 │ deployment tooling                 │
                 └────────────────┬───────────────────┘
                                  │
                                  ▼
                 ┌────────────────────────────────────┐
                 │              Evidence              │
                 │                                    │
                 │ diffs                              │
                 │ logs                               │
                 │ test results                       │
                 │ screenshots                        │
                 │ command output                     │
                 │ policy decisions                   │
                 │ approvals                          │
                 │ handoffs                           │
                 └────────────────┬───────────────────┘
                                  │
                                  ▼
                 ┌────────────────────────────────────┐
                 │            Evaluation              │
                 │                                    │
                 │ acceptance criteria                │
                 │ validation results                 │
                 │ policy compliance                  │
                 │ evidence completeness              │
                 │ human review                       │
                 │ probabilistic evaluation           │
                 └────────────────┬───────────────────┘
                                  │
                     ┌────────────┴────────────┐
                     │                         │
                     ▼                         ▼
              ┌──────────────┐         ┌────────────────┐
              │ Next Stage / │         │ Human Approval │
              │   Handoff    │         │ or Escalation  │
              └──────┬───────┘         └───────┬────────┘
                     │                         │
                     └────────────┬────────────┘
                                  │
                                  ▼
                      ┌──────────────────────┐
                      │       Outcome        │
                      │                      │
                      │ completed            │
                      │ failed               │
                      │ rejected             │
                      │ escalated            │
                      │ cancelled            │
                      │ no change required   │
                      └──────────┬───────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    Delivery Adapter     │
                    │                         │
                    │ PR / MR                 │
                    │ deployment              │
                    │ report                  │
                    │ issue update            │
                    │ notification            │
                    └─────────────────────────┘

---

## Architecture Layers

The reference architecture can be understood as several logical layers.

### 1. Request and Integration Layer

This layer connects external engineering systems to the core architecture.

Responsibilities include:

- receiving work
- translating external representations
- preserving source context
- producing normalized `WorkItem` contracts

Examples may include:

- GitHub
- GitLab
- Jira
- Slack
- CLI
- event systems
- APIs

This layer should not define engineering workflow behavior.

---

### 2. Engineering Definition Layer

This layer defines what engineering success means.

Primary concepts include:

- `WorkItem`
- `EngineeringIntent`
- `Workflow`

Responsibilities include:

- normalizing requested work
- defining desired outcomes
- defining workflow stages
- defining completion criteria
- defining validation and evidence expectations

This layer should remain independent from contributor implementation.

---

### 3. Contribution Layer

This layer determines how bounded engineering responsibilities are fulfilled.

Primary concepts include:

- `Contribution`
- `Contributor`
- `ContributorProfile`
- `ContributionStrategy`

Responsibilities include:

- selecting appropriate contributor types
- assigning bounded responsibilities
- applying contributor profiles
- determining capability requirements
- supporting handoffs between contributors

Contributor selection may change without redefining engineering intent.

---

### 4. Governance Layer

This layer enforces engineering constraints independently from contributor reasoning.

Primary concepts include:

- `Policy`
- `Capability`
- `Approval`

Responsibilities include:

- authorization
- least privilege
- repository boundaries
- environment restrictions
- required validation
- resource limits
- retry limits
- destructive-action controls
- approval gates

Governance should be deterministic wherever practical.

---

### 5. Execution Layer

This layer performs executable engineering activity.

Primary concepts include:

- `ExecutionEnvironment`
- `Tool`

Responsibilities include:

- providing isolated workspaces
- exposing authorized capabilities
- running automation
- interacting with external systems
- limiting network and credential access
- enforcing environment lifecycle rules

Execution technology is replaceable.

---

### 6. Evidence and Evaluation Layer

This layer determines what happened and whether it was successful.

Primary concepts include:

- `Evidence`
- `Evaluation`

Responsibilities include:

- collecting execution artifacts
- recording policy decisions
- recording contributor activity
- validating acceptance criteria
- evaluating engineering outcomes
- supporting audit and review

Contributor self-reporting alone should not determine success.

---

### 7. Delivery Layer

This layer translates completed engineering outcomes back into external systems.

Examples include:

- pull requests
- merge requests
- deployments
- reports
- issue updates
- notifications
- documentation artifacts

Delivery remains separate from contribution execution.

---

## Cross-Cutting Concerns

Some responsibilities apply across all architecture layers.

### Observability

The system should expose enough information to answer questions such as:

- Which contributor performed the work?
- Which contributor profile was used?
- Which tools were invoked?
- Which policies were evaluated?
- Which policies blocked execution?
- Was a handoff required?
- Was human intervention required?
- How many retries occurred?
- What evidence was produced?
- What was the final outcome?

### Security

The architecture should follow least-privilege principles.

Security considerations include:

- credential isolation
- tool allowlists
- network restrictions
- repository scope
- environment isolation
- supply-chain trust
- destructive-action protection
- auditability

### Provenance

Important artifacts should retain enough context to determine:

- what produced them
- when they were produced
- which contribution produced them
- which workflow they belong to
- which policies affected them

### Resource Governance

Contributions may require limits involving:

- time
- compute
- memory
- model tokens
- monetary cost
- retries
- external API usage

### Human Interaction

Humans may participate as:

- contributors
- reviewers
- approvers
- decision makers
- escalation recipients

Human participation is part of the architecture rather than an exception to it.

---

## Contributor Examples

The same workflow responsibility may be fulfilled differently depending on context.

### Example: Validation

Possible contributors include:

    CI Pipeline
        │
        └── execute automated test suite

    Playwright Automation
        │
        └── validate browser behavior

    AI Contributor
        │
        └── investigate unexpected test behavior

    Human Engineer
        │
        └── perform exploratory review

These contributors may participate independently or collaboratively.

The workflow responsibility remains:

> Validate the engineering outcome.

---

## Example Workflow

Consider this engineering intent:

> Prevent duplicate usernames from being created while preserving existing user creation behavior.

The conceptual workflow is:

    Investigate
        ↓
    Plan
        ↓
    Implement
        ↓
    Validate
        ↓
    Review
        ↓
    Deliver

One contribution strategy could produce:

    Human Engineer
        ↓
    Human Engineer
        ↓
    Human Engineer
        ↓
    CI Pipeline
        ↓
    Human Reviewer
        ↓
    GitHub

Another could produce:

    AI Investigator
        ↓
    AI Planner
        ↓
    AI Implementer
        ↓
    Automation + CI
        ↓
    Human Reviewer
        ↓
    GitLab

A third might use:

    Human Engineer
        ↓
    AI Assistant
        ↓
    Human Engineer
        ↓
    Automation
        ↓
    AI Review + Human Approval
        ↓
    GitHub

The contributor implementation changes.

The engineering intent and workflow do not.

---

## Boundary Rule

A useful architecture rule is:

> Core engineering concepts point inward. Platform-specific concepts remain at the boundary.

For example:

    GitHub
       ↓
    Adapter
       ↓
    WorkItem

not:

    WorkItem
       ↓
    GitHub Issue

Likewise:

    Claude Code
        ↓
    Contributor Adapter
        ↓
    Contributor

not:

    Workflow
        ↓
    Claude Code Agent

The core domain should not require knowledge of external implementation technologies.

---

## Current Architectural Invariants

The reference architecture currently assumes:

1. The architecture is contributor- and vendor-neutral.
2. Engineering intent is independent from engineering contribution.
3. Contributors participate in workflows but do not define them.
4. Capabilities must be explicitly granted.
5. Deterministic policy overrides contributor guidance.
6. Evidence is separate from evaluation.
7. Execution completion does not prove engineering success.
8. Humans are contributors within the system.
9. Contributor-specific capabilities may extend the architecture but may not define the core domain.
10. Complexity should be introduced only when it produces measurable engineering value.

---

## What This Diagram Does Not Decide

This architecture intentionally does not yet define:

- programming language
- orchestration framework
- persistence model
- event transport
- synchronous vs. asynchronous workflow execution
- policy engine
- capability namespace format
- contributor scoring algorithm
- model provider
- source control provider
- container platform
- observability backend

These decisions should remain open until implementation requirements justify them.

---

## Next Steps

The next architectural work should validate this model through a small reference scenario before selecting implementation technology.

The reference scenario should demonstrate:

- one normalized work item
- one engineering intent
- one workflow
- multiple contribution types
- policy enforcement
- bounded capabilities
- evidence capture
- evaluation
- human approval
- final outcome

The same scenario should eventually be executable using more than one contributor strategy.

---

## Related Decisions

- ADR-0001: Keep the Core Architecture Contributor- and Vendor-Neutral
- ADR-0002: Separate Engineering Intent from Engineering Contribution

## Related Documentation

- `docs/domain/engineering-domain.md`
- `docs/contracts/core-contracts.md`
