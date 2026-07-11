# Trash — Screen Design

**Design References:**
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)
- **Companion:** [`credits-design.md`](credits-design.md) — app info and support (separate sidebar item)

---

## Purpose

Trash holds all soft-deleted items across the platform before permanent purge. It provides peace of mind against accidental deletion and a clear management interface for recently discarded campaigns, sessions, scenes, soundscapes, and FX tracks.

GM can **multi-select** items for bulk restore or purge, or use **Restore All** to recover everything at once.

**Sidebar nav item:** Trash (active on this screen)

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See `home-design.md` for full shell spec.

- **Top bar:** hamburger — "Arcanum Audio" (no gear icon)
- **Sidebar:** Trash active (gold bar + tint)
- **FE sidebar navigation only (no tab bar)**

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  Trash                    [ Restore All ]  [ Empty Trash ]           │
│  Recently deleted items are kept for 7 days before permanent removal.│
│                                                                      │
│  [ ] Select all (3)                                                  │
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                 │
│  │ [x] ⏳ 2 days│ │ [ ] ⏳ 1 day │ │ [x] ⏳ 5 days│                 │
│  │ Whispering   │ │ Ember Swarm  │ │ Cursed Ch.IV │                 │
│  │ Depths       │ │              │ │              │                 │
│  │ SOUNDSCAPE   │ │ FX           │ │ SCENE        │                 │
│  │ Deleted 5d   │ │ Deleted 6d   │ │ Deleted 2d   │                 │
│  │ [Restore][×] │ │ [Restore][×] │ │ [Restore][×] │                 │
│  └──────────────┘ └──────────────┘ └──────────────┘                 │
│                                                                      │
│  ┌─ Selection bar (when 1+ selected) ─────────────────────────────┐  │
│  │  2 selected     [ Restore Selected ]  [ Purge Selected ]       │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Items in Trash are permanently deleted after 7 days.                │
│  This cannot be undone.                                              │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Page Header
- **Title:** "Trash" — large gold serif
- **Subtitle:** "Recently deleted items are kept for 7 days before permanent removal."
- **Restore All** — gold outline `Button` with counter-clockwise arrow (top right) — restores **every** item in Trash
- **Empty Trash** — red destructive outline `Button` with trash icon (top right, after Restore All)

**Restore All** is hidden or disabled when Trash is empty.

### Select All
- Checkbox + label **Select all (N)** above the grid
- Toggles selection on all visible items
- Indeterminate state when some but not all items are selected

### Trash Item Card (`Card` — grid, repeating)

| Element | Description |
|---|---|
| **Checkbox** | Multi-select; clicking checkbox does **not** trigger card navigation |
| Type icon | Circular icon — note (Soundscape), bolt (FX), frame (Scene), etc. |
| Countdown | "N days left" — **red text when urgent** (e.g. 1 day left) |
| Title | Item name in white serif |
| Type `Badge` | SOUNDSCAPE (gold), FX (purple), SCENE (blue), etc. |
| Deletion timestamp | "Deleted N days ago" — subdued grey |
| **Restore** | Text `Button` with counter-clockwise arrow → restores this item only |
| **Purge** | Text `Button` with × icon in red → permanently deletes this item |

Selected cards show a gold border or tint.

### Selection Bar (`Bar` — sticky above footer when selection non-empty)
- **N selected** count
- **Restore Selected** — restores all checked items
- **Purge Selected** — permanently deletes all checked items after confirmation

Hidden when no items are selected.

### Footer Note
- Centred italic serif: *"Items in Trash are permanently deleted after 7 days. This cannot be undone."*

### Empty State
- Centred visualization when Trash is empty
- **Icon:** large gold trash icon
- **Headline:** "Trash is empty"
- **Instructional text:** "No deleted items. Deleted content will appear here for 7 days."
- **Return** action → navigates to Home via sidebar
- No **Restore All**, **Empty Trash**, or selection controls when empty

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click item **checkbox** | Toggles selection; updates count and selection bar |
| Click **Select all** | Selects or clears all items in the grid |
| Click **Restore** on card | Restores that single item to its original library/list |
| Click **Purge** on card | Permanent deletion of that item after `AlertDialog` confirmation |
| Click **Restore Selected** | Restores all checked items |
| Click **Purge Selected** | Permanently deletes all checked items after confirmation |
| Click **Restore All** | Restores **all** items in Trash (confirmation if count > 0) |
| Click **Empty Trash** | Permanently purges **all** items after destructive confirmation |
| Card hover | Subtle border brighten / ember glow (FE) |
| Click sidebar item | Navigate to that section |

Per-card **Restore** / **Purge** remain available without selecting — multi-select is optional for bulk actions.

### Retention Policy
- Items remain in Trash for **7 days** before automatic permanent deletion
- Countdown displayed per card; urgent styling when = 1 day remains

---

## States

### Populated Trash
Grid of item cards with checkboxes, countdowns, and per-card actions. **Restore All** and **Empty Trash** enabled.

### Items selected
Selection bar visible; **Select all** reflects full or partial selection.

### Empty Trash
Quiet empty state with return CTA; bulk actions hidden.

### Confirm purge / empty / bulk purge
`AlertDialog` (destructive variant) before irreversible actions.

### Confirm Restore All
Optional `AlertDialog` when many items — e.g. "Restore all N items?"

---

## Colors & Theming

- Background: `#0D0D0D`–`#121212`
- Primary accents: gold `#D4AF37` / `#EAB308`
- Destructive: red for Purge, Purge Selected, Empty Trash, urgent countdown
- Selection: gold border/tint on selected cards
- Type badges: colour-coded outlines per item category

---

## Navigation

| Destination | Trigger |
|---|---|
| Home | Sidebar → Home |
| Credits | Sidebar → Credits |
| Original item location | Restore, Restore Selected, or Restore All |
