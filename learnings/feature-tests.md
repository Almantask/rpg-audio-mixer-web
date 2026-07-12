# Feature Test Learnings

## Context

Iteration 4 covered the Library soundscape category grid, Category Composer, and Track Picker. The final result was:

- 41 of 41 Iteration 4 scenarios passing
- Every Iteration 4 feature file verified independently
- No skipped Iteration 4 scenarios
- Final full-suite run: 216 passed, 5 failed, and 4 skipped
- The remaining failures and skips belong to Iterations 0 and 2

The failures were not all selector problems. They exposed missing test data, incomplete E2E state seeding, cross-domain step collisions, behavior that did not match the approved design, and assertions coupled to incidental HTML.

## What failed, what fixed it, and how to prevent it

### 1. Missing step definitions were silently converted to skipped tests

`playwright.config.ts` used:

```ts
missingSteps: 'skip-scenario'
```

This generated `test.fixme` cases for undefined steps. A run could therefore look mostly successful while required behavior never executed.

Examples included wording that had no matching definition, such as:

- `"Thunderous Downpour" is already attached ...`
- `"Thunderous Downpour" appears in "Level I"`
- Scenario-outline actions whose generated text included `I`, while the step definition did not

Fixes applied:

- Aligned Gherkin wording with implemented step definitions.
- Removed all missing Iteration 4 steps.
- Inspected generated specs and treated any Iteration 4 skip as a failure.

Future improvement:

- Change `missingSteps` to `fail-on-gen`, which is also the `playwright-bdd` default.
- Make `npx bddgen` a required CI gate.
- Require zero unexplained skipped scenarios before feature sign-off.

### 2. Generic steps collided across domains

The text `I swipe right on the "Weather" card` matched a Scenes step and looked for `data-scene-card="Weather"` instead of a soundscape category card. The same broad step pattern also affected campaign and session cards elsewhere in the suite.

Fixes applied:

- Made soundscape actions domain-specific:
  - `I delete "Weather" from the soundscape grid`
  - `I swipe right on the "Weather" soundscape card`
- Added matching soundscape-specific step definitions and selectors.
- Extended genuinely shared picker actions only where both domains had the same user meaning.

Future improvement:

- Include the domain noun in cross-cutting actions: `scene card`, `campaign card`, `session card`, or `soundscape card`.
- Keep shared steps only for behavior that is truly identical.
- Avoid large shared steps that infer the domain from URL checks or whichever selector happens to exist.

### 3. Scenario prerequisites were incomplete or implicit

Several scenarios expected tracks that had never been seeded:

- A category preview scenario created a category with zero tracks.
- A no-match search used an empty library, so the empty-library state appeared instead of the no-match state.
- Commit scenarios tried to check tracks that were not in the picker.
- The one-at-a-time preview scenario never created the second track.

Fixes applied:

- Seeded a real sample track when a previewable category was required.
- Added explicit Givens for tracks used by filtering, preview, and commit scenarios.
- Ensured the no-match scenario starts with at least one track.
- Ensured the disabled `Add Selected (0)` scenario contains an unchecked track, so it is not a vacuous assertion.

Future improvement:

- Every scenario should declare the smallest complete business state it needs.
- Empty-state, no-match, and loading-state scenarios must use distinct fixtures.
- Do not make a `When` or `Then` step secretly create data that belongs in a `Given`.

### 4. E2E seed data drifted from the application schema

`soundscapeTracks` had been added to `AppData`, but it was omitted from:

- The development-only `seedData` state reconstruction
- `EMPTY_E2E_APP_DATA`
- The E2E merge helper's empty state
- The E2E merge-by-ID logic

The category retained track IDs, but the referenced tracks disappeared during seeding. The UI therefore rendered a category that could not actually preview.

Fixes applied:

- Preserved `soundscapeTracks` in `CampaignDataContext.seedData`.
- Added `soundscapeTracks` to the empty E2E data structures.
- Merged soundscape tracks by ID in `mergeE2EData`.

Future improvement:

Whenever `AppData` changes, update this checklist in the same change:

1. Type definition
2. Empty/default data
3. Storage load and migration
4. Context state reconstruction
5. Development E2E seed API
6. E2E empty fixture
7. E2E merge helper
8. Builders and acceptance fixtures

Typechecking should be required because it detected the missing `soundscapeTracks` field immediately.

### 5. Test data used inconsistent IDs

One step attached `Thunderous Downpour` as `t-downpour`, while another seeded the same named track as `t-thunderous-downpour`. The picker correctly excluded IDs already on the level, so the duplicate name with a different ID still appeared.

Fix applied:

- Generated the attached track ID from the track name using the same rule as the library fixture.

Future improvement:

- Add shared `buildSoundscapeTrack`, `buildSoundscapeCategory`, and ID helper functions.
- Do not hand-author IDs in individual steps.
- Treat IDs, category level references, and track records as one fixture graph.

### 6. Some audio fixtures pointed to files that did not exist

Several soundscape fixtures referenced placeholder paths such as `/assets/audio/soundscape/light_rain.mp3`. This could leave preview state idle or make audio assertions timing-dependent.

