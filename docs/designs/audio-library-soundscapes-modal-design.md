# Soundscapes — Picker Modal Design

**Design References:**
- **Browse mode (Library page):** [`audio-library-design.md`](audio-library-design.md) — Soundscapes tab
- **Parallel pattern:** [`audio-library-fx-modal-design.md`](audio-library-fx-modal-design.md)
- **Launched from scene:** [`active-scene-soundscapes-design.md`](active-scene-soundscapes-design.md) — **ADD SOUNDSCAPE**

---

## Purpose

The Soundscapes **picker modal** lets the GM select soundscape categories from the library and add them to the **active scene** in one commit action. It is launched from Active Scene — **ADD SOUNDSCAPE**, not from the sidebar.

For browsing, buying, composing, and editing categories, use the **Library page** — [`audio-library-design.md`](audio-library-design.md).

This modal provides filters, buy/free actions, card grid, preview-on-click, **multi-select checkboxes**, and a footer **Add Selected** button.

**No Detail button.** Per-card edit / **+** is replaced by selection checkboxes.

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
│          │  Soundscapes                                               │
│  Search  │  Add categories to your active scene.                       │
│  Type    │  [ Buy Composition ]  [ Free Compositions ]                │
│  Sort    │  🔍  Search compositions…                                    │
│          │                                                              │
│          │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│          │  │☑ 🌧 Weather  │ │☐ 🍺 Tavern   │ │☐ ✨ Ethereal  │       │
│          │  │ 12 tracks    │ │ 8 tracks     │ │ 6 tracks     │       │
│          │  │ 3 layers     │ │ 2 layers     │ │ 1 layer      │       │
│          │  └──────────────┘ └──────────────┘ └──────────────┘       │
│          │ ┌──────────────────────────────────────────────────────────┐  │
│          │ │              Add Selected (1)                        │  │
│          │ └──────────────────────────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────────────────────────┘
```

---

## Sidebar Filter Panel

Anchored in the **sidebar footer**:

| Control | Component | Description |
|---|---|---|
| Search | `Input` | Placeholder: "Search compositions…" with magnifying glass |
| Category Type | `Select` | Dropdown — e.g. "All Types" |
| Sort Order | `Select` | Dropdown — e.g. "Recently Added" |

Filters apply to the modal grid in real time (debounced).

---

## Components

### Modal Header
- **Back control** — ← **Back to Active Scene** (always shown in picker)
- **Title:** **Soundscapes** — large gold serif
- **Subtitle:** "Add categories to your active scene."

### Action Buttons (below subtitle)

| Button | Style | Action |
|---|---|---|
| **Buy Composition** | gold + cart | Storefront — purchase pre-made soundscape compositions |
| **Free Compositions** | outline + external-link | Download free demo composition pack |

### Search Bar
- Full-width `Input` below the action buttons
- Magnifying-glass icon; placeholder: **Search compositions…**
- Filters the card grid in real time (debounced)
- Synced with sidebar search when both are visible on web

### Composition Card (`Card` — grid, repeating)

| Element | Description |
|---|---|
| **Selection** | Checkbox top-left — toggles category in selection set; does not play or navigate |
| Thumbnail / icon | Thematic artwork — **click card body to preview** a sample from the category |
| Category name | Gold serif (e.g. *Meteorological*) |
| Track count | e.g. **12 tracks** |
| Layer summary | e.g. **12 tracks**; intensity level counts (**I – V**) dimmed when zero |

**Not on cards:** Detail (⋯) button, per-card **+** / **?**, inline edit control.

**Playing state:**
- Gold border + optional **● PLAYING** on thumbnail
- Click playing card again to stop
- One preview at a time

**Already in target (picker mode):** checkbox disabled + muted card when category is already on the active scene.

### Add Soundscape Card
- **Hidden in picker modal** — use Library page to create categories

### Footer — Add Selected
- Sticky full-width gold `Button` at bottom of modal
- Label: **Add Selected (N)** — **N** = checked count; disabled when **N = 0**
- Commits all checked categories to the active scene

---

## Launch Context

| Launched from | Back link | Click card body | Add Selected commits to |
|---|---|---|---|
| **ADD SOUNDSCAPE** (Active Scene) | ← Back to Active Scene | Preview sample | Adds checked categories to the scene; modal may stay open |

> **Picker list scope:** categories with **zero tracks** at all intensity levels are **excluded**.

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click card body / thumbnail | Previews a sample track from that category |
| Click playing card again | Stops preview |
| Toggle checkbox | Adds/removes category from selection |
| Click **Add Selected (N)** | Adds all checked categories to the scene; clears selection on success |
| Click **Buy Composition** | Navigate to storefront |
| Click **Free Compositions** | Initiates free demo download; new compositions appear in grid |
| Type in **Search** bar | Filters grid by composition name (debounced) |
| Use sidebar search/filters | Same filter state as main search bar |
| Click ← back | Closes modal (picker); committed adds remain |

Adding a category to the scene does **not** start playback on the Active Scene.

---

## States

### Populated grid
Composition cards with checkboxes; footer **Add Selected (0)** disabled.

### Selection active
One or more checkboxes checked; footer count updates; button enabled.

### Playback state
One card shows gold border / **● PLAYING**; selection and footer remain usable.

### Empty library
Centred illustration + **Buy Composition** and **Free Compositions**; footer hidden or disabled.

### Filtered empty
"No compositions match your filters" with clear-filters action.

### Loading
`Skeleton` cards until library data resolves.

---

## Navigation

| Destination | Trigger |
|---|---|
| Active Scene — Soundscapes tab | ← back |
| Library page (browse) | `audio-library-design.md` |
| Category Composer | Library page — card click or Add Soundscape |
| Storefront | Buy Composition |
| FX picker modal | Add Sound on soundboard |
| Credits | Sidebar → Credits |
| Trash | Sidebar → Trash |

---

## Related Flows

| Flow | Doc |
|---|---|
| Library page (browse) | `audio-library-design.md` |
| Active Scene soundscapes tab | `active-scene-soundscapes-design.md` |
| Category Composer | `soundscape-category-composer-design.md` |
| FX picker modal | `audio-library-fx-modal-design.md` |
