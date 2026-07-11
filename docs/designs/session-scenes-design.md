# Session Scenes — Screen Design

**Design References:**
- **Same list as global Scenes** — [`scenes-list-design.md`](scenes-list-design.md) (one row per scene, same card chrome and actions); this screen shows only scenes **linked to this session**
- **Scene screen (after open):** [`active-scene-soundscapes-design.md`](active-scene-soundscapes-design.md), [`active-scene-soundboard-design.md`](active-scene-soundboard-design.md) — **identical** to opening from the global Scenes list
- **New source of truth:** FE sidebar layout (Jul 2026 IA redesign)

---

## Purpose

The **Session Scenes** screen is the **same list UI as Scenes** (`scenes-list-design.md`), filtered to scenes the GM has linked to **this session**. Scenes remain global — editing a scene here updates it everywhere it is used.

**Only differences from global Scenes list:**

| Aspect | Global Scenes list | Session Scenes list |
|---|---|---|
| Scope | All scenes | Scenes linked to this session only |
| Page header | **Scenes** + subtitle | Session name + **Session Scenes** + campaign breadcrumb |
| Bottom CTA | **New Scene** (create globally) | **Import Scene** (link existing global scenes to session) |
| **Trash** icon | Soft-deletes scene globally → Trash | **Unlinks** scene from session (scene persists globally) |

Row click opens the **same Scene screen** as the global list — Soundscapes tab, no auto-playback.

**Sidebar nav item:** Home (active — session scenes are drill-down from Campaign)

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See `home-design.md` for full shell spec.

- **FE sidebar navigation only (no tab bar)**
- **Sidebar:** Home active (gold bar + tint)

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  CAMPAIGN > ECHOES OF THE VOID > SESSION 14                          │
│  The Howling Crags                                                   │
│  Session Scenes                                                      │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ [background image]                                             │  │
│  │ COMBAT   Dragon's Lair              4 SC · 12 FX   ✏️  ⧉  🗑   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ [background image]                                             │  │
│  │ FOREST   Frostwind Pass             3 SC · 8 FX    ✏️  ⧉  🗑   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +  │
│  │              +  Import Scene                                    │  │
│  └ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +  │
└──────────────────────────────────────────────────────────────────────┘
```

*(Same row pattern as global Scenes list — background image, gradient overlay, one scene per row.)*

---

## Components

### Breadcrumb
- **CAMPAIGN > [CAMPAIGN NAME] > SESSION N** — uppercase sans-serif trail
- Tapping campaign or session segment navigates up the hierarchy

### Page Header
- **Session name** — large gold serif (e.g. "The Howling Crags")
- **Session Scenes** — subtitle below session name

### Scene Card (`Card` — repeating, **one per row**)

**Identical to** `scenes-list-design.md` — Scene Card:

| Element | Description |
|---|---|
| **Background image** | Scene cover art fills the row; dark gradient overlay |
| **Category tags** | Optional `Badge` chips (COMBAT, FOREST, etc.) |
| **Scene title** | Location name in white/gold serif |
| **Stats** | **SC · FX** — e.g. **4 SC · 12 FX** |
| **Edit** | ✏️ — scene metadata (global) |
| **Duplicate** | ⧉ — clones as "Copy of [Scene Name]" (global) |
| **Trash** | 🗑 — **unlinks from this session** (does not delete globally) |

- Action icon clicks do **not** navigate to the Scene screen
- Row body click navigates to the Scene screen

**Not on cards:** play button, ▶ control, **⋯** menu, or list-level playback.

### Import Scene (`Button` / dashed row)
- Full-width **Import Scene** at the **bottom** of the list — same dashed-row pattern as **New Scene** on the global list
- Opens a searchable picker of global scenes **not yet linked** to this session
- Multi-select + confirm links selected scenes to the session list

### Empty State
- Centred illustration (parchment / scroll)
- **Import Scene** as primary CTA
- Optional secondary link: Sidebar → **Scenes** → **New Scene** to create a scene globally, then return and **Import Scene**

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click scene card body | Navigate to **Scene screen** (Soundscapes tab) — **no playback starts**; same screen as global Scenes list |
| Click **✏️ Edit** | Open scene edit (metadata + background image) — updates scene globally |
| Click **⧉ Duplicate** | Creates duplicate scene named "Copy of [Scene Name]" |
| Click **🗑 Trash** | Unlinks scene from this session (confirmation if configured); scene remains in global Scenes list |
| Click **Import Scene** | Open global scene picker to link scenes to session |
| Click breadcrumb | Navigate up campaign hierarchy |

Playback is controlled only from the **Scene screen** after opening a scene — not from this list.

### Scene linking
- **Import Scene** creates a session link, not a copy
- Unlinking (🗑) does not delete the scene globally
- Changes to a linked scene affect the scene everywhere it appears

---

## States

### Populated list
One row per linked scene plus **Import Scene** row at the bottom.

### Empty state
Illustration + **Import Scene** button.

### Importing scenes
Picker overlay with search, multi-select, and confirm.

---

## Navigation

| Destination | Trigger |
|---|---|
| Campaign Sessions | Breadcrumb — campaign or session segment |
| Scene screen | Click scene card body (same as global Scenes list) |
| Scene edit | ✏️ Edit icon |
| Scene picker (import) | **Import Scene** |
| Scenes (global list) | Sidebar → Scenes |
| Credits | Sidebar → Credits |
| Trash | Sidebar → Trash |
