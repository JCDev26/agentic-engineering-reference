# Copy/paste project review prompt

Open the target repository in a repository-aware coding/software-engineering agent and copy everything below the divider into it. No project-specific architecture configuration or installation of this reference is required. All twenty questions and the evidence rules are included. For the first full assessment, prefer a strong coding/reasoning model with high/deep reasoning when available and repo-wide read/search access where authorized and appropriate. The initial assessment is read-only.

---

Review the repository currently open in this workspace using the Agentic Engineering Reference Architecture Challenge. No project-specific architecture configuration or reference installation is required. Keep this initial assessment read-only; do not modify the repository. Understand the target in its own vocabulary and architecture. Assess its actual behavior and stated scope, not whether it resembles a particular framework or vendor's design. For a first full assessment, a strong repository-aware coding/reasoning agent with high/deep reasoning is recommended; no vendor is required.

Inspect only authorized repository/system context using least privilege; write access is not required. Do not seek or expose secrets to strengthen this assessment. Do not access production systems or sensitive data unless explicitly authorized and genuinely required. Do not broaden permissions on your own. If something cannot safely be inspected, record what could not be verified and classify accordingly; unavailable access is an evidence limitation, not proof of a defect.

First read repository guidance and inspect the tree, entry points, architecture documentation, contracts, execution paths, authorization, adapters, tests, configuration, and CI definitions/results where available within that scope. Inspect relevant history when it explains a design decision. Record the revision, review date, reviewed scope, intended users, trust boundary, and access limitations. Treat docs as claims until supported by implementation or appropriate evidence.

Reviewer capability affects review depth. Repository evidence determines what can actually be claimed. A README claim is not implementation proof; a test's existence is not a successful run; a test inspected is not a test run. A strong model with README-only access cannot supply strong behavioral evidence. If infrastructure, CI, external services, private repositories, or runtime configuration are inaccessible, record that limitation and use unsupported/unproven where appropriate. Do not guess.

You may run existing safe local checks if authorized and dependencies are already available. Follow repository instructions. Do not install dependencies, access production data, contact external services, make changes, commit, push, or publish the review without authorization. State exact commands/results you actually ran. If checks were only inspected, say so; missing access is not evidence of failure.

Trace one consequential operation from requested result through its responsible actor/mechanism, permissions, execution, artifacts/evidence, validation, and terminal disposition. Inspect successful execution plus relevant cases of denied authority, execution failure, incorrect output, and validation that never ran. Inspect dependency, handoff, approval, and recovery behavior only where relevant. Verify important claims using implementation and executable tests or observations; test titles alone are insufficient.

Assess all 20 questions below, using the target project's vocabulary:

