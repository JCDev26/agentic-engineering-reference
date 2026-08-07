# Core Engineering Contracts

## Purpose

This document defines the initial technology-neutral contracts for the Engineering Contribution Architecture.

The contracts translate the domain language into stable interfaces that can later be implemented by different platforms, contributors, and execution technologies.

These contracts are intentionally independent of:

- programming language
- AI provider
- IDE
- source control platform
- CI/CD platform
- automation framework
- execution environment
- contributor type

The goal is not to define implementation syntax.

The goal is to define the minimum information and behavior the architecture requires.

---

# Contract Design Principles

The contracts should follow several rules.

## Stable Before Specific

Core contracts should model engineering responsibilities rather than vendor terminology.

## Explicit Boundaries

Contributors should receive explicit scope, capabilities, policies, and completion criteria.

## Evidence Over Assumption

Important decisions and outcomes should be supported by structured evidence.

## Small Contracts

Contracts should remain focused.

A single object should not become responsible for orchestration, execution, policy, and evaluation simultaneously.

## Extensible Without Redesign

Platform-specific implementations may add metadata or extensions without changing the meaning of the core contract.

---

# `WorkItem`

Represents engineering work entering the system.

## Required Fields

### `id`

Stable identifier for the normalized work item.

### `title`

Short human-readable description of the work.

### `description`

Detailed source description.

### `source`

Identifies where the work originated.

Examples:

- GitHub
- GitLab
- Jira
- Slack
- CLI
- API
- scheduled event
- human request

### `intent`

Reference to the normalized `EngineeringIntent`.

## Optional Fields

### `priority`

Relative urgency or ordering information.

### `metadata`

Source-specific contextual information.

### `artifacts`

References to relevant documents, code, screenshots, logs, or other input material.

### `relationships`

References to related work items or dependencies.

---

# `EngineeringIntent`

Defines the contributor-neutral engineering outcome.

## Required Fields

### `objective`

What must be accomplished.

### `acceptanceCriteria`

Conditions that determine whether the intended outcome has been achieved.

### `constraints`

Known boundaries that must be respected.

Examples:

- repository scope
- compatibility requirements
- environment restrictions
- security requirements
- performance constraints

### `validationRequirements`

The validation expected before the workflow can be considered successful.

### `evidenceRequirements`

The evidence required to support evaluation and review.

## Optional Fields

### `riskLevel`

Relative risk associated with the work.

### `businessContext`

Relevant product or organizational context.

### `nonGoals`

Explicitly identifies outcomes the work should not attempt to achieve.

---

# `Workflow`

Defines the engineering responsibilities required to satisfy an intent.

## Required Fields

### `id`

Stable workflow identifier.

### `intentId`

Reference to the associated engineering intent.

### `stages`

Ordered or dependency-aware collection of workflow stages.

### `completionCriteria`

Conditions required for the workflow itself to be complete.

## Workflow Stage

Each workflow stage should define:

- stage identifier
- responsibility
- expected contribution
- dependencies
- applicable policies
- evidence requirements
- completion criteria

A workflow stage should not require a specific contributor unless policy explicitly requires one.

---

# `Contribution`

Represents one bounded unit of engineering work.

## Required Fields

### `id`

Stable contribution identifier.

### `workflowId`

Workflow to which the contribution belongs.

### `stageId`

Workflow stage being fulfilled.

### `objective`

Specific responsibility assigned to this contribution.

### `scope`

Defines what the contributor may affect.

### `contributorProfile`

The role under which the selected contributor operates.

### `capabilities`

Capabilities made available to the contributor.

### `policies`

Policies that govern the contribution.

### `evidenceRequirements`

Evidence that must be produced.

### `completionCriteria`

Conditions that indicate the contribution is ready for evaluation.

## Optional Fields

### `timeout`

Maximum permitted duration.

### `retryPolicy`

Rules governing retries.

### `resourceBudget`

Limits involving compute, tokens, cost, or other constrained resources.

### `executionEnvironment`

Required or preferred execution environment.

---

# `Contributor`

Represents an actor capable of performing engineering work.

## Required Fields

### `id`

Stable contributor identifier.

### `type`

Contributor category.

Initial types may include:

- human
- AI
- automation
- pipeline
- script
- external-service

### `capabilities`

Capabilities the contributor can support.

### `availability`

Whether the contributor is currently eligible for selection.

