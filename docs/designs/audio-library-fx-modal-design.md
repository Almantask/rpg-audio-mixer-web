# Sound Effects — Picker Modal Design

**Design References:**
- **Browse mode (Library page):** [`audio-library-design.md`](audio-library-design.md) — Sound Effects tab
- **Parallel pattern:** [`audio-library-soundscapes-modal-design.md`](audio-library-soundscapes-modal-design.md)
- **Launched from soundboard:** [`active-scene-soundboard-design.md`](active-scene-soundboard-design.md) — **Add Sound**

---

## Purpose

The Sound Effects **picker modal** lets the GM select FX tracks from the library and add them to the **active scene soundboard** in one commit action. It is launched from Active Scene — **Add Sound**, not from the sidebar.

For browsing, importing, buying, previewing, and editing the global FX catalogue, use the **Library page** — [`audio-library-design.md`](audio-library-design.md).

This modal provides filters, import/buy actions, card grid, preview-on-click, **multi-select checkboxes**, and a footer **Add Selected** button.

**No Detail button.** Per-card **+** is replaced by selection checkboxes.

**Not used for:** Sidebar → Library (that route is the full Library page).

---

## Presentation

| Viewport | Container |
|---|---|
| **Mobile** | Full-screen `Sheet`; ← back when launched from Active Scene |
| **Web (sidebar layout)** | Large content-area `Sheet` / `Dialog`; app sidebar remains visible; filter panel stays in sidebar footer |

---

## Layout — Modal

```
┌──────────┬──────────────────────────────────────────────────────────────┐
│ Sidebar  │  ← Back to Active Scene          (picker launch only)      │
│          │  Sound Effects                                               │
│  Search  │  Browse, import, and manage your sound effects.       │
│  Types   │  [ Import FX ]  [ Buy More ]  [ Free Tracks ]              │
│  Intens. │  🔍  Search effects…                                         │
│  Sort    │                                                              │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│          │  │☑ [thumb] │ │☐ [thumb] │ │☑ [thumb] │ │☐ [thumb] │       │
│          │  │ Thunder  │ │ Sword    │ │ Rune Act │ │ Goblin   │       │
│          │  │ 0:04 · II│ │ 0:02 · I │ │ 0:03 · III│ │ 0:01 · I │       │
│          │  │ IMPACT   │ │ COMBAT   │ │ UI MAGIC │ │ CREATURE │       │
│          │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│          │                                                               │
│          │ ┌──────────────────────────────────────────────────────────┐  │
│          │ │              Add Selected (2)                        │  │
│          │ └──────────────────────────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────────────────────────┘
```

---

## Sidebar Filter Panel

Same as before — anchored in the **sidebar footer**, not the modal header:

| Control | Component | Description |
|---|---|---|
| Search | `Input` | Placeholder: "Search effects…" with magnifying glass |
| FX Types | `Select` | Dropdown — e.g. "All Types" |
| Base Intensity | `Slider` | Horizontal slider with speaker icons at each end |
| Sort Order | `Select` | Dropdown — e.g. "Recently Added" |

Filters apply to the modal grid in real time (debounced search).

---

## Components

### Modal Header
- **Back control** — ← **Back to Active Scene** (always shown in picker)
- **Title:** **Sound Effects** — large gold serif
- **Subtitle:** "Browse, import, and manage your sound effects."

### Action Buttons (below subtitle)
Unchanged from the import-capable library — always visible in the modal:

| Button | Style | Action |
|---|---|---|
| **Import FX** | outline + upload | Browser file picker → new tracks appear in grid (auto-selected optional) |
| **Buy More** | gold + cart | Storefront |
| **Free Tracks** | outline + external-link | Download demo FX pack |

### Search Bar
- Full-width `Input` below the action buttons
- Magnifying-glass icon; placeholder: **Search effects…**
- Filters the card grid in real time (debounced)
- Synced with sidebar search when both are visible on web

### FX Card (`Card` — grid, repeating)

| Element | Description |
|---|---|
| **Selection** | Checkbox top-left — toggles track in selection set; does not play or navigate |
| Thumbnail | Square artwork — **click card body to preview** |
| Title + duration + intensity | e.g. "Thunder Strike" — 0:04 — **II** (roman **I** / **II** / **III**) |
| Tags | `Badge` chips (IMPACT, COMBAT, UI, MAGIC, etc.) |

**Not on cards:** Detail (⋯) button, per-card **+** add button.

**Playing state:**
- Gold border + optional **● PLAYING** on thumbnail
- Click playing card again to stop
- One preview at a time

**Already in target (picker mode):** checkbox disabled + muted card styling when track is already on the active scene soundboard.

### Footer — Add Selected
- Sticky full-width gold `Button` at bottom of modal
- Label: **Add Selected (N)** — **N** = checked count; disabled when **N = 0**
- Commits all checked tracks to the active scene soundboard

---

## Launch Context

| Launched from | Back link | Add Selected commits to |
|---|---|---|
| **Add Sound** (Active Scene soundboard) | ← Back to Active Scene | Adds checked tracks to the scene soundboard; modal may stay open for more picks |

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click card body / thumbnail | Previews track |
| Click playing card again | Stops preview |
| Toggle checkbox | Adds/removes track from selection |
| Click **Add Selected (N)** | Adds all checked tracks to the scene soundboard; clears selection on success |
| Click **Import FX** | Opens browser file picker; new tracks appear in grid |
| Click **Buy More** | Navigate to storefront |
| Click **Free Tracks** | Initiates demo FX download |
| Type in **Search** bar | Filters grid by track name and tags (debounced) |
| Use sidebar search/filters | Same filter state as main search bar; filters grid in real time |
| Click ← back | Closes modal (picker); already-committed adds remain |

Preview volume uses each track's saved default with **Cubic ($x^3$) mapping**.

---

## States

### Populated grid
Card grid with checkboxes, tags, intensity; footer shows **Add Selected (0)** disabled.

### Selection active
One or more checkboxes checked; footer label updates count; button enabled.

### Playback state
One card shows gold border / **● PLAYING**; selection and footer remain usable.

### Empty library
Centred illustration + **Import FX**, **Buy More**, and **Free Tracks**; footer hidden or disabled.

### Filtered empty
"No effects match your filters" with clear-filters action.

### Loading
`Skeleton` cards until library data resolves.

---

## Navigation

| Destination | Trigger |
|---|---|
| Active Scene — Soundboard tab | ← back |
| Library page (browse) | `audio-library-design.md` |
| Browser file picker | Import FX |
| Storefront | Buy More |
| Credits | Sidebar → Credits |
| Trash | Sidebar → Trash |

---

## Related Flows

| Flow | Doc |
|---|---|
| Library page (browse) | `audio-library-design.md` |
| Soundboard grid | `active-scene-soundboard-design.md` |
| Soundscapes picker modal | `audio-library-soundscapes-modal-design.md` |
| Legacy combined spec | `add-fx-or-soundscape-to-scene-design.md` |
