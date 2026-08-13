# Agentic Engineering Reference

A reference architecture for engineering contribution systems that coordinate humans, automation, pipelines, external services, and AI through shared workflows, governance, evidence, and review.

## Why This Exists

Modern software engineering is performed by more than one kind of contributor.

Engineering work may be planned, implemented, validated, reviewed, or delivered by:

- software engineers
- automation frameworks
- CI/CD pipelines
- scripts
- external services
- AI agents
- future execution technologies

The architectural challenge is therefore larger than deciding which AI model or coding tool should perform a task.

The challenge is defining **engineering intent, governance, validation, and evidence independently from the contributor performing the work**.

When workflows are built directly around a specific contributor, IDE, vendor, or execution mechanism, several problems emerge:

- engineering workflows become coupled to individual tools
- governance is duplicated across contributor types
- execution boundaries become inconsistent
- observability becomes fragmented
- validation standards vary by implementation
- contributor changes require workflow redesign
- human review is added inconsistently
- automation complexity grows before it provides measurable value

This project explores a different approach.

The goal is to separate **engineering intent** from **engineering contribution** through reusable contracts, deterministic governance, observable workflows, bounded execution, and reviewable evidence.

The architecture should remain useful regardless of whether a contribution is performed by a human, automation, a pipeline, an AI agent, or a future technology.

---

## Core Principles

### Contributor- and Vendor-Neutral Contracts

Engineering workflows should not depend on one contributor type, AI provider, IDE, SDLC platform, or execution technology.

Core concepts such as work items, contributor profiles, policies, evidence, approvals, and execution environments should be modeled independently from contributor-specific implementations.

### Engineering Defines the Workflow

Contributors participate in engineering workflows.

They do not define them.

A workflow should describe the engineering outcome, constraints, validation, and evidence required without assuming which contributor will perform the work.

### Deterministic Governance

Important engineering constraints should not rely only on contributor instructions or probabilistic reasoning.

Policies such as:

- repository scope
- branch restrictions
- tool permissions
- required validation
- approval gates
- destructive-action limits
- retry limits

should be enforced through deterministic controls wherever possible.

### Bounded Contribution

Contributors should receive only the capabilities required for their assigned responsibility.

Execution should follow least-privilege principles using:

- explicit capability boundaries
- scoped credentials
- bounded retries
- defined execution environments
- controlled handoffs

### Observability by Default

Engineering workflows should produce evidence describing what occurred regardless of contributor type.

Useful telemetry may include:

- contributors invoked
- contributor type
- tools or capabilities used
- skills or guidance applied
- policy interactions
- workflow handoffs
- retries
- validation results
- execution artifacts
- human intervention
- final outcome

Observability should support both auditability and continuous improvement.

### Human Oversight

Automation should increase only where confidence, reversibility, and risk permit it.

High-risk, irreversible, ambiguous, or policy-sensitive actions should support human review or approval before completion.

Humans remain contributors within the architecture rather than being treated only as exception handlers.

### Simple Before Complex

Not every task requires an AI agent.

Not every agentic task requires multiple agents.

The architecture should support a progression from:

1. human contribution
2. deterministic automation
3. pipeline execution
4. single-agent contribution
5. specialized contributors
6. coordinated multi-contributor workflows

Complexity should be introduced only when it produces measurable engineering value.

### Isolated Execution

Reasoning, orchestration, and execution should be separated where practical.

Execution environments may include:

- local workspaces
- Docker containers
- virtual machines
- CI runners
- cloud sandboxes
- external systems

Isolation should be chosen according to risk, contributor capability, and workflow requirements.

### Evidence-Driven Validation

Successful execution is not the same as successful engineering.

Workflows should validate the intended outcome using appropriate evidence such as:

- automated tests
- static analysis
- policy checks
- runtime validation
- screenshots
- logs
- diffs
- task-specific evaluations
- human review

Failure causes should be emitted by the architectural layer that directly observes the failure rather than reconstructed later from downstream evidence.

