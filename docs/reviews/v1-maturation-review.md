# v1 maturation review

Review date: **2026-10-02**. This record distinguishes the inspected starting state from the final [v1 capability matrix](../v1-capability-matrix.md). Historical experiments remain available beside this file.

## Baseline and inspection

The live repository was cloned and inspected at `dfdaae5cf7ddeccbbfa6efa9a49bbb1442838e35`, with a clean working tree and 39 commits. Inspection covered the entire tracked tree, README, both ADRs, architecture/contracts/domain/scenario documents, every prior review, all domain/core/scenario/reference-app sources, all tests, package/lock metadata, TypeScript configuration, and Git history. There was no repository `AGENTS.md` or CI configuration.

On Node **v22.12.0**, `npm ci` succeeded and installed **46 packages**. `npm test` passed **19 files / 70 tests**. `npm run typecheck` passed. These are baseline results, not the final suite count.

The starting README claimed no open-source license grant, while root `LICENSE` granted MIT, `package.json` declared MIT, and root lockfile metadata declared ISC. The finishing change removes the root license grant and corrects package metadata to `UNLICENSED`, while leaving dependency licenses intact. This describes present repository hygiene only; it makes no conclusion about historical copies or grants.

## Evolution across the 39 commits

| Commits | Architectural development |
| --- | --- |
| `9b633d7`, `59dedd8`, `111e814`, `f04f0f0`, `5cb8b6b` | Initial repository and MIT file; vendor-neutral thesis broadened to contributor neutrality, then README alignment. |
| `871f723`, `266d227`, `64c9d9f`, `18ff055`, `62f9499` | Intent/contribution separation; conceptual domain, contracts, architecture, and six-stage reference scenario. These initially described more than implemented behavior. |
| `d95d53a`, `688172e`, `dd83f11` | Domain files introduced, then populated; typed policy/evidence tests and TypeScript/Vitest setup. The first contract commit contained empty files, corrected in the next. |
| `c9b0289`, `aa715a4`, `f5bd880`, `30fa883`, `57841e7`, `3d8b1ba`, `426a6dd`, `691f37d` | Governed execution boundary: policy before execution, capability grants, then structured capability/policy/execution evidence. |
| `98732b6`, `17393b3`, `f006b88`, `0f6483a`, `2cb00f9` | Evidence presence evolved into metadata requirements; evaluation and outcome composed into the first executable slice and review. |
| `63cba12`, `7593b16`, `ca69681` | Interchangeable local contributor execution, same-contract scenario tests, then deterministic contributor selection. |
| `734b0c2`, `2c8779a` | Real acceptance checks against a tiny application; then contributor-produced artifact references caused validation behavior. Application knowledge moved out of core into scenarios. |
| `b7e7618`, `3888c64`, `3930d96` | Two-stage orchestration and handoffs; array order replaced by dependency readiness/fan-in; separate validator selection and stage authority. |
| `7050136`, `c08c9cf` | Terminal causes retained, then contribution failure ownership moved from evidence inspection to typed runner results. |
| `e6f9b4e`, `b9a6464`, `dfdaae5` | Unreachable evaluation became inconclusive; applicability centralized; validator evidence survived execution instead of being reconstructed from artifact strings. |

Meaningful diffs show a consistent pattern: move a claim from prose to executable behavior, then correct the boundary that lost causality. The final baseline still duplicated evaluator requirements in scenario code and left the original scenario's terminal cause behind its newer evaluation semantics.

## Initial claims audit

Statuses below describe the baseline, not the completed v1. “Proven” is bounded to local trusted fixtures. A partial claim is not permission to build production infrastructure.

