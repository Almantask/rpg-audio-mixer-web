# Audio Library — Screen Design

**Design References:**
- **Browse mode (this doc):** sidebar → Library full page
- **Picker mode:** [`audio-library-soundscapes-modal-design.md`](audio-library-soundscapes-modal-design.md) — ADD SOUNDSCAPE
- **Picker mode:** [`audio-library-fx-modal-design.md`](audio-library-fx-modal-design.md) — Add Sound
- **Drill-down:** [`soundscape-category-composer-design.md`](soundscape-category-composer-design.md)
- **Shared shell:** [`home-design.md`](home-design.md)

---

## Purpose

The Audio Library is the GM's master catalogue for **soundscape categories** (compositions) and **one-shot FX tracks**. From the sidebar **Library** item the GM can switch between both asset types, search and filter, import or purchase content, preview audio, and open deeper editing flows.

This document covers **browse mode** — a full main-content **page**, not a modal.

**Scene pickers** (ADD SOUNDSCAPE, Add Sound) reuse the same grid/filter components inside modals with checkboxes and an **Add Selected** footer — see the picker modal docs.

**Sidebar nav item:** Library (active on this screen)

**Routes:**
- `/library` — defaults to Soundscapes tab
- `/library/soundscapes` — Soundscapes tab (deep link)
- `/library/fx` — Sound Effects tab (deep link)

