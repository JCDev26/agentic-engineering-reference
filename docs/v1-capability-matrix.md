# v1 capability matrix

**Proven** means exercised within the trusted local reference and the cited behavior tests. **Partial** means a meaningful boundary is demonstrated but a broader claim is not. **Deferred** means deliberately outside v1, even where a descriptive field or type name exists. None of these entries certifies production security or vendor interoperability.

| Capability | Status | Executable proof | Boundary / notes |
| --- | --- | --- | --- |
| Contributor-neutral core | Proven locally | [Substitution](../tests/contributor-executor.test.ts), [same-contract scenarios](../tests/duplicate-username.test.ts) | Different local implementations use common contracts; real human/AI integrations are deferred. |
| Vendor-neutral core | Proven structurally; portability partial | [Core imports](../src/core/), [domain](../src/domain/), [generic executor tests](../tests/contributor-executor.test.ts) | No provider, IDE, protocol, platform, or reference-app dependency in core. No cross-vendor integration test. |
| Engineering intent separate from contribution | Proven | [Intent](../src/domain/engineering-intent.ts), [scenario tests](../tests/duplicate-username.test.ts) | Human meaning remains separate from implementation choice. |
| Intent → evaluation causality | Proven | [Requirement-change tests](../tests/intent-driven-evaluation.test.ts) | Both engineering scenarios consume intent requirements; prose is not parsed. Empty structured requirements are inconclusive. |
| Deterministic governance | Proven within call boundary | [Policy](../tests/policy-engine.test.ts), [runner](../tests/contribution-runner.test.ts) | Scope checks and required policy presence gate execution. Textual rules and approval/retry actions are not general interpreters. |
| Bounded capability authorization | Proven within call boundary | [Runner denial tests](../tests/contribution-runner.test.ts) | Unrequested/ungranted authority cannot be gained through this invocation path. Executor internals remain trusted. |
| Contributor selection | Proven | [Strategy tests](../tests/contribution-strategy.test.ts) | Availability, capabilities, profile constraints, required policies, and type preference. No quality/cost scoring. |
| Contributor substitutability | Proven locally | [Original scenario tests](../tests/duplicate-username.test.ts) | Substitutability does not imply equivalent engineering quality. |
| Contribution execution → result | Proven | [Acceptance validator tests](../tests/acceptance-validator.test.ts), [scenario tests](../tests/duplicate-username.test.ts) | Artifact references select actual predefined application behavior; no source editing. |
| Contribution failure causes | Proven | [Causality](../tests/contribution-failure-causality.test.ts), [runner tests](../tests/contribution-runner.test.ts) | Causes originate at the runner; missing policy/executor exceptions are bounded failures. |
| Workflow progression | Proven | [Workflow runner](../tests/workflow-runner.test.ts) | Ready stages run sequentially; trusted handlers implement responsibilities. |
| Dependency readiness | Proven | [Out-of-order workflow tests](../tests/workflow-runner.test.ts) | Non-ready is different from failed; no ready stage yields typed deadlock. |
| Fan-in | Proven | [Multiple upstream dependencies](../tests/multi-dependency-workflow.test.ts) | Validation receives both upstream artifact handoffs. No concurrency claim. |
| Per-stage contributor and authority | Proven | [Multi-stage tests](../tests/duplicate-username-workflow.test.ts), [strategy tests](../tests/contribution-strategy.test.ts) | Implementer and validator are independently selected and governed. |
| Handoffs | Proven locally | [Runner](../tests/workflow-runner.test.ts), [fan-in](../tests/multi-dependency-workflow.test.ts) | Artifact/context transfer; no implicit authority. Full local stage evidence remains in handoffs. |
| Independent acceptance validation | Proven | [Validator](../tests/acceptance-validator.test.ts), [multi-stage tests](../tests/duplicate-username-workflow.test.ts) | All three reference acceptance findings are checked. Independence is a code/responsibility boundary, not hostile-process isolation. |
| Evidence provenance | Partial | [Object identity and findings](../tests/validation-evidence-provenance.test.ts), [runner preservation](../tests/contribution-runner.test.ts) | Original evidence survives with producer attribution. No remote identity, tamper protection, or freshness enforcement. |
| Evaluation applicability | Proven for reference runs | [Decision tests](../tests/evaluation-applicability-decision.test.ts), [unreachable evaluation](../tests/evaluation-applicability.test.ts) | Based on run state; no telemetry inference or claim that every future workflow fits this rule. |
| Evaluation semantics | Proven | [Evaluator](../tests/evaluator.test.ts), [intent tests](../tests/intent-driven-evaluation.test.ts), [v1 failure matrix](../tests/v1-failure-matrix.test.ts) | Execution success differs from engineering success. Unreachable validation is inconclusive. |
| Workflow failure causes | Proven | [V1 failure matrix](../tests/v1-failure-matrix.test.ts), [runner tests](../tests/workflow-runner.test.ts) | Denial, selection, execution, validation input, acceptance, deadlock, and missing binding preserve explicit causes. |
| Terminal outcome causality | Proven | [Outcome tests](../tests/outcome-resolver.test.ts), [both scenario surfaces](../tests/v1-failure-matrix.test.ts) | Primary run cause takes precedence over evaluation; no fake workflow state. |
| Human oversight | Deferred | No executing proof | Humans can author requirements and review code; there is no contributor/reviewer interaction lifecycle. |
| Approval boundaries | Deferred | No executing proof | Policy/type vocabulary is not an enforced approval flow. |
| Isolated execution | Deferred | No executing proof | Trusted in-process synchronous code; no OS/container/network confinement. |
| SDLC portability | Partial by design; integration deferred | Generic contracts and import direction only | No GitHub/GitLab/Jira adapter or delivery integration. |
| Real contributor interoperability | Deferred | No executing proof | No provider SDK, MCP, A2A, human, CI, or remote contributor adapter. |
| Durable execution / recovery | Deferred | No executing proof | No persistence, retries, idempotency, suspension/resumption, cancellation, or crash recovery. |
| Resource and identity controls | Deferred | No executing proof | Descriptive limits do not implement budgets, credentials, secrets, rate limits, or authenticated principals. |

The [Architecture Challenge](challenge/architecture-challenge.md) makes these beliefs portable to other projects without imposing these classes or treating appropriate differences as defects. The [maturation review](reviews/v1-maturation-review.md) records how the current proof differs from the baseline.
