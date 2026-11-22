# Agentic Engineering Reference

Learn how to separate who may do engineering work from who checks the result. Run the TypeScript reference to see those decisions in code, or use the Architecture Challenge to examine them in your own project. A contributor can be a person, an AI agent, a script, or a CI job.

| What do you want to do? | Start here |
| --- | --- |
| Review a repository you maintain | Follow [Challenge Your Project](#challenge-your-project). You need access to the target and a reviewer. The chat workflow requires no installation. |
| Learn by running examples | Follow [Run the reference itself](#run-the-reference-itself-optional). The TypeScript examples cover duplicate usernames, restoring a backup, and retrying a reservation after a lost reply. |
| Try checkpoint memory and live specialist steering | Run the [release-review workshop](docs/scenarios/checkpoint-swarm.md). Interrupt a timing draft, let unrelated work finish, and see what happens if permission changes before publication. |
| Measure the review method | Run the [reviewer calibration exercise](docs/challenge/reviewer-calibration.md) with a known defect, a sound case and missing evidence. |

## What the executable reference proves

Suppose someone asks an agent to fix duplicate registrations. The agent reports that it finished. Can the system establish that the fix works? The reference models that decision in a small, in-memory application. A local contributor selects a predefined implementation. A separate validator tries to register a new user, register that same name again, and register another new user after the duplicate is rejected. You can run every case locally without an AI account.

### Run the reference itself (optional)

Use Git, Node.js **24.22.2** (the version in `.node-version`), and npm. Clone this repository and install its locked dependencies. If you already have the checkout, start at `npm ci` in its root.

```sh
git clone https://github.com/JCDev26/agentic-engineering-reference.git
cd agentic-engineering-reference
npm ci
npm test -- tests/duplicate-username-workflow.test.ts --reporter=verbose
```

Expect **four passing tests**. Each test passes when the system makes the right decision for its inputs, including when the proposed fix is faulty. Read the test names alongside the two results the code records:

| Scenario | What the validator establishes | What ends the workflow |
| --- | --- | --- |
| Correct implementation and eligible validator | All three registration checks pass. | Completed. |
| Implementation still accepts duplicates | The validator observes a failed acceptance check. | Validation rejects the implementation. |
| No eligible validator | The behavior remains unknown. | Contributor selection fails. |
| Implementation requests a target outside its allowed scope | Validation is never reached. | Policy denies the action before handoff. |

### Follow one decision through the code

1. **Read the requirement.** Find the three registration behaviors and the structured evidence needed to accept them. [Engineering intent](src/scenarios/duplicate-username-intent.ts)
2. **Follow the handoff.** The workflow selects an implementer, checks its authority, and passes its artifact to a separately selected validator. The validator needs its own grant. [Multi-stage workflow](src/scenarios/duplicate-username-workflow.ts)
3. **Inspect the finding.** The validator tries the selected behavior against the user store and records what actually happened. The evaluator checks that evidence against the intent. [Acceptance validator](src/scenarios/duplicate-username-validator.ts) · [Evaluator](src/core/evaluator.ts)
4. **Compare the endings.** In the tests, find `duplicateSafeCandidate()` and `duplicateAcceptingCandidate()`. Both supply an implementation. Only one satisfies the same acceptance criteria. Compare their results with the denied case, where the outcome retains `governance-denied` and the evaluation is `inconclusive`. [Four worked cases](tests/duplicate-username-workflow.test.ts) · [Outcome resolver](src/core/outcome-resolver.ts)

### Apply the idea to a different decision

Run `npm test -- tests/operational-examples.test.ts --reporter=verbose` to see how an incomplete backup can decompress successfully and how a lost reservation reply can lead to a second booking. When reading either example, ask: **What would I observe independently before trusting the contributor’s account?** [Backup and reservation exercises](docs/scenarios/operational-examples.md)

To use the reference while designing your own workflow, pick one operation and write down its acceptance criteria, the grant required to act, and the observation that would establish success. Trace what your system reports if that observation cannot be collected. The [contracts guide](docs/contracts/core-contracts.md) explains who owns each decision; the [scenario guide](docs/scenarios/reference-scenario-001.md) shows how the pieces fit together.

Run `npm test` and `npm run typecheck` for the full reference checks. For design detail, read the [architecture decisions](docs/adr/) and [capability matrix](docs/v1-capability-matrix.md). The examples run trusted code in one process. Production isolation, external identity, and human approval enforcement remain outside the demonstrated guarantees.

### Try steering a swarm

After `npm ci`, run `npm run --silent reference:swarm -- demo`. Security flags a possible redirect, Performance checks which samples reached the product, and Reporting receives the result while its job is offline. The conductor holds one section of the report. The host checks the latest evidence and grant before it can record a release in the local ledger.

Use `workshop` in place of `demo` to steer the same jobs yourself. Type `brief security` to exchange a JSON brief and reply with your own tool. Use `memory` to compare a saved handoff against a changed revision, a revoked grant or a corrected observation. Each example runs locally with synthetic evidence and no model credentials. [Commands and worked outcomes](docs/scenarios/checkpoint-swarm.md)

## Challenge Your Project

Pick one operation you care about. For example, “Can our reporting agent publish a release?” The review follows that operation from the request through the permission check to the actual effect.

1. **Open the repository you want reviewed.** Start a chat in a coding tool that can read that repository. For a private repo, use an environment approved for its contents. Give the reviewer the repository name and commit you want assessed. Start with read access. [Privacy and access guidance](#privacy--security-before-you-run-it)
2. **Ask for claims.** Open the [first-pass prompt](docs/challenge/project-review-prompt.md), copy everything below the horizontal divider, and paste it into the chat. Name your chosen operation in the same message. Expect 20 answers. For each claim about behavior, the reviewer should say where the action happens, what it predicts, and what you could observe. Save that response before continuing.
3. **Challenge those claims.** In the same chat, paste everything below the divider in the [second-pass prompt](docs/challenge/pressure-test-prompt.md). A second reviewer can also do this if you give them the saved answers and the same revision. The reviewer applies general checks and proposes cases that could contradict the answers. Authorize specific local tests if appropriate. When a check cannot be run or verified from existing evidence, record it as inconclusive.
4. **Read the verdict and decide.** For each tested claim, look for the original prediction, what the reviewer actually observed, and a verdict of **supported within the tested scope**, **contradicted**, or **inconclusive**. You decide whether a finding warrants a change.

**What a finding looks like:** A reviewer claims that retrying a reservation always leaves one booking. Reusing the same request ID leaves one. Retrying with a fresh ID leaves two. The broad claim is contradicted; the same-ID guarantee holds in this exercise. [Runnable reservation and backup examples](docs/scenarios/operational-examples.md)

**Want a structured record?** The optional [checklist planner](docs/challenge/automated-checklist.md) generates a JSON answer sheet and challenge cards from this reference checkout. A reviewer conducts the checks in the target repo. The chat workflow above works independently of the planner.

See the [full method](docs/challenge/architecture-challenge.md), [worked assessment](docs/challenge/example-assessment.md), and [rationale for the twenty questions](docs/challenge/question-design.md) for more detail.

### Privacy & Security Before You Run It

The Challenge is a copy/paste review methodology. **agentic-engineering-reference itself does not receive your target repository, upload your source code, operate a remote scanning service, or collect target-repository telemetry.** It requires neither repository credentials nor installation inside the target.

Your chosen reviewing environment may receive and process repository content. Its behavior depends on the provider's product, plan, privacy settings, retention policies, enterprise/organization controls, administrator policies, and applicable terms. Verify those controls before sharing content; this reference makes no privacy guarantee about that environment.

- **Public repositories:** a capable agent with GitHub/web access may inspect a repository from its URL; support depends on the reviewing tool.
- **Private or sensitive repositories:** use an organization-approved environment with appropriately authorized access. Follow security, AI-use, repository, and data-classification policies, including enterprise/business controls where required. Do not make a private repository public or upload proprietary code to an unapproved service to run the Challenge. This reference does not provide repository access.

Use least privilege. Do not expose unnecessary passwords, API keys, access tokens, private keys, production credentials, customer or regulated data, or sensitive personal information. Do not grant access to production databases/infrastructure, unrelated private repositories, or organization systems outside the review scope merely for a more complete assessment.

If something cannot safely or appropriately be inspected, record the access limitation, describe what could not be verified, and classify the relevant claim accordingly. **Missing access is an evidence limitation, not automatically a defect.** Do not broaden access merely to obtain a stronger classification.

### Recommended reviewer configuration

| Review type | Recommended configuration |
| --- | --- |
| Quick orientation | Capable coding model, normal/medium reasoning, repo read access |
| Full Architecture Challenge | Strong coding/reasoning model, high reasoning, repo-wide read/search access where authorized and appropriate |
| Large/complex repo | Strong multi-step repo agent, high reasoning, tests/CI/history where permitted |
| Focused follow-up | Medium/high reasoning scoped to an accepted finding |

Repository-wide visibility can improve review depth, but grant only authorized and appropriate read/search access needed for relevant source, tests, docs, configuration, CI definitions/results, and useful git history. This does not mean unrestricted access to connected systems. Terminal/test execution requires separate authorization under applicable repository and organization policies. Keep the first assessment read-only; write access is not required.

This work needs cross-file causal reasoning, evidence tracing, negative-path analysis, trust/authority analysis, and architectural judgment—not primarily code completion. Fast/autocomplete-oriented models can help with orientation or follow-up but are not preferred for the first full review. No model vendor or official integration is required.

> Reviewer capability affects review depth. Repository evidence determines what can actually be claimed. Access should remain bounded to what the review legitimately requires.

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

## First External Challenge

The Challenge was applied to the independent [Playwright Agent Wrapper](https://github.com/JCDev26/playwright-agent-wrapper-starter), without requiring it to adopt this reference's classes. It found concrete semantic defects: most importantly, child exit 1 had been treated as proof that tests ran and failed, although that exit can also occur without a trustworthy test judgment.

The wrapper was [hardened](https://github.com/JCDev26/playwright-agent-wrapper-starter/commit/9cbfa3a) to classify current-run native Playwright evidence, preserve literal spec meaning, and strengthen structured failure handling. It remained a small Playwright wrapper, not a workflow/agent platform. [Hosted CI passed](https://github.com/JCDev26/playwright-agent-wrapper-starter/actions/runs/37132962751) at its [v1 stopping commit](https://github.com/JCDev26/playwright-agent-wrapper-starter/commit/932a8e23c01d3c7064331e36d5b39f1548617449).

**The Challenge exposed false claims about what the system knew without prescribing the reference implementation.** This is a case study, not certification. Its feedback also sharpened the method: determine whether a defect exists; do not manufacture work.

## V1 boundary and source availability

The [v1.0.0 release](https://github.com/JCDev26/agentic-engineering-reference/releases/tag/v1.0.0) remains the implementation stop point. Production isolation, credential management, authenticated evidence, real contributor/platform adapters, human approval flows, durable execution, recovery, retries, and parallel scheduling are intentionally deferred. Descriptive contract fields do not implement these controls. No production agent platform or security guarantee is claimed.

The [maturation audit](docs/reviews/v1-maturation-review.md) records the completion decisions. Earlier [reviews](docs/reviews/) are historical experiments, not a backlog; the [landscape cross-check](docs/reviews/2026-landscape-alignment-review.md) records external pressure without importing vendor-specific semantics.

This repository is publicly available for portfolio and reference purposes. No open-source license is currently granted.


## Portable current-run observations

See [run evidence v1](docs/run-evidence-v1.md) and the small, dependency-free adapters in
`src/reporting/`. Native terminal APIs remain unchanged. The envelope adds tested revision,
environment, time, named checks, and separate visual/owner states; it is not an evidence
service or authenticated approval mechanism. Keep the project bounded and independently usable.

These reporting adapters are optional library utilities. Existing CLI/CI output keeps its native format; adapter tests do not establish a universally wired reporting or human-approval system.

## Optional CI review fixture experiment

The [revision-bound CI review example](docs/scenarios/ci-review-fixtures.md) demonstrates
explicit prerequisites, bounded fixture handoffs, deterministic joining, governed
named verification and a human review packet. It reuses the v1 contracts and keeps
platform adapters outside policy. It does not dispatch live specialists or execute
agent-requested commands. Replay executes no verification actions. Editable approval
metadata grants no authority; fixture results establish no multi-agent performance
advantage. The guide records the separate host, permission, cancellation and usage
gate before any live pilot.
