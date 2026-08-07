# ADR-0001: Keep the Core Architecture Vendor-Neutral

- **Status:** Accepted
- **Date:** 2026-08-07
- **Decision Owners:** Project Maintainer

## Context

AI-assisted engineering platforms are evolving quickly.

Different tools expose similar capabilities through different concepts:

- agents
- subagents
- skills
- rules
- hooks
- MCP servers
- workflows
- cloud execution environments
- coding assistants
- approval mechanisms

These capabilities currently exist across platforms such as Cursor, Claude Code, OpenAI Codex, GitHub, GitLab, and others.

Building engineering workflows directly around the vocabulary or configuration model of one platform can make initial adoption easier, but it also creates architectural coupling.

That coupling can make it difficult to:

- move workflows between platforms
- adopt new AI providers
- reuse engineering governance
- compare agent performance consistently
- preserve observability across tools
- standardize execution boundaries
- evolve internal workflows independently from vendor changes

The underlying engineering problem is larger than any individual AI product.

## Decision

The core architecture will remain vendor-neutral.

Core engineering concepts will be represented using platform-independent contracts and abstractions.

Examples include:

- `WorkItem`
- `Workflow`
- `AgentProfile`
- `Skill`
- `Tool`
- `Policy`
- `ExecutionEnvironment`
- `Evidence`
- `Evaluation`
- `Handoff`
- `Approval`
- `Adapter`

Vendor-specific platforms will integrate through adapters rather than defining the internal architecture.

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
     Orchestrator

The same internal workflow could instead originate from:

    Jira
    GitLab
    Slack
    CLI
    API
    IDE Agent

Likewise, execution may eventually be performed through:

    Cursor
    Claude Code
    Codex
    GitHub Copilot
    GitLab Duo
    Custom Agents

without requiring the core workflow model to be redesigned.

## Why This Decision Was Made

### Portability

Engineering workflows should survive changes in tools, vendors, and model providers.

### Maintainability

Business and engineering rules should not need to be rewritten every time an AI platform changes its configuration model.

### Testability

Platform-independent contracts make orchestration, policy, and evaluation easier to test without requiring live vendor integrations.

### Observability

A normalized architecture makes it possible to compare execution data across providers.

Examples include:

- task completion
- tool usage
- retries
- handoffs
- human intervention
- policy decisions
- validation outcomes
- execution cost

### Governance

Security and engineering policies can be enforced consistently regardless of which model or agent platform performs the work.

### Evolution

AI tooling is changing too quickly for architectural ownership to live inside a single vendor's implementation.

The system should be able to adopt new capabilities without redesigning its fundamental engineering model.

## Alternatives Considered

### Build Directly Around One AI Platform

Example:

    Cursor
      ├── Rules
      ├── Skills
      ├── Commands
      └── Hooks

#### Advantages

- faster initial development
- direct access to platform-native features
- less abstraction
- simpler onboarding for teams already using that platform

#### Disadvantages

- strong vendor coupling
- migration cost if tooling changes
- governance becomes platform-specific
- difficult cross-platform evaluation
- architecture may inherit vendor limitations

This approach may be appropriate for small or short-lived workflows, but it is not the foundation selected for this reference architecture.

---

### Create a Lowest-Common-Denominator Abstraction

Another approach would be to expose only capabilities supported identically by every platform.

#### Advantages

- high portability
- simple conceptual model

#### Disadvantages

- prevents use of valuable platform-specific capabilities
- abstraction may become overly restrictive
- emerging features could not be adopted effectively

This project will not attempt to hide every vendor difference.

Instead, the core will remain neutral while adapters may expose platform-specific capabilities when useful.

## Consequences

### Positive

- workflows can evolve independently from vendors
- new providers can be integrated through adapters
- governance remains consistent
- evaluation can use normalized evidence
- architecture becomes easier to reason about and test

### Negative

- additional abstraction must be maintained
- adapter development creates implementation overhead
- vendor-specific capabilities may require extension points
- some integrations may not map perfectly to normalized contracts

These tradeoffs are intentional.

The goal is not perfect portability.

The goal is to prevent vendor implementation details from becoming the architecture itself.

## Guardrail

Vendor neutrality does **not** mean avoiding vendor-specific features.

A platform adapter may use capabilities such as:

- Cursor hooks
- GitHub custom agents
- GitLab flows
- Claude Code skills
- OpenAI tool calling
- MCP servers
- platform-specific sandboxing

when they provide value.

The architectural rule is:

> Vendor-specific capabilities may extend the system, but they should not define its core engineering contracts.

## Validation

This decision will be considered successful if the reference architecture can demonstrate the same conceptual workflow through at least two different platform adapters without changing the underlying workflow contracts.

## Future Considerations

Future ADRs should define:

- separation of engineering intent from execution
- deterministic policy enforcement
- evidence and provenance requirements
- execution isolation
- human approval boundaries
- evaluation strategy
- agent specialization and orchestration complexity
