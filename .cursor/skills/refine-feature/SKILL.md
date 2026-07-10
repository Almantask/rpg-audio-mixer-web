---
name: refine-feature
description: 'Refine existing specs, designs, and implementation plans for a feature. Use when: user says /refine-feature, requests spec or design updates, or needs plan corrections before implementation.'
---

# Refine Feature

Orchestrate refinement of existing artifacts. Delegate via Task subagents; do not substitute for specialists.

## Quick start

1. Read the refinement trigger (UX feedback, bug report, or extension request).
2. Create a todo list mirroring the phases below.
3. Launch subagents per phase; run parallel batches concurrently.
4. Stop at human gates; resume only after `/feedback/` has checkbox decisions.
5. End with a concise refinement summary.

## Phase 1 — Priority

Launch `product-owner` (`define-product-requirements`):
- Evaluate feedback and re-prioritize value
- Define change goals and behavior updates

## Phase 2 — Design update (sequential)

Launch `product-designer` (`design-ux-prototypes`):
- Update `[scene]-design.md` and HTML prototypes in `docs/designs/`
- Keep scene ↔ HTML links intact

## Phase 3 — Spec update

**First:** `qa-tester` (`author-acceptance-tests`) — modify existing `.feature` files in `features/`.

**Then parallel:** `qa-reviewer` (`review-bdd-artifacts`) · `principal-qa` (`review-feature-requirements`)

## Phase 4 — Plan update

**First:** `fe-developer` — update `/plans/summary.md` and relevant `/plans/iteration-x.md`. Reference all changed feature files, scenes, and HTML prototypes.

**Then parallel:** `fe-reviewer` (`review-frontend-production-code`) · `principal-engineer` (architectural review) · `audio-specialist` (`engineer-audio-playback`) *(skip if no audio logic)*

Build/CI blocked → `devops-engineer` (`manage-build-pipeline`), then retry.

## Phase 5 — Principal review (parallel)

`principal-engineer` · `principal-po` · `principal-qa`

Record trade-off questions in `/feedback/`.

## Phase 6 — Human gate

Stop and notify the human when `/feedback/` has open questions. Do not advance until checkbox decisions exist.

## Phase 7 — Post-feedback fixes

Launch `fe-developer` (+ `audio-specialist` if applicable) to align designs, `.feature` files, and plans with `/feedback/` decisions.

## Phase 8 — History

Launch `project-historian` (`document-learnings`) to capture what changed and why.

## Reporting

- Short phase-oriented progress updates.
- When blocked: phase, blocking role, needed human decision.
- Final summary: artifacts updated, remaining risks, readiness for `/new-feature`.

**Git Policy:** Do NOT commit unless the user explicitly asks.
