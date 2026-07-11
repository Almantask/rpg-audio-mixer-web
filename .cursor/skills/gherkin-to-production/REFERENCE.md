# Gherkin to Production — Reference

Implements from existing BDD artifacts. Principles: *Discovery* then build (*Formulation* applied to code, Nagy & Rose).

## Double BDD loop (implementation)

| Loop | Purpose | Agents |
|------|---------|--------|
| **1 — Discovery** | Map features + designs → implementation slices; audit `src/` | `qa-tester` + `fe-developer` (parallel) |
| **2 — Build** | TDD inner + acceptance outer per slice → validate | `fe-developer` → `qa-tester` → run E2E |

```
Discovery:  features + designs  →  slice backlog
Build:      RED (unit) + RED (steps)  →  GREEN (code)  →  GREEN (E2E)  →  next slice
```

## Feature ↔ design mapping

| Feature domain | Design doc |
|----------------|------------|
| `features/home/` | `home-design.md` |
| `features/campaigns/` | `campaigns-design.md` |
| `features/campaign-sessions/` | `campaign-sessions-design.md` |
| `features/scenes/` | `scenes-list-design.md` |
| `features/session-scenes/` | `session-scenes-design.md` |
| `features/active-scene/soundscapes/` | `active-scene-soundscapes-design.md` |
| `features/active-scene/soundboard/` | `active-scene-soundboard-design.md` |
| `features/library/` | `audio-library-design.md` |
| `features/library/composer/` | `soundscape-category-composer-design.md` |
| `features/trash/` | `trash-design.md` |
| `features/credits/` | `credits-design.md` |
| `features/platform/` | `platform-design.md` |

Add-modals and pickers: also read `add-fx-or-soundscape-to-scene-design.md` and modal-specific `*-modal-design.md` files.

## Conflict resolution

| Topic | Wins |
|-------|------|
| User flows, business rules, audio behavior | `.feature` files |
| Layout, typography, colors, copy, empty/loading/error UI | `*-design.md` + HTML |
| Contradiction (e.g. feature says X, design shows Y) | Stop — `/feedback/` — do not implement |

## Slice template (Discovery output)

```markdown
## Slice: [scenario title]
- Feature: features/<path>.feature — line/scenario ref
- Design: docs/designs/<scene>-design.md — section
- Existing code: src/... (extend | new)
- States: empty | loading | success | error
- Step defs: exist | missing
- Audio: yes | no
```

## When to escalate

| Situation | Skill |
|-----------|-------|
| Features or designs missing / stale | `refine-feature` or `design-to-gherkin` |
| Need new features from rough requirements | `gherkin-to-features` |
| Need full plan before coding | `plan-feature` |
| Need principal review council | `new-feature` |
| Audit BDD quality only | `review-bdd-artifacts` |
