# Sound Effects — Picker Modal Design

**Design References:**
- **Browse mode (Library page):** [`audio-library-design.md`](audio-library-design.md) — Sound Effects tab; import/buy/free actions live there only
- **Parallel pattern:** [`audio-library-soundscapes-modal-design.md`](audio-library-soundscapes-modal-design.md)
- **Launched from soundboard:** [`active-scene-soundboard-design.md`](active-scene-soundboard-design.md) — **Add Sound**

---

## Purpose

The Sound Effects **picker modal** lets the GM select FX tracks from the library and add them to the **active scene soundboard** in one commit action. It is launched from Active Scene — **Add Sound**, not from the sidebar.

For browsing, importing, buying, previewing, and editing the global FX catalogue, use the **Library page** — [`audio-library-design.md`](audio-library-design.md).

This modal provides filters, card grid, preview-on-click, **multi-select checkboxes**, and a footer **Add Selected** button.

**No Detail button.** Per-card **+** is replaced by selection checkboxes.

**No Import in scene picker** — import via Library page only (**FX-13**, **PW-24**). **Buy More** / **Free Tracks** remain on the Library page only.

**Not used for:** Sidebar → Library (that route is the full Library page).

---

## Presentation

| Viewport | Container |
|---|---|
| **Mobile** | Full-screen `Sheet`; ← back when launched from Active Scene; filters in **collapsible sheet header panel** |
| **Web (sidebar layout)** | Large content-area `Sheet` / `Dialog`; app sidebar remains visible; filter panel stays in sidebar footer |

---

## Layout — Modal

```
┌──────────┬──────────────────────────────────────────────────────────────┐
│ Sidebar  │  ← Back to Active Scene                                      │
│          │  Sound Effects                                               │
│  Search  │  Select effects for this scene's soundboard.                 │
│  Types   │  🔍  Search effects…                                         │
│  Intens. │                                                              │
│  Sort    │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
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

Anchored in the **sidebar footer** on web; **collapsible panel in sheet header** on mobile:

| Control | Component | Description |
|---|---|---|
| Search | `Input` | Placeholder: "Search effects…" with magnifying glass |
| FX Types | `Select` | Dropdown — e.g. "All Types" |
| Base Intensity | `Slider` | Horizontal slider with speaker icons at each end — **filters grid only** (same semantics as AL-06 on Library page) |
| Sort Order | `Select` | Dropdown — e.g. "Recently Added" |

Filters apply to the modal grid in real time (debounced search).

**Base Intensity filter:** narrows which tracks appear in the grid. Preview volume always uses each track's saved default — the filter does **not** affect preview loudness.

---

## Components

### Modal Header
- **Back control** — ← **Back to Active Scene** (always shown in picker)
- **Title:** **Sound Effects** — large gold serif
- **Subtitle:** "Select effects for this scene's soundboard."

### Search Bar
- Full-width `Input` below the subtitle
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

**Already on scene:** tracks already on the active scene soundboard are **omitted from the picker grid** — not shown as disabled rows.

### Footer — Add Selected
- Sticky full-width gold `Button` at bottom of modal
- Label: **Add Selected (N)** — **N** = checked count; disabled when **N = 0**
- Commits all checked tracks to the active scene soundboard

---

## Launch Context

| Launched from | Back link | Add Selected commits to |
|---|---|---|
| **Add Sound** (Active Scene soundboard) | ← Back to Active Scene | Adds checked tracks to the scene soundboard; modal **stays open** for additional picks |

> **Picker list scope:** FX tracks **already on the scene soundboard** are **excluded** from the grid.

> **Session Lock:** When active scene lock is on, the **Add Sound** tile is **disabled/hidden** — the picker cannot be opened by any path.

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click card body / thumbnail | Previews track at saved default volume |
| Click playing card again | Stops preview |
| Toggle checkbox | Adds/removes track from selection |
| Click **Add Selected (N)** | Adds all checked tracks to the scene soundboard in **selection order**; clears selection on success; modal **stays open**; **Sonner toast** — e.g. "2 effects added" (**PW-25**) |
| Type in **Search** bar | Filters grid by track name and tags (debounced) |
| Adjust **Base Intensity** slider | Filters grid to matching intensity tracks; preview volume unaffected |
| Use sidebar search/filters | Same filter state as main search bar; filters grid in real time |
| Click ← back | **Stops preview**; closes modal; already-committed adds remain |

**Post-commit soundboard behaviour:**
- New tiles append **after** existing tiles in **selection order**
- Hotkeys assigned **sequentially to new tiles only** (existing tile hotkeys unchanged)

Preview volume uses each track's saved default with **Cubic ($x^3$) mapping**.

Adding FX to the soundboard does **not** start playback on the Active Scene.

---

## States

### Populated grid
Card grid with checkboxes, tags, intensity; footer shows **Add Selected (0)** disabled.

### Selection active
One or more checkboxes checked; footer label updates count; button enabled.

### Playback state
One card shows gold border / **● PLAYING**; selection and footer remain usable.

### Empty library
Centred illustration + copy directing GM to **Library → Sound Effects** to import or purchase tracks; footer hidden or disabled.

### Filtered empty
"No effects match your filters" with clear-filters action.

### Loading
`Skeleton` cards until library data resolves.

---

## Navigation

| Destination | Trigger |
|---|---|
| Active Scene — Soundboard tab | ← back |
| Library page (import / buy / browse) | Sidebar → Library — Sound Effects tab |
| Credits | Sidebar → Credits |
| Trash | Sidebar → Trash |

---

## Related Flows

| Flow | Doc |
|---|---|
| Library page (browse, import, buy) | `audio-library-design.md` |
| Soundboard grid | `active-scene-soundboard-design.md` |
| Soundscapes picker modal | `audio-library-soundscapes-modal-design.md` |
| Legacy combined spec | `add-fx-or-soundscape-to-scene-design.md` |
