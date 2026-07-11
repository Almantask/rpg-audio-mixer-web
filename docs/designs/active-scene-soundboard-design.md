# Scene Screen — Soundboard Tab — Screen Design

**Design References:**
- **Same screen for new and existing scenes** — see [`active-scene-soundscapes-design.md`](active-scene-soundscapes-design.md) — Entry contexts
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)
- **Companion:** [`active-scene-soundscapes-design.md`](active-scene-soundscapes-design.md) — Soundscapes tab; shared shell

---

## Purpose

The **Scene screen** has **two tabs only** — **Soundscapes** and **Soundboard**. This document covers the **Soundboard** tab: a grid of one-shot FX buttons to trigger sound effects during play or while configuring a scene.

The **same Soundboard tab** appears for **new scenes** (empty grid, **Add Sound** only) and **existing scenes** (populated tiles). See **Entry contexts** in `active-scene-soundscapes-design.md`.

**Sidebar nav item:** **Home** when opened from session drill-down; **Scenes** when opened from global Scenes list — see [`platform-design.md`](platform-design.md) (PW-06).

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See [`platform-design.md`](platform-design.md) for shell spec.

- **FE sidebar navigation only (no tab bar)**

---

## Scene Screen — Shared Shell

Same as `active-scene-soundscapes-design.md` — **Scene Screen — Shared Shell** (new and existing scenes, session or Scenes list).

**Save State** appears in the header on the **Soundscapes** tab only (persists mixer configuration). On the **Soundboard** tab, layout changes auto-persist immediately — no Save State button.

---

## Layout — Main Content (Soundboard Tab)

```
┌──────────────────────────────────────────────────────────────────────┐
│  ACTIVE SCENE                                        [Stop All] 🔒   │
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
│  Soundboard                                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                        │
│  │≡ 🔥  🗑│ │≡ ⚔️  🗑│ │≡ ⚡  🗑│ │≡ 🐉  🗑│                        │
│  │Fireball│ │ Steel  │ │Thunder │ │Dragon  │                        │
│  │ Num 1  │ │ Num 2  │ │ Num 3  │ │ Num 4  │                        │
│  └────────┘ └────────┘ └────────┘ └────────┘                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌ - - - - ┐                        │
│  │≡ 🧪  🗑│ │≡ ✨  🗑│ │≡ 🪨  🗑│ │   +    │                        │
│  │ Acid   │ │ Magic  │ │ Cave In│ │ Add    │                        │
│  │ Num 5  │ │ Num 6  │ │ Num 7  │ │ Sound  │                        │
│  └────────┘ └────────┘ └────────┘ └ - - - - ┘                        │
└──────────────────────────────────────────────────────────────────────┘
```

**Responsive grid:** 4 columns desktop (≥1024px), 3 columns tablet (768–1023px), 2 columns phone (<768px). Minimum **44×44px** touch targets. **Add Sound** tile always last in grid.

---

## Components — Soundboard Tab

### Soundboard Master (`Card` + `Slider`)
- Speaker icon + **Soundboard Master** label
- Full-width horizontal `Slider` with percentage readout
- Controls output volume for **all** effects equally — no per-effect volume on this tab
- Independent from **Master Volume** on the Soundscapes tab
- **Master Intensity Switcher** (Soundscapes tab) does **not** affect soundboard FX volume — Soundboard Master is the sole board-level volume control
- **Natural Volume Progression:** **Cubic ($x^3$) mapping**
- Snaps instantly to saved value on scene load — no animation
- **Remains draggable when Active Scene Lock is on**

### Soundboard Section
- Section header: **Soundboard**
- Responsive grid of effect tiles (`Card` / `Button`) — see column counts above
- **Soft cap of 24 tiles.** At cap, **Add Sound** is replaced with inline message: *"Board full — remove an effect to add more."*
- **No Edit Board mode** — reorder and delete affordances are always visible

#### Effect Tile (repeating)
- **Drag handle** (`≡`) — always visible; reorders on drop (auto-saves immediately)
- **Delete** (`🗑`) — removes FX from scene (scene unlink only; library asset untouched, nothing sent to Trash). No confirmation dialog
- Coloured thematic icon
- FX name (truncated if needed)
- Hotkey label: **Num 1–9** auto-assigned to grid order (left-to-right, top-to-bottom). **Tiles 10+** show no hotkey label. **Not profile-configurable** in v1
- **Low-Latency Soundboard:** all FX MUST be played via **Web Audio API buffer pool** for near-zero latency

**Idle state:** subtle ▶ affordance.

