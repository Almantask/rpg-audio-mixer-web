# Scenes — Screen Design

**Design References:**
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)
- **Scene screen (after open):** [`active-scene-soundscapes-design.md`](active-scene-soundscapes-design.md), [`active-scene-soundboard-design.md`](active-scene-soundboard-design.md) — same layout for new and existing scenes
- **Session variant (filtered list):** [`session-scenes-design.md`](session-scenes-design.md) — same list UI, scoped to one session

---

## Purpose

Displays every scene ever created, regardless of which campaign or session it belongs to. Scenes are global and reusable — editing a scene here updates it everywhere it is used.

Each scene is identified by a **location name** (a place in the game world), not a mood or vibe label.

**Sidebar nav item:** Scenes (active on this screen)

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See `home-design.md` for full shell spec.

- **Top bar:** hamburger — "Arcanum Audio"
- **Sidebar:** Scenes active (gold bar + tint)
- **FE sidebar navigation only (no tab bar)**

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  Scenes                                                              │
│  Curate and manage your immersive environments.                      │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ [background image]                                             │  │
│  │ COMBAT   Dragon's Lair              4 SC · 12 FX   ✏️  ⧉  🗑   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ [background image]                                             │  │
│  │ TAVERN   The Rusty Tankard          3 SC · 24 FX   ✏️  ⧉  🗑   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ [background image]                                             │  │
│  │ FOREST   Whispering Woods           5 SC · 8 FX    ✏️  ⧉  🗑   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +  │
│  │              +  New Scene                                       │  │
│  └ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +  │
└──────────────────────────────────────────────────────────────────────┘
```

*(Each row fills with scene cover art behind the content row; dark gradient overlay for legibility.)*

---

## Components

### Page Header
- **Title:** "Scenes" — large gold serif
- **Subtitle:** "Curate and manage your immersive environments."

### New Scene (`Button` / dashed row)
- Full-width **New Scene** control at the **bottom** of the list (below all scene rows)
- Dashed border row with centred **+** icon and label **New Scene** — same pattern as **Create Campaign** on the Campaigns screen
- Always visible when the list is populated; sole CTA when empty (with optional illustration above)

**On click** — opens a `Dialog` (or dedicated form):

| Field | Required | Description |
|---|---|---|
| **Scene name** | Yes | Location name for the scene (e.g. *Dragon's Lair*) |
| **Description** | No | Optional text describing the place |
| **Background image** | No | Optional cover art via browser image upload |

- **Confirm** creates the scene and adds it to the list (empty soundscape/FX counts until configured on the **Scene screen**)
- **Cancel** dismisses without changes
- Tags are **not** collected here — add later via **Edit** if needed

### Scene Card (`Card` — repeating, **one per row**)

Full-width row with **background image**:

| Element | Description |
|---|---|
| **Background image** | Scene cover art fills the row; dark gradient overlay for text legibility |
| **Category tags** | Optional `Badge` chips for mood/context (e.g. COMBAT, TAVERN, FOREST) — not used as the scene title |
| **Scene title** | **Location name** in white/gold serif (e.g. *Dragon's Lair*) |
| **Stats** | **SC · FX** — e.g. **4 SC · 12 FX** (**SC** = soundscape categories in that scene) |
| **Edit** | ✏️ icon `Button` — opens scene edit (name, description, tags, cover image) |
| **Duplicate** | ⧉ (copy) icon `Button` — clones scene as "Copy of [Scene Name]" |
| **Trash** | 🗑 icon `Button` — soft-deletes scene → Trash |

- Action icons grouped on the trailing edge of the row; icon clicks do **not** navigate to the Scene screen
- Clicking the row body (outside action icons) navigates to the Scene screen
- Cards stack vertically; no horizontal grid

**Not on cards:** play button, ▶ control, **⋯** overflow menu, **Import Scene**, or list-level playback.

### Scene naming
- **Title = location** — a named place: room, building, region, landmark, dungeon level, etc.
- **Good:** Dragon's Lair, The Rusty Tankard, Whispering Woods, Temple of the Moon
- **Avoid as titles:** Combat Intense, Social Cozy, Ominous Ambience (use tags for mood instead)

### Empty State
- Centred illustration (parchment / scroll)
- **New Scene** as primary CTA

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click scene card body | Navigate to **Scene screen** (Soundscapes tab) — **no playback starts**; same screen for new and existing scenes |
| Click **✏️ Edit** | Open scene edit (metadata + background image) |
| Click **⧉ Duplicate** | Creates duplicate scene named "Copy of [Scene Name]" |
| Click **🗑 Trash** | Soft-deletes scene → Trash (confirmation if configured) |
| Click **New Scene** | Opens creation dialog: **scene name** (required), **description** (optional), **background image** (optional) |

Playback is controlled only from the **Scene screen** after opening a scene — not from this list.

### Scene Tags
- User adds tags from a predefined list (e.g. Tavern, Forest, Combat, City…) plus custom free-text tags
- Tags describe **context or mood**; the scene **name** remains a **location**
- Tags appear as `Badge` chips on the card for quick scanning

### Cover image
- Set during scene creation or via **Edit**
- User picks an image from the browser upload dialog
- Displayed as the row **background image** with gradient overlay

---

## States

### Populated list
One row per scene plus **New Scene** row at the bottom, sorted by most recently used or created (TBD — default: recent first).

### Empty state
Illustration + **New Scene** button.

### Creating a scene
Modal `Dialog` triggered by **New Scene**:

1. **Scene name** — text input, required (location name)
2. **Description** — optional multiline input
3. **Background image** — optional; **Choose image** opens browser file picker
4. **Create** / **Cancel** actions

On success: new row appears in the list; opening it (or navigating after create) lands on the **Scene screen** with empty Soundscapes and Soundboard — same layout as an existing scene.

### Empty list + create
Same dialog whether the list is empty or populated.

---

## Navigation

| Destination | Trigger |
|---|---|
| Scene screen | Click scene card body (new or existing scene) |
| Scene edit | ✏️ Edit icon |
| New scene creation | **New Scene** button |
| Credits | Sidebar → Credits |
| Trash | Sidebar → Trash |
| Home | Sidebar → Home |
