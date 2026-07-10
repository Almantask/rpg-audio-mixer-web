# Session Scenes — Screen Design

**Design References:**
- [`docs/designs/SessionScenes.html`](../../docs/designs/SessionScenes.html)
- [`docs/designs/SessionScenes.png`](../../docs/designs/SessionScenes.png)
- **New source of truth:** FE sidebar layout (inferred from Jul 2026 IA redesign)

---

## Purpose

Lists the scenes associated with a specific session within a campaign. Because scenes are global, this screen shows a curated subset — scenes the GM has linked to this session. Editing a scene here still updates it globally.

**Sidebar nav item:** Current Session (active — session scenes are session-context navigation)

---

## App Shell

Shared FE layout with left sidebar ("The Tome"). See `home-design.md` for full shell spec.

- **FE sidebar navigation only (no tab bar)**
- Scene card visual language aligns with Ambience Presets (`scenes-list-design.md`) but scoped to session-linked scenes

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  CAMPAIGN > [CAMPAIGN NAME] > SESSION 14                             │
│  The Howling Crags                                                   │
│  Session Scenes                              [ Import Scene ]        │
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                 │
│  │ COMBAT       │ │ EXPLORATION  │ │ SOCIAL       │                 │
│  │ (•) Last     │ │          [⋮] │ │          [⋮] │                 │
│  │ Active       │ │ Frostwind    │ │ Campfire     │                 │
│  │ Dragon's Lair│ │ Pass         │ │ Rest         │                 │
│  │ 4 SC  12 FX  │ │ 3 SC  8 FX   │ │ 2 SC  6 FX   │                 │
│  │ [▶]          │ │ [▶]          │ │ [▶]          │                 │
│  └──────────────┘ └──────────────┘ └──────────────┘                 │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Breadcrumb
- **CAMPAIGN > [CAMPAIGN NAME] > SESSION N** — uppercase sans-serif trail
- Links back to Campaign Sessions

### Page Header
- Session name — large gold serif (e.g. "The Howling Crags")
- **Session Scenes** subtitle
- **Import Scene** — gold outline `Button` (top right)

### Scene Card (`Card` — repeating)
Same visual language as Ambience Presets cards, minus clone action:
- Background cover art with gradient overlay
- Category `Badge` tags
- **Last Active** pulsing indicator on most recently played scene in this session
- Scene title, description snippet
- Stats: soundscape count · effect count
- **▶ Play button** — starts playback on open (2–3 s fade-in, cubic volume mapping)
- **⋮ menu** — unlink from session (does not delete globally)
- Card body click — opens Active Scene without starting playback

### Empty State
- Centred illustration
- **Import Scene** as primary CTA (scenes are global; creation happens via Ambience Presets)

### Import Scene Flow
- Searchable picker overlay showing all global scenes not yet linked to this session
- Multi-select + confirm

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click scene card (body) | Navigate to Active Scene — **no playback** |
| Click **▶** on scene card | Navigate to Active Scene — **playback starts** (2–3 s fade-in) |
| Click **⋮** → Unlink | Removes scene link from session (scene persists globally) |
| Click delete on card | Instantly unlinks scene from session |
| Click **Import Scene** | Open global scene picker to link scenes |
| Click breadcrumb | Navigate up campaign hierarchy |
| Click ⚙️ | Navigate to Arcane Settings |

### Scene Linking
- Scenes are global; "importing" creates a link, not a copy
- Removing a link does not delete the scene globally
- Changes to a linked scene affect the scene everywhere it appears

---

## States

### Populated
One card per linked scene in horizontal grid.

### Empty state
Illustration + Import Scene button.

### Importing scenes
Selection overlay with multi-select and confirm button.

---

## Navigation

| Destination | Trigger |
|---|---|
| Campaign Sessions | Breadcrumb |
| Active Scene (view only) | Click scene card body |
| Active Scene (with playback) | Click ▶ on card |
| Scene picker (import) | Import Scene |
| Ambience Presets (global scenes) | Sidebar |
| Arcane Settings | ⚙️ gear or sidebar |
