# November 2026 agent quality findings

The portable reporting adapters preserve native terminal APIs and descriptive evidence.
They do not authenticate producers, authorize publication, dispatch agents or operate a service.

## Dependency observation (2026-11-01)

The existing lockfile audit reports four affected development packages: two moderate and
two high severity findings. This project has no production dependencies. Development-only
does not mean risk-free: these advisories concern test mocks, dev-server/editor behavior
and source-map processing. They are not evidence of exploitation in this repository.

| Development package | Severity | Advisory references |
| --- | --- | --- |
| @vitest/mocker | moderate | [advisory](https://github.com/advisories/GHSA-82fw-gwwq-j7x9), [advisory](https://github.com/advisories/GHSA-qxg6-89mg-rqv8) |
| source-map-js | high | [advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) |
| vite | high | [advisory](https://github.com/advisories/GHSA-587h-7wmj-h5pm), [advisory](https://github.com/advisories/GHSA-698v-4r3x-3vcv), [advisory](https://github.com/advisories/GHSA-9jrq-w75r-8gcw), [advisory](https://github.com/advisories/GHSA-r825-w8mm-5pxw), [advisory](https://github.com/advisories/GHSA-rq7h-c2jc-7f22) |
| vitest | moderate | [advisory](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) |

Compatible-fix attempts with the already installed npm versions failed in Arborist with
`Cannot read properties of null (reading edgesOut)`, including a clean-manifest attempt.
No dependency ranges, lockfile, global tool installation, or validation gates were changed
to hide the findings. Recheck the audit and apply a narrowly validated compatible update
using supported tooling as a follow-up; this branch does not claim a clean security audit.

## Adoption boundary

Versioned deterministic CI, fresh native evidence and human revision-bound review are the
implemented foundation. A read-only CI diagnosis pilot or model-routing comparison remains
an optional future experiment. Evaluate accepted outcomes, retries, elapsed time and cost;
do not enable paid inference, live orchestration, account rulesets or self-approved policy
rewrites as a consequence of these reference updates. Preserve the bounded v1 stopping point.
