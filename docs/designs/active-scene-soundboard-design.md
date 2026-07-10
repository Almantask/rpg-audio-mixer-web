# Active Scene — Soundboard Tab — Screen Design

**Design References:**
- [`docs/designs/ActiveScene-Soundboard.html`](../../docs/designs/ActiveScene-Soundboard.html)
- [`docs/designs/ActiveScene-Soundboard.png`](../../docs/designs/ActiveScene-Soundboard.png)
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)

---

## Purpose

The Soundboard tab sits alongside the Soundscapes tab within an Active Scene. It gives the GM a grid of one-shot FX buttons to trigger sound effects instantly during play — thunder, door creaks, combat sounds, etc.

**Sidebar nav item:** Current Session (active — active scene is session context)

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See `home-design.md` for full shell spec.

- **Sidebar footer:** user profile — avatar, display name (e.g. "Master Alchemist"), campaign context (e.g. "Campaign: Curse of Strahd")
- **FE sidebar navigation only (no tab bar)**

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  📍 ACTIVE SCENE                              [Save State] [Stop All]│
│  The Dragon's Lair                                                   │
│  A cavernous expanse filled with the scent of sulfur and gold…       │
│                                                                      │
│  ( Soundscapes )  [ Soundboard ]   ← pill Tabs                       │
│                                                                      │
│  ┌─ Master Output ────────────────────────────────────────────────┐  │
│  │ 🔊 Master Output  ═══════════════◉═══════════════         85%  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Combat & Effects                                    Edit Board ✏️   │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                        │
│  │ 🔥     │ │ ⚔️     │ │ ⛈️     │ │ 🐉     │                        │
│  │Fireball│ │ Steel  │ │Thunder │ │Dragon  │                        │
│  │ Num 1  │ │ Num 2  │ │ Num 3  │ │ Num 4  │                        │
│  └────────┘ └────────┘ └────────┘ └────────┘                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌ ─ ─ ─ ┐                        │
│  │ 🧪     │ │ ✨     │ │ 🪨     │ │   +    │                        │
│  │ Acid   │ │ Magic  │ │ Cave In│ │ Add    │                        │
│  │ Num 5  │ │ Num 6  │ │ Num 7  │ │ Sound  │                        │
│  └────────┘ └────────┘ └────────┘ └ ─ ─ ─ ┘                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Scene Header
- **ACTIVE SCENE** — purple `Badge` with location-pin icon
- Scene title — large gold serif (e.g. "The Dragon's Lair")
- Scene description — subdued body text
- **Save State** — gold outline `Button` with floppy-disk icon → persists current mixer state
- **Stop All** — red outline `Button` → immediately fades out all soundscapes and stops all sound effects (panic button)

### Session Lock Toggle (🔒)
- Disables destructive gestures (reordering, deleting) and scene switching during live play
- May appear in header actions or as a toggle near Save State

### Scene Notes
- Expandable markdown-capable text area for storing DM cues, descriptions, and reminders specific to the scene

### Pill Tab Toggle (`Tabs` — pill variant)
- **Soundscapes** | **Soundboard** (active on this screen)
- Gold border + gold text on active tab

### Master Output (`Card` + `Slider`)
- Speaker icon + **Master Output** label
- Full-width horizontal `Slider` with purple-to-gold gradient fill
- Percentage readout (e.g. 85%)
- Controls output volume for **all** effects equally — no per-effect volume on this tab
- **Natural Volume Progression:** **Cubic ($x^3$) mapping**
- **Arcanum Motion:** sliders use specific motion tokens for tactile feedback
- Snaps instantly to saved value on scene load — no animation

### Combat & Effects Section
- Section header: **Combat & Effects**
- **Edit Board** — purple text link with pencil icon → enters reorder/edit mode
- 4-column grid of effect tiles (`Card` / `Button`)

#### Effect Tile (repeating)
- Coloured thematic icon
- FX name (truncated if needed)
- Hotkey label (e.g. Num 1–7)
- **Low-Latency Soundboard:** all FX MUST be played via **Web Audio API buffer pool** for near-zero latency

**Playing state:** tile glows/pulses and shows ⏸.

**Re-trigger behaviour:** clicking a playing tile starts a new instance from the beginning — the in-progress instance continues alongside the new one (overlap, not replace).

**Stop behaviour:** clicking ⏸ stops that instance and reverts the tile to idle.

#### Add Sound Tile (`Card` — dashed border)
- Centred **+** icon
- Label: **Add Sound**
- Opens FX Selection view

### Drag-to-Reorder
Effect tiles can be dragged via handle to reorder. **Disabled when Session Lock is active.**

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Drag Master Output slider | Adjusts output volume for all effects in real time |
| Click an effect tile (idle) | Starts playing; tile glows/pulses and shows ⏸ |
| Click an effect tile (playing) | **Re-triggers** — new instance starts; prior instance continues |
| Click ⏸ on a tile | Stops that effect's current instance; tile reverts to idle |
| Click **Stop All** | Fades out all soundscapes and stops all FX |
| Click **Save State** | Persists current scene mixer configuration |
| Drag a tile via handle | Reorders it in the grid. **Disabled if Session Lock is ON.** |
| Drag tile to trash zone | Removes effect from scene. **Disabled if Session Lock is ON.** |
| Click **Add Sound** | Opens FX Selection overlay |
| Click **Edit Board** | Enters board edit/reorder mode |
| Click Soundscapes tab | Switch to Soundscapes view |

### FX Selection View (Add Sound)
- Overlay/sheet presenting scrollable list or grid of all FX tracks from the global FX Library
- Multi-select: GM picks one or more to add to the scene's soundboard
- Confirm button adds selected effects

---

## States

### Populated grid
Effects shown in 4-column grid. Some may be playing (glowing) simultaneously.

### Empty grid
Only Add Sound dashed tile as primary CTA.

### Loading
Centred `Skeleton` / spinner until scene data is ready.

### Error state
Scrollable `AlertDialog` overlay with error details and dismiss button. Other playing effects are not interrupted.

---

## Navigation

| Destination | Trigger |
|---|---|
| Soundscapes tab | Click "Soundscapes" in pill toggle |
| FX Selection overlay | Click Add Sound |
| Ambience Presets | Sidebar |
| Arcane Settings | ⚙️ gear or sidebar |