## Optional Fields

### `provider`

Implementation provider or platform.

Examples may include:

- human organization
- OpenAI
- Anthropic
- GitHub
- GitLab
- internal service

### `metadata`

Implementation-specific information.

### `performanceProfile`

Historical information that may assist contribution selection.

---

# `ContributorProfile`

Defines the engineering role under which a contributor operates.

## Required Fields

### `id`

Stable profile identifier.

### `role`

Responsibility represented by the profile.

Examples:

- planner
- implementer
- reviewer
- validator
- investigator
- documenter
- deployer

### `responsibilities`

What the profile is expected to accomplish.

### `allowedCapabilities`

Capabilities permitted for contributors using the profile.

### `requiredPolicies`

Policies always applied to this profile.

## Optional Fields

### `guidance`

Reusable procedural guidance.

### `preferredContributorTypes`

Contributor types commonly suited to the profile.

This is advisory unless enforced by policy.

---

# `Capability`

Defines an action a contributor may perform.

## Required Fields

### `id`

Stable capability identifier.

### `action`

Action the capability permits.

Examples:

- source.read
- source.write
- test.execute
- browser.interact
- api.call
- source.create-branch
- source.create-review
- deployment.execute

### `scope`

Boundary within which the capability may be exercised.

## Optional Fields

### `conditions`

Additional conditions required before use.

### `resourceLimits`

Limits on frequency, duration, cost, or other resources.

---

# `Tool`

Represents the implementation mechanism used to exercise one or more capabilities.

## Required Fields

### `id`

Stable tool identifier.

### `capabilities`

Capabilities exposed by the tool.

### `adapter`

Implementation responsible for connecting the tool to the core architecture.

## Optional Fields

### `configuration`

Implementation-specific configuration.

### `health`

Current availability or readiness state.

---

# `Skill`

Represents reusable procedural or domain guidance.

## Required Fields

### `id`

Stable skill identifier.

### `purpose`

What knowledge or procedure the skill provides.

### `content`

Guidance made available to a contributor.

## Optional Fields

### `applicableProfiles`

Contributor profiles for which the skill is relevant.

### `version`

Skill version for traceability.

Skills provide guidance.

They do not override policy.

---

# `Policy`

Represents deterministic engineering constraints.

## Required Fields

### `id`

Stable policy identifier.

### `rule`

Constraint to be enforced.

### `scope`

Where the policy applies.

### `enforcementPoint`

Where enforcement occurs.

Examples:

- preflight
- capability request
- tool invocation
- workflow transition
- delivery
- deployment

### `failureBehavior`

What happens when the policy is violated.

Examples:

- deny
- require approval
- escalate
- retry
- terminate workflow

## Optional Fields

### `severity`

Relative importance of the policy.

### `evidenceRequirement`

Evidence that should be recorded when the policy is evaluated.

---

# `ExecutionEnvironment`

Defines where executable contribution activity occurs.

## Required Fields

### `id`

Stable environment identifier.

### `type`

Environment category.

Examples:

- local
- container
- CI runner
- virtual machine
- cloud sandbox
- external service

### `capabilities`

Capabilities exposed by the environment.

### `isolationLevel`

Expected isolation boundary.

## Optional Fields

### `resourceLimits`

Compute, memory, time, or cost constraints.

### `networkPolicy`

Network access restrictions.

### `credentialPolicy`

Credential exposure rules.

### `lifecycle`

Rules for creation, reuse, and destruction.

---

# `Evidence`

Represents structured proof produced during engineering work.

## Required Fields

### `id`

Stable evidence identifier.

### `contributionId`

Contribution that produced the evidence.

### `type`

Evidence category.

Examples:

- test-result
- source-diff
- log
- screenshot
- recording
- command-output
- policy-result
- approval
- handoff
- evaluation-result

### `timestamp`

When the evidence was produced.

### `contentReference`

Reference to the evidence payload.

## Optional Fields

### `producer`

Contributor or system that produced the evidence.

### `metadata`

Additional contextual information.

### `integrity`

Information used to establish evidence integrity or provenance.

---

# `Evaluation`

Determines whether a contribution or workflow achieved its expected result.

## Required Fields

### `id`

Stable evaluation identifier.

### `target`

Contribution, stage, or workflow being evaluated.

### `criteria`

Conditions against which the target is evaluated.

### `evidence`

Evidence considered during evaluation.