Tab choice persists in the URL so browser back/forward and bookmarks work.

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See `home-design.md` for full shell spec.

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
│  Search  │                                                              │
│  Type    │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  Sort    │  │ 🌧 Weather   │ │ 🍺 Tavern    │ │ ✨ Ethereal   │       │
│  (+ FX   │  │ 12 tracks    │ │ 8 tracks     │ │ 6 tracks     │       │
│  filters │  │ 3 layers     │ │ 2 layers     │ │ 1 layer      │       │
│  on FX   │  └──────────────┘ └──────────────┘ └──────────────┘       │
│  tab)    │  ┌ - - - - - - - ┐  ← Soundscapes tab only                 │
│          │  │ + New         │                                          │
│          │  │ Composition   │                                          │
│          │  └ - - - - - - - - ┘                                          │
│          │  ─────────────────────────────────────────────────────────  │
│          │  FX mini-player (Sound Effects tab only)                    │
└──────────┴──────────────────────────────────────────────────────────────┘
```

---

## Tab Strip

Two tabs only — same underline pattern as Active Scene:

| Tab | Label | Route suffix |
|---|---|---|
| **Soundscapes** | Soundscapes | `/library/soundscapes` |
| **Sound Effects** | Sound Effects | `/library/fx` |

- Active tab: gold text + gold underline
- Inactive tab: muted text, no underline
- Switching tabs preserves sidebar filter **category** (search text may clear or persist — persist is preferred)
- Each tab has its own action bar, search placeholder, grid card type, and sidebar filter set

---

## Sidebar Filter Panel

Anchored in the **sidebar footer** while Library is active. Controls change with the active tab.

### Soundscapes tab

| Control | Component | Description |
|---|---|---|
| Search | `Input` | Placeholder: "Search compositions…" |
| Category Type | `Select` | e.g. "All Types" |
| Sort Order | `Select` | e.g. "Recently Added" |

### Sound Effects tab

| Control | Component | Description |
|---|---|---|
| Search | `Input` | Placeholder: "Search effects…" |
| FX Types | `Select` | e.g. "All Types" |
| Base Intensity | `Slider` | Horizontal slider with speaker icons |
| Sort Order | `Select` | e.g. "Recently Added" |

Filters apply to the active tab's grid in real time (debounced). The main-content search bar shares the same filter state as sidebar search when both are visible.

---

## Soundscapes Tab

### Page Header
- **Title:** **Library** — large gold serif (page-level; tab context is clear from tab strip)
- **Subtitle (Soundscapes tab):** "Browse and manage your soundscape categories."

### Action Buttons

| Button | Style | Action |
|---|---|---|
| **Buy Composition** | gold + cart | Storefront |
| **Free Compositions** | outline + external-link | Download free demo pack |

### Search Bar
- Full-width `Input` below action buttons
- Placeholder: **Search compositions…**
- Debounced filter on category name

### Composition Card (`Card` — grid, repeating)

| Element | Description |
|---|---|
| Thumbnail / icon | Thematic artwork |
| Category name | Gold serif (e.g. *Meteorological*) |
| Track count | e.g. **12 tracks** |
| Layer summary | e.g. **12 tracks**; intensity level counts (**I – V**) dimmed when zero |
| **▶ preview** | Optional small control on card — previews a sample track without leaving the grid |
| **✏️ edit** | Opens **Category Composer** for this category |

**Not on cards:** checkboxes, Detail (⋯), per-card **+** (browse mode).

**Playing state:** gold border + **● PLAYING** on thumbnail; one preview at a time.

### Add Soundscape Card
- Dashed border tile at end of grid: **+ Add Soundscape**
- Prompt for name → **Category Composer** (empty category)

### Card Interactions (browse)

| Interaction | Result |
|---|---|
| Click **▶** on card | Previews sample from category |
| Click playing card / **▶** again | Stops preview |
| Click card body or **✏️** | Opens **Category Composer** |
| Click **Buy Composition** | Storefront |
| Click **Free Compositions** | Demo download; new categories appear in grid |
| Click **Add Soundscape** | Name prompt → Category Composer |

> Remove **"The Archivist's Choice"** section if present — out of scope.

---

## Sound Effects Tab

### Page Header
- **Subtitle (FX tab):** "Browse, import, and manage your sound effects."

### Action Buttons

| Button | Style | Action |
|---|---|---|
| **Import FX** | outline + upload | Browser file picker → track added to library |
| **Buy More** | gold + cart | Storefront |
| **Free Tracks** | outline + external-link | Demo FX pack download |

### Search Bar
- Placeholder: **Search effects…**
- Debounced filter on track name and tags

### FX Card (`Card` — grid, repeating)

| Element | Description |
|---|---|
| Thumbnail | Square artwork |
| Title + duration + intensity | e.g. "Thunder Strike" — 0:04 · **II** |
| Tags | `Badge` chips (IMPACT, COMBAT, UI, MAGIC, etc.) |
| **✏️ edit** | Opens track edit (name, tags, delete) |

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
| Click **✏️** | Track edit screen |
| Click **Import FX** | File picker; new track in grid |
| Click **Buy More** / **Free Tracks** | Storefront / demo download |

---

## Browse vs Picker Mode

Shared UI components; behaviour differs by launch context:

| Aspect | Browse (this page) | Picker (modal from Active Scene) |
|---|---|---|
| Container | Full page at `/library/…` | Modal / full-screen sheet |
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
"No compositions match your filters" / "No effects match your filters" with clear-filters action.

### Loading
`Skeleton` cards until library data resolves.

### Playback (FX tab)
One card **● PLAYING**; mini player visible. Leaving Library stops preview.

---

## Interactions & Behaviour (page-level)

| Interaction | Result |
|---|---|
| Click sidebar **Library** | Navigate to `/library/soundscapes` (or last visited tab) |
| Switch tab | Update route; swap action bar, filters, grid, mini player visibility |
| Type in search (main or sidebar) | Filter active tab grid (debounced, synced) |
| Click other sidebar item | Leave Library; FX preview stops |

---

## Navigation

| Destination | Trigger |
|---|---|
| Category Composer | Soundscapes card click or Add Soundscape |
| Track edit | FX card ✏️ |
| Storefront | Buy / Free action buttons |
| Active Scene pickers | Not from this page — use ADD SOUNDSCAPE / Add Sound |
| Credits | Sidebar → Credits |
| Trash | Sidebar → Trash |
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
