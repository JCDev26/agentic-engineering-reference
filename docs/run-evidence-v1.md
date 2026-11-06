# Run evidence contract v1

A shared observation vocabulary, not a universal runtime schema, orchestration service, or authorization mechanism.

The adapters in src/reporting are optional library utilities exercised by tests. They are not wired into the native runner, a CLI, or a universal CI envelope. Domain execution/evaluation contracts remain independent. Human revision-bound approval enforcement is external/deferred, not implemented by these metadata fields.
Keep each repository independently runnable; do not add cross-repository runtime imports.

- `schemaVersion`: `1`; `taskId`: stable task/run identifier.
- `repository`: `owner/name`; source revision/attribution must be qualified by the producer.
  Optional library adapters require caller-supplied context; they do not verify source identity.
  Native runners may leave `commit` null when attribution or binary correspondence is unverified.
- `environment`: platform, tool versions and relevant capabilities. Distinguish hosted
  headless, local engine, graphical session, and human/device review.
- `observedAt`: UTC ISO timestamp of this observation.
- `checks`: named checks with `passed`, `failed`, `inconclusive`, or `not-run` status,
  optional duration in milliseconds, and evidence paths/URLs from this invocation.
- `technical`: `failed` if any check failed; otherwise `inconclusive` if the check
  set is empty or any check is unavailable/not run; otherwise `passed`.
- `visual`: `unknown`, `review-required`, `not-applicable`, `passed`, `failed`, or `inconclusive`.
- `ownerApproval`: `pending`, `approved`, `rejected`, or `not-required`.

Technical success never implies visual acceptance or owner approval. Approval metadata
is informational: an agent-editable report must never authorize publishing or merging.
Any real human approval must be independently controlled and bound to the reviewed revision;
that is an external/deferred enforcement responsibility, not a new capability here.
Optional library reports default visual applicability to `unknown` and owner approval to
`pending`. Callers can explicitly select visual review or justify `not-applicable`; a
nonempty rationale is descriptive data, not authorization. Native producer formats remain project-specific. Preserve historical reports and append
new observations; missing access is not a pass or proof of a product defect.

Cancellation, stale observations, and unknown session state belong to the task/session
layer. Preserve those states separately; do not relabel them `passed`, `failed`, or `done`.
An old successful report remains a historical success, not current-head validation.
Wrapper transport `ok`, process exit 0, a submitted job, or an installed test is not by
itself evidence of engineering success. Validate native current-run evidence first.

## Performance and CI

Use lockfile/tool-version keyed dependency caches, bounded timeouts, least permissions,
and cancellation of superseded runs. Keep stable required check names. A skipped required
check is not success; use an explicit aggregate job when splitting gates.
Attach failure evidence without credentials, auth storage state, private notes, or `.env`.
Report exact commit, runner, workload, warmup, sample count and variance. Define the gate
before measuring. A median/repeatability gate and an every-pair threshold are different
claims; report both when both matter. Hosted timing does not establish laptop graphics
performance. No universal performance threshold is introduced by this contract.

## Bounded adoption

Keep deterministic checks before expensive engine/browser work. Route by needed capabilities
before selecting a model; use an inexpensive capable option for routine static work.
Compare models/tools with accepted outcomes, retries, elapsed time and actual cost, not
marketing benchmarks. Proposed rule changes require review and regression evidence.
Hooks and prompt instructions are advisory; CI and human-controlled authorization enforce
their own boundaries. Branch protection/rulesets remain an owner-controlled proposed next
step, not something this branch enables. No paid agents or live orchestration are enabled.


## Native adapter and compatibility

`reportOutcome(outcome, context)` in `src/reporting/outcome-run-report.ts` preserves the
complete native Outcome. The reference intentionally represents inconclusive evaluation as
native failed + evaluation-inconclusive, and review as escalated. The portable technical
observation maps those to inconclusive, retaining the native status/reason and a separate
engineeringReview requirement. Native API types and resolver behavior are unchanged.
Evidence producer/integrity metadata remains descriptive, not authenticated. The envelope
does not upgrade these trust guarantees. Cancellation remains visible in native status.
