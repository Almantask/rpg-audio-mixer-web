---
name: requirements-to-gherkin
description: Authors and refines Cucumber .feature files from decided acceptance criteria in docs/requirements and checked /feedback answers. Use when converting requirements or feedback decisions into Gherkin, or when the user says /requirements-to-gherkin — not when updating features from design specs (use design-to-gherkin).
---

# Requirements to Gherkin

Orchestrate requirements → Gherkin only. Delegate via Task subagents; do not substitute for specialists.

## Quick start

1. Identify requirements doc, feedback file, and target `features/` path.
2. **Gate** — if blocking `/feedback/` checkboxes are empty, stop (see [REFERENCE.md](REFERENCE.md#human-gate)).
3. Create a todo list mirroring the three phases below.
4. Launch subagents **sequentially** — Phase 2 once; no review loops.
5. Summarize coverage and BDD improvements applied.

```text
docs/requirements/library-imported-tracks.md
+ feedback/feature library-imported-tracks.md   (checked options)
→ features/library/browse_imported_tracks.feature
```

## Inputs

| Input | Location |
|---|---|
| Requirements | `docs/requirements/*.md` |
| Decided feedback | `feedback/feature *.md` — checked options only |
| Feature files | `features/<screen>/*.feature` (create or update) |
| Terminology | Peer `.feature` files (ubiquitous language only) |

Checked feedback overrides conflicting draft AC wording. Mapping rules and exclusions: [REFERENCE.md](REFERENCE.md).

## Phase 1 — Requirements alignment

Launch `qa-tester` (`author-acceptance-tests`):

- Map each AC and decided edge case to scenarios; create/update `.feature` files.
- Cover behavior, empty/loading/error/recovery, navigation, and decided terminology.
- Requirements correctness only — no BDD style review, steps, or production code.
- Do not invent rules for undecided feedback; do not use design docs as source of truth.

**Deliver:** edits with AC / feedback ID references.

## Phase 2 — BDD review (once)

Launch `qa-reviewer` (`review-bdd-artifacts`):

- Review only Phase 1 feature file(s).
- Suggest improvements only (`CRITICAL`–`LOW`); do not edit; single pass.

**Deliver:** severity-tagged rewrite recommendations.

## Phase 3 — Apply BDD improvements

Launch `qa-tester` (`author-acceptance-tests`):

- Apply `CRITICAL`, `HIGH`, `MEDIUM`; apply `LOW` when straightforward.
- Skip `LOW` that conflicts with Phase 1 requirements intent (brief rationale).
- Flag requirements contradictions to the user — do not guess.

**Deliver:** applied vs. skipped suggestions.

## Reporting

- Files changed, ACs/feedback IDs covered, deferred undecided items, BDD apply/skip summary.
- Open questions only when requirements and BDD guidance conflict.

**Git Policy:** Do NOT commit unless the user explicitly asks.
