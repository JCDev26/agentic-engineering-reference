# Contribution Failure Causality 001 Review

## Purpose

This review records the architectural findings from moving contribution failure classification into the contribution execution boundary.

Previous workflow experiments preserved failure causality through terminal `Outcome`.

However, scenario stage handlers still inferred some contribution failures by inspecting evidence metadata.

For example, policy denial was identified by searching `policy-result` evidence for:

    allowed = false

This experiment removes that responsibility from scenario code.

---

## Contribution Failure Model

`ContributionRunResult` now exposes an optional structured failure reason.

Current contribution-level causes are:

    capability-denied
    policy-denied
    execution-failed

These describe why a bounded contribution did not execute successfully.

---

## Capability Denial

A requested capability may not be granted to the contribution.

The runner returns:

    status = blocked
    failureReason = capability-denied

Only capability evidence is produced.

The executor is never invoked.

---

## Policy Denial

A capability may be granted while policy still denies the requested action or target.

The runner returns:

    status = blocked
    failureReason = policy-denied

Capability and policy evidence are preserved.

The executor is never invoked.

This remains distinct from capability denial.

---

## Execution Failure

A contribution may pass capability and policy governance but fail during execution.

The runner returns:

    status = execution-failed
    failureReason = execution-failed

Capability, policy, and execution evidence are preserved.

---

## Structured Cause and Evidence

Structured failure reasons do not replace evidence.

They serve different purposes.

### Failure Reason

Answers:

> Why did this contribution fail?

### Evidence

Answers:

> What happened, and what observations support that conclusion?

Consumers no longer need to reverse-engineer contribution causality from evidence metadata.

---

## Workflow Mapping

Workflow orchestration may intentionally normalize lower-level causes.

For example:

    capability-denied
            ↓
    governance-denied

and:

    policy-denied
            ↓
    governance-denied

Both represent governance failure at the workflow/outcome level.

However, the more precise contribution-layer cause remains available where the failure originated.

This allows different abstraction layers to preserve the amount of detail appropriate to their responsibility.

---

## Scenario Boundary Improvement

The duplicate-username workflow previously inspected policy evidence to determine whether execution had been denied by governance.

It now consumes:

    ContributionRunResult.failureReason

directly.

Scenario code no longer acts as a contribution-failure classifier.

---

## Architectural Finding

Failure causality should originate from the layer that has direct knowledge of the failure.

Higher layers should consume or deliberately normalize that cause rather than reconstruct it from implementation-specific evidence.

This reduces coupling between orchestration and evidence representation.

---

## What Is Now Defensible

The contribution layer now distinguishes:

- capability denial
- policy denial
- execution failure

without requiring scenario-level evidence inspection.

Evidence remains available for auditability.

Workflow and terminal layers can deliberately map contribution causes into broader workflow failure categories.

---

## What Is Still Not Proven

This experiment does not address:

- retries
- contributor reselection
- recovery
- human review
- approval boundaries
- persistent workflow state
- generalized error taxonomies

It also does not resolve the separate question of whether engineering evaluation should run after a workflow is already known to have failed before engineering validation could occur.

That remains a future architectural pressure point.

---

## Conclusion

Contribution failure causality is now owned by the contribution boundary rather than inferred by scenario orchestration.

The architecture preserves both structured cause and supporting evidence without requiring higher layers to understand evidence metadata conventions.