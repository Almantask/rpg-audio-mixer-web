---
name: design-to-gherkin
description: Translates design specs into refined Cucumber feature files through design alignment, a single BDD best-practices review, and applied improvements. Use when the user wants Gherkin updated to match designs.
---

# Design to Gherkin

Orchestrate Gherkin refinement only. Delegate via Task subagents; do not substitute for specialists.

## Quick start

1. Identify target `.feature` file(s) from the user request.
2. Create a todo list mirroring the three phases below.
3. Launch subagents **sequentially** — Phase 2 runs **once**; no review loops.
4. End with a concise summary of design deltas and BDD improvements applied.

## Inputs

| Input | Location |
|---|---|
| Feature files | `features/<screen>/*.feature` (user-specified) |
| Design specs | `docs/designs/*-design.md`, `docs/designs/platform-design.md` |
| **Excluded** | `docs/designs/answered-questions-dont-refer/` — never use as source of truth |

Map each feature file to its scene design doc by domain name (e.g. `home_screen.feature` → `home-design.md`). Include `platform-design.md` when shell, navigation, or shared layout applies. Ask the user if mapping is unclear.

## Phase 1 — Design alignment

Launch `qa-tester` (`author-acceptance-tests`):

- Read the specified `.feature` file(s) and mapped design docs.
- Cross-check every scenario against design: behaviors, empty/loading/error states, navigation, terminology, and acceptance criteria.
- **Update the feature files** for any gap, drift, or outdated wording vs. design.
- Do **not** read `answered-questions-dont-refer/` — resolved decisions belong in `*-design.md`.
- Do **not** review BDD style yet — design correctness only.

**Deliver:** list of design-driven edits (scenario added/changed/removed, with design reference).

## Phase 2 — BDD review (once)

Launch `qa-reviewer` (`review-bdd-artifacts`):

- Review **only** the Phase 1 updated feature file(s).
- Evaluate Gherkin quality per Discovery/Formulation best practices — scenario independence, declarative steps, ubiquitous language, coverage structure.
- **Suggest improvements only** — do not edit files.
- **Single pass** — no second review round.

**Deliver:** severity-tagged findings (`CRITICAL`–`LOW`) with concrete rewrite recommendations.

## Phase 3 — Apply BDD improvements

Launch `qa-tester` (`author-acceptance-tests`):

- Read Phase 2 suggestions.
- Apply all `CRITICAL`, `HIGH`, and `MEDIUM` recommendations to the feature files.
- Apply `LOW` when straightforward; skip with brief rationale if it conflicts with Phase 1 design intent.
- Do not re-open design alignment unless a suggestion exposes a design contradiction — flag to the user instead of guessing.

**Deliver:** final diff summary grouped by applied vs. skipped suggestions.

## Reporting

- Phase-oriented progress updates.
- Final summary: files changed, design gaps closed, BDD improvements applied, skipped suggestions with reason.
- Open questions only when design and BDD guidance conflict.

**Git Policy:** Do NOT commit unless the user explicitly asks.
