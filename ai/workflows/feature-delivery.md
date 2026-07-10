---
description: End-to-end feature delivery for the Arcanum Audio web app — implementation, validation, review, and fixes.
---

# Feature Delivery Workflow

Follow phases in strict sequence. Commands require user approval when run in the IDE.

## Phase 1: Implementation

Both `@qa-tester` and `@fe-developer` work in parallel:

- **QA Tester:** Writes BDD `.feature` files and Playwright step definitions. *Does NOT run E2E yet.*
- **Frontend Engineer:** Implements React/TypeScript via TDD (Vitest + RTL) for components, hooks, and client logic.

## Phase 2: Validation

- **QA Tester** runs E2E: `.\ai\skills\author-acceptance-tests\scripts\run_acceptance_tests.ps1 -FeaturePath "features/[target].feature"`.
- Build/CI blocked → **DevOps Engineer (`@devops-engineer`)**.
- Tests fail → **Frontend Engineer** fixes; rerun until green.

## Phase 3: Review Council (parallel batches)

**Batch A:** `@fe-reviewer` (production React/audio) · `@qa-reviewer` (BDD artifacts)

**Batch B:** `@principal-engineer` · `@principal-qa` · `@audio-specialist` *(if media logic)*

**Human gate:** Pause if principals raised `/feedback/` questions.

**Batch C:** `@product-owner` · `@principal-po`

## Phase 4: Post-Review Fixes

`@fe-developer` + `@qa-tester` address feedback; incorporate `/feedback/` decisions; rerun Phase 2 and affected reviews.
