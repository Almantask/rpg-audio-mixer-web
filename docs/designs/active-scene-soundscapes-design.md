# Active Scene — Atmospheres Tab — Screen Design

**Design References:**
- [`docs/designs/ActiveScene-Soundscapes.html`](../../docs/designs/ActiveScene-Soundscapes.html)
- [`docs/designs/ActiveScene-Soundscapes.png`](../../docs/designs/ActiveScene-Soundscapes.png)
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)

---

## Purpose

The primary scene-control screen during a game session. The Atmospheres tab (formerly "Soundscapes") lets the GM manage looping atmospheric categories: starting/stopping playback, adjusting volume, picking random tracks, and switching intensity levels.

**Sidebar nav item:** Current Session (active)

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See `home-design.md` for full shell spec.

- **FE sidebar navigation only (no tab bar)**

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  CAMPAIGN > ECHOES OF THE VOID                                       │
│  The Shattered Keep                                                  │
│                                                                      │
│  [ Atmospheres ]  BGM & Score   One-Shots & SFX    ← Tabs           │
│                                                                      │
│  ┌─ Master Atmosphere Volume ─────────────────────────────────────┐  │
│  │ 🔊  ════════════════════◉═══════════════  85%  [🔇] [Play Scene]│
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Active Soundscapes                                                  │
│  ┌─ Howling Tempest (playing) ────────────────────────────────────┐  │
│  │ ☁ Weather Pattern                          [✏️] [⏸]            │  │
│  │ Gale Force Winds    ═══════════════◉════  90%                   │  │
│  │ Heavy Rain on Stone ═════════◉══════════  65%                   │  │
│  │ Intensity (Dynamic) High  ████░░  Loop ∞   3 Layers Active      │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌─ Ruined Grand Hall (paused) ───────────────────────────────────┐  │
│  │ 🏰 Interior Acoustics                      [✏️] [▶]            │  │
│  │ Cavernous Reverb    ════◉═══════════════  40%                   │  │
│  │ Distant Torches     ══◉════════════════  20%                   │  │
│  │ Intensity (Dynamic) Low   █░░░░░  Loop ∞                        │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Breadcrumb
- Uppercase sans-serif trail: **CAMPAIGN > [CAMPAIGN NAME]**
- Links back to campaign context

### Scene Title
- Large gold serif (e.g. "The Shattered Keep")

### View Tabs (`Tabs`)
- **Atmospheres** *(this screen)* | **BGM & Score** | **One-Shots & SFX**
- Active tab: gold underline + gold text

### Session Lock Toggle (🔒)
- Disables destructive gestures (reordering, deleting) and scene switching during live play

### Session Control Bar
- **Global Master Stop (Stop All):** prominent red-outline button — immediately fades out all soundscapes and stops all sound effects
- **Master Intensity Switcher (I, II, III):** global selector updating intensity for *all* categories simultaneously (Calm, Tense, Climactic labels)

### Scene Notes
- Expandable markdown-capable text area for DM cues and reminders

### Master Atmosphere Volume (`Card` + `Slider`)
- Soundwave/speaker icon + label
- Full-width `Slider` with percentage readout
- **Mute button** — speaker-with-slash icon
- **Play Scene** — gold `Button` → starts all configured atmospheres
- Controls overall output volume for all soundscape categories
- Final volume per category = **Master × MIX** (multiplicative)
- **Natural Volume Progression:** **Cubic ($x^3$) mapping**
- **Arcanum Motion:** sliders use specific motion tokens
- Snaps instantly to saved value on scene load — no animation

### Active Soundscape Card (`Card` — repeating)
Each category card contains:

| Element | Description |
|---|---|
| Icon + title + subtitle | e.g. ☁ "Howling Tempest" / "Weather Pattern" |
| Edit / pause icons | Top-right actions |
| Per-layer sliders | Individual `Slider` rows per active layer (e.g. "Gale Force Winds" 90%) |
| Intensity (Dynamic) | 4-segment `Progress` bar with label (Low / High) |
| Loop toggle | ∞ icon + "Loop" label — gold when active |
| Layers Active count | e.g. "3 Layers Active" |
| 🎲 d20 icon button | Picks random track from category and plays immediately |
| ▶ / ⏸ button | Play or pause current track |
| MIX slider | Per-category relative volume; multiplicative with Master. **Cubic ($x^3$) mapping** |

**Playing state:** card shows coloured glow / gold highlight border when audio is active. Paused cards are greyed out.

**MIX slider snap:** snaps instantly to saved value on scene load.

### Drag-to-Reorder
Category cards can be dragged via handle to reorder. **Disabled when Session Lock is active.**

### Add New Soundscape
- Dashed **Invoke New Layer** / add tile at list bottom
- Opens Soundscape Selection view

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Drag Master slider | Adjusts overall output volume for all categories in real time |
| Click **Play Scene** | Starts playback for all configured atmospheres |
| Click 🎲 d20 | Picks a **random** track from that category's current intensity pool; starts playing |
| Click ▶ | Plays a **random** track from intensity pool (or resumes paused track) |
| Click ⏸ | Pauses current track; card loses playing state |
| Drag layer / MIX slider | Adjusts that layer's or category's relative volume in real time |
| Click I / II / III (Global) | Updates all categories to selected intensity; **crossfade if already playing** |
| Click intensity segments (card) | Changes intensity for that category |
| Toggle Loop (∞) | Enables/disables looping for that soundscape |
| Drag card by handle | Reorders categories. **Disabled if Session Lock is ON.** |
| Click delete on card | Removes category from scene. **Disabled if Session Lock is ON.** |
| Click add / invoke | Opens Soundscape Selection overlay |

### Volume Formula
`Actual output = Master × MIX` for each category independently.

### Intensity Levels
- **I** = calm/ambient — least tense
- **II** = moderate tension
- **III** = climactic/dramatic — most tense
- GM switches manually; no automatic trigger
- **Levels with no tracks are greyed out and non-selectable**
- **Seamless Intensity Transitions:** **Web Audio double-buffer crossfade engine** with **2-second crossfade**
- **Equal-Power Crossfading:** $sin/cos$ curves for constant perceived loudness

### Random Track Selection
- ▶ or 🎲 picks at random from current intensity pool
- d20 always picks fresh random track (even if one is playing)
- ▶ resumes paused track if one exists; otherwise picks new random track
- **Browser Media Session API:** external "Next" triggers **d20 randomization** for prominent category

### Soundscape Selection View
- Overlay with back button, scrollable category list, multi-select, confirm/add button

---

## States

### Scene loaded, no playback
All category cards show ▶. No glow borders. Sliders at saved positions.

### One or more categories playing
Relevant cards show ⏸ and gold glow border.

### No categories in scene
Empty area + add/invoke CTA.

### All intensities empty for a category
🎲 and ▶ disabled. Intensity toggles greyed out. MIX slider still adjustable.

### Loading
Centred spinner; sliders snap to saved values when ready.

### Error state
Scrollable message overlay; does not interrupt other playing categories.

---

## Navigation

| Destination | Trigger |
|---|---|
| BGM & Score tab | Tab strip |
| One-Shots & SFX tab | Tab strip → Soundboard content |
| Soundscape Selection overlay | Add / invoke tile |
| Campaign Sessions | Breadcrumb |
| Arcane Settings | ⚙️ gear or sidebar |
