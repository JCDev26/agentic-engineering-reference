# Architecture Challenge

Use this challenge to review another software project against evidence-oriented engineering beliefs. It is a portable review method, not a scanner, certification, security certification, automatic refactoring tool, architecture purity test, or requirement to use AI or adopt this repository's classes. There is no numerical score.

The central questions are whether the project separates desired results from the mechanism doing work, bounds authority appropriately, observes results, and preserves honest failure meaning. A conventional application can answer these through ordinary services, CI, database transactions, tests, and human review. Agent-specific questions may be not applicable.

## Start a review

Open the target repository in a repository-aware coding/software-engineering agent and paste the complete [project review prompt](project-review-prompt.md) below its divider. No installation of this reference or project-specific architecture configuration is required. The prompt contains all twenty questions, classifications, and evidence rules; the target does not need network access to this reference after you provide it. A human reviewer can use the same method and [checklist](claim-checklist.md).

For the first full assessment, prefer a strong coding/reasoning model with high/deep reasoning when available, repo-wide read/search access to source, tests, docs, and configuration, and CI definitions/results and useful history where available. Authorize terminal/test execution separately; begin read-only. See the [reviewer configuration guide](../../README.md#recommended-reviewer-configuration). This is cross-file causal reasoning and architectural judgment, not primarily code completion; fast/autocomplete-oriented models are better suited to orientation or focused follow-up.

A public repository URL may suffice if the reviewing tool supports GitHub/web access. Private repositories require authorized access. This repository is not a remote scanning service or a provider integration.

> Reviewer capability affects review depth. Repository evidence determines what can actually be claimed.

A README claim is not implementation proof; a test's existence or inspection is not a successful test run. A strong model with only a README still has only documentary evidence. Record inaccessible infrastructure, CI, services, private repositories, or runtime configuration as limitations. Use `unsupported/unproven` where applicable; do not guess.

## Review procedure

1. Record the project, revision, review date, intended users, deployment context, important operations, and trust boundary. State the files, commands, and systems you could and could not inspect.
2. Understand the target in its own vocabulary and architecture. Read repository guidance, architecture documentation, entry points, core contracts, adapters, authorization paths, workflows, tests, configuration, and CI. Follow imports and call sites. Treat documentation as claims until supported by implementation or appropriate documentary evidence.
3. Choose one consequential operation. Trace intent → contributor/mechanism → authority → execution → evidence → judgment → terminal result. Use the project's vocabulary; do not require objects named `EngineeringIntent` or `Outcome`.
4. Inspect a successful path and relevant negative paths. At minimum consider denied authority, execution failure, incorrect result, and validation that never ran. Include dependency or handoff failures only where the project has those concerns.
5. Assess C01–C20 in the [claim checklist](claim-checklist.md), explaining any not-applicable items. Cite precise source symbols and executable tests or observed commands. A source citation proves implementation exists; a test citation proves only the assertion it actually exercises. Record command result and revision if executed, or explicitly say “inspected, not run.”
6. Identify the weakest consequential boundary and any realistic trigger and impact. Determine whether a concrete defect exists. No defect is a valid outcome. Separate immediate defects from appropriate scope limits, evidence limitations, and intentionally different designs. Recommend only the smallest justified improvement, or none with a reason; the weakest boundary need not require a change.
7. Finish with a bounded verdict, explicit unknowns, and a stop point. Do not propose a platform rewrite or a list of speculative integrations.

Default to read-only inspection. Running existing tests may create normal temporary artifacts; disclose this and follow the target repository's instructions. Do not install dependencies, contact external services, mutate business data, publish findings, or modify code unless the user authorizes it. Lack of executable access is an evidence limit, not proof of a defect.

## Classifications

| Classification | Meaning |
| --- | --- |
| **conforms** | Appropriate inspected evidence supports the relevant belief within the stated scope. Behavioral claims require implementation and executable evidence; documentary commitments require documentary support, not a claim of runtime enforcement. |
| **intentionally differs** | The project makes a documented or otherwise substantiated different tradeoff; explain its purpose, evidence, and consequences. Difference alone is not a defect. |
| **partially supported** | Some meaningful behavior is proven, but an important boundary or part of the claim remains unproven. |
| **unsupported/unproven** | No sufficient evidence supports an applicable claim, or a concrete counterexample contradicts it. Distinguish missing evidence from demonstrated failure. |
| **not applicable** | The concern does not apply to the project's declared scope or operation. Give a reason; do not use this to hide an unimplemented requirement. |

These labels are not a maturity score. A small service can be sound with many not-applicable items; a large agent platform can have serious risks despite many conforming items. Trust assumptions and business impact determine what matters.

## Assessment record

For each checklist ID, record:

```text
Claim ID and claim:
Classification:
Evidence references: file/symbol/test, or command + result + revision
Rationale: what the evidence proves and what it does not
Risk: concrete consequence, or no material risk within stated scope
Follow-up: smallest useful action, or none with reason
```

Behavioral claims labeled `conforms` require executable evidence, not solely prose. Identify evidence as implementation inspected, tests inspected but not run, checks actually executed, observed CI results, or documentary statements. Inspect test assertions and report their execution status honestly; never imply that reading a test proves a passing run. Intentional differences need supporting context and evidence of replacement behavior where behavior is claimed. `unsupported/unproven` must say where you looked. `not applicable` must explain why. Do not manufacture test results or classify a dependency's advertised capability as this project's implemented behavior.

Non-goals, stop policies, intentionally deferred capabilities, and future maintainer commitments are inherently documentary. Cite the documents and assess those statements as such; runtime tests cannot prove a future commitment. Documentary evidence never proves an enforcement control. The [worked example's C20 entry](example-assessment.md) explicitly distinguishes its maintainer stop policy from executable scope enforcement.

Prefer a Markdown assessment using this record and a compact overview. No machine-readable schema, source-inference CLI, or additional tool is required.

## Results and human decision

Return the traced operation, C01–C20 classifications with evidence and limitations, confirmed defects separated from intentional differences and unknowns, the weakest consequential boundary, the smallest justified improvement or none, and a stop recommendation. No defect found is a valid outcome. "No implementation change is currently earned" is a successful assessment, not an incomplete one.

Assessment → evidence-backed findings → human review → finding accepted? **No: stop. Yes: separately authorize bounded implementation.**

The Challenge does not authorize implementation. The engineer/team decides whether a finding is legitimate and whether a change is earned. After an accepted finding is corrected, rerun only the affected claims and causal path when sufficient; do not automatically repeat all twenty claims or expand the project.

## Worked reference and portable prompt

The [example assessment](example-assessment.md) reviews this repository and includes partial and intentionally deferred boundaries. It is not a gold-standard architecture other projects must reproduce.

Copy [the project review prompt](project-review-prompt.md) into the reviewer. Determine whether a concrete defect exists. No defect is a valid outcome. The [first external Challenge](../../README.md#first-external-challenge) illustrates semantic defects found in a smaller Playwright wrapper without prescribing this reference's classes; it does not establish that every review must find a defect.
