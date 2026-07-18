# Audio Library — Screen Design

**Design References:**
- **Browse mode (this doc):** sidebar → Library full page
- **Picker mode:** [`audio-library-soundscapes-modal-design.md`](audio-library-soundscapes-modal-design.md) — ADD SOUNDSCAPE
- **Picker mode:** [`audio-library-fx-modal-design.md`](audio-library-fx-modal-design.md) — Add Sound
- **Drill-down:** [`soundscape-category-composer-design.md`](soundscape-category-composer-design.md)
- **Shared shell:** [`platform-design.md`](platform-design.md)

---

## Purpose

The Audio Library is the GM's master catalogue for **soundscape categories** (compositions) and **one-shot FX tracks**. From the sidebar **Library** item the GM can switch between both asset types, search and filter, import or purchase content, preview audio, and open deeper editing flows.

This document covers **browse mode** — a full main-content **page**, not a modal.

**Scene pickers** (ADD SOUNDSCAPE, Add Sound) reuse the same grid/filter components inside modals with checkboxes and an **Add Selected** footer — see the picker modal docs.

**Sidebar nav item:** Library (active on this screen)

**Route:** `/library` — single route; tab choice is **client-only state** (no `/library/soundscapes` or `/library/fx` URL segments). Browser back/forward does not restore tab selection.

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See [`platform-design.md`](platform-design.md) for shell spec.

- **Top bar:** hamburger — "Arcanum Audio"
- **Sidebar:** Library active (gold bar + tint)
- **FE sidebar navigation only (no tab bar)**