### `result`

Evaluation result.

Initial result values may include:

- passed
- failed
- inconclusive
- requires-review

## Optional Fields

### `evaluator`

Human, deterministic system, or AI contributor performing the evaluation.

### `confidence`

Confidence value when evaluation is probabilistic.

### `findings`

Structured reasons supporting the result.

---

# `Handoff`

Represents transfer of responsibility or context.

## Required Fields

### `id`

Stable handoff identifier.

### `from`

Contributor or workflow stage transferring responsibility.

### `to`

Contributor or workflow stage receiving responsibility.

### `context`

Information required to continue the work.

### `evidence`

Evidence transferred with the handoff.

## Optional Fields

### `reason`

Why the handoff occurred.

### `requirements`

Conditions the receiving contributor must satisfy.

---

# `Approval`

Represents explicit authorization for controlled work.

## Required Fields

### `id`

Stable approval identifier.

### `subject`

Action or transition requiring approval.

### `status`

Approval state.

Initial states may include:

- requested
- approved
- rejected
- expired

### `authority`

Actor or policy capable of granting approval.

## Optional Fields

### `conditions`

Conditions associated with the approval.

### `evidence`

Evidence supporting the approval decision.

---

# `Outcome`

Represents the final engineering state of a workflow.

## Required Fields

### `workflowId`

Workflow that produced the outcome.

### `status`

Final state.

Initial values may include:

- completed
- failed
- rejected
- escalated
- cancelled
- no-change-required

### `summary`

Human-readable description of the result.

### `evidence`

Evidence supporting the final state.

## Optional Fields

### `deliveredArtifacts`

Artifacts produced by the workflow.

### `followUpWork`

Additional work identified during execution.

---

# `Adapter`

Connects external systems or implementations to the core architecture.

## Required Responsibilities

An adapter should:

- translate external concepts into core contracts
- translate core requests into implementation-specific actions
- preserve core policy boundaries
- produce normalized evidence
- expose implementation capability without redefining the domain

Examples may include:

- GitHub adapter
- GitLab adapter
- Jira adapter
- AI contributor adapter
- Playwright tool adapter
- Docker execution adapter

Adapters belong at the architecture boundary.

They should not introduce vendor-specific concepts into core contracts unless represented through generic extension metadata.

---

# Example Contract Flow

A GitHub issue might enter the system as:

    GitHub Issue
        ↓
    GitHub Adapter
        ↓
    WorkItem
        ↓
    EngineeringIntent
        ↓
    Workflow

A workflow stage might produce:

    Contribution
        ↓
    ContributionStrategy
        ↓
    Contributor + ContributorProfile
        ↓
    Capability + Policy
        ↓
    Tool
        ↓
    ExecutionEnvironment

Execution produces:

    Evidence
        ↓
    Evaluation
        ↓
    Handoff / Approval / Next Contribution

The completed workflow produces:

    Outcome

---

# Contract Invariants

The following rules apply across implementations.

## Contracts describe engineering, not vendors.

Vendor-specific information belongs at adapter boundaries or optional metadata.

## Contribution scope must be explicit.

Contributors should not infer unlimited authority from broad task descriptions.

## Capability must be intentionally granted.

Platform capability does not imply contributor permission.

## Policy overrides skill guidance.

Procedural guidance cannot override deterministic governance.

## Evidence should be attributable.

Important evidence should identify what produced it and what contribution it supports.

## Evaluation should reference evidence.

Engineering success should not rely solely on contributor self-reporting.

## Outcome belongs to the workflow.

Contributor execution status alone does not determine engineering success.

---

# Open Questions

The following questions are intentionally left unresolved until implementation provides evidence:

- Should all workflows require explicit `EngineeringIntent`, or may trivial work items embed intent directly?
- Should `ContributionStrategy` be represented as a contract or as orchestration behavior?
- Should capabilities use a hierarchical namespace?
- How should policy precedence be represented?
- What minimum provenance should `Evidence` require?
- How should confidence be normalized across probabilistic evaluators?
- Should `ContributorProfile` and `Skill` support version pinning?
- How should long-running workflows represent suspended state?

These questions should become ADRs only when a real architectural decision is required.

---

# Related Decisions

- ADR-0001: Keep the Core Architecture Contributor- and Vendor-Neutral
- ADR-0002: Separate Engineering Intent from Engineering Contribution