| Claim | Baseline classification | Evidence / gap observed |
| --- | --- | --- |
| Contributor neutrality | Proven locally | Same contracts exercised by two local contributor implementations; real humans/AI absent. |
| Vendor neutrality | Proven structurally | Domain/core imports are generic; no platform interoperability exercised. |
| Engineering intent | Proven | Separate domain contract and same-contract scenario comparison. |
| Intent → evaluation causality | Declarative only | Acceptance prose described intent; scenarios authored separate structured requirement arrays. |
| Deterministic governance | Partially proven | Denial blocked execution, but missing targets and omitted declared policies could bypass intended checks. |
| Bounded capability authorization | Proven for call gating | Grant membership checked before executor; no sandbox. |
| Contributor selection | Proven | Availability, profile capability boundaries, type preference; profile required policies were unenforced. |
| Contributor substitutability | Proven locally | Local safe/faulty implementations used unchanged contracts. |
| Contribution execution causality | Proven | Produced artifact selected behavior validated independently. |
| Contribution failure causality | Partially proven | Returned capability/policy/execution causes worked; executor exceptions escaped. |
| Workflow progression | Proven | Multiple stages executed through bindings. |
| Dependency readiness | Proven | Out-of-order declarations deferred until dependencies completed. |
| Fan-in | Proven | Downstream stage received both upstream references. |
| Stage authority boundaries | Partially proven | Distinct grants/policies applied; required-policy omission remained possible. |
| Handoffs | Proven locally | Data and evidence transferred without grants; no filtering or transport guarantees. |
| Independent validation | Partially proven | Known correct/faulty artifacts tested; unknown artifacts fabricated failed individual findings. |
| Evidence provenance | Partially proven | Original evidence preserved with attribution; no authenticity/freshness guarantees. |
| Evaluation applicability | Proven for modeled cases | Shared decision used contribution/workflow state; missing validation input exposed a remaining case. |
| Evaluation semantics | Partially proven | Passed/failed/inconclusive exercised; missing validator evidence could still be labeled engineering failure. |
| Workflow failure causality | Partially proven | Explicit declared failures retained; exceptions/input loss needed tighter coverage. |
| Terminal outcome causality | Misleading / should be corrected | Multi-stage preserved causes; original inconclusive evaluation became `evaluation-failed`, and selection failure threw. |
| Human oversight | Declarative only | Principle/type vocabulary without an interaction lifecycle. |
| Approval boundaries | Intentionally deferred | No approval gate implementation. |
| Isolated execution | Intentionally deferred | Trusted synchronous in-process code only. |
| SDLC portability | Partially proven | Neutral contracts support a design claim; no real platform adapter. |
| Real contributor interoperability | Intentionally deferred | Local deterministic/simulated implementations only. |

## Earned finishing decisions

- Put structured evaluation requirements on EngineeringIntent in a neutral domain contract; let both engineering scenarios consume them. Preserve prose for human meaning, without parsing it.
- Keep the compact original path, but give it an actual workflow run and coherent terminal context. Do not fabricate a run or use evaluation as a failure narrator.
- Preserve original validator evidence, all acceptance findings, and producer/contribution selection. A provenance selector chooses attributed evidence; it does not authenticate the producer.
- Distinguish unavailable validation input/evidence from acceptance rejection. Preserve directly observed causes through terminal outcome and executable negative paths.
- Close omitted/duplicate required policy and malformed logical scope cases. Normalize executor exceptions at the observing boundary. Describe this as invocation governance, not filesystem security.
- Keep the existing handoff shape. Artifact references are sufficient for the downstream reference validator; upstream evidence retention is harmless in this trusted local model. Filtering and authority delegation remain external concerns.
- Consolidate the current reader path and label historical reviews. The earlier documents' approval, retry, delivery, human, and isolation vocabulary must not imply executable features.
- Add an evidence-oriented Architecture Challenge and one durable [ADR on evidence/cause ownership](../adr/ADR-0003-preserve-evidence-and-terminal-causality.md). Do not turn every experiment into another ADR.

## Final scope

The [capability matrix](../v1-capability-matrix.md), [current architecture](../reference-architecture.md), and [scenario guide](../scenarios/reference-scenario-001.md) describe v1. The [external review](2026-landscape-alignment-review.md) is a pressure test rather than a new integration backlog.

Final local verification on Node **v22.12.0** completed a fresh locked install, **21 test files / 137 passing tests**, and `npm run typecheck`. The final failure matrix covers both engineering surfaces, direct causes, execution/validation reachability, evidence identity and source selection, artifact ambiguity, and handoff authority. A final independent read-only review found two evidence/artifact ordering inconsistencies; both were corrected and regression-tested before completion.

CI is configured to run `npm ci`, `npm test`, and `npm run typecheck` on Node **22.12.0** and **24**, with read-only repository permissions and pinned action revisions. Adding CI configuration is not itself a claim that a remote run passed; the hosted run/check result remains the authority for that claim. No production or development dependency was added. Changed TypeScript files received a one-time formatting pass without adding formatter configuration or scripts.

The stop rule is explicit: use the challenge on a real external project before proposing another major architectural capability. Production identity, secrets, isolation, approvals, durable state, retries/recovery, parallelism, real adapters, and protocol interoperability remain intentionally deferred.
