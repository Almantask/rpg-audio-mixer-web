# Trash — Screen Design

**Design References:**
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)
- **Companion:** [`credits-design.md`](credits-design.md) — app info and support (separate sidebar item)
- **Resolved decisions:** [`open-questions/trash.md`](open-questions/trash.md), [`open-questions/platform-wide.md`](open-questions/platform-wide.md) (PW-16–PW-22)

---

## Purpose

Trash holds all soft-deleted items across the platform before permanent purge. It provides peace of mind against accidental deletion and a clear management interface for recently discarded campaigns, sessions, scenes, soundscapes, and FX tracks.

GM can **multi-select** items for bulk restore or purge, or use **Restore All** to recover everything on the **active tab** at once.

**Sidebar nav item:** Trash (active on this screen)

**Platform naming:** Screen title and sidebar label are **Trash** everywhere — no Vault of Echoes or Arcane Settings entry paths.

---

## Soft-Delete Model

All primary entities soft-delete to Trash and are retained for **7 days** before automatic permanent purge ([PW-16](open-questions/platform-wide.md#pw-16)):

| Entity | Trash tab | Notes |
|---|---|---|
| Campaign | **Campaigns** | Sessions are orphaned/hidden from active UI; restoring campaign auto-restores sessions ([PW-19](open-questions/platform-wide.md#pw-19)) |
| Session | **Sessions** | Independent soft-delete; **no** routine confirm — optional undo toast (**PW-17**) |
| Scene | **Scenes** | Global scene delete only — session unlink does **not** create a Trash entry ([PW-18](open-questions/platform-wide.md#pw-18)) |
| Soundscape | **Soundscapes** | Category/composer soft-delete |
| FX track | **FX** | Audio blob retained until purge or manual purge ([PW-20](open-questions/platform-wide.md#pw-20)) |

### What does **not** go to Trash ([PW-18](open-questions/platform-wide.md#pw-18))

- Session scene **unlink** (removes link only; scene remains in Scenes)
- Remove category/FX from scene only (scene-level detach)
- Remove track from composer level (composer detach)

### Delete affordance & confirmation ([PW-15](open-questions/platform-wide.md#pw-15), [TR-02](open-questions/trash.md#tr-02))

- **Entry:** 🗑 icon on web/tablet; swipe on touch
- **Routine soft-delete:** no confirmation dialog (campaigns, sessions, scenes, soundscapes, FX) — optional undo `Sonner` toast (**PW-17**)
- **Purge / Empty Trash:** always confirm via destructive `AlertDialog`

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See [`platform-design.md`](platform-design.md) for shell spec.

- **Top bar:** hamburger — "Arcanum Audio" (no gear icon)
- **Sidebar:** Trash active (gold bar + tint)
- **FE sidebar navigation only** — Trash is a direct sidebar item, not nested under settings

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  Trash                    [ Restore All ]  [ Empty Trash ]           │
│  Recently deleted items are kept for 7 days before permanent removal.│
│                                                                      │
│  [ Campaigns ] [ Sessions ] [ Scenes ] [ Soundscapes ] [ FX ]        │
│                                                                      │
│  [ ] Select all (3)                                                  │
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                 │
│  │ [x] ⏳ 2 days│ │ [ ] ⚠ 1 day  │ │ [x] ⏳ 5 days│                 │
│  │ Shadows of   │ │ Session 12   │ │ Whispering   │                 │
│  │ the Underdark│ │              │ │ Depths       │                 │
│  │ CAMPAIGN     │ │ SESSION      │ │ SOUNDSCAPE   │                 │
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
- **Restore All** — gold outline `Button` with counter-clockwise arrow (top right) — restores **all items on the active tab**; **always** shows confirmation `AlertDialog` before proceeding ([TR-05](open-questions/trash.md#tr-05))
- **Empty Trash** — red destructive outline `Button` with trash icon (top right, after Restore All) — purges **all items on the active tab** after destructive confirmation

**Restore All** and **Empty Trash** are hidden or disabled when the **active tab** is empty.

### Entity Type Tabs (`Tabs`)
Five tabs organize Trash by entity type ([TR-10](open-questions/trash.md#tr-10)):

| Tab | Contents |
|---|---|
| **Campaigns** | Soft-deleted campaigns |
| **Sessions** | Soft-deleted sessions (independent of campaign delete) |
| **Scenes** | Globally deleted scenes |
| **Soundscapes** | Soft-deleted soundscape categories |
| **FX** | Soft-deleted FX tracks (audio blob retained) |

- Switching tabs filters the grid to that entity type only
- **Select all**, **Restore All**, **Empty Trash**, and bulk actions are scoped to the **active tab**
- Default sort within each tab: **days-remaining ascending** (soonest expiry first)
- In-tab search and filter chips deferred to P2 ([TR-09](open-questions/trash.md#tr-09) superseded by tab menu)

### Select All
- Checkbox + label **Select all (N)** above the grid
- Toggles selection on all visible items **on the active tab**
- Indeterminate state when some but not all items are selected

### Trash Item Card (`Card` — grid, repeating)

| Element | Description |
|---|---|
| **Checkbox** | Multi-select; clicking checkbox does **not** trigger card navigation |
| Type icon | Circular icon — banner (Campaign), scroll (Session), frame (Scene), note (Soundscape), bolt (FX) |
| Countdown | "N days left" — **urgent styling at 1 day left** (red text + warning indicator; in-app only, no email — [PW-22](open-questions/platform-wide.md#pw-22)) |
| Title | Item name in white serif |
| Type `Badge` | CAMPAIGN (amber), SESSION (teal), SCENE (blue), SOUNDSCAPE (gold), FX (purple) |
| Deletion timestamp | "Deleted N days ago" — subdued grey |
| **Restore** | Text `Button` with counter-clockwise arrow → restores this item only |
| **Purge** | Text `Button` with × icon in red → permanently deletes this item |

Selected cards show a gold border or tint.

### Restore Destinations ([TR-04](open-questions/trash.md#tr-04))

| Type | Restore destination |
|---|---|
| CAMPAIGN | Active Campaigns list; orphaned sessions auto-restored with campaign ([PW-19](open-questions/platform-wide.md#pw-19)) |
| SESSION | Parent campaign's sessions list |
| SCENE | Scenes list; all prior session links intact — restore as-is, no re-link prompt ([TR-06](open-questions/trash.md#tr-06)) |
| SOUNDSCAPE | Audio Library soundscapes |
| FX | Audio Library FX |

### Name Collision on Restore ([PW-21](open-questions/platform-wide.md#pw-21))

If a live item already uses the same name, the restored item is auto-renamed to **"[Name] (restored)"**. No block-restore dialog in MVP.

### Selection Bar (`Bar` — sticky above footer when selection non-empty)
- **N selected** count
- **Restore Selected** — restores all checked items **on the active tab**
- **Purge Selected** — permanently deletes all checked items after confirmation

Hidden when no items are selected.

### Footer Note
- Centred italic serif: *"Items in Trash are permanently deleted after 7 days. This cannot be undone."*

### Empty State (per tab) ([TR-07](open-questions/trash.md#tr-07))

Shown when the **active tab** has no deleted items:

| Tab | Headline | Instructional text |
|---|---|---|
| Campaigns | No deleted campaigns | Deleted campaigns will appear here for 7 days. |
| Sessions | No deleted sessions | Deleted sessions will appear here for 7 days. |
| Scenes | No deleted scenes | Deleted scenes will appear here for 7 days. |
| Soundscapes | No deleted soundscapes | Deleted soundscapes will appear here for 7 days. |
| FX | No deleted FX | Deleted FX tracks will appear here for 7 days. |

- Centred visualization with large gold trash icon
- **No explicit "Go to Home" button** — GM returns via sidebar navigation only
- No **Restore All**, **Empty Trash**, or selection controls when the active tab is empty

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click **tab** | Switches active entity type; grid, counts, and bulk actions scope to that tab |
| Click item **checkbox** | Toggles selection; updates count and selection bar |
| Click **Select all** | Selects or clears all items on the **active tab** |
| Click **Restore** on card | Restores that single item to its original location; auto-rename on name collision |
| Click **Purge** on card | Permanent deletion of that item after `AlertDialog` confirmation |
| Click **Restore Selected** | Restores all checked items on the active tab |
| Click **Purge Selected** | Permanently deletes all checked items after confirmation |
| Click **Restore All** | **Always** shows confirmation, then restores all items on the **active tab** |
| Click **Empty Trash** | Permanently purges all items on the **active tab** after destructive confirmation |
| Bulk partial failure | Summary toast (e.g. "Restored 2 of 5"); failed items remain selected with error detail; successful restores persist ([TR-08](open-questions/trash.md#tr-08)) |
| Card hover | Subtle border brighten / ember glow (FE) |
| Click sidebar item | Navigate to that section |

Per-card **Restore** / **Purge** remain available without selecting — multi-select is optional for bulk actions ([F-TR-01](open-questions/trash.md#f-tr-01)).

### Campaign Delete & Restore Cascade ([TR-03](open-questions/trash.md#tr-03), [PW-19](open-questions/platform-wide.md#pw-19))

1. Deleting a campaign soft-deletes it to the **Campaigns** tab
2. The campaign's sessions are **orphaned/hidden** from active UI — they do **not** appear independently on the Sessions tab
3. Restoring the campaign from the **Campaigns** tab **auto-restores** all orphaned sessions
4. Deleting a session independently (with confirmation) soft-deletes it to the **Sessions** tab regardless of campaign state

### FX File Retention ([PW-20](open-questions/platform-wide.md#pw-20), [F-TR-03](open-questions/trash.md#f-tr-03))

- Soft-deleted FX tracks retain their **audio blob** for the full 7-day retention window
- Audio is purged only on manual purge (card, bulk, or Empty Trash on FX tab) or automatic expiry
- FX cards on the **FX** tab show the same countdown and urgent styling as other entity types

### Retention Policy
- Items remain in Trash for **7 days** before automatic permanent deletion
- Countdown displayed per card; urgent styling when **1 day** remains ([PW-22](open-questions/platform-wide.md#pw-22))

---

## States

### Populated tab
Grid of item cards with checkboxes, countdowns, and per-card actions. **Restore All** and **Empty Trash** enabled for the active tab.

### Items selected
Selection bar visible; **Select all** reflects full or partial selection on the active tab.

### Empty tab
Tab-specific empty state; bulk actions hidden; sidebar-only navigation to leave Trash.

### Confirm purge / empty / bulk purge
`AlertDialog` (destructive variant) before irreversible actions.

### Confirm Restore All
`AlertDialog` **always** shown before Restore All on the active tab — no count threshold shortcut ([TR-05](open-questions/trash.md#tr-05)).

### Bulk partial failure
Summary toast with success/failure count; failed items stay selected; error detail available per failed item ([TR-08](open-questions/trash.md#tr-08)).

### Loading
Skeleton `Card` placeholders in grid while Trash items load for the active tab.

### Error
Inline error message or toast if Trash list fails to load; retry action available.

---

## Colors & Theming

- Background: `#0D0D0D`–`#121212`
- Primary accents: gold `#D4AF37` / `#EAB308`
- Destructive: red for Purge, Purge Selected, Empty Trash, urgent countdown (1 day left)
- Selection: gold border/tint on selected cards
- Type badges: colour-coded outlines per item category (CAMPAIGN amber, SESSION teal, SCENE blue, SOUNDSCAPE gold, FX purple)
- Active tab: gold underline or tint per `Tabs` pattern in `home-design.md`

---

## Navigation

| Destination | Trigger |
|---|---|
| Home | Sidebar → Home |
| Active Campaigns | Restore CAMPAIGN card |
| Campaign sessions list | Restore SESSION card |
| Scenes | Restore SCENE card |
| Audio Library (soundscapes) | Restore SOUNDSCAPE card |
| Audio Library (FX) | Restore FX card |
| Credits | Sidebar → Credits |
| Other sidebar sections | Sidebar navigation |

---

## Accessibility Checklist

- [ ] Tab bar: `role="tablist"`; active tab announced; keyboard arrow navigation between tabs
- [ ] Interactive elements have visible label or `aria-label`
- [ ] Click/touch targets at least **44 × 44 px**
- [ ] Urgent countdown uses colour **and** icon/text — not colour alone ([PW-22](open-questions/platform-wide.md#pw-22))
- [ ] Dialogs trap focus and restore on close
- [ ] Bulk partial-failure toast uses `aria-live="polite"`

---

## Edge Cases & Constraints

| Case | Behaviour |
|---|---|
| Campaign deleted, then session deleted independently before campaign restore | Session appears on **Sessions** tab; campaign restore does not re-delete it |
| Scene restored with existing session links | Restore as-is; links intact ([TR-06](open-questions/trash.md#tr-06)) |
| Restore name collision | Auto-rename to "[Name] (restored)" ([PW-21](open-questions/platform-wide.md#pw-21)) |
| Session unlink from session scenes | No Trash entry ([F-TR-02](open-questions/trash.md#f-tr-02), [PW-18](open-questions/platform-wide.md#pw-18)) |
| FX soft-delete | Audio blob retained 7 days ([PW-20](open-questions/platform-wide.md#pw-20)) |
| Automatic expiry during session | Item removed from grid; no toast required in MVP |

---

## P2 Deferred

- In-tab search and filter chips within each entity tab ([TR-09](open-questions/trash.md#tr-09))
- Email notification before purge ([PW-22](open-questions/platform-wide.md#pw-22) Option B)
