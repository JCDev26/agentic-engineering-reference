# ADR-0001: Keep the Core Architecture Contributor- and Vendor-Neutral

- **Status:** Accepted
- **Date:** 2026-08-07
- **Decision Owners:** Project Maintainer

---

# Context

Modern software engineering is no longer performed exclusively by humans.

Engineering work may now be performed by multiple types of contributors, including:

- software engineers
- AI agents
- automation frameworks
- CI/CD pipelines
- scripts
- external services
- future execution technologies

Likewise, engineering platforms continue to evolve rapidly.

Different platforms expose similar capabilities using different terminology and implementation models, including:

- agents
- subagents
- skills
- rules
- hooks
- workflows
- MCP servers
- cloud execution environments
- coding assistants
- approval mechanisms

These capabilities currently exist across platforms such as Cursor, Claude Code, OpenAI Codex, GitHub, GitLab, and others.

Building engineering workflows directly around the vocabulary or configuration model of one contributor or platform can accelerate initial development, but it also introduces architectural coupling.

That coupling makes it more difficult to:

- evolve engineering workflows
- adopt new contributors
- migrate between platforms
- standardize governance
- normalize observability
- compare execution consistently
- preserve long-term maintainability

The underlying engineering problem is larger than any individual contributor or vendor.

---

# Decision

The core architecture will remain independent of:

- contributor type
- AI provider
- IDE
- SDLC platform
- execution technology

Humans, AI agents, automation frameworks, pipelines, scripts, and external systems are all treated as **contributors** participating in a shared engineering system.

No contributor defines the architecture.

Instead, contributors interact through common engineering contracts.

Examples include:

- `WorkItem`
- `Workflow`
- `Contributor`
- `ContributorProfile`
- `Skill`
- `Tool`
- `Policy`
- `ExecutionEnvironment`
- `Evidence`
- `Evaluation`
- `Handoff`
- `Approval`
- `Adapter`

Vendor-specific platforms integrate through adapters rather than defining the internal architecture.

For example:

    GitHub Issue
          │
          ▼
    GitHub Adapter
          │
          ▼
      WorkItem
          │
          ▼
      Workflow
          │
          ▼
    Contribution System

The same workflow could instead originate from:

- Jira
- GitLab
- Slack
- CLI
- API
- IDE
- Future platforms

Likewise, contributions may eventually be performed by:

- Human engineers
- Cursor
- Claude Code
- OpenAI Codex
- GitHub Copilot
- GitLab Duo
- CI/CD pipelines
- Existing automation
- Future contributors

without requiring the engineering workflow itself to change.

---

# Why This Decision Was Made

## Portability

Engineering workflows should survive changes in contributors, vendors, tools, and execution environments.

## Maintainability

Business and engineering rules should not need to be rewritten whenever contributor technology evolves.

## Testability

Platform-independent contracts make workflows, governance, and evaluation easier to test independently from specific integrations.

## Observability

A normalized architecture makes it possible to compare engineering outcomes across different contributors.

Examples include:

- task completion
- validation success
- retries
- execution cost
- tool usage
- evidence collected
- handoffs
- policy decisions
- human intervention

## Governance

Security, engineering policy, and organizational standards should be enforced consistently regardless of which contributor performs the work.

## Evolution

Contributor technology will continue to evolve.

The engineering architecture should evolve independently from contributor implementation details.

---

# Alternatives Considered

## Build Directly Around One Platform

Example:

    Cursor
      ├── Rules
      ├── Skills
      ├── Commands
      └── Hooks

### Advantages

- rapid implementation
- direct access to platform capabilities
- reduced abstraction

### Disadvantages

- strong platform coupling
- governance tied to vendor implementation
- migration cost
- reduced portability
- inconsistent engineering model

This approach may be appropriate for individual projects, but it is not the foundation chosen for this reference architecture.

---

## Create a Lowest-Common-Denominator Abstraction

Another option would expose only capabilities supported identically by every platform.

### Advantages

- high portability
- simple conceptual model

### Disadvantages

- limits useful platform capabilities
- discourages innovation
- forces architecture toward the weakest shared feature set

Instead, the core architecture remains neutral while adapters are free to expose platform-specific capabilities.

---

# Consequences

## Positive

- engineering workflows evolve independently from contributors
- new contributors integrate through adapters
- governance remains consistent
- observability becomes normalized
- evaluation compares outcomes instead of implementations
- architecture remains easier to understand and maintain

## Negative

- additional abstraction requires maintenance
- adapter development introduces implementation overhead
- contributor capabilities may require extension points

These tradeoffs are intentional.

The objective is not perfect portability.

The objective is to prevent contributor implementation details from becoming the engineering architecture.

---

# Guardrail

Contributor neutrality does **not** prohibit contributor-specific capabilities.

Adapters may leverage features such as:

- Cursor Hooks
- GitHub Custom Agents
- GitLab Flows
- Claude Code Skills
- OpenAI Tool Calling
- MCP
- Containerized execution
- Cloud sandboxes

when those capabilities provide value.

The architectural rule is:

> Contributor- and vendor-specific capabilities may extend the system, but they must never define its core engineering contracts.

---

# Validation

This decision will be considered successful if the reference architecture can demonstrate the same engineering workflow:

- across multiple platform adapters
- across multiple contributor types

without changing the underlying engineering contracts.

---

# Future Considerations

Future ADRs should define:

- separation of engineering intent from engineering contribution
- deterministic governance
- execution boundaries
- evidence and provenance
- human approval
- evaluation strategy
- contributor specialization
- orchestration complexity
