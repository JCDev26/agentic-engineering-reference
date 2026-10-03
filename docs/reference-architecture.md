# Reference architecture v1

The engineering system defines intent, responsibilities, authority, evidence requirements, and terminal meaning independently from the selected contributor. The TypeScript reference makes those boundaries executable using trusted local implementations.

The [capability matrix](v1-capability-matrix.md) is the current proof inventory. [Historical reviews](reviews/v1-maturation-review.md) explain how the architecture reached this point.

## Responsibilities and dependency direction

```text
src/domain       Engineering concepts and data contracts
     ↑
src/core         Selection, governed execution, readiness, evaluation, outcome
     ↑
src/scenarios    Application-specific composition, adapters, acceptance checks
     ↓
src/reference-app  Tiny in-memory user-creation fixture
```

Core imports domain contracts. It does not import the reference application, scenario artifacts, model APIs, protocols, IDEs, or SDLC platforms. Scenario code knows what a user-creation artifact means; the evaluator knows only evidence requirements. A future platform adapter must preserve that direction.

| Responsibility | Current owner | Boundary |
| --- | --- | --- |
| Requested work and intended result | `WorkItem`, `EngineeringIntent` | Human-readable acceptance criteria coexist with explicit structured evaluation requirements. No prose parsing. |
| Responsibilities and dependencies | `Workflow`, `WorkflowStage` | Definitions are independent of contributor implementation. Stage handlers compose concrete operations. |
| Eligibility | `DeterministicContributionStrategy` | Profile, declared capabilities, required policies, candidate availability and preference. Selection grants no extra authority. |
| Governed invocation | `ContributionRunner`, `DeterministicPolicyEngine` | Check the requested capability and supplied policies before invoking the executor. |
| Execution | `Executor`, `ContributorExecutor` | Return execution status, artifact references, and optional first-class evidence. |
| Progression | `DeterministicWorkflowRunner` | Execute ready stages sequentially; stop on failure or report unresolved dependencies. |
| Acceptance validation | Scenario validator | Exercise the contributor-produced implementation and emit attributable `test-result` evidence. |
| Applicability | `decideEvaluationApplicability` | Decide from run state whether engineering evidence can be judged. Never infer the primary cause from logs. |
| Engineering judgment | `DeterministicEvaluator` | Match evidence against the intent's structured requirements when applicable. |
| Terminal disposition | `DeterministicOutcomeResolver` | Preserve a run's primary failure before considering evaluation disposition. |

## Intent and evaluation

`EngineeringIntent.acceptanceCriteria` expresses human meaning. Its structured `evaluationRequirements` supplies the deterministic checks. The evaluator matches evidence type, optional producer/contribution selectors, and expected scalar metadata; it does not understand natural language, application code, or artifact tokens. The reference pins acceptance evidence to its designated validator and contribution so unrelated passing evidence cannot mask a validator's rejection.

Changing only the structured intent requirement changes the evaluation. This proves a causal connection, not that arbitrary prose has been verified or that the chosen requirements are complete. The author remains responsible for choosing appropriate checks. Empty structured requirements are inconclusive.

Both duplicate-username reference surfaces use this contract. The multi-stage path separates implementation and validation into independently selected, governed contributions. The compact original path keeps validation next to its implementation stage while preserving real workflow terminal state. The fan-in example isolates scheduling behavior and does not claim complete engineering evaluation.

## Governance and trust

Authorization, selection, and policy are distinct. A candidate may support an action but lack permission for the current contribution. A granted capability can still be denied by policy. Handoff never supplies capability grants or overrides the receiving contribution's policy.

The reference policy is a small deterministic target-scope check. Targets use canonical relative slash paths or colon-delimited resource names; checks reject missing scoped targets, traversal, encoded/absolute paths, and ambiguous separators, and match segment boundaries. Empty scope explicitly imposes no target restriction. Scope matching is a lexical contract for the reference identifiers, not filesystem isolation or canonical-path authorization. It cannot constrain a malicious executor's operating-system access, network requests, secrets, or child processes. Adapters must enforce those boundaries in their actual execution environments.

Stage handlers, executors, configuration, and evidence producers are trusted in-process participants. Domain descriptions of risk, deadlines, budgets, approval actions, and environments do not implement those controls. Governance tests prove that denied calls do not reach an executor; they do not establish a production security boundary.

## Handoff and evidence

Each completed dependency produces a handoff to its direct downstream stages. A stage becomes ready only after all dependencies complete. Fan-in delivers each upstream artifact reference; declaration order need not be execution order. Ready stages run sequentially.

`artifactReferences` identifies the outputs a downstream contribution consumes. Handoffs also retain the producing stage's evidence for local audit/context. This reference does not implement redaction, confidentiality filtering, durable transport, or authority delegation. Reference validators need the artifact references; copying evidence is not a new permission or proof of trust.

An execution artifact and evidence serve different purposes. `command-output` records an invocation's completion. `test-result` records the validator's engineering findings. `ExecutionResult.evidence` preserves the validator's original Evidence object through contribution and workflow aggregation into Evaluation. Scenario code must not recreate those findings from a pass/fail artifact string.

Producer names, contribution IDs, timestamps, and references provide local attribution. They do not provide authenticated identity, tamper protection, freshness guarantees, or remote attestation.

## Failure and terminal meaning

A cause belongs to the layer that directly observes it. Contribution code observes capability denial, policy denial, and executor failure. Stage composition observes missing input and failed contributor selection. The workflow runner observes deadlock and missing bindings. The validator observes acceptance findings. Higher layers may deliberately normalize these causes but must not reconstruct them from telemetry.

Evaluation answers the engineering question:

- `passed`: applicable evidence satisfies the structured requirements.
- `failed`: the engineering judgment was applicable and its required evidence did not satisfy the requirements.
- `inconclusive`: required validation was unreachable or requirements were unspecified; missing success evidence is not a failed acceptance check.
- `requires-review`: available as a contract result; the deterministic evaluator does not create a human review workflow.

Outcome answers terminal disposition. A governance or execution failure remains that cause even when Evaluation is inconclusive. Successful executor completion can coexist with failed acceptance findings. A run's terminal cause takes precedence over evaluation disposition.

See [the v1 failure matrix](../tests/v1-failure-matrix.test.ts), [earlier terminal tests](../tests/terminal-failure-modes.test.ts), and [outcome tests](../tests/outcome-resolver.test.ts). [ADR-0003](adr/ADR-0003-preserve-evidence-and-terminal-causality.md) records this cross-cutting commitment.

## Extension points and v1 stop rule

Humans, remote contributors, and platform adapters can be represented conceptually. They are not demonstrated integrations. Approvals, sandboxing, secrets, persistent identity, authenticated evidence, durable state, cancellation, retries, recovery, and parallelism remain future work.

An external project's [Architecture Challenge](challenge/architecture-challenge.md) should reveal the next consequential limitation. Add only the smallest experiment that addresses that observed limitation. v1 requires no database, event bus, policy DSL, protocol implementation, agent swarm, or vendor SDK.
