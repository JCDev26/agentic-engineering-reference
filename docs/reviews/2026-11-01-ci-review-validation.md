# CI review fixture validation, 2026-11-01

Branch: `feat/ci-review-fixtures-20261101`, isolated under
`worktrees/ci-review-fixtures-20261101`. Base: feature commit
`c936e80331998405e93f5949ad4bddd4a948ca7c`; remote main remains
`b7a86c3fa4f6ac708125df1fca3188ee29b4c874`. Both remote heads were rechecked after
validation. Changes are local and uncommitted; no push, PR, merge or deployment ran.
The original checkout remains on its original local main commit.

## Validation sequence and evidence

The [maintenance observation](2026-11-01-ci-review-maintenance.md) records official
security/compatibility sources and the 145-test gates passed on both Node pins
**before** adding the scenario. Final checks ran on Windows x64:

- **Node 24.22.2 / npm 11.19.1:** clean `npm ci`; source-only demo build; all
  **195 tests / 25 files passed**, 0 failures and 0 skips; native Vitest duration
  **662 ms**; `npm run typecheck` passed; `npm audit --json` reported **0** findings.
- **Node 22.23.4 / npm 10.9.9:** clean `npm ci`; source-only demo build; all
  **195 tests / 25 files passed**, 0 failures and 0 skips; native Vitest duration
  **805 ms**; `npm run typecheck` passed; `npm audit --json` reported **0** findings.
- The 145 existing tests remain present and passing; 50 new deterministic cases
  occupy `ci-review.test.ts` (38) and `ci-review-context.test.ts` (12). The last
  boundary case verifies duration checks even when a host returns a mutable clock.
- All eight CLI cases emitted parseable JSON. Healthy: review-ready/passed;
  blocked/stale: blocked/inconclusive; conflict: requires-review/inconclusive;
  cancelled: cancelled/inconclusive; unauthorized: blocked with native
  governance-denied; duplicate: blocked after one underlying fixture execution;
  interrupted: unknown with its native execution failure retained. No case ran
  an agent, GitHub mutation or verification shell command.
- Current replay preserved the serialized record; another commit was historical
  and inconclusive for that target while retaining historical success. Replay's
  API accepts no execution dependency. Tests assert zero executor calls on replay.
- `git diff --check` passed. Domain/core, reporting adapters, AGENTS.md and all
  existing test files have no changes. CI edits retain the existing permissions,
  cancellation policy and check names; hosted CI has **not** run on these local edits.

Durations above are one observation of deterministic test suites, not an agent
comparison or a speedup claim. Fixture durations are synthetic inputs. Model usage,
tokens and cost are unmeasured; human acceptance has not been inferred.

Raw evidence lives in the ignored `artifacts/validation/` directory:

- `maintenance-ci-node22.txt`, `maintenance-ci-node24.txt`, maintenance test/typecheck
  logs, `maintenance-node22.xml`, `maintenance-node24.xml`, `maintenance-audit.json`,
  `maintenance-tree.txt`, `maintenance-lock.txt`, and `maintenance.patch`.
- `final-ci-node22.txt`, `final-ci-node24.txt`, `complete-build-node{22,24}.txt`,
  `complete-tests-node{22,24}.txt`, `complete-typecheck-node{22,24}.txt`,
  `complete-node22.xml`, `complete-node24.xml`, `final-audit.json`, and
  `final-audit-node22.json`.
- `complete-fixture-{healthy,blocked,stale,conflict,cancelled,unauthorized,duplicate,interrupted}.json`,
  `complete-fixture-replay.json`, `complete-fixture-historical-replay.json`. Earlier
  fixture and 194-test observations remain available under their original names.
- `complete-source-manifest.json` binds the final local file contents to the baseline;
  `complete-validation-summary.json` records tool pins, native JUnit/audit totals and CLI observations.
  These local hashes identify the reviewed contents, not authenticated provenance.

