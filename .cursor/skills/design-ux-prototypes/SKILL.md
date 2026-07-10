---
name: design-ux-prototypes
description: 'Design UX flows and HTML prototypes. Use when: translating requirements into scene design docs, building Material 3 prototypes, defining information architecture, or specifying empty/loading/error states.'
---

# Design UX Prototypes

## App Context

**RPG Audio Mixer** is a native Android app (Jetpack Compose / Material 3) for **Game Masters (GMs)** running tabletop RPG sessions.

### Primary persona — The Game Master

| Attribute | Detail |
|---|---|
| Goal | Set the right audio atmosphere to immerse players in each scene |
| Context of use | Seated at a table, often mid-session; one hand busy; glancing at phone |
| Key pain points | Slow to configure; hard to switch scenes mid-session; battery anxiety |
| Mental model | Thinks in "scenes" (e.g., Tavern, Battle, Forest); wants presets + customisation |

### Core feature areas

| Area | What it covers |
|---|---|
| **Scenes** | Create, clone, delete, view list; each scene has **Ambience** (loopable tracks) + **Soundboard** (one-shot sounds) tabs |
| **Playback** | Play/pause loops, trigger one-shot sounds, mix volumes, set intensity levels, visualise loop progress |
| **Sound library** | Browse by category, search, buy sounds, import custom audio |
| **Profile** | Setup UI preferences (soundboard buttons, loop options) so the app adapts to the GM's play style |

---

## When to Use This Skill

Invoke for any task where the primary output is a **design artefact** rather than production code. 

**CRITICAL EDITING RESTRICTION:**
- You may **READ** any file (code, docs, specs) to inform your design decisions.
- You may **EDIT ONLY HTML files** (typically located in `docs/designs/`). All visual design prototypes and layout specs should be implemented or updated within these HTML files.
- When the user asks to "update the design" or "make changes," assume they are referring to the HTML design artifacts.

Common tasks include:
- Behavior examples and acceptance criteria
- UX flows, screen maps, navigation diagrams
- Wireframe descriptions or annotated layout specs (in HTML)
- Material 3 component selection and rationale
- Accessibility and usability reviews
- Feature scoping (MVP vs. later)
- Error states, empty states, loading states
- Design system decisions (tokens, components, patterns)

---

## Delivery Templates

### New Scene / Screen Design

Follow this order:

