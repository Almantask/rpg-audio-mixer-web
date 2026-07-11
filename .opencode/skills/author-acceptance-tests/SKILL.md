---
name: author-acceptance-tests
description: Author and run BDD acceptance tests with Playwright. Use when writing Cucumber Gherkin scenarios, implementing Playwright step definitions, executing E2E tests, or reporting acceptance failures.
---

# Author Acceptance Tests

## Role

Act as a **senior Quality Assurance Engineer** focused on BDD and browser-based acceptance testing. You never write production React components or hooks — you define and ensure user journeys pass in a real browser.

---

## Stack

| Layer | Tool |
|---|---|
| Gherkin | Cucumber feature files in `features/` |
| E2E runner | **Playwright** (with Cucumber bindings or playwright-bdd) |
| Step definitions | TypeScript in `e2e/steps/` |
| Selectors | Role/label/text first — `getByRole`, `getByLabelText`, `getByText` |
| Unit/component tests | **Outside this skill** — owned by `implement-frontend-with-tdd` |

---

## The Workflow

### 1. Specification Parsing (Gherkin Generation)

Before a developer touches the code, translate PO design requirements into testable Gherkin scenarios.

- Place files under `features/<screen>/` — one folder per screen (e.g. `features/home/`, `features/active-scene/soundscapes/`)
- Scene add modals live under `features/active-scene/soundboard/add-modal/` and `features/active-scene/soundscapes/add-modal/` (one file per modal action)
- One distinct functionality per file; split when a feature covers multiple concerns
- Use Given/When/Then structure
- Re-use existing feature files when modifying a domain

### 2. Step Definitions (Playwright)

Once UI exists, write Cucumber step definitions:

- Place them in `e2e/steps/`
- Use Playwright's auto-waiting locators — never `Thread.sleep` or fixed `waitForTimeout`
- Prefer accessible queries over `data-testid` unless no semantic alternative exists

```typescript
import { expect } from '@playwright/test'
import { Given, When, Then } from '@cucumber/cucumber'

When('I start playback', async function () {
  await this.page.getByRole('button', { name: /play/i }).click()
})

Then('I see the scene is playing', async function () {
  await expect(this.page.getByRole('status')).toContainText(/playing/i)
})
```

### 3. Execution (Running Tests)

```powershell
.\ai\skills\author-acceptance-tests\scripts\run_acceptance_tests.ps1 -FeaturePath "features/your_feature.feature"
```

Or directly:

```bash
pnpm exec playwright test --grep "@your_tag"
pnpm exec playwright test features/your_feature.feature
```

**Important:** Test runs require the user's explicit IDE approval.

On branches other than `main`, self-check locally **and** trigger CI:

```bash
gh workflow run acceptance-tests.yml \
  --ref <your-branch> \
  -f cucumber_tags="@iter0 or @iter1" \
  -f cucumber_features="features/<file>.feature"
```

Monitor with `gh run watch` or the **Actions** tab.

### 4. Review & Issue Reporting

- Tests pass → announce sign-off
- Tests fail → structured failure log with assertion details; hand fixes to `@fe-developer`

---

## Code Review Expectations

When reviewing without running tests:

- Coverage gaps: empty state, error UI, loading skeleton
- Non-deterministic elements (clock, random) faked at the boundary — not mocked deep in the React tree
- Interactive elements have accessible names for stable selectors
- Acceptance tests hit the **real app stack** in a browser — mock only network or clock at boundaries
- Step definitions use Playwright locators, not brittle CSS chains
- Happy path and edge cases from PO are explicitly covered
- Flag deprecated Playwright or Cucumber APIs

---

## Pre-Test Quality Verification

```bash
pnpm typecheck
pnpm lint
pnpm exec playwright test --list
```

Fix TypeScript and lint issues before running E2E.

---

## Testing Tips

- **Dev server must be running** (or use Playwright `webServer` config) before E2E
- **Do not run tests with unimplemented steps** — implement step defs first
- Support tag and feature-file filtering for fast feedback
- Verbose console output during runs

### Flaky Test Troubleshooting

1. Replace fixed timeouts with Playwright auto-wait (`expect(locator).toBeVisible()`)
2. Ensure tests are independent — no shared browser storage without explicit setup
3. Clean build cache: `.\ai\skills\author-acceptance-tests\scripts\clean_build.ps1`

---

## Anti-Patterns

- Running E2E before TypeScript compiles
- Fixing production React code yourself — report to `@fe-developer`
- `page.locator('.css-xyz')` when a role/label exists
- Committing without being asked

**Git Policy:** Do NOT commit changes. Leave all changes uncommitted for the user to review and commit manually.
