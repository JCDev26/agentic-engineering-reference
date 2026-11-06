# Revision-bound CI review fixtures

This optional example extends the local reference with one personal GitHub-shaped
workflow: resolve prerequisites, assemble revision-specific context, receive bounded
specialist findings, join them, invoke named verification through governance, and
produce a human review packet. It runs synthetic data from `example/personal-workflow`.
It does not fetch GitHub, dispatch agents, execute test commands on behalf of an
agent, or implement production orchestration. Other projects need not install it.

## Run and replay

From the repository root, using the supported Node pin:

```sh
npm ci
npm run reference:ci-review:build
npm run reference:ci-review --silent -- --case healthy > artifacts/review.json
npm run reference:ci-review --silent -- --replay artifacts/review.json
```

Cases: `healthy`, `blocked`, `stale`, `conflict`, `cancelled`, `unauthorized`,
`duplicate`, and `interrupted`. `--replay <file> --commit <full-sha>` marks observations
from another revision historical. The build step is separate: replay itself reads
JSON and renders evidence, with no compiler, executor, network or retry invocation.
The CLI writes JSON to stdout; use `--silent` to exclude npm's command banner.
A blocked fixture is a successfully produced observation, not a failing CLI check.
Read `session`, `evaluation`, native `outcome`, and named checks rather than exit 0.

## Contracts and trust

- One task owner appears in the context. Each assignment has its own owner,
  responsibility, prerequisite IDs and exactly `context.read` / `analysis.return`.
  There is one fixture response per assignment; no recursive delegation or retry.
- Required `source-snapshot` and `locked-toolchain` prerequisites must each exist
  exactly once, be satisfied, and contain current evidence. Assignment-specific
  prerequisites are also resolved. Pending, missing, failed and cancelled inputs
  remain visible and prevent downstream verification.
- The context digest binds task, owner, objective, repository, full commit, CI run
  and attempt, source excerpts, prompt contents and configured limits. Paths are
  canonical relative identifiers. Hashes identify content; they authenticate neither
  a repository nor a producer. Acquisition and identity verification remain host work.
- Handoffs use the existing `Handoff` / `Evidence` contracts. Joining sorts claims
  and source assignments, retains each original finding and attribution, and flags
  contradictory or uncertain conclusions for review. A vote cannot override conflict.
- Only `unit` and `typecheck` are named actions. The fixture executor implements the
  existing `Executor`; the existing `ContributionRunner` checks grants and policy.
  A real platform adapter would translate these names to fixed argument vectors;
  provider, GitHub and shell semantics do not belong in policy or domain/core.
- The boundary receives its grant from trusted composition, separately from the
  report. The grant is bound to the context digest and copied when the boundary is
  constructed. No editable approval field, source outcome, prompt, handoff or
  specialist response can supply a grant. The fixture's grant is test configuration,
  not proof of a real human approval system or hostile-process confinement.
- An action is reserved before invocation. Successful, failed, throwing and
  interrupted attempts cannot be repeated through that boundary. This in-memory
  guard has no durability or cross-process guarantee. A new process is not recovery.
- Cancellation is checked before handoff and at invocation. Interrupted work records
  confirmed cancellation or unknown termination and starts no downstream action.
  Returned native results remain intact. Reconciliation and fresh authority are
  required before deliberately repeating an action in a new attempt.
  Cancellation, unknown termination and budget exhaustion permanently stop that
  boundary; resetting host control values cannot authorize another invocation.

`config/ci-review-fixtures.json` can tighten limits, never exceed these ceilings:
12 source files; 24 KiB context including prompts/config; 2 specialists; 8 KiB per
specialist response including evidence; 8 findings per specialist; 120 seconds
per session; 45 seconds per specialist; 20 seconds per verification action; and
2 verification attempts. Values must be positive integers. The complete context
packet size, including its digest, is checked consistently during creation and
freshness validation. Count/byte limits and
pre-dispatch checks execute here. Fixture durations and control-clock values are
inputs; post-invocation checks detect over-budget observations, not preempt a
running synchronous executor. A live host must enforce real timeouts separately.

## Meaning of the review packet

The packet contains context, prerequisites, assignments, original specialist data,
handoffs, joined findings, every verification attempt's native contribution result,
the actual verification workflow result when reached, Evaluation, Outcome and the
optional unchanged upstream Outcome. It snapshots these values for review.

