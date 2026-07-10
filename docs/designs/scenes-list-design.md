# Scenes List (Global) — Screen Design

**Design References:**
- [`docs/designs/ScenesList.html`](../../docs/designs/ScenesList.html)
- [`docs/designs/ScenesList.png`](../../docs/designs/ScenesList.png)

---

## Purpose

Displays every scene ever created, regardless of which campaign or session it belongs to. Scenes are global and reusable — editing a scene here updates it everywhere it is used.

This screen is reached via the **🖼 SCENES** bottom navigation tab.

---

## Layout

```
┌─────────────────────────────────────┐
│  Scenes                        [⚙️]  │
├─────────────────────────────────────┤
│  Global Scenes                      │
│  ALL REALMS & ENCOUNTERS            │
│  [🔍 Filter scenes by name or tag...]│
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ [Cover Art Background]      │    │
│  │                        [▶]  │    │
│  │                        [Clone]│  │
│  │  Scene name                 │    │
│  │  [Tag] [Tag]                │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ [Cover Art Background]      │    │
│  │                        [▶]  │    │
│  │                        [Clone]│  │
│  │  Scene name                 │    │
│  │  [Tag] [Tag]                │    │
│  └─────────────────────────────┘    │
│  …                                  │
│                                     │
│  [ + ADD NEW SCENE ]                │
├─────────────────────────────────────┤
│  🏰 HOME  📖 CAMPAIGNS  🖼 SCENES  🎵 LIBRARY │
└─────────────────────────────────────┘
```

---

## Components

### Top Bar
- Screen title "Scenes"
- ⚙️ gear icon top-right

### Scene Card (repeating)
- Scene name in gold typography
- Optional tags displayed as chips below the name
- Number of soundscape categories
- **▶ Play button**: Navigates to the Active Scene screen and **starts playback** (2–3 s fade-in).
- **Clone button** (content_copy): Creates an exact duplicate of the scene with the name "Copy of [Scene Name]".
- The card itself (body) is tappable separately from action buttons.

### Empty State
- Centred illustration (parchment / scroll)
- **Add New Scene** button

### Add New Scene Button
- Persistent **+ ADD NEW SCENE** at the bottom of the list (or FAB)
- Opens scene creation flow: name, optional description, optional tags

### Bottom Navigation Bar
- 🖼 SCENES tab is active

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Tap scene card (body) | Navigate to Active Scene screen — **no playback starts** |
| Tap **▶** on scene card | Navigate to Active Scene screen — **playback starts** (2–3 s fade-in) |
| Tap **Clone** icon | Creates a duplicate scene in the list. |
| Swipe right on card | Instantly moves scene to temporarily unavailable (permanently deleted after 7 days) |
| Tap **+ ADD NEW SCENE** | Open new scene creation |
| Tap ⚙️ | Navigate to Credits screen |

### Scene Tags
- User adds tags from a predefined list (e.g. Tavern, Forest, Combat, City…) plus custom free-text tags
- Tags appear as small chips on the card for quick scanning

---

## States

### Populated list
All created scenes. No grouping, no filters.

### Empty state
Illustration + "Add New Scene" button.

### Creating a scene
Form: name input (required), description (optional), tags picker (optional — fixed list + custom).

---

## Navigation

| Destination | Trigger |
|---|---|
| Active Scene (view only) | Tap scene card body |
| Active Scene (with playback) | Tap ▶ on card |
| New scene creation | + ADD NEW SCENE |
| Credits | ⚙️ gear icon |
| Home tab | 🏰 bottom nav |
| Campaigns tab | 📖 bottom nav |
| Library tab | 🎵 bottom nav |
