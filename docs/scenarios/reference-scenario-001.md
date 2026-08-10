# Reference Scenario 001: Prevent Duplicate Usernames

## Purpose

This scenario validates the Engineering Contribution Architecture against a concrete software change.

The goal is to demonstrate that the same engineering intent and workflow can be fulfilled by different contributor strategies without changing the core engineering contracts.

This scenario intentionally uses a generic application domain and does not depend on any specific vendor, employer, repository, or platform.

---

## Engineering Request

A user-management application currently allows duplicate usernames to be created.

The requested change is:

> Prevent duplicate usernames from being created while preserving existing user creation behavior.

---

## Work Item

### `WorkItem`

- `id`: `WI-001`
- `title`: Prevent duplicate usernames
- `source`: Example issue tracker
- `priority`: Medium

### Description

The application should reject creation of a user when the requested username already exists.

Existing behavior for valid user creation must remain unchanged.

---

## Engineering Intent

### `EngineeringIntent`

#### Objective

Prevent duplicate usernames from being persisted.

#### Acceptance Criteria

1. A unique username can still be created successfully.
2. An existing username cannot be created again.
3. The application returns a clear validation response for duplicate usernames.
4. Existing user-creation behavior remains unchanged.
5. Automated validation demonstrates both successful and rejected creation paths.

#### Constraints

- Existing public behavior should not change for valid requests.
- The change should remain within the user-management domain.
- No unrelated refactoring is required.

#### Validation Requirements

- automated test for successful unique username creation
- automated test for duplicate username rejection
- regression validation for existing user creation behavior

#### Evidence Requirements

- source diff
- automated test results
- validation output
- review outcome

---

# Conceptual Workflow

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

The workflow is defined independently from contributor selection.

---

# Workflow Stages

## Stage 1: Investigate

### Responsibility

Determine:

- where username creation occurs
- where uniqueness should be enforced
- existing validation behavior
- relevant automated coverage

### Completion Criteria

Investigation identifies:

- likely change location
- relevant dependencies
- validation approach
- affected tests

### Required Evidence

- investigation summary

---

## Stage 2: Plan

### Responsibility

Define a bounded implementation approach.

### Completion Criteria

The plan identifies:

- files or components expected to change
- intended validation behavior
- required automated tests
- known risks

### Required Evidence

- implementation plan

---

## Stage 3: Implement

### Responsibility

Modify the application so duplicate usernames are rejected.

### Completion Criteria

- implementation matches engineering intent
- contribution remains within approved scope
- no unrelated changes are introduced

### Required Evidence

- source diff

---

## Stage 4: Validate

### Responsibility

Demonstrate that the engineering change satisfies its acceptance criteria.

### Completion Criteria

- unique username creation passes
- duplicate username creation is rejected
- existing user creation regression checks pass

### Required Evidence

- automated test results
- relevant logs or command output

---

## Stage 5: Review

### Responsibility

Evaluate the proposed change against:

- engineering intent
- scope
- implementation quality
- validation evidence
- applicable policy

### Completion Criteria

The change is either:

- approved
- rejected
- returned for additional work

### Required Evidence

- review result
- findings when applicable

---

## Stage 6: Deliver

### Responsibility

Deliver the approved engineering outcome to the selected external system.

Possible delivery mechanisms include:

- pull request
- merge request
- patch
- reviewed change artifact

Delivery is intentionally separate from implementation.

---

# Strategy A: Human-Led Contribution

This strategy uses a human engineer for most engineering responsibilities.

    Investigate  → Human Engineer
    Plan         → Human Engineer
    Implement    → Human Engineer
    Validate     → Automated Test Runner
    Review       → Human Reviewer
    Deliver      → Source Control Adapter

## Contributor Profiles

### Human Engineer

Responsibilities:

- investigate
- plan
- implement

Capabilities may include:

- source.read
- source.write
- test.execute

### Automated Validator

Responsibilities:

- execute deterministic validation

Capabilities may include:

- test.execute

### Human Reviewer

Responsibilities:

- review implementation and evidence
- approve or reject delivery

Capabilities may include:

- source.read
- review.approve
- review.reject

---

# Strategy B: AI-Assisted Contribution

This strategy uses AI for bounded engineering contributions while retaining deterministic validation and human review.

    Investigate  → AI Contributor
    Plan         → AI Contributor
    Implement    → AI Contributor
    Validate     → Automated Test Runner
    Review       → Human Reviewer
    Deliver      → Source Control Adapter

The engineering intent does not change.

The workflow does not change.

Only contributor selection changes.

---

# Strategy C: Collaborative Contribution

This strategy distributes responsibilities across human, AI, and deterministic automation.

    Investigate  → AI Contributor
    Plan         → Human Engineer
    Implement    → AI Contributor
    Validate     → Automated Test Runner
    Review       → AI Reviewer + Human Approval
    Deliver      → Source Control Adapter

This strategy demonstrates that a workflow stage may involve more than one contributor where the additional complexity provides value.

---

# Example Contribution

## Implementation Contribution

### Objective

Add duplicate-username validation within the user-management domain.

### Scope

Allowed:

- user creation implementation
- username validation logic
- related automated tests

Not allowed:

