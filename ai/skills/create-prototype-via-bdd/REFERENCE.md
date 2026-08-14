# Create Prototype via BDD — Reference Manual

Comprehensive reference for the `create-prototype-via-bdd` workflow, iteration maps, test commands, and quality learnings.

---

## Iteration Breakdown

Mapped directly from `plans/plan.md`. Feature files use the primary `@iter<N>` tag.

### Iteration 1 — CI Readiness
*Acceptance-test infrastructure runs reliably in CI before feature delivery scales.*
- Hardware compatibility checks
- `bddgen` baseline verification
- Pipeline & test worker isolation validation (`workers=2` in CI, local parallel execution)

### Iteration 2 — Campaigns & Sessions
*GM can create campaigns, open a campaign, and manage sessions within it.*

| Feature File | Feature Name | Tag |
|---|---|---|
| `features/campaigns/create_campaign.feature` | Create campaign | `@iter2` |
| `features/campaigns/view_campaigns_list.feature` | View campaigns list | `@iter2` |
| `features/campaigns/open_campaign_sessions.feature` | Open campaign sessions | `@iter2` |
| `features/campaigns/delete_campaign.feature` | Delete campaign | `@iter2` |
| `features/campaign-sessions/create_session.feature` | Create session | `@iter2` |
| `features/campaign-sessions/view_campaign_sessions.feature` | View campaign sessions | `@iter2` |
| `features/campaign-sessions/edit_session.feature` | Edit session | `@iter2` |
| `features/campaign-sessions/delete_session.feature` | Delete session | `@iter2` |

### Iteration 3 — Scenes Catalogue & Soundboard
*GM can browse and manage scenes, link scenes to sessions, manage the FX library, and add effects to a scene's soundboard.*

| Feature File | Feature Name | Tag |
|---|---|---|
| `features/scenes/view_created_scenes.feature` | View created scenes | `@iter3` |
| `features/scenes/build_your_own_scene.feature` | Build your own scene | `@iter3` |
| `features/scenes/delete_scene.feature` | Delete scene | `@iter3` |
| `features/scenes/add_description_to_scene.feature` | Add description to scene | `@iter3` |
| `features/scenes/tag_scene.feature` | Tag scene | `@iter3` |
| `features/scenes/user_owned_scenes.feature` | User-owned scenes are fully editable | `@iter3` |
| `features/session-scenes/view_session_scenes.feature` | View session scenes | `@iter3` |
| `features/session-scenes/open_scene_from_session.feature` | Open scene from session | `@iter3` |
| `features/session-scenes/import_scene_to_session.feature` | Import scene to session | `@iter3` |
| `features/session-scenes/create_scene_from_session.feature` | Create scene from session | `@iter3` |
| `features/session-scenes/unlink_scene_from_session.feature` | Unlink scene from session | `@iter3` |
| `features/library/browse_fx_library.feature` | Browse FX library | `@iter3` |
| `features/library/edit_fx_in_library.feature` | Edit FX in library | `@iter3` |
| `features/library/import_fx_library.feature` | Import FX to library | `@iter3` |
| `features/library/preview_fx_track.feature` | Preview FX track in library | `@iter3` |
| `features/active-scene/soundboard/add-modal/open_fx_picker.feature` | Open FX picker on Active Scene | `@iter3` |
| `features/active-scene/soundboard/add-modal/close_fx_picker.feature` | Close FX picker | `@iter3` |
| `features/active-scene/soundboard/add-modal/filter_fx_picker.feature` | Filter FX picker | `@iter3` |
| `features/active-scene/soundboard/add-modal/preview_fx_in_picker.feature` | Preview FX in picker | `@iter3` |
| `features/active-scene/soundboard/add-modal/commit_fx_to_soundboard.feature` | Commit FX selection to soundboard | `@iter3` |

---

## Command Reference

### Local Verification & Gates (FE)
```powershell
npm run typecheck       # Verify TypeScript types
npm run lint            # ESLint rules
npm run test            # Vitest unit/component tests
```

### Acceptance Execution (QA)

1. **Re-generate BDD spec files (always run before Playwright)**:
   ```powershell
   npx bddgen
   ```

2. **Run Single Feature (Targeted Fix Validation)**:
   ```powershell
   npm run test:acceptance:feature -- ".features-gen/features/<path>/<feature>.feature.spec.js" --workers=1 --reporter=line
   ```

