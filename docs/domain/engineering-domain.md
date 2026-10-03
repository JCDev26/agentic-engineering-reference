# Engineering contribution domain

The core domain describes engineering work independently of a contributor, vendor, IDE, protocol, or execution platform. A useful test is: would this concept still matter if the current tool disappeared?

The [contracts guide](../contracts/core-contracts.md) describes implemented fields. The [capability matrix](../v1-capability-matrix.md) distinguishes executable proof from conceptual extension points.

## Implemented vocabulary

| Concept | Question it answers |
| --- | --- |
| Work item | What request entered the engineering system? |
| Engineering intent | What outcome is wanted, and what explicit evidence requirements will judge it? |
| Workflow | Which responsibilities depend on which others? |
| Contribution | What bounded unit of work is assigned now? |
| Contributor | Who or what can perform that work? |
| Contributor profile | What role and authority constraints apply? |
| Contribution strategy | Which available candidate fits those constraints? |
| Capability grant | Is this requested action authorized for this contribution? |
| Policy | Does a deterministic constraint allow this requested invocation? |
| Executor | What mechanism performs the authorized operation? |
| Artifact | What output can the next responsibility consume? |
| Evidence | What observation was produced, by whom, for which contribution? |
| Handoff | What data and context move between dependent responsibilities? |
| Evaluation applicability | Was the engineering question reachable? |
| Evaluation | Does applicable evidence satisfy the declared requirements? |
| Outcome | What is the terminal disposition and primary cause? |

The system owns engineering definitions and governance. Contributors perform assigned work through contracts. A contributor may propose a better requirement or workflow, but changing the system's definition is a separate engineering decision.

## Distinctions that matter

**Intent and contribution.** Acceptance prose explains the desired result to people. Structured intent requirements supply deterministic evidence checks. A contributor's identity or preferred tool does not define success.

**Ability and authority.** Candidate capabilities describe eligibility. Contribution capability IDs describe granted authority. Selection does not enlarge a grant, and a grant does not bypass policy.

**Execution and engineering.** A validator can execute successfully and discover incorrect behavior. Conversely, denied execution cannot establish that the untested behavior is incorrect.

**Artifact and evidence.** An implementation reference identifies what to validate. The resulting test evidence reports what validation observed. A pass/fail filename or artifact token cannot replace the original observations.

**Evidence and cause.** Evidence supports inspection; typed causes communicate the failure observed at a particular boundary. Higher layers preserve or deliberately normalize the cause rather than parsing logs to rediscover it.

**Handoff and authority.** A downstream stage receives artifact references and local context. It still needs its own eligible contributor, grants, and policies.

## Conceptual vocabulary, intentionally unimplemented

A **tool** would expose capabilities through a concrete mechanism. A **skill** would provide guidance without granting authority. An **execution environment** would enforce isolation and resource boundaries. An **approval** would represent an authorized decision that allows controlled work to continue. An **adapter** would translate an external system without redefining engineering semantics.

These concepts remain useful for humans, scripts, pipelines, services, and AI contributors. v1 does not implement human participation, remote identity, approvals, isolated execution, or real platform interoperability merely by naming them.

## The reference domain

The reference application has a tiny in-memory user store. Its acceptance validator checks unique creation, duplicate rejection without an extra persisted user, and subsequent valid creation. Contributor implementations select predefined behavior by artifact reference.

That fixture provides a small falsifiable engineering result. It is not a user-management product, database uniqueness strategy, source-editing agent, or production workload benchmark.

See [ADR-0001](../adr/ADR-0001-contributor-and-vendor-neutral-core.md), [ADR-0002](../adr/ADR-0002-separate-engineering-intent-from-engineering-contribution.md), and [ADR-0003](../adr/ADR-0003-preserve-evidence-and-terminal-causality.md) for the durable decisions.
