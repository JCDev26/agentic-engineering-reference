# 2026 landscape alignment review

Review and source access date: **2026-10-02** (America/New_York).

This review compares architectural boundaries and executable claims against public primary sources. Conceptual alignment does not establish production readiness, certification, protocol conformance, or a vendor's guarantees.

The local baseline was commit `dfdaae5`: 70 tests across 19 files and TypeScript checking passed before the maturation changes. Passing that baseline did not establish every README claim.

## Aligned concepts and limits of the proof

| Concern | External reference | Repository assessment |
| --- | --- | --- |
| Orchestration, harness, and execution separation | OpenAI's [Agents API architecture](https://developers.openai.com/api/docs/guides/agents-api/architecture) separates harness, environment, and application server. Its [Agents SDK](https://developers.openai.com/api/docs/guides/agents/sdk) runs inside the application. | `Workflow`, `ContributionRunner`, and `Executor` separate responsibilities from execution. Local substitution exercises this; remote harness integration is unproven. |
| Structured work and SDLC boundaries | Microsoft's [architecture and SDLC module](https://learn.microsoft.com/en-us/training/modules/design-agent-architecture-integration/) separates task contracts, planning, reasoning, execution, and delivery controls. | Intent, dependency readiness, fan-in, and independent validation follow these concerns. PR acceptance, branch protection, and deployment gates remain unproven. |
| Governance outside model reasoning; bounded capabilities | Microsoft describes independent control hooks and restricted permissions in [agent operations controls](https://learn.microsoft.com/en-us/training/modules/design-agent-architecture-integration/7-agent-operations-controls). OWASP's [Agent Control Standard](https://genai.owasp.org/resource/agent-control-standard-acs/) describes portable runtime policy hooks. | Capability and policy denial prevent executor invocation. These in-process controls require cooperating executors; they supply neither OS confinement nor ACS implementation. |
| Observability, evaluation, and provenance | OpenAI's [SDK observability guidance](https://developers.openai.com/api/docs/guides/agents/integrations-observability) distinguishes execution tracing from evaluation. | Validator evidence preserves producer and object identity. Execution success can accompany engineering failure; unreachable validation yields inconclusive evaluation. Producer labels supply attribution without authenticated attestation. |
| Handoffs and interoperability | Google's [2026 protocol guide](https://developers.googleblog.com/en/developers-guide-to-ai-agent-protocols/) distinguishes A2A agent communication from MCP tool/data integration. [A2A v1.0.0](https://a2a-protocol.org/v1.0.0/specification/) separates discovery, task exchange, authentication, and authorization. | Handoffs carry context and artifacts; downstream contributions receive their own authority. Local substitution proves neither network interoperability nor identity. Discovery is not permission. |
| Host responsibility for tool access | The [MCP 2026-07-28 architecture](https://modelcontextprotocol.io/specification/2026-07-28/architecture) assigns security and consent to the host; its [authorization specification](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) addresses protected HTTP access. | Protocol capabilities differ from engineering capability grants. Adapters must preserve local governance. |
| Failure and recovery semantics | Microsoft's operations guidance discusses bounded retries, escalation, and rollback. A2A models task state and asynchronous delivery. | Contribution/workflow causes reach outcomes without parsing logs. Failure stopping and deadlock detection are exercised; retry, compensation, and recovery are absent. |

Executable anchors: [authorization](../../tests/contribution-runner.test.ts), [progression](../../tests/workflow-runner.test.ts), [fan-in](../../tests/multi-dependency-workflow.test.ts), [provenance](../../tests/validation-evidence-provenance.test.ts), [applicability](../../tests/evaluation-applicability.test.ts), and [terminal failures](../../tests/terminal-failure-modes.test.ts).

## Actual gaps identified for this finishing pass

Baseline inspection identified three earned corrections:

1. **Intent did not cause evaluation.** Human-readable intent fields coexisted with separately authored scenario requirement arrays. Structured evaluation requirements belong with `EngineeringIntent`, while prose acceptance criteria retain their human meaning. Changing a structured requirement must change evaluation without editing evaluator literals in each scenario.
2. **Terminal causality differed across reference surfaces.** The original contribution path could turn an inconclusive evaluation into `evaluation-failed` because it supplied no run-level cause. Both paths need a coherent terminal context; an evaluation result must not replace the directly observed reason work stopped.
3. **Declared governance could be bypassed through ordinary inputs.** Raw scope-prefix checks accepted ambiguous targets, absent targets could pass scoped policy, and declared policy IDs were not sufficient to require the corresponding policy objects. These need explicit denial before execution. Lexical scope validation still cannot resolve symlinks, confine a process, or police an executor that ignores its request.

The maturation pass closes intent causality through [intent-change tests](../../tests/intent-driven-evaluation.test.ts) and governance gaps through [scope tests](../../tests/policy-engine.test.ts) and [executor-denial tests](../../tests/contribution-runner.test.ts). These correct existing claims; the production capabilities below remain deliberately absent.

## Intentionally deferred production concerns

| Concern | What remains outside v1 | Consequence for adopters |
| --- | --- | --- |
| Sandboxing and isolation | Process/container/VM boundaries, network egress controls, resource enforcement, and safe filesystem resolution. | The `Executor` seam permits an implementation; it does not supply isolation. OpenAI's [sandbox security guidance](https://developers.openai.com/api/docs/guides/agents-api/environments/security) separates workload isolation, network restrictions, and credential handling. Current [Codex Cloud environments](https://learn.chatgpt.com/docs/environments/cloud-environments) provide isolated task workspaces; this repository does not inherit that behavior. |
| Identity and secrets | Authentication, credential issuance, delegation, revocation, and secret brokering. | String IDs do not establish identity. NIST's [August 2026 guidance](https://www.nist.gov/blogs/cybersecurity-insights/back-future-why-agentic-ai-needs-strong-identity-foundation) emphasizes distinct identities, scoped authorization, and avoiding shared credentials. |
| Human control | Approval lifecycle, pause/resume, cancellation, and delivery gates. | The `approval` evidence type enforces nothing. Authorization must precede the controlled action independently of contributor prose. |
| Durable execution and recovery | Persistence, retries, idempotency, crash recovery, concurrency, and compensation. | The synchronous in-memory runner cannot recover interrupted or ambiguously completed remote work. |
| Strong evidence and observability | Evidence authentication/integrity enforcement, durable retention, redaction, tracing exporters, and cross-service correlation. | Keeping evidence intact inside one process proves preservation, not resistance to forgery or tampering. Optional integrity fields are not verified. |
| Real interoperability and agent security | Live AI/CI/SDLC contributors, A2A/MCP adapters, hostile input evaluation, prompt-injection defenses, memory security, and remote trust boundaries. | OWASP's [Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/) and its [published guidance](https://genai.owasp.org/download/52117/?tmstv=1765059207) cover threats beyond this deterministic local example, including tool misuse, identity abuse, poisoned context, unsafe inter-agent communication, and cascading failures. Local governance is not a claim to mitigate that entire threat set. |

Deferral is justified by the absence of untrusted or remote execution in the reference, not by the unimportance of these controls. An adopter changing that assumption must revisit the corresponding boundary.

## Source status and concepts not adopted

At access time, OpenAI distinguished Agents API, Agents SDK, and Responses API. An older cloud URL redirected to a legacy page; the comparison uses the linked current guide. No account entitlement is inferred.

MCP `latest` resolved to **2026-07-28**; A2A was examined at **v1.0.0**. Neither protocol enters core contracts.

OWASP's ACS resource was dated **2026-09-01**. Its [project](https://github.com/GenAI-Security-Project/agent-control-standard) described v0.1.0 and documented implementation limits. Runtime hooks are relevant; its wire schemas, Guardian terminology, conformance profiles, inventories, and tracing formats are not adopted.

NIST's [AI RMF page](https://www.nist.gov/itl/ai-risk-management-framework) described voluntary AI RMF 1.0 undergoing revision. Its [2026 agent initiative](https://www.nist.gov/artificial-intelligence/ai-agent-standards-initiative) described standards, protocols, identity research, and security evaluations. Neither establishes certification here; no NIST compliance is claimed.

Managed sessions, models, hosted sandboxes, tracing dashboards, GitHub delivery controls, and Google ADK components remain adapter or deployment choices.

The defensible v1 position is a small executable reference for those distinctions, with explicit limits at the process, identity, human-control, persistence, and external-integration boundaries.