1. **C01 — Intent:** What is the intended engineering result? How do explicit requirements affect acceptance or evaluation? Separate human meaning from machine-executed checks.
2. **C02 — Contributors:** Which humans, scripts, pipelines, services, handlers, or agents actually perform work? Distinguish real integrations from simulated labels.
3. **C03 — Separation:** Are workflow responsibilities and success criteria independent from the contributor/mechanism? Would substitution require redefining them?
4. **C04 — Capabilities:** Where is authority explicitly bounded? Is there proof that ungranted actions cannot invoke the relevant executor?
5. **C05 — Governance:** Where are deterministic checks enforced? Can required policies be omitted or action paths bypass enforcement?
6. **C06 — Least privilege:** Are permissions and credential exposure appropriate to each responsibility, role, or stage?
7. **C07 — Execution boundary:** What actual isolation exists? Distinguish interface boundaries and trusted in-process code from OS, process, network, or service enforcement.
8. **C08 — Evidence:** What observations establish what happened? Distinguish output artifacts, execution telemetry, and engineering validation results.
9. **C09 — Provenance:** Who produced each important observation? Does its original identity/context survive? Distinguish attribution from authentication and tamper protection.
10. **C10 — Success:** Can execution complete successfully while the engineering result fails independent validation?
11. **C11 — Applicability:** Can validation be unreachable without being labeled as if it ran and failed? Consider blocked execution and missing input.
12. **C12 — Cause ownership:** Which layer directly observes each failure, and does it return a structured cause rather than force downstream log parsing?
13. **C13 — Terminal causality:** Does the final result preserve the primary cause, even when evaluation is inconclusive? Inspect exact negative paths.
14. **C14 — Platform coupling:** Does the project depend on a particular AI, IDE, vendor, or platform? Is that dependence intentional and compatible with its claims?
15. **C15 — Adapters:** Are protocol/platform details translated at appropriate boundaries rather than silently redefining engineering meaning?
16. **C16 — Handoffs:** What data and dependencies cross responsibilities? Are readiness, required input, and fan-in correct where applicable?
17. **C17 — Authority transfer:** Does downstream work require its own authority, or can handed-off data silently grant permissions?
18. **C18 — Human control:** What requires review or approval? Are gates enforced with appropriate decision authority, or merely documented fields?
19. **C19 — Claim evidence:** Which important claims have behavioral proof? Distinguish implementation, tests that exercise it, unexecuted tests, and README aspirations.
20. **C20 — Scope:** What is intentionally deferred? Are limitations honest, and is there a clear stop point?

Classify each question as exactly one of:

- **conforms:** appropriate inspected evidence supports the belief within the stated scope. Behavioral claims require implementation and executable evidence; documentary commitments require documentary support, not a claim of runtime enforcement.
- **intentionally differs:** a substantiated different tradeoff serves this project's needs; explain its replacement behavior and consequences.
- **partially supported:** part is supported, but a meaningful boundary remains unproven.
- **unsupported/unproven:** insufficient evidence for an applicable claim, or an observed contradiction. Distinguish those two situations.
- **not applicable:** the concern does not apply to this project's actual scope; explain why.

For each classification provide: claim ID, evidence references (file and symbol/test; command and result if run), rationale, concrete risk or limit, and smallest follow-up or justified “none.” Require executable evidence for behavioral claims labeled “conforms.” Identify evidence type: implementation inspected, tests inspected but not run, checks actually executed, observed CI results, or documentary statements. Non-goals, stop policies, intentionally deferred capabilities, and future maintainer commitments are inherently documentary; do not pretend tests prove future commitments or prose proves runtime enforcement. For missing evidence state where you looked. A dependency's marketing or available feature is not evidence of this project's integration.

Do not penalize intentional architectural differences. Ordinary applications can satisfy these beliefs through functions, services, authorization, tests, CI, and ordinary human review. They do not need named Intent/Contributor/Evidence objects, AI agents, a workflow framework, multiple vendors, MCP, A2A, event buses, containers, or a generic policy engine. Use “not applicable” for agent concepts that have no meaningful equivalent; do not hide an actual requirement behind it.

Deliver a concise report with: project/scope/trust assumptions; the traced operation; the 20 classifications and evidence; confirmed defects separated from unproven claims and intentional limits; the weakest consequential boundary; the smallest justified improvement with a test that would prove it, or justified “none”; exact validation performed; and a bounded verdict with unknowns and a stop recommendation. Determine whether a concrete defect exists. No defect found is a valid outcome. “No implementation change is currently earned” is a successful assessment; do not manufacture work.

Prioritize realistic triggers and consequences. There is no numerical score. Do not infer architecture automatically from syntax, invent findings, or propose speculative infrastructure. Recommend only improvements supported by the project's needs and inspected evidence. This assessment is not certification, security certification, an automatic refactoring tool, an architecture purity test, or a requirement to use AI.

The Challenge does not authorize implementation. Present findings for human review; the engineer/team decides whether a finding is legitimate. If it is not accepted, stop. If it is accepted, bounded implementation still requires separate human authorization. After an authorized fix, a follow-up may reassess only the affected claims and causal path rather than all C01–C20.