**Playing state:** tile glows/pulses and shows **pause icon** (⏸).

**Re-trigger behaviour:** tapping the tile body while playing starts a **new instance from the beginning** — the in-progress instance(s) continue alongside the new one (overlap, not replace).

**Stop behaviour:** tapping **pause/⏹** on the tile stops **all** running instances of that FX at once; tile reverts to idle.

#### Add Sound Tile (`Card` — dashed border)
- Centred **+** icon
- Label: **Add Sound**
- Opens **Sound Effects Modal** — see [`audio-library-fx-modal-design.md`](audio-library-fx-modal-design.md)
- **Disabled/hidden when Active Scene Lock is on** — no path to open the picker mid-session

### Drag-to-Reorder
Effect tiles can be dragged via the always-visible handle to reorder. **Auto-saves on drop.** **Disabled when Active Scene Lock is active.**

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click **Soundscapes** tab | Switch to Soundscapes view (allowed when Active Scene Lock is on) |
| Drag Soundboard Master slider | Adjusts output volume for all effects in real time (allowed when locked) |
| Click an effect tile (idle) | Starts playing; tile glows/pulses and shows pause icon |
| Click an effect tile (playing) | **Re-triggers** — new instance starts; all prior instances continue |
| Click pause/⏹ on a tile | Stops **all** running instances of that FX; tile reverts to idle |
| Click **Stop All** | Uniform fade — all audio including FX fades out together; all soundboard tiles return to idle chrome immediately |
| Drag a tile via handle | Reorders it in the grid; order auto-saves on drop. **Disabled if Active Scene Lock is ON** |
| Click tile 🗑 | Removes effect from scene (scene unlink only). **Disabled if Active Scene Lock is ON**. No confirmation |
| Click **Add Sound** | Opens Sound Effects picker modal (checkboxes + **Add Selected (N)**). **Disabled/hidden if Active Scene Lock is ON** |
| Toggle **Active Scene Lock** 🔒 | Enables/disables structural edits per lock matrix below |

### Auto-Ducking
When any soundboard FX is triggered, **all playing soundscapes duck to 40%** volume. Volume restores smoothly when that FX instance ends. **Required for MVP; not configurable** in v1.

### FX Concurrency
- **Global cap:** max **5** concurrent FX instances across the entire board
- **Per-effect cap:** max **5** simultaneous instances of the same sound
- On exceed, **silently stop the oldest** instance — no toast in v1

### In-Flight FX on Scene Switch
FX instances triggered before a scene switch **persist until natural end** — only soundscapes crossfade on scene change.

### Sound Effects Modal (Add Sound)

Full FX picker modal — filters, **Import FX** / **Buy More** / **Free Tracks**, card grid with preview-on-click, **selection checkboxes**, footer **Add Selected (N)**. No Detail button.

**Commit model:** checkbox multi-select + **Add Selected (N)**. Modal **stays open** after commit for additional picks; GM closes with ← back when done.

**Post-add feedback:** **Sonner toast** — e.g. *"3 effects added"*.

**Already-on-board FX** are **filtered out** of the picker grid (not shown as disabled rows).

New tiles append after existing tiles in **selection order**; hotkeys assigned sequentially to new tiles only.

See [`audio-library-fx-modal-design.md`](audio-library-fx-modal-design.md). Browse/edit the global catalogue on the **Library page** — [`audio-library-design.md`](audio-library-design.md). ← back returns to Scene screen — Soundboard tab.

### Active Scene Lock Matrix

There is no separate "session lock" — structural edits are gated by **Active Scene Lock** on the Scene screen.

| Disabled when locked | Still enabled |
|---|---|
| Add Sound (picker cannot open) | Tap FX tiles (play/retrigger) |
| Drag-reorder via handle | Soundboard Master + Soundscapes Master sliders |
| Tile 🗑 delete | Per-soundscape volume sliders, play/pause, d20 |
| Add Soundscape, category reorder/remove | Stop All, Lock toggle |
| Navigate to different scene | Tab switch (Soundscapes ↔ Soundboard) |

Lock scope is **Active Scene only** — it does not extend to the session scene list.

---

## States

### New scene (just created)
GM lands on **Soundscapes** tab first. Soundboard tab shows empty grid with only **Add Sound** dashed tile. First FX add auto-persists layout.

### Populated grid
Effects shown in responsive grid (4/3/2 columns). Some may be playing (glowing) simultaneously.

### Empty grid
Only Add Sound dashed tile as primary CTA.

### Board full (24 tiles)
Add Sound replaced with inline *"Board full — remove an effect to add more."* message.

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
