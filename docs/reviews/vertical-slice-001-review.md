# Vertical Slice 001 Review

## Purpose

This review captures the architectural lessons from the first executable vertical slice of the Agentic Engineering Reference.

The goal of the slice was to validate that contributor-neutral engineering contracts could support a complete governed workflow without requiring an AI provider, vendor-specific orchestration platform, or external execution framework.

The implemented path was:

    WorkItem
        ↓
    EngineeringIntent
        ↓
    Workflow
        ↓
    Contribution
        ↓
    Capability Authorization
        ↓
    Policy Evaluation
        ↓
    Execution
        ↓
    Evidence
        ↓
    Evaluation
        ↓
    Outcome

---

## What Was Validated

### Contributor Neutrality

The core implementation does not depend on a specific contributor type.

No AI provider, IDE, source-control platform, orchestration platform, or external agent framework is required by the core execution path.

This supports ADR-0001.

### Engineering Intent Remains Separate from Contribution

The engineering objective is represented independently from the mechanism used to execute the contribution.

The contribution is bounded by:

- objective
- scope
- granted capabilities
- applicable policies
- evidence requirements
- completion criteria

This supports ADR-0002.

### Capability Is Distinct from Technical Ability

A contributor may technically be capable of performing an action without being authorized to perform that action for a specific contribution.

The executable slice enforces this distinction.

An ungranted capability is blocked before execution.

### Governance Happens Before Execution

Policy evaluation occurs before the execution boundary.

A denied policy prevents the executor from being invoked.

This is stronger than instructing contributors to behave correctly because the execution path itself enforces the decision.

### Governance Produces Evidence

Capability and policy decisions produce structured evidence.

Blocked activity is therefore observable rather than silently rejected.

### Execution Produces Evidence

Successful execution produces normalized execution evidence.

The evaluator does not need to understand executor implementation details.

### Evidence Is Not the Same as Success

The presence of evidence alone does not determine engineering success.

Evaluation verifies that evidence satisfies explicit requirements.

For example:

    command-output exists

does not imply:

    command-output.status == succeeded

### Execution Success Is Not the Same as Engineering Success

The executor reports whether execution occurred successfully.

The evaluator independently determines whether the produced evidence satisfies engineering requirements.

The outcome is resolved from evaluation rather than from executor status alone.

### Negative Paths Are First-Class

The executable slice validates both successful and unsuccessful paths.

Examples include:

- capability denied
- policy denied
- execution allowed
- evidence satisfied
- evaluation failed
- workflow failed

This prevents the architecture from being modeled only around successful autonomous execution.

---

## What the Slice Exposed

### Policy Is Still Minimal

The current policy implementation performs simple scope validation.

This is sufficient to validate the policy boundary but does not represent a general policy language.

No generic policy engine should be introduced until additional scenarios justify it.

### Evidence Metadata Is Flexible

Evidence currently supports implementation-specific metadata through:

    Record<string, unknown>

This enables rapid iteration but provides limited compile-time guarantees for individual evidence categories.

A stronger typed evidence model may eventually be justified if multiple implementations begin relying on the same evidence structures.

### Contribution Scope Is Still Generic

Contribution scope is currently represented as:

    string[]

This is sufficient for the first scenario.

Future scenarios may reveal a need for structured resource scopes such as:

- repository paths
- environments
- APIs
- infrastructure resources
- deployment targets

The architecture should not introduce a generalized scope model until real scenarios require it.

### Evaluation Is Deterministic and Simple

The current evaluator verifies evidence type and metadata requirements.

It does not yet support:

- complex boolean criteria
- weighted scoring
- semantic evaluation
- probabilistic evaluation
- human judgment
- AI-assisted evaluation

These are future evaluation strategies, not current requirements.

### Workflow Execution Is Not Yet Orchestrated

The first vertical slice models a workflow but executes a single contribution.

The system does not yet implement:

- stage transitions
- multiple contributions
- retries
- handoffs
- parallel execution
- suspended workflows
- approval gates

Those behaviors should be introduced only when a reference scenario requires them.

### Contributor Selection Is Not Yet Implemented

The architecture defines contributors and contribution strategy conceptually, but the first vertical slice does not dynamically choose a contributor.

This is intentional.

The first implementation proves governed contribution execution before introducing routing or orchestration complexity.

---

## Architectural Decisions Confirmed

The first executable slice reinforces the following existing decisions.

### ADR-0001

The core architecture can operate without coupling to a contributor type or vendor.

### ADR-0002

Engineering intent and workflow remain distinct from engineering contribution.

---

## Decisions Not Yet Required

The first vertical slice does not justify decisions about:

- AI provider selection
- contributor scoring
- orchestration framework
- workflow persistence
- database technology
- message queues
- event transport
- policy engine technology
- Docker
- MCP
- source-control provider
- observability backend
- cloud execution
- multi-agent architecture

These should remain open.

---

## Current Architectural Invariants

The executable implementation currently demonstrates:

1. The contributor is not the workflow.
2. The platform is not the architecture.
3. Engineering intent is independent from contribution.
4. Capability must be explicitly granted.
5. Technical ability does not imply authorization.
6. Policy is enforced before execution.
7. Governance decisions produce evidence.
8. Execution produces evidence.
9. Evidence presence does not imply success.
10. Execution success does not imply engineering success.
11. Evaluation determines whether evidence satisfies requirements.
12. Outcome is derived from evaluation.
13. Blocked work must not fabricate execution evidence.

---

## Next Recommended Experiment

The next implementation should test contributor neutrality directly.

The same engineering contribution should be performed through more than one contributor implementation while preserving:

- the same WorkItem
- the same EngineeringIntent
- the same Workflow
- the same Contribution contract
- the same Capability requirements
- the same Policy requirements
- the same Evidence expectations
- the same Evaluation requirements

A useful next step would be to introduce two simple contributor implementations:

1. deterministic local contributor
2. simulated alternate contributor

The objective is not to add AI yet.

The objective is to prove that contributor implementation can change without changing the engineering contracts.

Only after that boundary is proven should an AI contributor adapter be introduced.

---

## Conclusion

The first vertical slice successfully demonstrates that contributor-neutral engineering governance can be implemented without depending on AI or vendor-specific infrastructure.

The architecture remains intentionally small.

The next phase should test substitutability of contributors rather than expand the number of abstractions.