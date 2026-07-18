---
name: author-acceptance-tests
description: Authors and runs BDD acceptance tests with Playwright and playwright-bdd. Use when writing Cucumber Gherkin scenarios, implementing Playwright step definitions, seeding E2E fixtures, executing acceptance tests, diagnosing E2E failures, or reporting test results.
---

# Author Acceptance Tests

Act as a **senior QA engineer** for browser-based acceptance testing. You never write production React components or hooks.

## Quick start

```powershell
pnpm typecheck
pnpm lint
npx bddgen
npx playwright test ".features-gen/features/<path>/<feature>.feature.spec.js" --workers=1 --reporter=line
```

`playwright.config.ts` uses `missingSteps: 'fail-on-gen'` — undefined steps fail generation. Never treat `fixme` or skipped scenarios as passing coverage.

## Workflow

1. **Typecheck and lint** before any browser run.
2. **`npx bddgen`** — required before every run (also in CI).
3. **One feature file** at a time while iterating.
4. **Classify the failure** — see [REFERENCE.md](REFERENCE.md#failure-diagnosis) — then fix the smallest correct layer.
5. **Re-run that feature** until it passes with zero skips.
6. **Shared step or component changed?** Search all uses; re-run affected features.
7. **Full suite** before sign-off; confirm failures outside the target iteration.

### Commands

```powershell
# Warm server (start once)
npm run dev

# Focused Iteration (run one feature while server is running)
npx bddgen
npm run test:acceptance:feature -- .features-gen/features/<path>/<feature>.feature.spec.js --workers=1 --reporter=line

# Iteration slice (run by tag expression)
npm run test:acceptance:iter -- "@iterN" --workers=1

# Full suite
npm run test:acceptance
```

Test runs require the user's explicit IDE approval. On non-`main` branches, also trigger CI:

```bash
gh workflow run acceptance-tests.yml --ref <branch> -f cucumber_tags="@iterN" -f cucumber_features="features/<file>.feature"
```

## Authoring rules

| Area | Rule |
|---|---|
| Gherkin | `features/<screen>/`; explicit `Given` for smallest complete state; domain nouns in steps (`soundscape card`, not generic `card`) |
| Steps | `e2e/steps/`; `getByRole` / `getByLabel`; scope to `main` or `dialog`; no `.first()` band-aids |
| Fixtures | Shared builders and consistent ID graph; update all seed paths when `AppData` changes — see [REFERENCE.md](REFERENCE.md#e2e-fixture-integrity) |
| Design | Compare failures to approved design; fix production, do not weaken tests |
| Input | Match component event family (touch vs mouse) |

Full conventions, locator strategy, fixture checklist, and anti-patterns: [REFERENCE.md](REFERENCE.md).

Iteration post-mortems: `learnings/feature-tests.md`.

## Definition of done

- [ ] Every targeted scenario executes — no `fixme` or missing-step skips
- [ ] Each targeted feature passes independently
- [ ] Fixtures have consistent IDs and complete cross-references
- [ ] Locators are accessible, scoped, and strict
- [ ] `typecheck`, `lint`, and `bddgen` pass
- [ ] Full-suite run has no failures in the target iteration

## Reporting

- **Pass** → sign off against the checklist above.
- **Fail** → structured log with diagnosis category, assertion details, and fix layer; hand production defects to `@fe-developer`.

## Flaky tests & Test Isolation

1. **Replace fixed timeouts** with Playwright auto-wait or `expect.poll` assertions. Never introduce `waitForTimeout` calls in step definitions.
2. **Ensure test independence** — always seed data per scenario (or per feature) using `seedE2EData` / builders. Avoid shared mutable browser profile / `localStorage` state across tests.
3. **Reject suite-wide shared create/interact/delete setups** on `localStorage`. The data model cannot safely share one mutable world across parallel workers.
4. **Clean cache**: `.\ai\skills\author-acceptance-tests\scripts\clean_build.ps1`

**Git Policy:** Do NOT commit changes. Leave all changes uncommitted for the user to review and commit manually.
