# Agentic Engineering Reference

A v1 reference for engineering work guided by explicit intent, deterministic governance, independent validation, and attributable evidence. AI is one possible contributor alongside humans, scripts, pipelines, and services.

This repository has two deliverables:

- **Executable Reference Architecture:** a small TypeScript implementation and tests showing what the architectural beliefs mean. Start with [what v1 proves](#what-the-executable-reference-proves).
- **Architecture Challenge:** a portable review method for interrogating another project's claims without adopting this implementation. Start with [Challenge Your Project](#challenge-your-project).

The contributor is not the workflow. The platform is not the architecture. Execution completion is not engineering success.

## Challenge Your Project

Use the Challenge to test whether a project's claims hold up along real execution and failure paths. It requires **no installation of this repository in the target project and no project-specific architecture configuration**.

### 30-second quick start

1. Open your target repository in a repository-aware coding/software-engineering agent.
2. For the first full assessment, choose a strong reasoning-capable model and high/deep reasoning if available.
3. Copy the complete [project review prompt](docs/challenge/project-review-prompt.md) below its divider.
4. Paste it into the agent; it reviews the repository currently open in the workspace.
5. Keep the initial assessment read-only; grant test/terminal execution separately when appropriate.
6. Review the evidence-backed findings before authorizing any changes.

The reviewer first understands the target in its own vocabulary, traces one consequential operation, and inspects implementation, tests, configuration, and CI. It assesses C01–C20, separates defects from intentional differences and evidence limits, and recommends only the smallest justified improvement—or **"No implementation change is currently earned."**

Read the [full method](docs/challenge/architecture-challenge.md) or [worked example assessment](docs/challenge/example-assessment.md) for detail. The example reviews this reference; it is not a template architecture to copy.

```text
Your Repository → Architecture Challenge Prompt
  → Repository-Aware Engineering Reviewer
  → Understand target in its own vocabulary
  → Trace one consequential operation
  → Inspect implementation + tests + CI
  → C01–C20 evidence assessment
  → Weakest consequential boundary
  → Smallest justified improvement (or none)
  → Human review
```

This is a review loop, not software installed or executed inside the target. Some reviewing tools can instead inspect a public repository URL with GitHub/web access. That depends on the tool; private repositories require authorized access. This reference is not a remote scanning service.

### Recommended reviewer configuration

| Review type | Recommended configuration |
| --- | --- |
| Quick orientation | Capable coding model, normal/medium reasoning, repo read access |
| Full Architecture Challenge | Strong coding/reasoning model, high reasoning, repo-wide access |
| Large/complex repo | Strong multi-step repo agent, high reasoning, tests/CI/history where permitted |
| Focused follow-up | Medium/high reasoning scoped to an accepted finding |

Use a repository-aware engineering agent with read/search access to source, tests, docs, and configuration, plus CI definitions/results and useful git history where available. Terminal/test execution requires authorization. Keep the first assessment read-only.

This work needs cross-file causal reasoning, evidence tracing, negative-path analysis, trust/authority analysis, and architectural judgment—not primarily code completion. Fast/autocomplete-oriented models can help with orientation or follow-up but are not preferred for the first full review. No model vendor or official integration is required.

> Reviewer capability affects review depth. Repository evidence determines what can actually be claimed.

- README claim ≠ implementation proof.
- Test exists ≠ test executed successfully.
- Test inspected ≠ test run.
- Strong model + README only ≠ strong architecture evidence.

Record inaccessible infrastructure, CI, external services, private repositories, or runtime configuration as limitations; use `unsupported/unproven` where appropriate rather than guessing. Prefer executable evidence for behavioral claims. Non-goals, stop policies, deferred capabilities, and future maintainer commitments are documentary evidence, not runtime guarantees.

### What you get—and who decides

The review returns evidence-backed C01–C20 classifications, evidence limitations, the weakest consequential boundary, the smallest justified improvement or none, and a stop recommendation. The classifications are **conforms**, **intentionally differs**, **partially supported**, **unsupported/unproven**, and **not applicable**.

**There is no numerical score.** No defect found is a valid outcome. "No implementation change is currently earned" is a successful result.

Assessment → evidence-backed findings → human review → finding accepted? **No: stop. Yes: separately authorize bounded implementation.**

The Challenge does not authorize implementation. The engineer/team decides whether a finding is valid and whether any change is earned. After an accepted fix, rerun only the affected claims and causal path when sufficient; a full reassessment is not automatically required.

### Conventional software is welcome

The target need not be an AI system. Intent may be an API/business requirement; a contributor may be a service, worker, script, or CI job; governance may be authorization/business rules; evidence may be tests, responses, database results, or artifacts; outcome may be an API/job status; workflow may be a direct function/service call. Agent-specific questions may be `not applicable`. Absence of an agent framework is not a defect.

The Challenge is not a scanner, certification, security certification, automatic refactoring tool, architecture purity test, requirement to use AI, or requirement to adopt these classes. A human reviewer can use the same [checklist](docs/challenge/claim-checklist.md).

## What the executable reference proves

The reference task is deliberately small: **prevent duplicate usernames while preserving valid user creation**. Local contributors return references to predefined implementation behaviors. A validator exercises the selected behavior; no contributor edits source code or calls an AI service.

Tests demonstrate structured intent driving evaluation, contributor substitution without changing contracts, capability/policy denial before executor invocation, dependency readiness and fan-in, per-stage authority, original validation evidence preservation, and terminal failure causality. Execution success can coexist with engineering rejection; unreachable validation is inconclusive.

These are proofs within a trusted, synchronous, in-memory reference. Capability checks gate calls; they do not sandbox arbitrary code. Provenance identifies producers; it does not authenticate external producers. See the [reference architecture](docs/reference-architecture.md) and [v1 capability matrix](docs/v1-capability-matrix.md) for evidence and limits.

### Run the reference itself (optional)

These commands run this repository's executable examples; they are **not required to review another project**. Use Node.js 22.12 or later within the versions declared by the package and CI configuration.

```sh
npm ci
npm test
npm run typecheck
```

Start with the [scenario guide](docs/scenarios/reference-scenario-001.md), [multi-stage scenario](src/scenarios/duplicate-username-workflow.ts), [its tests](tests/duplicate-username-workflow.test.ts), and [v1 failure matrix](tests/v1-failure-matrix.test.ts). The [contracts guide](docs/contracts/core-contracts.md), [domain vocabulary](docs/domain/engineering-domain.md), and [architecture decisions](docs/adr/) explain the design.

## First External Challenge

The Challenge was applied to the independent [Playwright Agent Wrapper](https://github.com/JCDev26/playwright-agent-wrapper-starter), without requiring it to adopt this reference's classes. It found concrete semantic defects: most importantly, child exit 1 had been treated as proof that tests ran and failed, although that exit can also occur without a trustworthy test judgment.

The wrapper was [hardened](https://github.com/JCDev26/playwright-agent-wrapper-starter/commit/9cbfa3a) to classify current-run native Playwright evidence, preserve literal spec meaning, and strengthen structured failure handling. It remained a small Playwright wrapper, not a workflow/agent platform. [Hosted CI passed](https://github.com/JCDev26/playwright-agent-wrapper-starter/actions/runs/37132962751) at its [v1 stopping commit](https://github.com/JCDev26/playwright-agent-wrapper-starter/commit/932a8e23c01d3c7064331e36d5b39f1548617449).

**The Challenge exposed false claims about what the system knew without prescribing the reference implementation.** This is a case study, not certification. Its feedback also sharpened the method: determine whether a defect exists; do not manufacture work.

## V1 boundary and source availability

The [v1.0.0 release](https://github.com/JCDev26/agentic-engineering-reference/releases/tag/v1.0.0) remains the implementation stop point. Production isolation, credential management, authenticated evidence, real contributor/platform adapters, human approval flows, durable execution, recovery, retries, and parallel scheduling are intentionally deferred. Descriptive contract fields do not implement these controls. No production agent platform or security guarantee is claimed.

The [maturation audit](docs/reviews/v1-maturation-review.md) records the completion decisions. Earlier [reviews](docs/reviews/) are historical experiments, not a backlog; the [landscape cross-check](docs/reviews/2026-landscape-alignment-review.md) records external pressure without importing vendor-specific semantics.

This repository is publicly available for portfolio and reference purposes. No open-source license is currently granted.
