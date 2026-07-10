# Session Scenes — Screen Design

**Design References:**
- [`docs/designs/SessionScenes.html`](../../docs/designs/SessionScenes.html)
- [`docs/designs/SessionScenes.png`](../../docs/designs/SessionScenes.png)

---

## Purpose

Lists the scenes associated with a specific session within a campaign. Because scenes are global, this screen shows a curated subset — scenes the GM has linked to this session. Editing a scene here still updates it globally.

---

## Layout

```
┌─────────────────────────────────────┐
│  [App Logo]                    [⚙️]  │
├─────────────────────────────────────┤
│  ← Back to Sessions                 │
│  Session Name                       │
│  SESSION SCENES                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ [Cover Art Background]      │    │
│  │                        [▶]  │    │
│  │  (•) Last Active            │    │
│  │  Scene name                 │    │
│  │  [Tag] [Tag]                │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ [Cover Art Background]      │    │
│  │                        [▶]  │    │
│  │                             │    │
│  │  Scene name                 │    │
│  │  [Tag] [Tag]                │    │
│  └─────────────────────────────┘    │
│  …                                  │
│                                     │
│  [ + IMPORT SCENE ]                 │
├─────────────────────────────────────┤
│  🏰 HOME  📖 CAMPAIGNS  🖼 SCENES  🎵 LIBRARY │
└─────────────────────────────────────┘
```

---

## Components

### Top Bar / Header
- Breadcrumb link "← Back to Sessions"
- Session name as large screen title
- "Session Scenes" subtitle
- ⚙️ gear icon top-right

### Scene Card (repeating)
Same as the global Scenes List card, but without the clone button:
- Card features a background image (cover art) with a gradient overlay.
- **Last Active Indicator**: The most recently played scene in the session displays a pulsing "Last Active" label.
- Scene name in prominent typography
- Optional tags as chips
- **▶ play button** on the right — starts playback on open
- Card body tap — opens without starting playback

### Empty State
- Centred illustration
- **Import Scene** button (since scenes are global, creation is done from the SCENES tab; here the GM only links existing scenes)

### Import Scene Button
- Persistent **+ IMPORT SCENE** at the bottom of the list
- Opens a simplified scene picker: searchable list of all global scenes not yet linked to this session, with multi-select

### Bottom Navigation Bar
- 📖 CAMPAIGNS tab remains active

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Tap scene card (body) | Navigate to Active Scene — **no playback** |
| Tap **▶** on scene card | Navigate to Active Scene — **playback starts** (2–3 s fade-in) |
| Swipe right on card | Instantly unlinks scene from session (does not delete globally) |
| Tap **+ IMPORT SCENE** | Open global scene picker to link scenes to this session |
| Tap back arrow | Return to Campaign Sessions list |
| Tap ⚙️ | Navigate to Credits screen |

### Scene Linking
- Scenes are global; "importing" a scene into a session creates a link, not a copy
- Removing a scene from a session removes the link only — the scene still exists globally
- Changes to a linked scene affect the scene everywhere it appears

---

## States

### Populated
One card per linked scene.

### Empty state
Illustration + "Import Scene" button.

### Importing scenes
A selection overlay/sheet showing the global scene list with multi-select and a confirm button.

---

## Navigation

| Destination | Trigger |
|---|---|
| Active Scene (view only) | Tap scene card body |
| Active Scene (with playback) | Tap ▶ on card |
| Scene picker (import) | + IMPORT SCENE |
| Campaign Sessions list | Back arrow |
| Credits | ⚙️ gear icon |
