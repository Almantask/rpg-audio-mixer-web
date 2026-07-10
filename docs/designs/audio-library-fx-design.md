# Audio Library — Sound Effects Tab — Screen Design

**Design References:**
- [`docs/designs/AudioLibrary-FX.html`](../../docs/designs/AudioLibrary-FX.html)
- [`docs/designs/AudioLibrary-FX.png`](../../docs/designs/AudioLibrary-FX.png)

---

## Purpose

The Sound Effects tab of the Audio Library is the global catalogue of all one-shot FX tracks. The GM can import new audio files from the device, search and filter through their collection, and preview tracks via the global playback controller. 

This screen is reached via the **🎵 LIBRARY** bottom nav tab (Sound Effects tab).

---

## Layout

```
┌─────────────────────────────────────┐
│  ✨ ARCANUM AUDIO              [⚙️]  │
├─────────────────────────────────────┤
│  Sound Effects                      │
│  ACTION & ENVIRONMENTAL FX          │
├─────────────────────────────────────┤
│  [ Import FX ] [ Buy More ] [ Free ]│
├─────────────────────────────────────┤
│  [Soundscapes]  |  [Sound Effects]  │  
│  [ Search... 🔍 ] [ Filter ] [ Vol ] │
│  [ Sort By     ]                    │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ [🖼 + ▶] FX Name        00:03 │  │
│  │           Tags         [---O] │  │
│  │                        [ ⋮ ]  │  │
│  └───────────────────────────────┘  │
│  …                                  │
├─────────────────────────────────────┤
│  ┌─ Playback Controller ───────┐    │
│  │ [EQ] Title   [|◀] [▶] [▶|] [Vol] │    
│  └─────────────────────────────┘    │
│  🏰 HOME 📖 SESSIONS 🖼 SCENES 🎵 LIB│
└─────────────────────────────────────┘
```

---

## Components

### Top App Bar
- App identity text ("ARCANUM AUDIO") with styling
- ⚙️ Settings icon top-right

### Header
- Title "Sound Effects"
- Subtitle "Action & Environmental FX"

### Action Buttons
- **Import FX:** Opens device file picker to upload audio.

### Tabs & Filters
- **Tabs:** Soundscapes | **Sound Effects** (active).
- **Search Bar:** Text input for filtering tracks by name.
- **Filters Dropdowns:** 
  - Type (e.g. Combat, Magic, Nature, Creature)
  - Volume (e.g. Subtle, Loud, Piercing)
- **Sort By:** Dropdown for sorting tracks.

### Track List Item (Card)
| Element | Description |
|---|---|
| **Thumbnail & Play** | Square image thumbnail. Hovering reveals a **▶** play button overlay to preview the track. |
| **FX Name & Tags** | Title and category chips (e.g. Combat, Impact). |
| **Duration** | Track length in mm:ss format. |
| **Volume Slider** | Individual slider for the track's default playback output. Uses **Cubic ($x^3$) mapping** for natural progression. |
| **⋮ Menu** | "More options" dropdown to edit or remove the track. |

### Global Playback Controller
- Consistently anchored floating glass card at the bottom of the screen.
- **State indicators:** Shows "Last Effect Played" and its title.
- **Controls:** Skip previous, Play/Pause, Skip next.
- **Master Volume:** A slider for global sound effects volume. Uses **Cubic ($x^3$) mapping**.

### Bottom Navigation Bar
- Active tab is 🎵 Library. Note the Sessions tab uses the `auto_stories` icon.

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Tap **▶** on track image | Loads track into Global Playback Controller and plays it |
| Tap **Free Tracks** | Initiates download of 100 demo sound effects |
| Tap **⋮** on track | Opens contextual menu (edit, delete) |
| Tap Play/Pause in controller | Toggles playback of the loaded track |
| Adjust Volume in track row | Sets base volume level for that specific track |
| Tap "Soundscapes" tab | Switch to Soundscapes tab |

---

## States

### Populated list
Grid of robust track cards with images and controls.

### Playback State
When playing, the Playback Controller reflects the active track and allows skipping or pausing.

---

## Navigation

| Destination | Trigger |
|---|---|
| Device file picker (OS overlay) | Import FX |
| Audio Library — Soundscapes tab | Tap "Soundscapes" in tab strip |
| Settings Overlay | ⚙️ gear icon |
ary — Soundscapes tab | Tap "Soundscapes" in tab strip |
| Settings Overlay | ⚙️ gear icon |
Tap "Soundscapes" in tab strip |
| Settings Overlay | ⚙️ gear icon |