3. **Run Iteration Slice (Iteration Gate)**:
   ```powershell
   npm run test:acceptance:iter -- "@iter<N>" --workers=1
   ```

4. **Run Full Test Suite (Final Gate after Iteration 3)**:
   ```powershell
   npm run test:acceptance
   ```

---

## QA & Testing Learnings (Mandatory Compliance)

From `learnings/feature-tests.md` and `ai/agents/qa-tester.agent.md`:

1. **Domain-Specific Step Naming**:
   - Use specific domain nouns (e.g. `Given the GM is on the soundboard` rather than generic `Given I am on the page`).
   - Prevent step definition collisions across feature areas.
2. **Scenario Prerequisites & Asset Sanity**:
   - Sanity check that referenced audio assets and track files exist before running.
   - Use real assets from the project; do not mock audio with invalid synthetic stubs.
3. **E2E Seed Data Isolation (`seedE2EData`)**:
   - Keep schema up to date with application changes.
   - Strictly isolate scenario data; never share mutable `localStorage` or browser context state across scenarios.
   - Reject suite-wide shared create/interact/delete setups.
4. **Accessible, Strict Locators**:
   - Prefer `getByRole`, `getByLabel`, and accessible names.
   - Scope locators to the relevant landmark or dialog (`dialog.getByRole('button', { name: 'Save' })`).
   - Do **not** use `.first()` to bypass Playwright strict-mode errors.
5. **Modal Lifecycle & UI Helpers**:
   - Leave the browser in the exact promised state.
   - Encapsulate navigation and expansion in reliable helpers (e.g. `openTrackPicker`).
   - Never use forced clicks (`click({ force: true })`) to bypass overlays.
6. **Web Audio State Exposure**:
   - Validate audio behavior via `window.__ARCANUM_AUDIO_STATE__` rather than guessing or mocking.
   - Use `getAudioState(page)`, `isTrackPlaying(page, trackName)`, and `isCategoryLooping(page, categoryName)`.
7. **Speed & Stability / Zero Fixed Sleeps**:
   - **Zero `page.waitForTimeout`**: Rely on Playwright auto-waiting and `expect.poll`.
   - Use short audio seeds by default unless explicitly testing long audio duration overrides.

---

## Frontend Engineer Guidelines (Mandatory Compliance)

From `ai/agents/fe-developer.agent.md` and `ai/skills/implement-frontend-with-tdd`:

1. **Strict TDD (Red-Green-Refactor)**:
   - **RED**: Smallest failing Vitest/RTL test.
   - **GREEN**: Minimum production React/TypeScript to satisfy the test.
   - **REFACTOR**: Clean and optimize structure without breaking tests.
2. **Read Before Write**:
   - Inspect existing components in `src/components/` and `src/hooks/` before creating new ones.
   - Align layout, dark theme tokens, and copy with `docs/designs/` specifications.
3. **Component System**:
   - Utilize shadcn/ui primitives (`Button`, `Card`, `Dialog`, `Tabs`, etc.) styled with Tailwind CSS.
   - Ensure all interactive elements include accessible labels and roles.
4. **Quality Gates**:
   - Ensure `npm run typecheck`, `npm run lint`, and `npm run test` pass before handing off to acceptance testing.

---

## Failure Triage & Retest Matrix

```
                          [Run Iteration Acceptance Tests]
                                        │
                             ┌──────────┴──────────┐
                             │                     │
                       [All Passed]          [Any Failed]
                             │                     │
                [Advance to Next Iteration]   [Identify Failed Features]
                                                   │
                                     ┌─────────────┴─────────────┐
                                     │                           │
                                [Step/Fixture Bug]         [Production Bug]
                                     │                           │
                                [Fix QA Steps]           [Fix Component/Hook]
                                     │                           │
                                     └─────────────┬─────────────┘
                                                   │
                                     [Rerun ONLY Fixed Feature]
                                                   │
                                          ┌────────┴────────┐
                                          │                 │
                                    [Still Fails]       [Passed]
                                          │                 │
                                     [Loop Back]  [Are ALL Failed Features
                                                   Individually Fixed?]
                                                            │
                                                   ┌────────┴────────┐
                                                   │                 │
                                                  [No]             [Yes]
                                                   │                 │
                                            [Fix Next]      [Rerun Full Iteration]
```
