---
description: Plan a new web feature from requirements to designs, Gherkin specs, and implementation strategy.
---

# Feature Planning Workflow

## Phase 1: Discovery (parallel)

- `@product-owner` + `@principal-po`

## Phase 2: Design

- `@product-designer` — `[scene]-design.md`, HTML prototypes in `docs/designs/`, all UI states

## Phase 3: Behavioral spec

- **First:** `@qa-tester` — Gherkin in `features/`
- **Then parallel:** `@qa-reviewer` · `@principal-qa`

## Phase 4: Implementation strategy

- **First:** `@fe-developer` — `/plans/summary.md`, `/plans/iteration-x.md` (link features, scenes, HTML)
- **Then parallel:** `@fe-reviewer` · `@principal-engineer` · `@audio-specialist` *(if audio)*
- CI blocked → `@devops-engineer`

## Phase 5: Principal review (parallel)

`@principal-engineer` · `@principal-po` · `@principal-qa` → `/feedback/`

## Phase 6–8: Human gate, post-feedback fixes (`@fe-developer`), baseline (`@project-historian`)
