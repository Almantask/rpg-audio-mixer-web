---
name: design-ux-prototypes
description: Design UX flows and HTML prototypes with shadcn/ui and Tailwind. Use when translating requirements into scene design docs, building HTML prototypes, defining information architecture, or specifying empty, loading, and error states.
---

# Design UX Prototypes

## Design Context

Web applications built with React, Tailwind CSS, and shadcn/ui — responsive across desktop, tablet, and mobile browsers.

### User Centric Design

| Attribute | Detail |
|---|---|
| Goal | Complete core user tasks efficiently with minimal friction |
| Context of use | Clear, glanceable interface with responsive layout |
| Key considerations | Fast interaction, intuitive navigation, minimal distractions |
| Mental model | Organized into intuitive screens, dashboards, and workflows |

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

**File location:** `features/<screen>/<feature_name>.feature` (one folder per screen)

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
| Primary action | `Button` (default or destructive variant) | Use `size="lg"` for key primary actions |
| Item / record list | `Card` + list rows | Skeleton while loading |
| Tabbed content | `Tabs` | Sync with URL hash or query when useful |
| Range / value adjust | `Slider` | Show value label for accessibility |
| Confirmation (delete) | `AlertDialog` | Destructive variant on confirm |
| Settings form | `Label` + `Switch` / `Select` rows | Group with section headings |
| Search | Input with search icon or `Command` palette | Debounced filter |
| Loading / progress | `Progress` | Indeterminate while loading |
| App navigation | Sidebar or top `NavigationMenu` | Consistent across pages |
| Contextual actions | `DropdownMenu` | Keyboard accessible |
| Toast feedback | `Sonner` / `Toast` | Prefer over `alert()` |
| Import / upload | `Dialog` + file input | Drag-drop zone optional |

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

## UX Principles

1. **Safe interactions** — Destructive actions require confirmation; support undo where possible.
2. **Glanceable & clear** — Primary controls visible without excessive scrolling on common viewports.
3. **Predictable** — Consistent control patterns across all screens.
4. **Resilient** — Handle network delays and errors with clear user feedback.
5. **Accessible** — Fully operable via keyboard, screen readers, and touch.

---

## Output Conventions

- Reference shadcn component names, not generic "button" or "card"
- Use tables for states and component choices
- Gherkin and Mermaid in fenced blocks
- Present tense, active voice

**Git Policy:** Do NOT commit changes. Leave all changes uncommitted for the user to review and commit manually.
