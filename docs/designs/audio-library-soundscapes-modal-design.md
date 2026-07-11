# Soundscapes — Category Picker Modal Design

**Design References:**
- **Browse mode (Library page):** [`audio-library-design.md`](audio-library-design.md) — Soundscapes tab
- **Parallel pattern:** [`audio-library-fx-modal-design.md`](audio-library-fx-modal-design.md)
- **Launched from scene:** [`active-scene-soundscapes-design.md`](active-scene-soundscapes-design.md) — **ADD SOUNDSCAPE**
- **Composer track picker (distinct):** [`soundscape-category-composer-design.md`](soundscape-category-composer-design.md) — **Add FX** title (PW-43)

---

## Purpose

The **Add Soundscape** category picker modal lets the GM select soundscape categories from the library and add them to the **active scene** in one commit action. It is launched from Active Scene — **ADD SOUNDSCAPE**, not from the sidebar.

For browsing, buying, composing, and editing categories, use the **Library page** — [`audio-library-design.md`](audio-library-design.md).

This modal provides filters, buy/free actions, card grid, preview-on-click, **multi-select checkboxes**, and a footer **Add Selected** button.

**No Detail button.** Per-card edit / **+** is replaced by selection checkboxes.

**No Import in category picker.** Import is available on the Library page and in the Composer **track picker** only (PW-24, F-SCM-02).

**Not used for:** Sidebar → Library (that route is the full Library page).

> **Naming:** UI title **Add Soundscape** (this modal — category picker) vs **Add FX** (Composer track picker, PW-43). Do not use "Track Picker" for category selection.

---

## Presentation

| Viewport | Container | Filters |
|---|---|---|
| **Mobile** | Full-screen `Sheet`; ← back when launched from Active Scene | Collapsible filter panel in **sheet header** (PW-27) |
| **Web (sidebar layout)** | Large content-area `Sheet` / `Dialog`; app sidebar remains visible | Filter panel in **sidebar footer** (PW-27) |

---

## Layout — Modal

```
┌──────────┬──────────────────────────────────────────────────────────────┐
│ Sidebar  │  ← Back to Active Scene          (picker launch only)      │
│          │  Add Soundscape                                              │
│  Search  │  Select soundscapes for this scene.                         │
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

## Sidebar Filter Panel (web)

Anchored in the **sidebar footer**:

| Control | Component | Description |
|---|---|---|
| Search | `Input` | Placeholder: "Search compositions…" with magnifying glass |
| Category Type | `Select` | Dropdown — e.g. "All Types" |
| Sort Order | `Select` | Dropdown — e.g. "Recently Added" |

Filters apply to the modal grid in real time (debounced).

On **mobile**, the same controls appear in a collapsible panel in the **sheet header** (PW-27).

---

## Components

### Modal Header
- **Back control** — ← **Back to Active Scene** (always shown in picker)
- **Title:** **Add Soundscape** — large gold serif (SCM-02)
- **Subtitle:** **Select soundscapes for this scene.** (SCM-08)

### Action Buttons (below subtitle)

| Button | Style | Action |
|---|---|---|
| **Buy Composition** | gold + cart | Storefront — purchase pre-made soundscape compositions |
| **Free Compositions** | outline + external-link | Download free demo composition pack |

Buy and Free CTAs are **included in MVP** inside the picker modal (SCM-03) so the GM can acquire content without leaving Active Scene.

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
| Track count | e.g. **12 tracks** (SCM-04, AL-02) |
| Layer count | e.g. **3 layers** (SCM-04, AL-02) |

**Not on cards:** Detail (⋯) button, per-card **+** / **?**, inline edit control, per-intensity breakdown.

**Playing state:**
- Gold border + optional **● PLAYING** on thumbnail
- Click playing card again to stop
- One preview at a time

**Already on scene (F-SCM-03):** categories already on the active scene are **omitted from the picker grid** — not shown as disabled rows. Same rule as the FX picker (F-FXM-01).

### Add Soundscape Card
- **Hidden in picker modal** — use Library page to create categories

### Footer — Add Selected
- Sticky full-width gold `Button` at bottom of modal
- Label: **Add Selected (N)** — **N** = checked count; disabled when **N = 0**
- Commits all checked categories to the active scene in **selection order** (SCM-01, SCM-07)

---

## Launch Context

| Launched from | Back link | Click card body | Add Selected commits to |
|---|---|---|---|
| **ADD SOUNDSCAPE** (Active Scene) | ← Back to Active Scene | Preview sample | Adds checked categories to the scene; **modal stays open** for additional picks (PW-23, PW-26) |

> **Picker list scope:** categories with **zero tracks** at all intensity levels are **excluded**. Categories **already on the scene** are **excluded** (F-SCM-03).

### Session Lock (PW-28, F-SCM-04)

When **Session Lock** is active, **ADD SOUNDSCAPE** is **disabled or hidden** on Active Scene — the picker **cannot open**. Mirrors Add Sound on the soundboard (F-FXM-02).

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click card body / thumbnail | Previews a sample track from that category |
| Click playing card again | Stops preview |
| Toggle checkbox | Adds/removes category from selection |
| Click **Add Selected (N)** | Adds all checked categories to the scene in **checkbox order**, appended after existing categories (SCM-07); clears selection; **modal stays open** (PW-26); **Sonner toast** — "N categories added" (PW-25) |
| Click **Buy Composition** | Navigate to storefront |
| Click **Free Compositions** | Initiates free demo download; new compositions appear in grid |
| Type in **Search** bar | Filters grid by composition name (debounced) |
| Use sidebar / mobile header filters | Same filter state as main search bar |
| Click ← back | **Stops any active preview** (SCM-06); closes modal; committed adds remain |

### Post-add scene defaults (SCM-05, F-SCM-01)

Each category added via **Add Selected** lands on Active Scene with:

| Property | Default |
|---|---|
| Playback | **Idle** — does **not** auto-play (F-SCM-01) |
| Volume | **100%** |
| Intensity | **II** |
| List position | **Appended** after existing categories, in **selection order** (SCM-07) |

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

### Session Lock (launcher)
**ADD SOUNDSCAPE** disabled/hidden on Active Scene; picker unreachable (F-SCM-04).

---

## Navigation

| Destination | Trigger |
|---|---|
| Active Scene — Soundscapes tab | ← back |
| Library page (browse / import) | `audio-library-design.md` |
| Category Composer | Library page — card click or Add Soundscape |
| Composer track picker (**Add FX**) | `soundscape-category-composer-design.md` |
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
