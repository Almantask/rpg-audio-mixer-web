# Feature Test Learnings

### 1. Generic steps collided across domains

Make sure Gherkin steps are specific and reused where possible, without sabotaging readability.

### 2. Scenario prerequisites were incomplete or implicit

Before using a track, verify it exists. Do a sanity check for assets used, before tests are run.

### 3. E2E seed data drifted from the application schema

As new scenarios are added and rely on existing data it's important to update the shared seed data.
Use consistent naming and ids for test data.

### 4. Assertions were coupled to incidental markup

Prefer `getByRole`, `getByLabel`, and exact accessible names.
Scope locators to the relevant landmark or dialog.
Avoid styling classes and assumed heading levels unless the level itself is the requirement.
Let Playwright strict-mode failures expose ambiguous locators; do not silence them with `.first()`.

### 5. Helpers ignored collapsed UI and modal lifecycle

A step should leave the browser in exactly the state its wording promises.
Create a single `openTrackPicker(level, category)` helper that handles navigation, expansion, and readiness.
Do not use forced clicks to bypass an overlay.

### 6. Speed & Stability Improvements 

As part of the test speed and stability audit:
- **Sleeps to Conditions**: Removed all fixed `waitForTimeout` calls and replaced them with:
  - Playwright `expect.poll` for animation tracking.
  - Asserting closing of dialog elements (`expect(dialog).toHaveCount(0)`).
  - Checking native attributes instead of arbitrary sleep.
  - Relying on the subsequent assertions which natively poll.
- **Short Audio Seeds**: Updated `seedSoundboardEffects` to avoid forcing a `120` second duration for regular one-shot seeds. Now, only scenarios requesting `longAudio` will get the `120`s overrides.
- **CI Configuration**: Set CI workers to `2` to safely speed up test runs under parallel load without introducing flakes, running locally is configured for 6 or 12 workers and proven to work.
- **Shared Storage Rejection**: Confirmed that suite-wide shared mutable state databases or shared orchestrations across workers must be rejected in favor of independent scenario/feature level seeding (`seedE2EData`), ensuring thread-safe runs.

