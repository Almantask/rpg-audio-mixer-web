# Scenes — Screen Design

**Design References:**
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)
- **Scene screen (after open):** [`active-scene-soundscapes-design.md`](active-scene-soundscapes-design.md), [`active-scene-soundboard-design.md`](active-scene-soundboard-design.md) — same layout for new and existing scenes
- **Session variant (filtered list):** [`session-scenes-design.md`](session-scenes-design.md) — same list UI, scoped to one session
- **Trash recovery:** [`trash-design.md`](trash-design.md) — soft-deleted scenes appear on the **Scenes** tab
- **Resolved decisions:** [`answered-questions-dont-refer/scenes-list.md`](answered-questions-dont-refer/scenes-list.md), [`answered-questions-dont-refer/platform-wide.md`](answered-questions-dont-refer/platform-wide.md) (PW-15, PW-16, PW-17, PW-29, PW-31)

---

## Purpose

Displays every scene ever created, regardless of which campaign or session it belongs to. Scenes are global and reusable — editing a scene here updates it everywhere it is used.

Each scene is identified by a **location name** (a place in the game world), not a mood or vibe label.

**Sidebar nav item:** Scenes (active on this screen)

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See [`platform-design.md`](platform-design.md) for shell spec.

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
│  🔍  Search scenes…                                                  │
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

### Search Bar (`Input`)
- Placed **above** the scene list, below the page header
- Magnifying-glass icon; placeholder: **Search scenes…**
- Filters rows by **scene name** (location name) — debounced
- Tag-chip filters are **deferred** post-MVP; tags may display on cards but are not filterable in MVP

### New Scene (`Button` / dashed row)
- Full-width **New Scene** control at the **bottom** of the list (below all scene rows)
- Dashed border row with centred **+** icon and label **New Scene** — same pattern as **Create Campaign** on the Campaigns screen
- Always visible when the list is populated; sole CTA when empty (with optional illustration above)

**On click** — opens a `Dialog`:

| Field | Required | Description |
|---|---|---|
| **Scene name** | Yes | Location name for the scene (e.g. *Dragon's Lair*) |
| **Description** | No | Optional text describing the place |
| **Background image** | No | Optional cover art via browser image upload |

- **Create** adds the scene, inserts a new row in the list, and **keeps the GM on the Scenes list** — no auto-navigation to Scene screen (**PW-31**, recommended Option A — PO pending); GM opens the new row manually when ready
- **Cancel** dismisses without changes
- Tags are **not** collected here — add later via **Edit** if needed

### Scene Card (`Card` — repeating, **one per row**)

Full-width row with **background image**:

| Element | Description |
|---|---|
| **Background image** | Scene cover art fills the row; dark gradient overlay for text legibility |
| **Category tags** | Optional `Badge` chips for mood/context (e.g. COMBAT, TAVERN, FOREST) — not used as the scene title |
| **Scene title** | **Location name** in white/gold serif (e.g. *Dragon's Lair*) |
| **Stats** | **SC · FX** on every populated row — e.g. **4 SC · 12 FX** (**SC** = soundscape categories in that scene) |
| **Edit** | ✏️ icon `Button` — opens scene edit (name, description, tags, cover image) |
| **Duplicate** | ⧉ (copy) icon `Button` — **one-tap** clone; no name prompt |
| **Trash** | 🗑 icon `Button` — soft-deletes scene → Trash **Scenes** tab |

- Action icons grouped on the trailing edge of the row; icon clicks do **not** navigate to the Scene screen
- Clicking the row body (outside action icons) navigates to the Scene screen
- Cards stack vertically; no horizontal grid
- **Virtual scroll** renders the list when the library exceeds ~50 scenes — no pagination UI

**Not on cards:** play button, ▶ control, **description** text, **⋯** overflow menu, **Import Scene**, or list-level playback.

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
| Click **⧉ Duplicate** | **One tap** — creates duplicate scene named **"Copy of [Scene Name]"** immediately; no dialog; GM renames via **Edit** if needed |
| Click **🗑 Trash** | Soft-deletes scene → Trash **Scenes** tab — **no confirmation** on routine delete; optional undo `Toast` |
| Swipe scene row (touch) | Same soft-delete as **🗑 Trash** — optional swipe affordance on touch / narrow viewports |
| Click **New Scene** | Opens creation `Dialog`: **scene name** (required), **description** (optional), **background image** (optional) |
| Type in **Search** bar | Filters list by scene name (debounced); empty result shows "No scenes match" inline |

Playback is controlled only from the **Scene screen** after opening a scene — not from this list.

### Delete — linked sessions (`AlertDialog`)
When the scene is linked to one or more sessions, show a **one-time warning** before soft-delete:

> "This scene is linked to N sessions. It will be unlinked from those sessions and moved to Trash."

- **Confirm** — unlinks from all sessions and soft-deletes to Trash **Scenes** tab
- **Cancel** — dismisses without changes
- Routine delete (no session links) skips this dialog

### Scene Tags
- User adds tags from a predefined list (e.g. Tavern, Forest, Combat, City…) plus custom free-text tags
- Tags describe **context or mood**; the scene **name** remains a **location**
- Tags appear as `Badge` chips on the card for quick scanning

### Description
- Collected in the **New Scene** dialog and editable via **✏️ Edit**
- Visible on the **Scene screen** and in edit flows only — **not** shown on list cards

### Cover image
- Set during scene creation or via **Edit**
- User picks an image from the browser upload dialog
- Displayed as the row **background image** with gradient overlay

---

## States

### Populated list
One row per scene plus **New Scene** row at the bottom, sorted **recently used** first (last played **or** last edited). Virtual scroll activates at 50+ scenes.

### Empty state
Illustration + **New Scene** button.

### Creating a scene
Modal `Dialog` triggered by **New Scene**:

1. **Scene name** — text input, required (location name)
2. **Description** — optional multiline input
3. **Background image** — optional; **Choose image** opens browser file picker
4. **Create** / **Cancel** actions

On success: new row appears in the list; GM **remains on Scenes list** (**PW-31**, recommended — PO pending). Opening the row lands on the empty Scene screen when the GM chooses.

### Search — no matches
Search field remains visible; list area shows inline "No scenes match" message; **New Scene** row still available at bottom.

### Empty list + create
Same dialog whether the list is empty or populated.

---

## Navigation

| Destination | Trigger |
|---|---|
| Scene screen | Click scene card body |
| Scene edit | ✏️ Edit icon |
| New scene creation | **New Scene** button |
| Credits | Sidebar → Credits |
| Trash | Sidebar → Trash (deleted scenes recoverable on **Scenes** tab) |
| Home | Sidebar → Home |

---

## Edge Cases & Constraints

| Case | Behaviour |
|---|---|
| Duplicate scene | Auto-named **"Copy of [Scene Name]"** — one tap, no dialog |
| Delete scene (no session links) | Immediate soft-delete → Trash **Scenes** tab; optional undo `Toast` |
| Delete scene (linked to sessions) | `AlertDialog` warns about unlink + Trash; then soft-delete |
| Large library (50+ scenes) | Virtual scroll — list remains responsive; no pagination controls |
| Search with no results | Inline empty message; clear search to restore full list |
| Tag filters | Deferred post-MVP — search-by-name only in MVP |
