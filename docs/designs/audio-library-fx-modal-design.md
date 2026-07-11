# Sound Effects — Screen Design

**Design References:**
- [`docs/designs/AudioLibrary-FX.html`](../../docs/designs/AudioLibrary-FX.html)
- [`docs/designs/AudioLibrary-FX.png`](../../docs/designs/AudioLibrary-FX.png)
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)

---

## Purpose

The Sound Effects view is the global catalogue of all one-shot FX tracks within the Sound Library. The GM can import new audio files, search and filter the collection, preview tracks via the persistent bottom player, and add tracks to scenes or playlists.

**Sidebar nav item:** Sound Library (active — FX is a sub-view of Sound Library)

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See `home-design.md` for full shell spec.

### Sidebar Filter Panel (bottom of sidebar)
Filters are anchored in the sidebar footer area, not the main content header:

| Control | Component | Description |
|---|---|---|
| Search | `Input` | Placeholder: "Search Incantations…" with magnifying glass |
| FX Types | `Select` | Dropdown — e.g. "All Types" |
| Base Intensity | `Slider` | Horizontal slider with speaker icons at each end |
| Sort Order | `Select` | Dropdown — e.g. "Recently Added" |

- **FE sidebar navigation only (no tab bar)**

---

## Layout — Main Content + Player

```
┌──────────────────────────────────────────────────────────────────────┐
│  Sound Effects                                                       │
│  Browse, import, and manage your arcane audio assets.                │
│  [ Import FX ]  [ Buy More ]  [ Free Tracks ]                        │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │ [thumb]  │ │ [thumb]  │ │ ●PLAYING │ │ [thumb]  │                │
│  │ Thunder  │ │ Sword    │ │ Rune Act │ │ Goblin   │                │
│  │ 0:04     │ │ 0:02     │ │ 0:03     │ │ 0:01     │                │
│  │ IMPACT   │ │ COMBAT   │ │ UI MAGIC │ │ CREATURE │                │
│  │ ═◉══ [+] │ │ ═◉══ [+] │ │ ═◉══ [✓] │ │ ═◉══ [+] │                │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                │
├──────────────────────────────────────────────────────────────────────┤
│  [thumb] Rune Activation  UI·Magic  │◀  ⏸  ▶│ ═══◉════ 0:03/8:08  🔊│
└──────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Page Header
- **Title:** "Sound Effects" — large gold serif
- **Subtitle:** "Browse, import, and manage your arcane audio assets."

### Action Buttons (top right)
- **Import FX** — outline `Button` with upload icon → browser file picker
- **Buy More** — gold `Button` with cart icon → storefront
- **Free Tracks** — outline `Button` with external-link icon → demo download

### FX Card (`Card` — grid, repeating)

| Element | Description |
|---|---|
| Thumbnail | Square artwork or icon |
| Title + duration | e.g. "Thunder Strike" · 0:04 |
| Tags | `Badge` chips (IMPACT, WEATHER, UI, MAGIC, etc.) |
| Volume `Slider` | Per-track default output. **Cubic ($x^3$) mapping** |
| Add / check button | **+** to add to playlist/scene; **✓** when already added |

**PLAYING overlay (active card):**
- Gold border highlight
- Dimmed thumbnail with **● PLAYING** label
- Large pause icon in gold circle centred on thumbnail
- Title rendered in gold; footer shows checkmark instead of plus

### Bottom Persistent Player Bar
Fixed horizontal bar spanning main content width:

| Region | Elements |
|---|---|
| Left | Thumbnail, track title, category (e.g. "UI • Magic") |
| Centre | Previous, **Play/Pause** (large gold circle), Next; `Progress` bar with elapsed/total |
| Right | Add-to-playlist icon, volume icon + `Slider` |

- Master volume uses **Cubic ($x^3$) mapping**
- Player persists while browsing the grid

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click card thumbnail / play | Loads track into bottom player and plays |
| Click **+** on card | Adds track to playlist or active scene context |
| Click **✓** on card | No duplicate add |
| Click **Import FX** | Opens browser file picker |
| Click **Free Tracks** | Initiates download of 100 demo sound effects |
| Adjust card volume slider | Sets base volume for that track |
| Use sidebar search/filters | Filters grid in real time (debounced search) |
| Player prev/next | Skips to adjacent track in filtered list |
| Click ⚙️ | Navigate to Arcane Settings |

---

## States

### Populated grid
Card grid with thumbnails, tags, and controls.

### Playback state
Active card shows PLAYING overlay; bottom player reflects current track.

### Empty library
Centred illustration + Import FX and Free Tracks CTAs.

### Filtered empty
"No incantations match your filters" message with clear-filters action.

---

## Navigation

| Destination | Trigger |
|---|---|
| Sound Library (compositions) | Sidebar or library sub-nav |
| Browser file picker | Import FX |
| Storefront | Buy More |
| Arcane Settings | ⚙️ gear or sidebar |