Absence of engineering-success evidence should not be treated as proof of engineering failure when the workflow never reached the required validation boundary.

Evaluation applicability should be derived consistently from contribution or workflow run state rather than redefined independently by each scenario.

Structured evidence produced directly during a contribution should remain evidence through downstream evaluation rather than being reconstructed from weaker artifacts or telemetry.

### Incremental Delivery

Contributor orchestration should reinforce good software engineering practices rather than replace them.

Changes should remain:

- small
- reviewable
- testable
- observable
- reversible where practical

The architecture should support iterative delivery and continuous improvement rather than large autonomous changes with limited visibility.

---

## Reference Flow

```text
Request Source
    │
    ▼
Normalized Work Item
    │
    ▼
Engineering Intent
    │
    ▼
Policy / Preflight
    │
    ▼
Engineering Workflow
    │
    ▼
Contribution Strategy
    │
    ├──────────────┬──────────────┬──────────────┐
    ▼              ▼              ▼              ▼
  Human         Automation      Pipeline       AI Agent
    │              │              │              │
    └──────────────┴──────────────┴──────────────┘
                           │
                           ▼
                 Execution Environment
                           │
                           ▼
                   Validation / Evals
                           │
                           ▼
                   Evidence Collection
                           │
                    ┌──────┴──────┐
                    ▼             ▼
                 Delivery     Human Review
                    │             │
                    └──────┬──────┘
                           ▼
                     Final Outcome
```

---

## Core Abstractions

The reference architecture is centered around a small set of reusable engineering concepts.

### `WorkItem`

A normalized representation of engineering work independent of where the request originated.

Sources may include:

- GitHub issue
- GitLab issue
- Jira ticket
- Slack request
- CLI command
- API request
- human request
- automated event

### `EngineeringIntent`

A contributor-neutral description of the desired engineering outcome.

Intent describes **what must be accomplished**, not who or what should accomplish it.

### `Workflow`

The defined engineering path used to satisfy a work item.

A workflow may contain deterministic, human, automated, or agentic contributions.

### `Contributor`

An actor capable of performing an engineering contribution.

Examples include:

- human engineer
- automation framework
- CI/CD pipeline
- script
- external service
- AI agent

### `ContributorProfile`

A description of a contributor's role, capabilities, constraints, and responsibilities within a workflow.

Examples may include:

- planner
- implementer
- reviewer
- validator
- documentation contributor
- deployment contributor

The same role may be fulfilled by different contributor types.

### `Contribution`

A bounded unit of engineering work performed by a contributor.

Examples include:

- planning
- implementation
- review
- validation
- investigation
- documentation
- deployment

### `Skill`

Reusable domain knowledge or procedural guidance that may support a contributor.

### `Tool`

An executable capability exposed to a contributor or workflow.

Examples may include:

- filesystem access
- source control
- test execution
- APIs
- browser automation
- MCP servers
- deployment systems

### `Policy`

A deterministic constraint applied to engineering work.

Examples may include:

- repository scope
- allowed branches
- contributor permissions
- required tests
- approval gates
- retry limits
- deployment restrictions

### `ContributionStrategy`

The mechanism used to determine which contributor or combination of contributors should perform a contribution.

Selection may consider:

- capability
- risk
- policy
- cost
- availability
- confidence
- execution environment

### `ExecutionEnvironment`

The environment in which a contribution is executed.

Possible implementations include:

- developer workspace
- Docker container
- CI runner
- virtual machine
- cloud sandbox
- external service

### `Evidence`

Structured proof of what occurred during a contribution or workflow.

Examples may include:

- test results
- logs
- screenshots
- diffs
- commands executed
- contributor handoffs
- policy decisions
- approvals
- evaluation outcomes

Evidence produced directly by an executor may remain attached to its execution result and be preserved by contribution orchestration.

### `Evaluation`

A task-level assessment of whether the intended engineering outcome was achieved.

Evaluation may also be inconclusive when contribution or workflow state shows that the required engineering validation boundary was never reached.

### `Handoff`