The initial all-source-and-tests demo build caused Vitest to discover stale emitted
test copies. That intermediate gate failed (30 failures among 378 discovered tests).
Its native log/JUnit are retained as `intermediate-duplicate-discovery-node24.*`.
The correction is a source-only demo build configuration plus explicit discovery
of `tests/**/*.test.ts`; tests pass **after** building, with stale generated copies
still present. The fix excludes generated outputs rather than suppressing source
failures. Replay uses the already-built entry point and does not invoke a compiler.

## Changed file inventory

Maintenance:

- `.node-version`
- `.github/workflows/ci.yml`
- `package.json` (also adds the optional build/demo commands)
- `package-lock.json`
- `README.md` (also links the optional scenario)
- `docs/2026-11-agent-quality-findings.md` (append-only follow-up pointer)
- `docs/reviews/2026-11-01-ci-review-maintenance.md`

Deterministic example and its review evidence:

- `config/ci-review-fixtures.json`
- `prompts/ci-review-owner-v1.md`
- `prompts/ci-review-specialist-v1.md`
- `src/scenarios/ci-review-context.ts`
- `src/scenarios/ci-review.ts`
- `src/scenarios/ci-review-fixtures.ts`
- `src/scenarios/ci-review-demo.ts`
- `tests/ci-review-context.test.ts`
- `tests/ci-review.test.ts`
- `tsconfig.ci-review.json`
- `vitest.config.ts`
- `tsconfig.json` (typechecks the test configuration)
- `docs/scenarios/ci-review-fixtures.md`
- `docs/reviews/2026-11-01-ci-review-validation.md`

The [scenario guide](../scenarios/ci-review-fixtures.md) contains the claim-to-test
mapping and the separate live-pilot gate. Deterministic contracts are exercised;
agent-behavior evaluation and human acceptance remain distinct, unexecuted tracks.
No SDK, production runtime, live provider/GitHub adapter, new credentials or paid
service is introduced. Stop at the host/permissions/cancellation/usage gate.

## Review fixes and revalidation, 2026-11-06

The November 1 observations above remain historical. Maintenance is now isolated
on local branch `feat/reference-maintenance-20261106`; the fixture experiment
remains on `feat/ci-review-fixtures-20261101`, based on that maintenance commit.
Neither branch has been pushed or merged.

Two review findings were reproduced and corrected:

- Context creation and freshness validation now measure the complete serialized
  packet, including its digest. An exact-limit packet remains current and can be
  reconstructed unchanged; one additional byte is rejected.
- A verification boundary retains cancellation, unknown termination and budget
  exhaustion as terminal state. Resetting host cancellation or clock values cannot
  start another action through that boundary. The original attempt keeps its
  native result; later rejected attempts do not claim a new execution.

Ten regression cases cover the packet edge, action/session duration exhaustion,
invalid/backwards clocks, pre-invocation session exhaustion, and cancellation or
unknown termination before and after invocation. Eight cases were run against the
original implementation and failed before the fixes; all ten pass after the fixes.
The prior interruption test now expects the retained terminal disposition rather
than a duplicate-action disposition. Ordinary successful/throwing deduplication
tests remain unchanged.

The CI matrix now builds the source-only demo before running the tests, exercising
the documented build configuration and test discovery after generated output exists.

Fresh Windows x64 checks passed on **Node 22.23.4** and **Node 24.22.2**:

- Maintenance checkout: clean `npm ci`, **145 tests / 23 files**, and typecheck.
- Fixture checkout: clean `npm ci`, demo build, **205 tests / 25 files**, and typecheck.
- Both clean installations reported zero audit findings. npm 11 retained its
  esbuild script-approval warning; no approval configuration was changed.
- All eight CLI cases matched their documented session/technical states on both
  versions. Current replay preserved the packet and passed; another revision was
  historical/inconclusive while preserving the original successful record.
- `git diff --check` passed. Hosted GitHub Actions has not run on these local commits.

Fresh replay inputs are retained in ignored
`artifacts/validation/2026-11-06-healthy-node{22.23.4,24.22.2}.json`.
These checks establish fixture behavior, not live-agent effectiveness or acceptance.
