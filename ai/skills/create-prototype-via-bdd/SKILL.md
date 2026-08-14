---
name: create-prototype-via-bdd
description: Deliver the Arcanum Audio prototype across Iterations 1-3 using parallel QA and Frontend TDD/BDD loops. Use when building prototype features, executing iterative BDD cycles for iterations 1 to 3, or running parallel QA and FE implementation with targeted retest loops.
---

# Create Prototype via BDD

Orchestrate the delivery of prototype iterations 1 through 3 from `plans/plan.md` using parallel QA Tester and Frontend Engineer agents.

## Quick Start

1. Start with Iteration 1, then proceed sequentially through Iterations 2 and 3.
2. For each iteration, launch QA (`qa-tester`) and Frontend (`fe-developer`) tracks in parallel.
3. Once implemented, run the iteration's acceptance tests.
4. If failures occur, fix and rerun **only** the fixed feature tests until all are green.
5. Rerun the iteration's tests once all features are fixed.
6. After completing Iteration 3, rerun the full acceptance suite across all completed iterations.

## Delivery Scope (Iterations 1–3)

- **Iteration 1 — CI Readiness**: Acceptance test infrastructure, hardware compatibility, and baseline validation.
- **Iteration 2 — Campaigns & Sessions**: Campaign management and session workflows (8 feature files).
- **Iteration 3 — Scenes Catalogue & Soundboard**: Scene catalogue, session linking, FX library, and active scene soundboard (20 feature files).

See [REFERENCE.md](REFERENCE.md#iteration-breakdown) for complete feature maps.

## Workflow per Iteration

### Phase 1 — Parallel Implementation

Launch both tracks concurrently:

| Track | Role / Skill | Responsibility |
|---|---|---|
| **Acceptance Spec** | `qa-tester`<br>`author-acceptance-tests` | Write `.feature` files and Playwright steps in `e2e/steps/`. Apply [learnings](REFERENCE.md#qa--testing-learnings) (zero sleeps, isolated seeds, accessible locators, audio state evaluation). |
| **Production Code** | `fe-developer`<br>`implement-frontend-with-tdd` | Implement UI, hooks, and audio logic using strict TDD (Vitest + RTL). Pass local quality gates (`typecheck`, `lint`, `test`). |

*QA does not run acceptance tests until the FE implementation compiles and passes unit tests.*

### Phase 2 — Iteration Test Execution

Run the iteration acceptance slice:

```powershell
npx bddgen
npm run test:acceptance:iter -- "@iter<N>" --workers=1
```

### Phase 3 — Targeted Fix & Retest Loop

If any test fails:
1. **Diagnose**: Determine whether failure is in steps/fixtures (QA) or production code (FE).
2. **Fix**: Update the failing layer.
3. **Rerun ONLY the fixed feature**:
   ```powershell
   npx bddgen
   npm run test:acceptance:feature -- ".features-gen/features/<path>/<feature>.feature.spec.js" --workers=1 --reporter=line
   ```
4. Repeat isolated fixes and single-feature re-runs until **every** failing feature passes.
5. **Rerun Iteration**: Once all individual features pass, rerun the entire iteration:
   ```powershell
   npm run test:acceptance:iter -- "@iter<N>" --workers=1
   ```

### Phase 4 — Final Suite Verification

After Iteration 3 passes Phase 3:
Rerun all tests across all completed iterations (0 through 3) to ensure zero regressions:

```powershell
npx bddgen
npm run test:acceptance
```

See [REFERENCE.md](REFERENCE.md) for full commands, failure diagnosis, and QA learnings checklist.
