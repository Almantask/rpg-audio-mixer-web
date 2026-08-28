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

Map each feature domain to its corresponding design specification (e.g. `features/<domain>/` → `<domain>-design.md`).

| Feature domain (examples) | Design doc |
|---|---|
| `features/home/` | `home-design.md` |
| `features/dashboard/` | `dashboard-design.md` |
| `features/settings/` | `settings-design.md` |
| `features/profile/` | `profile-design.md` |

## Conflict resolution

| Topic | Wins |
|---|---|
| User flows, business rules, application behavior | `.feature` files |
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
```

## When to escalate

| Situation | Skill |
|-----------|-------|
| Features or designs missing / stale | `refine-feature` or `design-to-gherkin` |
| Need new features from rough requirements | `gherkin-to-features` |
| Need full plan before coding | `plan-feature` |
| Need principal review council | `new-feature` |
| Audit BDD quality only | `review-bdd-artifacts` |