The core remains synchronous and unchanged. Native governance/execution causes
take precedence over inconclusive evaluation. The core has no cancellation status
for its workflow runner: a stopped verification stage retains its native failure
disposition while `session` separately records cancellation or unknown termination.
That is not evidence that an acceptance test ran and failed.

Execution success without one current, designated native test judgment is
inconclusive. An actual failed judgment remains failed even when its executor
succeeded. Both named judgments are required. Conflicts produce `requires-review`
and native escalation. Native failed + `evaluation-inconclusive` is preserved.
`ownerApproval` defaults to pending and is informational. Technical success does
not establish human acceptance.

Replay accepts no execution dependency. It returns the recorded packet unchanged
and a separate applicability judgment; historical success is not rewritten, nor
treated as validation of a different revision. Reports are descriptive, editable
observations, not authenticated attestations or an execution authorization channel.
UUIDs/timestamps from existing evidence recording are retained; deterministic
decisions do not promise byte-identical newly generated reports.

## Claim-to-test mapping

- **Dependencies / C16:** `ci-review.test.ts` blocks pending, missing, failed,
  cancelled, duplicate and evidence-free prerequisites; waits for every result.
  Existing workflow readiness and fan-in tests remain unchanged.
- **Freshness / C09:** `ci-review-context.test.ts` binds source, run attempt,
  prompts/config and owner; `ci-review.test.ts` rejects stale prerequisite,
  specialist and verification evidence, changed context and stale grants.
- **Joining / C03, C10, C11:** reversed input order preserves the join; conflicts
  and uncertainty retain both sources, escalate and invoke no verification.
- **Authority / C04-C07, C17-C18:** ungranted capability and unknown actions invoke
  no executor, including with forged editable approval fields. Assignments cannot
  expand their action set. These are local invocation proofs, not OS security.
- **Interruption / C11-C13:** cancellation before work and confirmed/unknown
  interruption preserve native results, remain inconclusive and start no next action.
- **At-most-once / C05:** duplicate requests, exceptions and resumed calls through
  the same boundary do not repeat execution. Cross-process recovery is unproven.
- **Native meaning / C08-C13:** successful execution without current/unique native
  judgment cannot pass; real failed judgments stay failed; original source Outcomes
  survive; primary invocation causes survive into the native terminal Outcome.
- **Replay / C19:** serialized evidence replays without calling an executor;
  another revision is historical, with its original report preserved.
- **Bounds / C06, C20:** every configurable ceiling rejects unsafe values;
  byte/count/clock fixtures demonstrate the specified local stopping behavior.

These are **deterministic contract evaluations**. Agent-behavior evaluations and
human acceptance are separate, unexecuted tracks. Synthetic specialist durations
are not elapsed measurements. Usage is `not-measured`, not zero. Nothing here proves
specialists outperform a single agent.

## Gate before any live pilot

Stop here until a concrete host is selected and separately authorized. No live
host is certified by these fixtures. Before a pilot, demonstrate:

1. **Supported host:** exact runtime, model/version, settings and tool interfaces;
   revision/attempt-bound GitHub acquisition; bounded context; native result export;
   capability discovery and denial when a required capability is unavailable.
2. **Permission enforcement:** independent owner-controlled authorization bound to
   SHA, packet/config hashes, named actions and expiry; enforced read-only specialist
   tools; fixed verification arguments, confined checkout and credential/network
   limits. If unavailable, keep analysis text-only and have the owner execute checks.
   Report fields and prompt rules cannot substitute for this boundary.
3. **Cancellation:** cancellation propagation, timeout and child-process-tree
   termination with confirmation; late-result rejection; partial evidence retention;
   reconciliation of uncertain completion and an appropriate durable attempt guard
   before any side-effecting retry. This synchronous example supplies none of those
   process-lifecycle guarantees.
4. **Usage accounting:** per-arm/per-role input, output and cached tokens, calls,
   retries, elapsed phases and actual cost where exposed. Record unavailable values;
   reserve/enforce token and cost ceilings in the host before dispatch. Proposed
   ceilings remain 24,000 input tokens / 4,000 output tokens per arm, 60 minutes for
   the pilot, no recursive delegation or automatic retries, and no new paid service.
5. **Evaluation and acceptance:** freeze the six cases, paired baseline/specialist
   protocol, budgets and scoring before calls. Keep native uncertainty and blind
   human usefulness assessment separate from deterministic tests. Retain the
   single-agent baseline unless coordination earns its added complexity.

No push, PR, merge, deployment, credential setup, paid service or live comparison
is part of this stage.