Fixes applied:

- Used audio URLs that are present in the repository for scenarios that exercise playback.
- Asserted visible play/pause state instead of manually setting a global playback flag.

Future improvement:

- Centralize one known-good short audio asset for acceptance tests.
- Validate fixture asset paths during test setup or CI.
- Do not fake playback state when the scenario is intended to verify real browser playback.

### 7. The implementation did not match the approved picker design

The design states:

- Checkbox click selects and does not preview.
- Card-body click previews.
- Only one track previews at a time.

The implementation made the whole card select and provided a separate generic preview button. Updating the test to click that unrelated control would have hidden a product defect.

Fixes applied:

- Changed the Track Picker so the checkbox alone controls selection.
- Made the visible card body control preview and pause.
- Added track-specific accessible names:
  - `Preview <track>`
  - `Pause preview <track>`
- Added component regression tests for selection versus preview behavior.
- Updated acceptance steps to operate the checkbox for selection and the named card-body control for preview.

Future improvement:

- Compare failures against the approved design before changing a test expectation.
- If production behavior contradicts the design, fix production rather than weakening the acceptance test.
- Add a component test for each interaction contract that acceptance tests depend on.

### 8. Assertions were coupled to incidental markup

Broad selectors failed as the page became richer:

- `locator('h1')` matched both the app title and category title.
- `locator('p.text-muted')` matched the composer label and track metadata.
- `locator('h2')` failed because the dialog title rendered at another heading level.

Fixes applied:

- Scoped assertions to `main` or `dialog`.
- Used role, accessible name, and exact text where possible.
- Used stable domain attributes only when no semantic locator described the element.

Future improvement:

- Prefer `getByRole`, `getByLabel`, and exact accessible names.
- Scope locators to the relevant landmark or dialog.
- Avoid styling classes and assumed heading levels unless the level itself is the requirement.
- Let Playwright strict-mode failures expose ambiguous locators; do not silence them with `.first()`.

### 9. Helpers ignored collapsed UI and modal lifecycle

`Add track` for Level II was not rendered until Level II was expanded. Another precondition added a track but left the Track Picker open, so the modal overlay blocked the subsequent Library button.

Fixes applied:

- Picker-opening helpers now expand the requested level when needed.
- Preconditions that promise the user is back on the composer explicitly close the picker.
- Assertions verify whether the picker should remain open or be closed.

Future improvement:

- A step should leave the browser in exactly the state its wording promises.
- Create a single `openTrackPicker(level, category)` helper that handles navigation, expansion, and readiness.
- Do not use forced clicks to bypass an overlay; fix the preceding state transition.

### 10. Gesture simulation did not match the implemented input modality

The soundscape delete test used mouse movement, but `SwipeToDelete` listens to touch events. The gesture never reached the component behavior.

Fix applied:

- Dispatched `touchstart` and `touchend` on the actual `data-swipe-delete` wrapper with a distance above the delete threshold.

Future improvement:

- Test the same event family the component handles.
- Prefer a touch-enabled Playwright project for mobile gestures where practical.
- Keep gesture helpers shared and domain-aware instead of duplicating mouse approximations.

### 11. A focused pass is not enough after shared behavior changes

Changing picker card semantics from "card selects" to "card previews" made an already-passing composer setup click the wrong control. The final full-suite run caught this cross-feature regression.

Fix applied:

- Updated the composer setup to check the named checkbox.
- Re-ran only the affected feature.
- Re-ran the complete suite after focused verification.

Future improvement:

- After changing a shared component or shared step, search all uses of its selector and interaction.
- Keep the focused feature loop for speed, but always finish with a full-suite run.

## Recommended feature-test workflow

1. Run typecheck and lint before browser tests.
2. Generate BDD tests with missing steps configured to fail generation.
3. Run one feature file.
4. Diagnose whether the failure is:
   - specification ambiguity
   - missing prerequisite data
   - step-definition collision
   - selector/accessibility issue
   - E2E seed defect
   - production behavior defect
5. Fix the smallest correct layer.
6. Re-run only that feature file until it passes with zero skips.
7. If a shared step or component changed, search and recheck affected feature files one at a time.
8. Run the full suite.
9. Classify any remaining failures by iteration and confirm none belong to the target iteration.

Example focused command:

```powershell
npx bddgen
npx playwright test ".features-gen/features/library/composer/compose_soundscape.feature.spec.js" --workers=1 --reporter=line
```

Final suite command:

```powershell
npx bddgen
npx playwright test --reporter=line
```

## Definition of done

A feature-test iteration is complete only when:

- Every targeted scenario executes; none are `fixme` or skipped because of missing steps.
- Every targeted feature passes independently.
- Fixtures use consistent IDs and complete references.
- Playback tests use valid assets and observable UI state.
- Steps use domain-specific wording where collisions are possible.
- Locators are accessible, scoped, and strict.
- Modified acceptance files pass lint and typecheck.
- A final full-suite run has no failures in the target iteration.

