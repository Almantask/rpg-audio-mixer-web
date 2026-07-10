# Ambience Presets (Atmospheric Scenes) — Screen Design

**Design References:**
- [`docs/designs/ScenesList.html`](../../docs/designs/ScenesList.html)
- [`docs/designs/ScenesList.png`](../../docs/designs/ScenesList.png)
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)

---

## Purpose

Displays every scene ever created, regardless of which campaign or session it belongs to. Scenes are global and reusable — editing a scene here updates it everywhere it is used.

**Sidebar nav item:** Ambience Presets (active on this screen)

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See `home-design.md` for full shell spec.

- **Top bar:** hamburger · "Arcanum Audio" · ⚙️
- **Sidebar:** Ambience Presets active (gold bar + tint)
- **FE sidebar navigation only (no tab bar)**

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  Atmospheric Scenes                          [ Import Scene ]        │
│  Curate and manage your immersive environments.                      │
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                 │
│  │ COMBAT INTENSE│ │ SOCIAL COZY  │ │ EXPLOR EERIE │                 │
│  │          [⋮] │ │          [⋮] │ │          [⋮] │                 │
│  │ Dragon's Lair│ │ Bustling     │ │ Whispering   │                 │
│  │ Deep rumbles…│ │ Tavern       │ │ Woods        │                 │
│  │ 4 SC  12 FX  │ │ 3 SC  24 FX  │ │ 5 SC  8 FX   │                 │
│  │ [▶]   14.2MB │ │ [▶]   8.5MB  │ │ [▶]   11.1MB │                 │
│  └──────────────┘ └──────────────┘ └──────────────┘                 │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Page Header
- **Title:** "Atmospheric Scenes" — large gold serif
- **Subtitle:** "Curate and manage your immersive environments."
- **Import Scene** — gold outline `Button` (top right) → opens scene creation / import flow

### Scene Card (`Card` — repeating, horizontal grid)
- Background cover art with dark gradient overlay
- **Category tags** — `Badge` chips (e.g. COMBAT, COZY, EXPLORATION, EERIE) in top-left
- **Three-dot menu** (`DropdownMenu`) — top-right: edit, clone, delete
- Scene title — white/gold serif
- Description snippet — truncated body text
- Stats row: soundscape count + effect count (e.g. "4 Soundscapes · 12 Effects")
- **Play button** — circular gold `Button`; filled when active/playing
- File size label — bottom-right (e.g. "14.2 MB")

### Empty State
- Centred illustration (parchment / scroll)
- **Import Scene** as primary CTA

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click scene card (body) | Navigate to Active Scene screen — **no playback starts** |
| Click **▶** on scene card | Navigate to Active Scene screen — **playback starts** (2–3 s fade-in) |
| Click **⋮** menu → Clone | Creates duplicate scene named "Copy of [Scene Name]" |
| Click **⋮** menu → Delete | Soft-deletes scene → Vault of Echoes |
| Click delete on card | Instantly moves scene to Vault (permanently deleted after 7 days) |
| Click **Import Scene** | Open new scene creation |
| Click ⚙️ | Navigate to Arcane Settings |

### Scene Tags
- User adds tags from a predefined list (e.g. Tavern, Forest, Combat, City…) plus custom free-text tags
- Tags appear as `Badge` chips on the card for quick scanning

---

## States

### Populated grid
All created scenes in a horizontal scroll/grid layout.

### Empty state
Illustration + Import Scene button.

### Creating a scene
`Dialog` or dedicated form: name input (required), description (optional), tags picker (optional).

---

## Navigation

| Destination | Trigger |
|---|---|
| Active Scene (view only) | Click scene card body |
| Active Scene (with playback) | Click ▶ on card |
| New scene creation | Import Scene button |
| Arcane Settings | ⚙️ gear or sidebar |
| Current Session | Sidebar |
