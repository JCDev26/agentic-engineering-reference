# Agentic Engineering Reference

A vendor-neutral reference architecture for AI-assisted software engineering, automation governance, and developer productivity.

## Why This Exists

AI-assisted development workflows are increasingly tied to individual IDEs, model providers, and agent platforms.

That makes it easy to move quickly at first, but it can also create long-term problems:

- engineering workflows become coupled to one vendor or tool
- governance is implemented differently across platforms
- agent behavior becomes difficult to observe and audit
- execution boundaries are unclear
- human review is added inconsistently
- workflows become harder to evolve as tools change
- multi-agent complexity is introduced before it is actually needed

This project explores a different approach.

The goal is to separate **engineering intent** from **execution** through reusable contracts, deterministic governance, observable workflows, isolated execution environments, and reviewable evidence.

The architecture is designed to remain useful even as models, IDEs, and agent platforms evolve.

---

## Core Principles

### Vendor-Neutral Contracts

Engineering workflows should not depend on one AI provider, IDE, or orchestration platform.

Core concepts such as work items, policies, evidence, approvals, and execution environments should be modeled independently from vendor-specific implementations.

### Deterministic Governance

Important engineering constraints should not rely only on model instructions.

Policies such as allowed tools, repository scope, branch restrictions, required validation, approval gates, and destructive-action limits should be enforced through deterministic controls wherever possible.

### Bounded Execution

Agents should receive only the capabilities required to complete their assigned task.

Execution should follow least-privilege principles with explicit tool access, scoped credentials, bounded retries, and clearly defined environments.

### Observability by Default

Agentic workflows should produce evidence that explains what happened.

Useful telemetry may include:

- agents or subagents invoked
- tools and skills used
- policy or hook interactions
- workflow handoffs
- retries
- validation results
- execution artifacts
- human intervention
- final outcome

Observability should support both auditability and continuous improvement.

### Human Oversight

Autonomy should increase only where confidence and risk allow it.

High-risk, irreversible, ambiguous, or policy-sensitive actions should support human review or approval before completion.

### Simple Before Complex

Not every task requires multiple agents.

The architecture should support a progression from:

1. deterministic automation
2. single-agent workflows
3. specialized subagents
4. multi-agent orchestration

Complexity should be introduced only when it provides measurable value.

### Isolated Execution

Agent reasoning and code execution should be separated from the host environment whenever practical.

Reference implementations may use local sandboxes, containers, virtual machines, or cloud execution environments.

### Evidence-Driven Validation

Successful execution is not the same as successful completion.

Workflows should validate the actual engineering outcome using tests, policies, static checks, runtime evidence, or task-specific evaluation before delivery.

### Incremental Delivery

Agentic development should reinforce good software engineering practices rather than replace them.

Changes should remain small, reviewable, testable, and aligned with normal software delivery processes.

---

## Reference Flow

    Request Source
         │
         ▼
    Normalized Work Item
         │
         ▼
    Policy / Preflight
         │
         ▼
    Orchestrator
         │
         ├───────────────┐
         │               │
         ▼               ▼
    Deterministic     Agentic
    Workflow          Workflow
                         │
                ┌────────┼────────┐
                ▼        ▼        ▼
             Planner  Executor  Validator
                │        │        │
                └────────┴────────┘
                         │
                         ▼
                    Tools / MCP
                         │
                         ▼
                Execution Environment
              Local / Container / Cloud
                         │
                         ▼
                 Validation / Evals
                         │
                         ▼
                 Evidence Collection
                         │
                 ┌───────┴───────┐
                 ▼               ▼
              Delivery       Human Review
                 │               │
                 └───────┬───────┘
                         ▼
                    Final Outcome

---

## Core Abstractions

The reference architecture is centered around a small set of reusable concepts.

### `WorkItem`

A normalized description of the engineering task, independent of where the request originated.

Examples may include:

- GitHub issue
- GitLab issue
- Jira ticket
- Slack request
- CLI command
- API request

### `Workflow`

The defined path used to complete a work item.

A workflow may be deterministic, agentic, or a combination of both.

### `AgentProfile`

A specialized reasoning role with a clearly defined purpose, context, and capability boundary.

Examples may include:

- planner
- implementer
- validator
- reviewer
- documentation agent

### `Skill`

Reusable domain knowledge or procedural guidance that can support an agent or workflow.

### `Tool`

An executable capability exposed to an agent or workflow.

Examples may include:

- filesystem access
- source control
- test execution
- APIs
- browser automation
- MCP servers

### `Policy`

A deterministic constraint applied to execution.

Examples may include:

- repository scope
- allowed branches
- tool permissions
- required tests
- approval gates
- retry limits

### `ExecutionEnvironment`

The isolated environment in which work is performed.

Possible implementations include:

- local workspace
- Docker container
- virtual machine
- cloud sandbox

### `Evidence`

Structured proof of what occurred during execution.

Examples may include:

- test results
- logs
- screenshots
- diffs
- commands executed
- agent handoffs
- policy decisions

### `Evaluation`

A task-level assessment of whether the intended engineering outcome was achieved.

### `Handoff`

The transfer of responsibility or context between agents, workflows, or humans.

### `Approval`

Explicit authorization required before a controlled action can continue.

### `Adapter`

A vendor- or platform-specific implementation that connects the reference architecture to an external system.

Potential adapters may include:

- GitHub
- GitLab
- Jira
- Cursor
- Claude Code
- OpenAI Codex
- MCP
- Docker

---

## Repository Goals

This repository will evolve through small, testable iterations.

Planned areas include:

- architecture principles
- workflow contracts
- governance patterns
- execution boundaries
- observability and evidence models
- human review patterns
- agent and SDLC adapters
- containerized execution examples
- reference workflows
- practical evaluation strategies

The project will prioritize clarity and architectural reasoning over feature count.

---

## What This Project Is Not

This repository is not intended to be:

- a production-ready autonomous coding platform
- a replacement for existing AI coding tools
- a recommendation that every workflow should use multiple agents
- a vendor-specific agent framework
- a copy of any private or employer-specific implementation
- a large framework built before the problem is understood

The purpose is to explore reusable engineering patterns and document the reasoning behind them.

---

## Design Philosophy

Every architectural decision in this repository should answer:

> Why does this abstraction exist?

The goal is not simply to demonstrate how to build agentic software.

The goal is to explore how AI-assisted engineering systems can remain:

- understandable
- maintainable
- observable
- secure
- portable
- reviewable
- adaptable over time

---

## Status

Early reference architecture.

The project is intentionally beginning with principles and contracts before implementation.

Initial milestones:

- [x] Define project purpose
- [x] Establish architecture principles
- [x] Define the initial reference flow
- [ ] Formalize core contracts
- [ ] Define execution and governance boundaries
- [ ] Add evidence and evaluation models
- [ ] Build a minimal reference implementation
- [ ] Add a containerized execution example
- [ ] Add an SDLC integration example

---

## License

MIT