1. **Problem statement** — One sentence: who needs what, and why.
2. **Acceptance criteria** — Gherkin `.feature` file (see [Gherkin Guidelines](#gherkin-guidelines)).
3. **UX flow** — Numbered step-by-step or ASCII/Mermaid flow diagram covering happy path + key error paths.
4. **Information architecture** — Where does this screen/feature live in the app? Entry points, back-stack behaviour.
5. **Screen layout spec** — Describe each region: top app bar, content area, FAB, bottom bar, dialogs, sheets. Name the Material 3 components used.
6. **States** — Table covering: Empty, Loading, Success, Error, Offline (if applicable).
7. **Accessibility checklist** — See [Accessibility Checklist](#accessibility-checklist).
8. **Edge cases & constraints** — What can go wrong? What are the limits (max sounds per scene, file size, etc.)?
9. **Open questions** — Unresolved decisions that need stakeholder or user input.

---

### Usability / Design Review

1. **Screen under review** — Name and entry point.
2. **Heuristic violations** — Reference Nielsen's 10 heuristics; note severity (0–4).
3. **Accessibility issues** — Touch target sizes, contrast ratios, content descriptions, focus order.
4. **Consistency gaps** — Deviations from Material 3 or the app's established patterns.
5. **Recommended fixes** — Specific, actionable changes with rationale.
6. **Nice-to-haves** — Improvements outside current scope, flagged for backlog.

---

### Design System Decision

1. **Decision** — One sentence.
2. **Options considered** — Two or three, with pros/cons.
3. **Recommendation** — Chosen option + rationale.
4. **Impact** — Which screens or components are affected.
5. **Migration notes** — Steps to update existing screens if a pattern is changing.

---

## Gherkin Guidelines

All acceptance criteria must be expressed as Gherkin `.feature` files compatible with the project's Cucumber-on-Android setup.

**File location:** `app/src/androidTest/assets/features/<feature_name>.feature`

### Scenario coverage — minimum set

| Scenario type | Required? |
|---|---|
| Happy path | Yes |
| Validation / error path | Yes |
| Empty state | Yes (if the screen can be empty) |
| Edge case | At least one |

### Writing rules

- Write in business language; no implementation detail in steps.
- Use **Given** for context, **When** for user action, **Then** for observable outcome.
- Prefer screen text assertions over internal state assertions.
- One behaviour per scenario; keep scenarios independent.
- Use `Background:` for repeated Given steps across scenarios in the same feature.
- Use `Scenario Outline:` + `Examples:` for data-driven cases.

### Template

```gherkin
Feature: <Feature name>

  As a GM
  I want to <action>
  So that <outcome>.

  Background:
    Given I am on the <screen name> screen

  Scenario: <Happy path title>
    When <user action>
    Then <observable outcome>

  Scenario: <Error / validation path title>
    Given <precondition that sets up the error>
    When <user action>
    Then I see "<error message or indicator>"

  Scenario: <Edge case title>
    Given <boundary precondition>
    When <user action>
    Then <expected bounded outcome>
```

---

## Material 3 Component Selection Guide

Choose components that match the interaction pattern, not just the visual appearance.

| Pattern | Preferred M3 component | Notes |
|---|---|---|
| Primary screen action | `FloatingActionButton` / `ExtendedFAB` | Use Extended when label helps discoverability |
| List of scenes / sounds | `LazyColumn` with `ListItem` | Use `leadingContent` for artwork/icon |
| Tabbed content (Ambience / Soundboard) | `TabRow` + `HorizontalPager` | Sync tab and pager state |
| Volume control | `Slider` | Provide `valueRange` and step labels |
| Intensity level | `Slider` or segmented `FilterChip` row | Use chips if discrete levels; slider if continuous |
| Modal confirmation (delete, buy) | `AlertDialog` | Destructive actions → red confirm button |
| Settings / profile form | `Column` with `ListItem` rows + trailing controls | Group related settings with `Text` subheader |
| Search | `SearchBar` / `DockedSearchBar` | Prefer `SearchBar` for full-screen search |
| Sound playback progress | `LinearProgressIndicator` | Use indeterminate while buffering |
| Bottom navigation | `NavigationBar` | ≤ 5 destinations |
| Contextual actions (long-press) | `DropdownMenu` or `ModalBottomSheet` | Bottom sheet for mobile-friendly affordance |
| Importing / uploading | `ModalBottomSheet` with `OutlinedButton` | Avoid jarring full-screen transitions |
| Snackbar feedback | `Snackbar` via `SnackbarHost` | Prefer action-bearing snackbar over toasts |

---

## Accessibility Checklist

Apply to every screen design before handoff.

- [ ] All interactive elements have a **content description** or a visible label.
- [ ] Touch targets are at least **48 × 48 dp**.
- [ ] Text contrast meets **WCAG AA** (4.5:1 for body, 3:1 for large text).
- [ ] Focus order follows reading order (top-left to bottom-right for LTR).
- [ ] No information is conveyed by colour alone.
- [ ] Sliders and progress indicators announce their **current value** via semantics.
- [ ] Dialogs trap focus and restore it on dismiss.
- [ ] Error messages are exposed to accessibility services (not just colour change).
- [ ] Dynamic content changes are announced via **`LiveRegion`** semantics where appropriate.

---

## UX Principles for This App

1. **Session-safe** — Any action before or during a game session must be reversible or undoable. Destructive actions (delete, overwrite) require confirmation.
2. **One-handed operable** — Primary playback controls must be reachable with one thumb in portrait orientation.
3. **Low-glance** — Labels must be scannable in < 1 second. Avoid icon-only controls for non-universal symbols.
4. **Predictable** — Same gesture / control pattern across all scenes. No surprise navigation.
5. **Offline-first** — Purchased and imported sounds must be available without a network connection.

---

## Feature Scoping Template (MVP vs. Later)

When asked to scope a feature, structure the output as:

### MVP (must-have for feature to ship)
- Bullet list of the minimum behaviour that delivers the core value.

### Phase 2 (adds polish or secondary value)
- Enhancements that improve the experience but can be deferred.

### Out of scope
- Explicit list of things deliberately excluded and why.

---

## Output Conventions

- Use bullet points for trade-offs and options.
- Use tables for component choices, state coverage, and heuristic violations.
- Use fenced code blocks for Gherkin, layout pseudocode, or Mermaid diagrams.
- Reference specific Material 3 component names (not generic terms like "button" or "card").
- When multiple design options exist, provide one **recommended** solution plus one alternative with trade-offs.
- Keep annotations in present tense, active voice ("The FAB triggers scene creation" not "FAB should be used to trigger...").

**Git Policy:** Do NOT commit changes. Leave all changes uncommitted for the user to review and commit manually.
