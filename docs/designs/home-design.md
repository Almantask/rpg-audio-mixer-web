# Home — Screen Design

**Design References:**
- [`docs/designs/Home.html`](../../docs/designs/Home.html)
- [`docs/designs/Home.png`](../../docs/designs/Home.png)

---

## Purpose

The Home screen is the app's entry point. It gives the GM a quick-access dashboard to their active campaign and highlights their most-used audio tracks without requiring any navigation.

---

## Layout

```
┌─────────────────────────────────────┐
│  [App logo / wordmark]        [⚙️]  │
├─────────────────────────────────────┤
│  ACTIVE CAMPAIGNS                   │
│  ┌───────────────────────────────┐  │
│  │  [Campaign cover art]         │  │
│  │  Campaign name                │  │
│  │              [ENTER DOMAIN →] │  │
│  └───────────────────────────────┘  │
│                                     │
│  [Left Col: 8]       [Right Col: 4] │
│  RESUME JOURNEY      TOP ATMOSPHERE │
│  ┌───────────────┐   ┌───────────┐  │
│  │ Last scene    │   │ Name      │  │
│  │ Desc          │   │ Plays [▶] │  │
│  │      [ENTER]  │   │ 0:00-4:12 │  │
│  └───────────────┘   └───────────┘  │
│                      LEGENDARY ACT. │
│                      ┌───────────┐  │
│                      │ Name      │  │
│                      │ Casts [▶] │  │
│                      │ 0:00-0:05 │  │
│                      └───────────┘  │
├─────────────────────────────────────┤
│  🏰 HOME  📖 CAMPAIGNS  🖼 SCENES  🎵 LIBRARY │
└─────────────────────────────────────┘
```

---

## Components

### Top Bar
- App logo / wordmark centred or left-aligned
- ⚙️ gear icon top-right → navigates to Credits screen

### Active Campaign Card
- Filled card with campaign cover art as background
- Campaign name in gold typography
- **ENTER DOMAIN** button → navigates to that campaign's Sessions list
- Always reflects the most recently played campaign (determined automatically — no manual "pin")

### Resume Journey Card
- Shows the last scene opened within the active campaign
- Scene name and optional description
- **ENTER** button → opens that scene's Active Scene screen and starts playback with a **~2–3 s fade-in**.
- **Natural Volume Progression**: The fade-in animation MUST follow a **Cubic ($x^3$) mapping** for a natural hearing progression.
- ~~Progress bar (65%)~~ — removed (design mistake)

### Top Atmosphere Card
- Displays the global all-time most-played loopable track
- Shows: track name, category name, total play count tag, an inline play button, and a progress bar with timestamps.

### Legendary Action Card
- Displays the global all-time most-played FX
- Shows: FX name, category name, total casts count tag, an inline play button, and a progress bar with timestamps.

### Bottom Navigation Bar
- Four tabs: 🏰 HOME · 📖 CAMPAIGNS · 🖼 SCENES · 🎵 LIBRARY
- HOME tab is active (highlighted)

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Tap **ENTER DOMAIN** | Navigate to active campaign's Sessions list |
| Tap **ENTER** (Resume Journey) | Open Active Scene screen + begin playback (2–3 s fade-in) |
| Tap ⚙️ | Navigate to Credits screen |
| Tap any bottom nav tab | Switch to that section |

---

## States

### Normal state
All four sections populated. Top Atmosphere and Legendary Action reflect all-time most played globally.

### No active campaign
- Active Campaign card shows an empty/placeholder card with a prompt to create or open a campaign
- Resume Journey card is hidden or shows a prompt to start a campaign

### No scenes played yet
- Resume Journey card shows a placeholder/empty state prompting the GM to open a scene

---

## Navigation

| Destination | Trigger |
|---|---|
| Campaign Sessions list | ENTER DOMAIN button |
| Active Scene (last scene, autoplay) | ENTER button in Resume Journey |
| Credits | ⚙️ gear icon |
| Campaigns tab | 📖 bottom nav |
| Scenes tab | 🖼 bottom nav |
| Library tab | 🎵 bottom nav |
