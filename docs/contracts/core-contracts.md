# Core contracts in v1

This guide describes implemented contracts and explicitly separates descriptive fields from enforced behavior. TypeScript under [src/domain](../../src/domain/) and [src/core](../../src/core/) is the API source of truth. It is a reference implementation, not a published stable SDK.

## Engineering definitions

| Contract | Implemented meaning |
| --- | --- |
| [WorkItem](../../src/domain/work-item.ts) | Request ID, title, description, source; optional `intentId` and contextual metadata. No external issue-tracker integration. |
| [EngineeringIntent](../../src/domain/engineering-intent.ts) | Human objective, acceptance criteria, constraints, validation/evidence descriptions, and required `evaluationRequirements`. Optional risk/business context does not enforce a risk policy. |
| [EvidenceRequirement](../../src/domain/evaluation.ts) | Evidence `type`, optional `producer`/`contributionId` selectors, and expected scalar metadata. These requirements cause deterministic evaluation; descriptive strings do not. |
| [Workflow / WorkflowStage](../../src/domain/workflow.ts) | IDs, intent association, stages, dependency IDs, responsibilities, and descriptive requirements. Handlers implement stage responsibilities. |

Each `EvidenceRequirement` must be satisfied by one evidence object of the required type, selected producer/contribution when specified, and every expected metadata value. Every requirement must be satisfied. This is equality matching, not a nested query language, validator generator, evidence authenticity check, or natural-language interpreter. Source selectors prevent an unrelated observation satisfying a requirement; they do not authenticate the labels.

## Contribution and authority

| Contract | Implemented meaning |
| --- | --- |
| [Contribution](../../src/domain/contribution.ts) | Bounded responsibility associated with a workflow/stage, profile ID, capability IDs, policy IDs, scope, and descriptive completion/evidence expectations. |
| [Contributor](../../src/domain/contributor.ts) | Candidate identity, type, availability, and supported capability IDs. Type labels alone do not prove a real integration. |
| [ContributorProfile](../../src/domain/contributor.ts) | Role, allowed capability IDs, required policy IDs, responsibilities, and optional type preferences. |
| [Policy](../../src/domain/policy.ts) | A concrete supplied policy with scope and failure metadata. The reference engine enforces a small target-scope rule. |
| [Capability](../../src/domain/capability.ts) | Describes an action and scope. Runtime contribution authorization uses capability IDs; it does not dynamically instantiate this descriptor. |

Selection checks eligibility and profile constraints, including required policy IDs on the contribution. The contribution runner checks a requested capability grant, requires each declared policy to be supplied exactly once, evaluates policy, then invokes execution. A negative decision produces evidence without fabricating an execution record. Executor exceptions are normalized at this boundary as execution failures.

`Contribution.scope`, textual `Policy.rule`, stage policy IDs, resource budgets, timeouts, retry limits, and environment IDs are not a general enforcement engine. The supplied deterministic policy governs the requested target. A profile's required policies constrain composition; they do not authorize external resources. Approval/escalation/retry values in `PolicyFailureBehavior` describe possible decisions; v1 blocks a denied invocation and does not execute those lifecycles.

## Execution and evidence

[Executor](../../src/core/executor.ts) and [ContributorExecutor](../../src/core/contributor-executor.ts) expose synchronous local execution. An `ExecutionResult` has execution status, contribution/capability IDs, summary, optional artifacts, and optional `evidence`.

Artifacts are type/reference pairs. Evidence is a first-class observation with ID, contribution ID, type, timestamp, content reference, and optional producer/metadata/integrity fields. Reference producers populate provenance; the core does not authenticate it.

The [ContributionRunner](../../src/core/contribution-runner.ts) appends executor-produced evidence without recreating it. The [EvidenceRecorder](../../src/core/evidence-recorder.ts) separately records capability, policy, and command-output evidence. A successful validation invocation may produce a failed `test-result`.

[AcceptanceValidator](../../src/core/acceptance-validator.ts) distinguishes completed validation with evidence from unavailable validation with a reason. The duplicate-username adapter interprets implementation references; the generic evaluator never does. Unknown input must not become fabricated acceptance failures.

## Workflow and handoff

[WorkflowStageBinding](../../src/core/workflow-runner.ts) connects a stage ID with executable behavior. The runner waits until all dependencies have completed, executes ready stages sequentially, aggregates evidence, and creates one handoff per dependency edge.

[Handoff](../../src/domain/handoff.ts) contains workflow/stage/contribution identity, timestamp, summary, upstream evidence, and artifact references. It transfers data and context. Capabilities and policies remain independently bound to each contribution. Full upstream stage evidence is retained locally; filtering and remote trust are deferred.

A stage handler is trusted orchestration code. Defining a `Workflow` does not automatically enforce every string in its completion criteria or policy list.

## Applicability, evaluation, and outcome

[Evaluation applicability](../../src/core/evaluation-applicability.ts) derives whether an engineering judgment is reachable from typed run state. [Evaluation](../../src/domain/evaluation.ts) records criteria, considered evidence, result, evaluator, and findings. The deterministic evaluator can pass, fail, or be inconclusive; empty structured requirements do not prove success.

[Outcome](../../src/domain/outcome.ts) records terminal disposition, evidence, and optional cause/stage/dependency context. The [resolver](../../src/core/outcome-resolver.ts) preserves the run's primary cause before resolving an evaluation-only disposition. Evaluation is not a substitute narrator for execution or orchestration failure.

Only exercised statuses are current workflow behavior. The existence of `rejected`, `cancelled`, `no-change-required`, or `requires-review` in a domain union does not implement cancellation, delivery, or human approvals.

## Conceptual extension points

There are no implemented `Tool`, `Skill`, `ExecutionEnvironment`, `Approval`, source-adapter, or delivery-adapter domain contracts. Those names describe useful responsibilities in the [domain vocabulary](../domain/engineering-domain.md), not shipped subsystems.

No persistence, transport, credentials, sandbox, protocol negotiation, distributed tracing, retry framework, or human approval lifecycle is part of v1. New contracts require an external use case and executable proof.
