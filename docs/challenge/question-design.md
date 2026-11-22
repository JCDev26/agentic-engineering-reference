# Why these twenty questions?

The Challenge asks whether a specific engineering claim survives inspection of a consequential operation. Keep the twenty IDs stable so earlier assessments can be compared. Select follow-ups according to the claim, the people affected and the authority of the system under review.

| Claims | Decision for this review |
| --- | --- |
| C01–C03 · intent, actors, responsibilities | Keep all three. Knowing the objective does not identify who can act or what happens if a different contributor takes over. Ask who experiences the consequences and what outcome they need protected. |
| C04–C07 · capabilities, policy, permissions, isolation | Keep these distinct. An allowed tool, a policy decision, a scoped credential and a confined process each support a different claim. Follow the actual invocation to the component that enforces the limit. |
| C08–C11 · observations, provenance, judgment, applicability | Keep all four. Ask which revision, inputs and attempt an observation covers. A genuine report can still be evidence about yesterday’s system. |
| C12–C13 · origin and preservation of failure | Keep both. A worker can report a timeout accurately and the final result can still imply that the operation never happened. Trace what a downstream retry would do. |
| C14–C17 · coupling, translation, dependencies, authority | Keep all four. A project may deliberately choose one vendor. The consequential question is whether an adapter or handoff silently changes the promised result or grants new authority. |
| C18–C20 · human control, proof, scope | Extend the probes for intervention and repeated trials. Require evidence proportionate to the claim. A deterministic library and a deployed autonomous service warrant different answers. |

## What the research changes

OWASP’s excessive-agency guidance gives a reason to preserve C04–C07 even though they sound similar: a tool may be legitimate, the account behind it may be overprivileged, and the action may proceed without the affected user’s authorization. For an agent that acts on someone’s behalf, trace the credential and the actual enforcement point through the downstream service. [OWASP Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)

NIST’s AI Risk Management Framework connects intended use and affected people to measurement in context and intervention after deployment. For this reference, that supports asking who bears a bad outcome (C01) and who can actually stop, override or recover a consequential operation (C18). A local teaching fixture can document where those operational responsibilities would begin. [NIST AI RMF Core, Map, Measure and Manage](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/)

Anthropic’s evaluation guidance distinguishes the recorded interaction from the resulting environment state and discusses how success varies across trials. For C19, a claim that an agent *can* solve one case and a claim that it solves representative cases *reliably* need different evidence. Ask for the case selection, attempt count, failures and baseline when reliability or improvement is claimed. [Demystifying evals for AI agents](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)

These are design judgments for an architecture review. They do not establish conformance with a risk framework. The [worked exercises](../scenarios/operational-examples.md) show how two reviewers can follow the same questions and look for different evidence.
