---
name: gherkin-to-production
description: Implements production code from existing Cucumber feature files and scene design specs using the Double BDD loop — features define behavior, designs define looks. Use when specs and designs already exist, or shipped UI must match Gherkin without rewriting features.
---

# Gherkin to Production

Orchestrate implementation from **existing** artifacts. Delegate via Task subagents; do not substitute for specialists.

**Source of truth:** `.feature` files → behavior · `docs/designs/*-design.md` + HTML prototypes → looks. On conflict: features win for logic and flows; designs win for layout, copy, and visual states. Escalate contradictions — do not guess.

**Not this skill:** write or refine specs → `gherkin-to-features`, `design-to-gherkin`, `refine-feature`. Full delivery council → `new-feature`.

## Quick start

1. Identify target scope (feature file(s), screen, or iteration).
2. Create a todo list mirroring the phases below.
3. Run **Loop 1 (Discovery)** — map artifacts and slice work before coding.
4. Run **Loop 2 (Build)** — TDD inner loop + acceptance outer loop per slice.
5. End with verification status, files changed, and open conflicts.

## Inputs

| Input | Location |
|---|---|
| Behavior | `features/<domain>/*.feature` (user-specified or inferred from scope) |
| Looks | `docs/designs/*-design.md`, linked HTML in `docs/designs/` |
| Shared shell | `docs/designs/platform-design.md`, `docs/designs/home-design.md` |
| Plans (optional) | `/plans/iteration-x.md` when present |
| **Excluded** | `docs/designs/answered-questions-dont-refer/` — never source of truth |

Map features to design docs by domain (e.g. `features/trash/` → `trash-design.md`). Ask the user if mapping is unclear.

## Loop 1 — Discovery

**Goal:** Understand what to build before touching production code.

Launch in parallel:

| subagent_type | Skill | Task |
|---|---|---|
| `qa-tester` | `author-acceptance-tests` | Read target `.feature` files; list scenarios, tags, and missing step definitions |
| `fe-developer` | `implement-frontend-with-tdd` | Read mapped design docs + HTML; inspect `src/` for existing components to extend |

**Deliver:** implementation slice list — scenario → components/hooks → design states (empty, loading, success, error). Mark slices already green in code vs. pending.

**Human gate:** Stop on feature↔design contradictions or ambiguous scope. Record in `/feedback/`; resume after decisions.

## Loop 2 — Build (per slice)

Work scenario-by-scenario or by small batches. For each pending slice:

### Inner loop — TDD (production)

Launch `fe-developer` (`implement-frontend-with-tdd`):

- **RED** → failing Vitest/RTL test for observable behavior from the scenario.
- **GREEN** → minimum React/TypeScript to pass; match design spec for layout and states.
- **REFACTOR** → clean without breaking tests.
- Audio logic → also follow `engineer-audio-playback`.

Behavior from **features**; visuals from **designs**. Do not invent scenarios or UI not in artifacts.

### Outer loop — Acceptance (BDD)

Launch `qa-tester` (`author-acceptance-tests`):

- Add or extend Playwright step definitions in `e2e/steps/` for the scenario.
- Do **not** run E2E until the slice has production code and compiles.

### Validate slice

```powershell
.\ai\skills\author-acceptance-tests\scripts\run_acceptance_tests.ps1 -FeaturePath "features/<target>.feature"
```

- Build/CI blocked → `devops-engineer` (`manage-build-pipeline`), then retry.
- Failures → return to inner/outer loops for that slice; do not advance.

Repeat until all target scenarios are green.

## Quality gates

Before handoff, all must pass:

```bash
pnpm typecheck
pnpm lint
pnpm test
```

Plus acceptance tests for the target feature path(s).

## Reporting

Loop-oriented progress updates; final summary: scenarios shipped, files changed, gates, conflicts. Escalate to `new-feature` for review council.

**Git Policy:** Do NOT commit unless the user explicitly asks.
