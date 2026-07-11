# Sound Effects — Library Tab Design (Browse)

> **Canonical picker modal:** [`audio-library-fx-modal-design.md`](audio-library-fx-modal-design.md)  
> **Canonical Library page (both tabs):** [`audio-library-design.md`](audio-library-design.md)

**Design References:**
- [`docs/designs/AudioLibrary-FX.html`](AudioLibrary-FX.html)
- [`docs/designs/AudioLibrary-FX.png`](AudioLibrary-FX.png)
- **Launched from soundboard:** [`active-scene-soundboard-design.md`](active-scene-soundboard-design.md) — **Add Sound** (picker — see modal doc)

---

## Purpose

The **Sound Effects** tab on the Library page is browse mode for the global FX catalogue: filters, import, buy, free tracks, card grid, inline preview with sticky mini player, and **inline card edit** (name, tags, delete).

For **picker mode** (Add Sound from Active Scene), see [`audio-library-fx-modal-design.md`](audio-library-fx-modal-design.md).

**Sidebar nav item:** Library → Sound Effects tab (client-only tab state on `/library`).

---

## Layout — FX Tab (browse)

```
┌──────────┬──────────────────────────────────────────────────────────────┐
│ Sidebar  │  Library  |  Sound Effects (active tab)                       │
│  Types   │  Browse, import, and manage your sound effects.             │
│  Intens. │  [ Import FX ]  [ Buy More ]  [ Free Tracks ]              │
│  Sort    │  🔍  Search effects…                                         │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│          │  │ [thumb]  │ │ [thumb]  │ │ [thumb]  │ │ [thumb]  │       │
│          │  │ Thunder  │ │ Sword    │ │ Rune Act │ │ Goblin   │       │
│          │  │ 0:04 · II│ │ 0:02 · I │ │ 0:03 · III│ │ 0:01 · I │       │
│          │  │ IMPACT   │ │ COMBAT   │ │ UI MAGIC │ │ CREATURE │       │
│          │  │ ✏️       │ │ ✏️       │ │ ✏️       │ │ ✏️       │       │
│          │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│          │  ─────────────────────────────────────────────────────────  │
│          │  FX mini-player (sticky)                                     │
└──────────┴──────────────────────────────────────────────────────────────┘
```

---

## Sidebar Filter Panel

Anchored in the **sidebar footer** while Library → Sound Effects is active. **No search field in the sidebar.**

| Control | Component | Description |
|---|---|---|
| FX Types | `Select` | e.g. "All Types" |
| Base Intensity | `Slider` | **Filter** — show tracks with base intensity **≤** selected value (inclusive ceiling). Stops: **I**, **II**, **III** only |
| Sort Order | `Select` | e.g. "Recently Added" |

Filters apply to the grid in real time (debounced). Text search is **main-content only**.

---

## Components

### Tab Header
- **Subtitle:** "Browse, import, and manage your sound effects."

### Action Buttons

| Button | Style | Action |
|---|---|---|
| **Import FX** | outline + upload | Browser file picker → new tracks appear in grid |
| **Buy More** | gold + cart | Storefront |
| **Free Tracks** | outline + external-link | Download variable-size demo FX pack (progress UI; not a fixed track count) |

### Search Bar
- Full-width `Input` below action buttons — **only** search control
- Placeholder: **Search effects…**
- Filters grid by track name and tags (debounced)

### FX Card (`Card` — grid, repeating)

| Element | Description |
|---|---|
| Thumbnail | Square artwork — **click card body to preview** |
| Title + duration + intensity | e.g. "Thunder Strike" · 0:04 · **II** (roman **I** / **II** / **III**) |
| Tags | `Badge` chips (IMPACT, COMBAT, UI, MAGIC, etc.) |
| **✏️ edit** | **Inline edit** on card — name, tags, delete (no separate screen or route) |

**Not on cards:** checkboxes (browse mode), Detail (⋯), per-card **+**.

**Playing state:**
- Gold border + **● PLAYING** on thumbnail
- Click playing card again to stop
- One preview at a time

### FX Mini Player
- Sticky bar at bottom of main content — **FX tab only**
- Shows current preview track name, progress, play/pause
- **Navigating away from Library stops playback and hides the mini player**

Preview volume uses each track's saved default with **Cubic ($x^3$) mapping**.

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click card body / thumbnail | Previews track (updates mini player) |
| Click playing card again | Stops preview |
| Click **✏️** | Inline edit on card (name, tags, delete) |
| Delete via inline edit | Soft-deletes → Trash **FX** tab; **audio file retained** 7 days; no routine confirm |
| Click **Import FX** | Browser file picker; new tracks in grid |
| Click **Buy More** | Storefront |
| Click **Free Tracks** | Demo FX download with progress |
| Type in main **Search** bar | Filters grid by track name and tags (debounced) |
| Use sidebar filters | Filters grid in real time (types, base intensity, sort) |
| Leave Library (sidebar nav) | Stops FX preview; hides mini player |

---

## States

### Populated grid
Card grid with tags and intensity; mini player available when previewing.

### Playback state
One card shows gold border / **● PLAYING**; mini player visible.

### Empty library
Centred illustration + **Import FX**, **Buy More**, and **Free Tracks**.

### Filtered empty
**"No effects match your filters"** with clear-filters action.

### Loading
`Skeleton` cards until library data resolves.

---

## Navigation

| Destination | Trigger |
|---|---|
| Trash (FX restore) | Sidebar → Trash → **FX** tab |
| Library Soundscapes tab | Tab strip (client state) |
| Browser file picker | Import FX |
| Storefront | Buy More |
| Credits | Sidebar → Credits |

---

## Related Flows

| Flow | Doc |
|---|---|
| Library page (both tabs) | `audio-library-design.md` |
| Add Sound picker modal | `audio-library-fx-modal-design.md` |
| Soundboard grid | `active-scene-soundboard-design.md` |
| Trash restore | `trash-design.md` |
