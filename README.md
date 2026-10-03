# Agentic Engineering Reference

A v1 reference architecture for coordinating engineering contributions through explicit intent, governed execution, independent validation, and attributable evidence.

> The contributor is not the workflow.
>
> The platform is not the architecture.
>
> Execution completion is not engineering success.

AI is one possible contributor. Humans, scripts, automation, pipelines, and external services belong behind the same engineering boundaries. This repository proves a small set of those boundaries in TypeScript; it does not implement a production agent platform.

## What v1 proves

The reference task is deliberately small: **prevent duplicate usernames while preserving valid user creation**. Local contributors return references to predefined implementation behaviors. A validator exercises the selected behavior; no contributor edits source code or calls an AI service.

The executable path is:

```text
EngineeringIntent + structured evaluation requirements
    → workflow responsibilities and dependencies
    → contributor selection for each contribution
    → capability and policy checks
    → execution and artifact handoff
    → independent acceptance validation
    → original evidence + applicability decision
    → deterministic Evaluation
    → Outcome preserving the primary terminal cause
```

Tests demonstrate that changing a structured intent requirement changes evaluation; changing the contributor can change the engineering result without changing the contracts; denied work never invokes its executor; and validation that cannot run is inconclusive rather than a failed acceptance test. Dependency readiness, fan-in, stage-specific authority, and evidence provenance are also executable.

These are proofs within a trusted, synchronous, in-memory reference. Capability checks gate calls; they do not sandbox arbitrary code. Provenance identifies the producer; it does not authenticate an external producer. See the [v1 capability matrix](docs/v1-capability-matrix.md) for evidence and limits.

## Read and run

1. [Reference architecture](docs/reference-architecture.md): responsibilities, runtime boundaries, and failure semantics.
2. [Architecture decisions](docs/adr/ADR-0001-contributor-and-vendor-neutral-core.md): neutral core; [intent separation](docs/adr/ADR-0002-separate-engineering-intent-from-engineering-contribution.md); [evidence and cause ownership](docs/adr/ADR-0003-preserve-evidence-and-terminal-causality.md).
3. [Executable scenario guide](docs/scenarios/reference-scenario-001.md): the small application and its three reference surfaces.
4. [Architecture Challenge](docs/challenge/architecture-challenge.md): inspect another project using evidence, without requiring it to copy this design.

Use Node.js 22.12 or later within the supported Node versions declared by the package and CI configuration.

```sh
npm ci
npm test
npm run typecheck
```

The tests are the executable entry point. Start with [the multi-stage scenario](src/scenarios/duplicate-username-workflow.ts), [its tests](tests/duplicate-username-workflow.test.ts), and [the v1 failure matrix](tests/v1-failure-matrix.test.ts). The [contracts guide](docs/contracts/core-contracts.md) and [domain vocabulary](docs/domain/engineering-domain.md) explain the code without requiring every historical review.

## Current boundary and stop point

- [x] Contributor- and vendor-neutral domain/core contracts, with substitutable local contributors.
- [x] Structured intent requirements driving deterministic evaluation in both engineering reference paths.
- [x] Capability and policy denial before executor invocation.
- [x] Dependency-driven progression, fan-in, bounded handoffs, and per-stage selection.
- [x] Independent acceptance evidence surviving into evaluation with its original provenance.
- [x] Execution failure, engineering rejection, and unreachable validation distinguished through terminal outcome.
- [x] Reusable evidence-oriented review challenge and [copy/paste review prompt](docs/challenge/project-review-prompt.md).

Human approvals, operating-system isolation, credential management, real contributor/platform adapters, durable execution, recovery, retries, and parallel scheduling are intentionally deferred. Contract fields describing future concerns are not evidence of enforcement. There is no delivery adapter, approval UI, protocol client, or production security claim.

v1 stops here. The next experiment should be justified by an actual external project's assessment, not by the availability of another platform feature. A [2026 landscape cross-check](docs/reviews/2026-landscape-alignment-review.md) records current external pressure without importing vendor-specific semantics into core.

## History and source availability

The [maturation audit](docs/reviews/v1-maturation-review.md) records the starting baseline and decisions made to finish v1. Earlier files under `docs/reviews/` are historical experiments; their “next experiment” sections are not the current backlog.

This repository is publicly available for portfolio and reference purposes. No open-source license is currently granted. This statement describes the current repository posture.
