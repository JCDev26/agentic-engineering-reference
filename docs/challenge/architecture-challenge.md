# Architecture Challenge

Use this challenge to review another software project against evidence-oriented engineering beliefs. It is a review method, not a scanner, certification, numerical ranking, or requirement to adopt this repository's classes.

The central questions are whether the project separates desired results from the mechanism doing work, bounds authority appropriately, observes results, and preserves honest failure meaning. A conventional application can answer these through ordinary services, CI, database transactions, tests, and human review. Agent-specific questions may be not applicable.

## Review procedure

1. Record the project, revision, review date, intended users, deployment context, important operations, and trust boundary. State the files, commands, and systems you could and could not inspect.
2. Read repository guidance, architecture documentation, entry points, core contracts, adapters, authorization paths, workflows, tests, and CI. Follow imports and call sites. Treat README statements as claims until supported by implementation.
3. Choose one consequential operation. Trace intent → contributor/mechanism → authority → execution → evidence → judgment → terminal result. Use the project's vocabulary; do not require objects named `EngineeringIntent` or `Outcome`.
4. Inspect a successful path and relevant negative paths. At minimum consider denied authority, execution failure, incorrect result, and validation that never ran. Include dependency or handoff failures only where the project has those concerns.
5. Complete every applicable item in the [claim checklist](claim-checklist.md). Cite precise source symbols and executable tests or observed commands. A source citation proves implementation exists; a test citation proves only the assertion it actually exercises. Record command result and revision if executed, or explicitly say “inspected, not run.”
6. Identify the weakest consequential boundary, explain a realistic trigger and impact, and suggest the smallest change that would strengthen it. Separate immediate defects from appropriate scope limits and intentionally different designs.
7. Finish with a bounded verdict, explicit unknowns, and a stop point. Do not propose a platform rewrite or a list of speculative integrations.

Default to read-only inspection. Running existing tests may create normal temporary artifacts; disclose this and follow the target repository's instructions. Do not install dependencies, contact external services, mutate business data, publish findings, or modify code unless the user authorizes it. Lack of executable access is an evidence limit, not proof of a defect.

## Classifications

| Classification | Meaning |
| --- | --- |
| **conforms** | Inspected implementation and executable evidence support the relevant belief within the stated scope. |
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

Claims labeled `conforms` require executable evidence, not solely prose. Intentional differences need supporting context and proof of their replacement behavior. `unsupported/unproven` must say where you looked. `not applicable` must explain why. Do not manufacture test results or classify a dependency's advertised capability as this project's implemented behavior.

Prefer a Markdown assessment using this record and a compact overview. No machine-readable schema or source-inference CLI is required for v1; a future tool may validate assessment completeness but must not infer architectural quality from syntax.

## Worked reference and portable prompt

The [example assessment](example-assessment.md) reviews this repository and includes partial and intentionally deferred boundaries. It is not a gold-standard architecture other projects must reproduce.

Copy [the project review prompt](project-review-prompt.md) into a coding agent inside another repository. It includes the checklist and classification definitions so the agent does not need network access to this repository. Ask for a concrete defect and the smallest justified improvement, not a purity score.
