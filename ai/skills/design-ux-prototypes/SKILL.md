---
name: design-ux-prototypes
description: Design UX flows and HTML prototypes with shadcn/ui and Tailwind. Use when translating requirements into scene design docs, building HTML prototypes, defining information architecture, or specifying empty, loading, and error states.
---

# Design UX Prototypes

## App Context

**Arcanum Audio** is a **web application** (React, Tailwind CSS, shadcn/ui) for **Game Masters (GMs)** running tabletop RPG sessions — usable on desktop and tablet browsers.

### Primary persona — The Game Master

| Attribute | Detail |
|---|---|
| Goal | Set the right audio atmosphere to immerse players in each scene |
| Context of use | Seated at a table, often mid-session; one hand busy; glancing at screen |
| Key pain points | Slow to configure; hard to switch scenes mid-session; tab/browser distractions |
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
- You may **READ** any file to inform design decisions.
- You may **EDIT ONLY HTML files** in `docs/designs/`. Visual prototypes live there.
- When the user asks to "update the design," update HTML artifacts.

Common tasks: UX flows, wireframes, shadcn component selection, accessibility review, MVP scoping, state tables.

---

## Delivery Templates

### New Scene / Screen Design

1. **Problem statement** — One sentence: who needs what, and why.
2. **Acceptance criteria** — Gherkin `.feature` file (see [Gherkin Guidelines](#gherkin-guidelines)).
3. **UX flow** — Numbered steps or Mermaid diagram (happy path + error paths).
4. **Information architecture** — Route, nav entry, back behavior.
5. **Screen layout spec** — Header, content, sidebar, dialogs. Name **shadcn/ui** components.
6. **States** — Empty, Loading, Success, Error, Offline (if applicable).
7. **Accessibility checklist** — See below.
8. **Edge cases & constraints**
9. **Open questions**

---

## Gherkin Guidelines

Acceptance criteria as Gherkin compatible with **Playwright + Cucumber**.

**File location:** `features/<feature_name>.feature`

| Scenario type | Required? |
|---|---|
| Happy path | Yes |
| Validation / error path | Yes |
| Empty state | Yes (if applicable) |
| Edge case | At least one |

### Writing rules

- Business language only — no CSS selectors or React component names in steps.
- **Given** = context, **When** = action, **Then** = observable outcome.
- One behaviour per scenario; scenarios independent.

---

## shadcn/ui Component Selection Guide

| Pattern | Preferred component | Notes |
|---|---|---|
| Primary action | `Button` (default or destructive variant) | Use `size="lg"` for session-critical controls |
| Scene / sound list | `Card` + list rows | Skeleton while loading |
| Tabbed content (Ambience / Soundboard) | `Tabs` | Sync with URL hash or query when useful |
| Volume / intensity | `Slider` | Show value label for accessibility |
| Confirmation (delete) | `AlertDialog` | Destructive variant on confirm |
| Settings form | `Label` + `Switch` / `Select` rows | Group with section headings |
| Search | Input with search icon or `Command` palette | Debounced filter |
| Playback progress | `Progress` | Indeterminate while buffering |
| App navigation | Sidebar or top `NavigationMenu` | Match `docs/designs/home-design.md` |
| Contextual actions | `DropdownMenu` | Keyboard accessible |
| Toast feedback | `Sonner` / `Toast` | Prefer over `alert()` |
| Import / upload | `Dialog` + file input | Drag-drop zone optional |

**Theme:** Dark-first — black background, gold/amber text, purple/pink/gold accents per `docs/designs/home-design.md`.

---

## Accessibility Checklist

- [ ] Interactive elements have visible label or `aria-label`
- [ ] Click/touch targets at least **44 × 44 px**
- [ ] Text contrast **WCAG AA** (4.5:1 body, 3:1 large)
- [ ] Focus order matches reading order; visible focus rings
- [ ] No information by colour alone
- [ ] Sliders announce value (label + `aria-valuenow`)
- [ ] Dialogs trap focus and restore on close
- [ ] Dynamic updates use `aria-live="polite"` where needed

---

## UX Principles for This App

1. **Session-safe** — Destructive actions require confirmation; support undo where possible.
2. **Low-glance** — Primary playback controls visible without scrolling on common viewports.
3. **Predictable** — Same control patterns across all scenes.
4. **Offline-capable** — Purchased/imported assets available without network (PWA / cached assets as applicable).
5. **Browser-respectful** — Handle autoplay blocks and tab visibility without silent failure.

---

## Output Conventions

- Reference shadcn component names, not generic "button" or "card"
- Use tables for states and component choices
- Gherkin and Mermaid in fenced blocks
- Present tense, active voice

**Git Policy:** Do NOT commit changes. Leave all changes uncommitted for the user to review and commit manually.
