---
name: new-feature
description: 'Deliver a feature end-to-end — implementation, validation, review council, fixes, and documentation. Use when: user says /new-feature, requests full feature delivery, or wants the complete pipeline for a bug or requirement.'
---

# New Feature Delivery

Orchestrate the full delivery lifecycle. You are the delivery lead — delegate via Task subagents; do not substitute for specialists.

## Quick start

1. Read the user's feature or bug description.
2. Create a todo list mirroring the phases below.
3. Launch subagents per phase; run parallel batches concurrently.
4. Stop at human gates; resume only after `/feedback/` has decisions.
5. End with a concise delivery summary.

## Phase 1 — Implementation (parallel)

| Track | subagent_type | Skill |
|---|---|---|
| Acceptance spec | `qa-tester` | `author-acceptance-tests` |
| Production code | `fe-developer` | `implement-frontend-with-tdd` |

QA writes `.feature` files and step definitions — does **not** run acceptance tests yet.

## Phase 2 — Validation

Launch `qa-tester` to run:

```powershell
.\ai\skills\author-acceptance-tests\scripts\run_acceptance_tests.ps1 -FeaturePath "features/[target].feature"
```

- Build/CI blocked → launch `devops-engineer` (`manage-build-pipeline`), then retry.
- Tests fail → return to Phase 1 production track; rerun Phase 2 before advancing.

## Phase 3 — Review Council (strict batches)

**Batch A** (parallel): `qa-reviewer` · `principal-engineer`

**Batch B** (parallel, after A): `principal-qa` · `audio-specialist` *(skip audio if feature has no media logic)*

**Human gate:** Principal reviewers may record questions in `/feedback/`. Stop and notify the human. Do not start Batch C until decisions exist.

**Batch C** (parallel, after gate): `product-owner` · `principal-po`

Blocking issues → Phase 4.

## Phase 4 — Post-Review Fixes

Launch `fe-developer` and `qa-tester` to resolve all reviewer findings and `/feedback/` decisions. Return to Phase 2, then rerun affected review batches.

## Phase 5 — Documentation

Launch `project-historian` (`document-learnings`) to update `app/Learnings.md` and related docs.

## Reporting

- Short phase-oriented progress updates.
- When blocked: phase, blocking role, needed human decision.
- Final summary: shipped scope, verification status, risks, follow-ups.

**Git Policy:** Do NOT commit unless the user explicitly asks.