- authentication changes
- unrelated user-profile behavior
- deployment configuration
- database migrations unless specifically approved

### Contributor Profile

`Implementer`

### Required Capabilities

- `source.read`
- `source.write`
- `test.execute`

### Applicable Policies

- changes limited to approved scope
- no direct production access
- automated tests required before handoff
- destructive external operations prohibited

### Evidence Requirements

- source diff
- executed test results

### Completion Criteria

The contribution is complete when:

- implementation is present
- required tests execute
- evidence has been produced
- the work is ready for evaluation

---

# Example Policy Evaluation

Before source modification:

    Contribution
         ↓
    Capability Request
         ↓
    Policy Evaluation
         ↓
       Allowed

Example policy:

> Contributors assigned to implementation may modify only files within the approved contribution scope.

If the contributor attempts to modify unrelated deployment configuration:

    Capability Request
         ↓
    Policy Evaluation
         ↓
        Denied
         ↓
    Evidence Recorded

The contributor may then:

- adjust its approach
- request expanded scope
- hand off
- escalate to a human

The policy does not depend on whether the contributor is human or AI.

---

# Evidence Produced

A successful workflow may produce:

## Investigation Evidence

- identified implementation area
- affected components
- existing behavior summary

## Planning Evidence

- implementation plan
- expected file scope
- validation strategy

## Implementation Evidence

- source diff
- contributor identity
- contribution metadata

## Validation Evidence

- test command
- test results
- execution logs

## Policy Evidence

- capability authorization decisions
- denied actions
- approvals

## Review Evidence

- review findings
- approval status

---

# Evaluation

The workflow should be evaluated against the original engineering intent.

## Evaluation Criteria

### Criterion 1

Unique usernames can be created.

### Criterion 2

Duplicate usernames are rejected.

### Criterion 3

Existing user creation behavior remains valid.

### Criterion 4

The implementation remains within approved scope.

### Criterion 5

Required evidence is present.

---

# Possible Evaluation Results

## Passed

All required criteria are satisfied.

The workflow may proceed to delivery.

## Failed

One or more engineering requirements are not satisfied.

The workflow returns to the appropriate stage.

Example:

    Validation Failed
          ↓
    Implementation
          ↓
    Validation

## Requires Review

The system cannot safely determine the appropriate outcome.

Example reasons:

- ambiguous acceptance criteria
- unexpected architecture impact
- policy conflict
- incomplete evidence
- elevated risk

The workflow escalates to human judgment.

---

# Handoff Example

An AI implementation contributor may produce:

    Contribution Result
          │
          ├── Source Diff
          ├── Test Results
          ├── Scope Summary
          └── Known Risks
                  │
                  ▼
             Human Reviewer

The reviewer should not need to reconstruct the contributor's entire reasoning history.

The handoff should contain sufficient engineering context and evidence to support the next responsibility.

---

# Outcome

A successful workflow produces:

### `Outcome`

- `status`: completed
- `summary`: Duplicate username creation is rejected while existing valid user creation behavior remains unchanged.
- `evidence`:
  - source diff
  - automated test results
  - policy results
  - review approval

Delivery may then occur through the configured delivery adapter.

---

# What This Scenario Validates

This scenario tests several architectural assumptions.

## Contributor Neutrality

The same workflow can be completed by different contributor types.

## Intent Separation

Engineering intent remains unchanged when contributor strategy changes.

## Deterministic Governance

Policies apply regardless of contributor type.

## Bounded Capability

Contributors receive only the capabilities required by their contribution.

## Evidence-Based Evaluation

Success is determined using evidence rather than contributor self-reporting.

## Human Participation

Humans may participate as contributors, reviewers, approvers, or escalation targets.

## Adapter Boundaries

Issue trackers, AI platforms, automation tools, and source control remain outside the core engineering domain.

---

# Architecture Test

This scenario should eventually be implemented at least twice.

For example:

### Implementation 1

- human-oriented contributor strategy
- deterministic validation
- GitHub delivery adapter

### Implementation 2

- AI-oriented contributor strategy
- same engineering intent
- same workflow contracts
- same validation expectations
- same evidence expectations
- alternate contributor or platform adapter

If implementation requires changing the engineering workflow solely because contributor technology changed, the architecture has failed one of its foundational goals.

---

# Open Questions Exposed by This Scenario

This scenario intentionally exposes questions that should be resolved only when implementation requires a decision.

Examples include:

- Who creates `EngineeringIntent` from an ambiguous work item?
- Can workflow stages execute in parallel?
- When should contribution strategy be selected?
- Can contributor strategy change after failure?
- How should scope expansion be requested?
- How should policy exceptions be represented?
- What evidence is mandatory for every contribution?
- How much contributor reasoning should be retained?
- How should retry limits differ between deterministic and probabilistic contributors?
- How should review disagreement be represented?

These should not automatically become new abstractions.

They should become ADRs only when the reference implementation forces an architectural choice.

---

# Related Decisions

- ADR-0001: Keep the Core Architecture Contributor- and Vendor-Neutral
- ADR-0002: Separate Engineering Intent from Engineering Contribution

# Related Documentation

- `docs/domain/engineering-domain.md`
- `docs/contracts/core-contracts.md`
- `docs/reference-architecture.md`
