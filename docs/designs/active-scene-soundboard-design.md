# Scene Screen — Soundboard Tab — Screen Design

**Design References:**
- **Same screen for new and existing scenes** — see [`active-scene-soundscapes-design.md`](active-scene-soundscapes-design.md) — Entry contexts
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)
- **Companion:** [`active-scene-soundscapes-design.md`](active-scene-soundscapes-design.md) — Soundscapes tab; shared shell

---

## Purpose

The **Scene screen** has **two tabs only** — **Soundscapes** and **Soundboard**. This document covers the **Soundboard** tab: a grid of one-shot FX buttons to trigger sound effects during play or while configuring a scene.

The **same Soundboard tab** appears for **new scenes** (empty grid, **Add Sound** only) and **existing scenes** (populated tiles). See **Entry contexts** in `active-scene-soundscapes-design.md`.

**Sidebar nav item:** Home when in session context; parent sidebar item stays highlighted when opened from Scenes

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See `home-design.md` for full shell spec.

- **FE sidebar navigation only (no tab bar)**

---

## Scene Screen — Shared Shell

Same as `active-scene-soundscapes-design.md` — **Scene Screen — Shared Shell** (new and existing scenes, session or Scenes list).

---

## Layout — Main Content (Soundboard Tab)

```
┌──────────────────────────────────────────────────────────────────────┐
│  ACTIVE SCENE                              [Save State] [Stop All]   │
│  The Shattered Keep                                                  │
│  CAMPAIGN > ECHOES OF THE VOID                                       │
│                                                                      │
│  Soundscapes    SOUNDBOARD                    (gold underline tabs)  │
│                 ----------                                           │
│                                                                      │
│  ┌─ Soundboard Master ──────────────────────────────────────────┐   │
│  │ 🔊  ---------------●-------------------------------         85%  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Soundboard                                          Edit Board ✏️   │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                        │
│  │ 🔥     │ │ ⚔️     │ │ ⚡     │ │ 🐉     │                        │
│  │Fireball│ │ Steel  │ │Thunder │ │Dragon  │                        │
│  │ Num 1  │ │ Num 2  │ │ Num 3  │ │ Num 4  │                        │
│  └────────┘ └────────┘ └────────┘ └────────┘                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌ - - - - ┐                        │
│  │ 🧪     │ │ ✨     │ │ 🪨     │ │   +    │                        │
│  │ Acid   │ │ Magic  │ │ Cave In│ │ Add    │                        │
│  │ Num 5  │ │ Num 6  │ │ Num 7  │ │ Sound  │                        │
│  └────────┘ └────────┘ └────────┘ └ - - - - ┘                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Components — Soundboard Tab

### Soundboard Master (`Card` + `Slider`)
- Speaker icon + **Soundboard Master** label
- Full-width horizontal `Slider` with percentage readout
- Controls output volume for **all** effects equally — no per-effect volume on this tab
- Independent from **Master Volume** on the Soundscapes tab
- **Natural Volume Progression:** **Cubic ($x^3$) mapping**
- Snaps instantly to saved value on scene load — no animation

### Soundboard Section
- Section header: **Soundboard**
- **Edit Board** — text link with pencil icon → enters reorder/edit mode
- 4-column grid of effect tiles (`Card` / `Button`)

#### Effect Tile (repeating)
- Coloured thematic icon
- FX name (truncated if needed)
- Hotkey label (e.g. Num 1–7)
- **Low-Latency Soundboard:** all FX MUST be played via **Web Audio API buffer pool** for near-zero latency

**Playing state:** tile glows/pulses and shows ▶.

**Re-trigger behaviour:** clicking a playing tile starts a new instance from the beginning — the in-progress instance continues alongside the new one (overlap, not replace).

**Stop behaviour:** clicking ⏹ stops that instance and reverts the tile to idle.

#### Add Sound Tile (`Card` — dashed border)
- Centred **+** icon
- Label: **Add Sound**
- Opens **Sound Effects Modal** — see [`audio-library-fx-modal-design.md`](audio-library-fx-modal-design.md)

### Drag-to-Reorder
Effect tiles can be dragged via handle to reorder. **Disabled when Session Lock is active.**

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click **Soundscapes** tab | Switch to Soundscapes view |
| Drag Soundboard Master slider | Adjusts output volume for all effects in real time |
| Click an effect tile (idle) | Starts playing; tile glows/pulses and shows ▶ |
| Click an effect tile (playing) | **Re-triggers** — new instance starts; prior instance continues |
| Click ⏹ on a tile | Stops that effect's current instance; tile reverts to idle |
| Click **Stop All** | Fades out all soundscapes and stops all FX |
| Click **Save State** | Persists current scene mixer configuration |
| Drag a tile via handle | Reorders it in the grid. **Disabled if Session Lock is ON.** |
| Drag tile to trash zone | Removes effect from scene. **Disabled if Session Lock is ON.** |
| Click **Add Sound** | Opens Sound Effects picker modal (checkboxes + **Add Selected**) |
| Click **Edit Board** | Enters board edit/reorder mode |

### Sound Effects Modal (Add Sound)

Full FX picker modal — filters, **Import FX** / **Buy More** / **Free Tracks**, card grid with preview-on-click, **selection checkboxes**, footer **Add Selected (N)**. No Detail button.

See [`audio-library-fx-modal-design.md`](audio-library-fx-modal-design.md). Browse/edit the global catalogue on the **Library page** — [`audio-library-design.md`](audio-library-design.md). ← back returns to Scene screen — Soundboard tab.

---

## States

### New scene (just created)
Empty soundboard grid; only **Add Sound** dashed tile. **Save State** persists first FX layout.

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
| Soundscapes tab | Click "Soundscapes" in tab strip |
| Sound Effects Modal | Add Sound |
| Scenes | Sidebar → Scenes |
| Credits | Sidebar → Credits |
| Trash | Sidebar → Trash |
