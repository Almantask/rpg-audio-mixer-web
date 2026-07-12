# Author Acceptance Tests — Reference

Detailed conventions for Gherkin, Playwright steps, fixtures, and failure handling. The agent loads this when authoring or debugging acceptance tests.

---

## Stack

| Layer | Tool |
|---|---|
| Gherkin | Cucumber feature files in `features/` |
| E2E runner | Playwright with `playwright-bdd` |
| Step definitions | TypeScript in `e2e/steps/` |
| Selectors | `getByRole`, `getByLabel`, exact accessible names |
| Unit/component tests | Outside this skill — owned by `implement-frontend-with-tdd` |

---

## Failure diagnosis

Classify every failure before changing anything:

| Category | Symptoms | Fix layer |
|---|---|---|
| Specification ambiguity | Step text unmatched; outline examples generate wrong text | Gherkin wording |
| Missing prerequisite data | Empty/wrong UI; entities never seeded | `Given` steps and fixtures |
| Step collision | Step resolves to wrong domain selector | Domain-specific step wording |
| Selector / accessibility | Strict-mode violation; ambiguous match | Step definition locators |
| E2E seed defect | IDs present but records missing after merge | E2E seed helpers and empty defaults |
| Production defect | Behavior contradicts approved design | Production code → `@fe-developer` |

**Design fidelity:** Compare failures against the approved design before weakening a test. If production contradicts the design, fix production and add a component test for the interaction contract.

---

## Gherkin conventions

- Place files under `features/<screen>/` — one folder per screen.
- Scene add modals: `features/active-scene/soundboard/add-modal/` and `features/active-scene/soundscapes/add-modal/`.
- One distinct functionality per file; split when a feature covers multiple concerns.
- Use Given/When/Then; re-use existing feature files when modifying a domain.

### Scenario prerequisites

Every scenario declares the **smallest complete business state** in `Given` steps:

- No implicit data from earlier scenarios or hidden setup in `When`/`Then`.
- Empty-state, no-match, and loading-state scenarios need **distinct fixtures** — an empty library is not a no-match search.
- Vacuous assertions are invalid (e.g. disabled button when nothing could be selected).

### Domain-specific steps

Include the domain noun in cross-cutting actions:

```
I swipe right on the "Weather" soundscape card   ✓
I swipe right on the "Weather" card              ✗  (collides with scene/campaign/session)
```

- Keep shared steps only for truly identical behavior across domains.
- Avoid steps that infer domain from URL or whichever selector exists.
- Align Gherkin wording exactly with step definitions, including outline example text (`Level I` vs `I`).

---

## Step definitions

- Location: `e2e/steps/`
- Never use fixed `waitForTimeout` — rely on Playwright auto-wait.

### Locator strategy

- Prefer `getByRole`, `getByLabel`, and exact accessible names.
- Scope to landmark (`main`, `dialog`) or component region.
- Use stable domain attributes only when no semantic locator exists.
- Let strict-mode failures expose ambiguity — do not silence with `.first()`.
- Avoid `locator('h1')`, `locator('p.text-muted')`, and other markup-coupled selectors.

### UI state lifecycle

A step leaves the browser in exactly the state its wording promises:

- Expand collapsed sections before nested interactions.
- Close modals when the user should be back on the underlying screen.
- Do not force-click through overlays — fix the preceding transition.
- Prefer one helper (e.g. `openTrackPicker(level, category)`) for navigation, expansion, and readiness.

### Input modality

Match the component's event family:

- Touch components (`touchstart` / `touchend`) need touch simulation, not mouse movement.
- Prefer a touch-enabled Playwright project for mobile gestures.

### Example

```typescript
import { expect } from '@playwright/test'
import { When, Then } from '@cucumber/cucumber'

When('I start playback', async function () {
  await this.page.getByRole('button', { name: /play/i }).click()
})

Then('I see the scene is playing', async function () {
  await expect(this.page.getByRole('status')).toContainText(/playing/i)
})
```

---

## E2E fixture integrity

When `AppData` or domain models change, update **all** of these in the same change:

1. Type definition
2. Empty/default data
3. Storage load and migration
4. Context state reconstruction
5. Development E2E seed API
6. E2E empty fixture
7. E2E merge helper
8. Builders and acceptance fixtures

Run typecheck — it catches missing seed fields immediately.

### Fixture graph rules

- Use shared builders (`buildSoundscapeTrack`, `buildSoundscapeCategory`, ID helpers) — no hand-authored IDs in steps.
- Treat IDs, level references, and records as one consistent graph.
- Centralize known-good audio assets; validate paths exist.
- Assert observable UI state (play/pause) — do not fake global playback flags.

---

## Review without running tests

- Coverage gaps: empty state, error UI, loading skeleton
- Non-deterministic elements faked at boundaries — not deep in the React tree
- Interactive elements have accessible names
- Real app stack in browser — mock network/clock at boundaries only
- Happy path and edge cases from PO explicitly covered
- Flag deprecated Playwright or Cucumber APIs

---

## Anti-patterns

- Running E2E before typecheck, lint, or `bddgen`
- Treating skipped/`fixme` scenarios as passing coverage
- Fixing production React yourself — report to `@fe-developer` unless delegated
- Weakening tests to match incorrect production behavior
- Generic step text colliding across domains
- Implicit prerequisites in `When`/`Then` instead of `Given`
- Hand-authored fixture IDs drifting from builders
- CSS or unscoped tag selectors when role/label exists
- `.first()` to hide ambiguous locators
- Forced clicks through modal overlays
- Mouse gestures for touch-only components