The transfer of responsibility, context, or evidence between contributors.

### `Approval`

Explicit authorization required before controlled work may continue.

### `Adapter`

An implementation that connects the core architecture to a contributor, platform, or external system.

Potential adapters may include:

- GitHub
- GitLab
- Jira
- Cursor
- Claude Code
- OpenAI Codex
- GitHub Copilot
- GitLab Duo
- MCP
- Docker
- CI/CD platforms

---

## Repository Goals

This repository evolves through small, testable iterations.

Planned areas include:

- architecture principles
- engineering workflow contracts
- contributor contracts
- contribution strategies
- deterministic governance
- execution boundaries
- evidence and provenance models
- evaluation strategies
- human review patterns
- contributor and SDLC adapters
- isolated execution examples
- reference workflows
- observability
- practical multi-contributor orchestration

The project prioritizes architectural clarity, engineering reasoning, and measurable value over feature count.

---

## What This Project Is Not

This repository is not intended to be:

- a production-ready autonomous coding platform
- a replacement for existing engineering or AI tools
- a recommendation that every workflow should use AI
- a recommendation that every agentic workflow should use multiple agents
- a vendor-specific agent framework
- a copy of any private or employer-specific implementation
- a large framework built before its abstractions are understood

The purpose is to explore reusable engineering patterns and document the reasoning behind them.

---

## Design Philosophy

Every architectural decision in this repository should answer:

> Why does this abstraction exist?

Two additional rules guide the architecture:

> The contributor is not the workflow.

> The platform is not the architecture.

Engineering systems should define intent, governance, validation, and evidence independently from the contributor selected to perform the work.

The goal is to explore how modern engineering systems can remain:

- understandable
- maintainable
- observable
- secure
- portable
- reviewable
- adaptable over time

AI is an important contributor within that system, but it is not the system itself.

---

## Architecture Decisions

Major architectural choices are documented through Architecture Decision Records.

Current decisions:

- `ADR-0001` — Keep the core architecture contributor- and vendor-neutral
- `ADR-0002` — Separate engineering intent from engineering contribution

Future decisions will be added only when an architectural choice has been exercised enough to justify a durable decision record.

Current implementation experiments are documented separately through focused review records under `docs/reviews/`.

---

## Status

Active reference architecture under incremental development.

The project began with principles and contracts and now includes executable reference implementations that pressure-test those architectural claims.

Current milestones:

- [x] Define project purpose
- [x] Establish contributor- and vendor-neutral principles
- [x] Define the initial reference flow
- [x] Establish foundational architecture decisions
- [x] Separate engineering intent from engineering contribution
- [x] Formalize core engineering contracts
- [x] Implement deterministic governance
- [x] Implement bounded capability authorization
- [x] Capture structured governance and execution evidence
- [x] Implement deterministic evidence evaluation
- [x] Resolve evaluations into workflow outcomes
- [x] Demonstrate contributor substitutability
- [x] Implement contributor selection strategy
- [x] Validate reference-scenario engineering outcomes against explicit acceptance checks
- [x] Link contributor-produced results to engineering outcomes
- [x] Preserve validator-produced evidence through multi-stage evaluation
- [x] Execute multi-stage workflows
- [x] Implement bounded handoffs between workflow stages
- [x] Make workflow progression dependency-driven
- [x] Handle multiple upstream dependencies and fan-in
- [x] Select contributors independently across workflow stages
- [x] Preserve per-stage capability and policy boundaries
- [x] Preserve failure causality through terminal workflow outcomes
- [x] Emit structured contribution failure causes at the contribution boundary
- [x] Distinguish failed engineering validation from unreachable evaluation
- [x] Centralize evaluation applicability decisions across reference scenarios
- [ ] Introduce approval boundaries
- [ ] Add an isolated execution environment
- [ ] Add an SDLC platform adapter
- [ ] Demonstrate multiple real contributor technologies

---

## Source Availability

This repository is publicly available for portfolio and reference purposes. No open-source license is currently granted.