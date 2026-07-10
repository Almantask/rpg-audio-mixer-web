---
name: plan-feature
description: 'Plan a new feature from requirements to finalized designs, Gherkin specs, and implementation strategy. Use when: user says /plan-feature, requests feature planning, or needs an iteration plan before any production code.'
---

# Plan Feature

Orchestrate pre-implementation planning. Delegate via Task subagents; do not substitute for specialists.

**Quality gate:** No plan is complete without `.feature` files, `[scene]-design.md` specs linked to HTML prototypes, and `/plans/iteration-x.md` referencing all three.

## Quick start

1. Read the feature or increment description.
2. Create a todo list mirroring the phases below.
3. Launch subagents per phase; run parallel batches concurrently.
4. Stop at human gates; resume only after `/feedback/` has checkbox decisions.
5. End with a concise planning summary.

## Phase 1 — Discovery (parallel)

| subagent_type | Skill |
|---|---|
| `product-owner` | `define-product-requirements` |
| `principal-po` | `define-product-requirements` |

## Phase 2 — Design (sequential)

Launch `product-designer` (`design-ux-prototypes`):
- `[scene]-design.md` in `docs/designs/`
- HTML prototypes with empty, loading, success, and error states
- Each scene doc links to its HTML file

## Phase 3 — Behavioral spec

**First:** `qa-tester` (`author-acceptance-tests`) — Gherkin `.feature` files in `features/`.

**Then parallel:** `qa-reviewer` (`review-bdd-artifacts`) · `principal-qa` (`review-feature-requirements`)

Principal QA may record questions in `/feedback/feature [name].md`.

## Phase 4 — Implementation strategy

**First:** `fe-developer` — draft `/plans/summary.md` and `/plans/iteration-x.md`. Every plan must link `.feature` files, scene design docs, and HTML prototypes.

**Then parallel:** `principal-engineer` (technical feasibility) · `audio-specialist` (`engineer-audio-playback`) *(skip if no audio logic)*

Build/CI blocked → `devops-engineer` (`manage-build-pipeline`), then retry.

## Phase 5 — Principal review (parallel)

`principal-engineer` · `principal-po` · `principal-qa`

Record trade-off questions in `/feedback/iteration [x].md` or `/feedback/feature [name].md`.

## Phase 6 — Human gate

Stop and notify the human when `/feedback/` has open questions. Do not advance until checkbox decisions exist.

## Phase 7 — Post-feedback fixes

Launch `fe-developer` (+ `audio-specialist` if applicable) to update plans and linked artifacts per `/feedback/` decisions.

## Phase 8 — Baseline

Launch `project-historian` (`document-learnings`) to finalize `plans/summary.md` and capture strategic rationale.

## Reporting

- Short phase-oriented progress updates.
- When blocked: phase, blocking role, needed human decision.
- Final summary: artifacts produced, open risks, readiness for `/new-feature`.

**Git Policy:** Do NOT commit unless the user explicitly asks.