When Library is active, the **sidebar footer** hosts tab-scoped filter controls (see [Sidebar Filter Panel](#sidebar-filter-panel)).

---

## Layout — Main Content

```
┌──────────┬──────────────────────────────────────────────────────────────┐
│ Sidebar  │  Library                                                     │
│  Home    │  Soundscapes  |  Sound Effects        ← gold underline tabs  │
│  Camp    │  -----------                                                 │
│  Scene   │  [ Buy Composition ] [ Free Compositions ]   ← SC tab only  │
│  Library │  — or —                                                      │
│  (active)│  [ Import FX ] [ Buy More ] [ Free Tracks ]    ← FX tab only│
│          │  🔍  Search compositions… / Search effects…                  │
│  Type    │                                                              │
│  Sort    │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  (+ FX   │  │ 🌧 Weather   │ │ 🍺 Tavern    │ │ ✨ Ethereal   │       │
│  filters │  │ I:3·II:5·III:2│ │ I:2·II:4·III:0│ │ I:1·II:0·III:0│       │
│  on FX   │  └──────────────┘ └──────────────┘ └──────────────┘       │
│  tab)    │  ┌ - - - - - - - ┐  ← Soundscapes tab only                 │
│          │  │ + Add         │                                          │
│          │  │ Soundscape    │                                          │
│          │  └ - - - - - - - - ┘                                          │
│          │  ─────────────────────────────────────────────────────────  │
│          │  FX mini-player (Sound Effects tab only)                    │
└──────────┴──────────────────────────────────────────────────────────────┘
```

---

## Tab Strip

Two tabs only — same underline pattern as Active Scene:

| Tab | Label |
|---|---|
| **Soundscapes** | Soundscapes |
| **Sound Effects** | Sound Effects |

- Active tab: gold text + gold underline
- Inactive tab: muted text, no underline
- Switching tabs may clear or persist search text — persist is preferred
- Each tab has its own action bar, search placeholder, and grid card type
- Tab state is **not** reflected in the URL

---

## Sidebar Filter Panel

Neither Library tab exposes a sidebar filter panel. Search lives in main content only. Both grids default to recently added order.

### Soundscapes tab

No sidebar filter panel. The main-content search bar is the **only** filter control. The grid defaults to recently added order.

### Sound Effects tab

No sidebar filter panel. The main-content search bar is the **only** filter control. The grid defaults to recently added order.

---

## Soundscapes Tab

### Page Header
- **Title:** **Library** — large gold serif (page-level; tab context is clear from tab strip)
- **Subtitle (Soundscapes tab):** "Browse and manage your soundscape categories."

### Action Buttons

| Button | Style | Action |
|---|---|---|
| **Buy Composition** | gold + cart | Storefront |
| **Free Compositions** | outline + external-link | Download variable-size demo pack (progress UI; not a fixed track count) |

### Search Bar
- Full-width `Input` below action buttons — **only** search control on this tab
- Placeholder: **Search compositions…**
- Debounced filter on category name

### Composition Card (`Card` — grid, repeating)

| Element | Description |
|---|---|
| Thumbnail / icon | Thematic artwork |
| Category name | Gold serif (e.g. *Meteorological*) |
| Intensity breakdown | **`I: 3 · II: 5 · III: 2`** on every card — per-level track counts; dim segments when zero |
| **▶ preview** | Optional small control on card — previews a sample track without leaving the grid |
| **✏️ edit** | Opens **Category Composer** for this category |
| **🗑 delete** | Web/tablet — soft-deletes category to Trash **Soundscapes** tab (7-day retention) |

**Not on cards:** checkboxes, Detail (⋯), per-card **+** (browse mode).

**Playing state:** gold border + **● PLAYING** on thumbnail; one preview at a time. **Inline card preview only** — no sticky mini player on the Soundscapes tab.

### Add Soundscape Card
- Dashed border tile at end of grid: **+ Add Soundscape**
- Prompt for name → **Category Composer** (empty category)

### Card Interactions (browse)

| Interaction | Result |
|---|---|
| Click **▶** on card | Previews sample from category (inline) |
| Click playing card / **▶** again | Stops preview |
| Click card body or **✏️** | Opens **Category Composer** |
| Click **🗑** (web/tablet) or **swipe** (touch) | Soft-deletes category → Trash **Soundscapes** tab; recoverable 7 days; no routine confirm dialog |
| Click **Buy Composition** | Storefront |
| Click **Free Compositions** | Demo download with progress; new categories appear in grid when complete |
| Click **+ Add Soundscape** | Name prompt → Category Composer |

> Remove **"The Archivist's Choice"** section if present — out of scope.

### Category delete — Composer path

From **Category Composer** header: **Delete** soft-deletes the whole category to Trash **Soundscapes** tab (same 7-day retention as grid delete). No routine confirm dialog.

---

## Sound Effects Tab

### Page Header
- **Subtitle (FX tab):** "Browse, import, and manage your sound effects."

### Action Buttons

| Button | Style | Action |
|---|---|---|
| **Import FX** | outline + upload | Browser file picker → track added to library |
| **Buy More** | gold + cart | Storefront |
| **Free Tracks** | outline + external-link | Download variable-size demo FX pack (progress UI; not a fixed track count) |

### Search Bar
- Placeholder: **Search effects…**
- Debounced filter on track name and tags

### FX Card (`Card` — grid, repeating)

| Element | Description |
|---|---|
| Thumbnail | Square artwork |
| Title + duration + intensity | e.g. "Thunder Strike" — 0:04 · **II** |
| Tags | `Badge` chips (IMPACT, COMBAT, UI, MAGIC, etc.) |
| **✏️ edit** | **Inline edit** on card — name, tags, delete (no separate edit screen or route) |

**Not on cards:** checkboxes, heart/favourite, ⋮ menu (use ✏️ edit instead).

**Playing state:** gold border + **● PLAYING**; click card body to preview; click again to stop.

### FX Mini Player
- Sticky bar at bottom of main content — **Sound Effects tab only**
- Shows current preview track name, progress, play/pause
- Hidden on Soundscapes tab
- **Navigating away from Library stops playback and hides the mini player**

Preview volume uses each track's saved default with **Cubic ($x^3$) mapping**.

### Card Interactions (browse)

| Interaction | Result |
|---|---|
| Click card body / thumbnail | Previews track (updates mini player) |
| Click playing card again | Stops preview |
| Click **✏️** | Opens inline edit on card (name, tags, delete) |
| Delete via inline edit | Soft-deletes track → Trash **FX** tab; **audio file retained** 7 days until Trash purge; recoverable |
| Click **Import FX** | File picker; new track in grid |
| Click **Buy More** / **Free Tracks** | Storefront / demo download with progress |

---

## Soft-delete & Trash

All Library deletes are **soft-delete** with **7-day retention** on the matching Trash tab ([`trash-design.md`](trash-design.md)):

| Entity | Delete affordance | Trash tab |
|---|---|---|
| Soundscape category | 🗑 on card (web/tablet) or swipe (touch); Composer header delete | **Soundscapes** |
| FX track | Inline edit → delete | **FX** |

- **No routine confirm dialog** on soft-delete (Purge/Empty Trash still confirm)
- FX soft-delete **retains the audio blob** until Trash purge or restore

---

## Browse vs Picker Mode

Shared UI components; behaviour differs by launch context:

| Aspect | Browse (this page) | Picker (modal from Active Scene) |
|---|---|---|
| Container | Full page at `/library` | Modal / full-screen sheet |
| Back control | — | ← Back to Active Scene |
| Checkboxes | **No** | **Yes** |
| Footer CTA | **No** Add Selected | **Add Selected (N)** |
| Soundscape card click | Category Composer | Preview sample |
| FX card click | Preview (+ mini player) | Preview only |
| Add Soundscape tile | **Visible** | **Hidden** |
| Categories with 0 tracks | **Shown** | **Hidden** (ADD SOUNDSCAPE picker) |
| Already on scene | N/A | Checkbox disabled + muted |

Picker specs: [`audio-library-soundscapes-modal-design.md`](audio-library-soundscapes-modal-design.md), [`audio-library-fx-modal-design.md`](audio-library-fx-modal-design.md).

---

## States

### Populated grid
Tab-appropriate cards in responsive grid (2–4 columns by viewport).

### Empty library (tab)
Centred illustration + tab action buttons as primary CTAs.

### Filtered empty
**"No compositions match your filters"** / **"No effects match your filters"** with clear-filters action.

### Loading
`Skeleton` cards until library data resolves.

### Playback
- **Soundscapes tab:** one card **● PLAYING**; inline preview only; no mini player
- **FX tab:** one card **● PLAYING**; mini player visible. Leaving Library stops preview.

---

## Interactions & Behaviour (page-level)

| Interaction | Result |
|---|---|
| Click sidebar **Library** | Navigate to `/library` (restores last visited tab in client state) |
| Switch tab | Swap action bar, filters, grid, mini player visibility (client state only) |
| Type in main search bar | Filter active tab grid (debounced) |
| Click other sidebar item | Leave Library; FX preview stops and mini player hides |

---

## Out of scope (P2)

- **Scene filter** — "sounds used in Scene X" is deferred; not in Library MVP browse

---

## Navigation

| Destination | Trigger |
|---|---|
| Category Composer | Soundscapes card click or + Add Soundscape |
| Trash (restore) | Sidebar → Trash — **Soundscapes** or **FX** tab |
| Storefront | Buy / Free action buttons |
| Active Scene pickers | Not from this page — use ADD SOUNDSCAPE / Add Sound |
| Credits | Sidebar → Credits |
| Home / Campaign / Scenes | Sidebar |

---

## Related Flows

| Flow | Doc |
|---|---|
| Category Composer | `soundscape-category-composer-design.md` |
| ADD SOUNDSCAPE picker | `audio-library-soundscapes-modal-design.md` |
| Add Sound picker | `audio-library-fx-modal-design.md` |
| Active Scene | `active-scene-soundscapes-design.md`, `active-scene-soundboard-design.md` |
| Trash restore | `trash-design.md` |
