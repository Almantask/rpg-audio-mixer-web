# Scene Screen — Soundscapes Tab — Screen Design

**Design References:**
- **Same screen for new and existing scenes** — one layout whether the scene is empty (just created) or already configured
- **Mobile reference:** one category card per row, current track visible, **ADD SOUNDSCAPE** footer button
- **Companion:** [`active-scene-soundboard-design.md`](active-scene-soundboard-design.md) — Soundboard tab
- **Opened from:** [`scenes-list-design.md`](scenes-list-design.md), session scene lists, campaign play

---

## Purpose

The **Scene screen** is the single place to view and configure a scene’s audio — **Soundscapes** and **Soundboard** tabs, mixer controls, and **Save State**. The **same screen** is used for:

- A **new scene** (just created via **New Scene** on the Scenes list — typically empty soundscapes and FX)
- An **existing scene** opened from the global Scenes list, a session’s scene list, or during live play

This document covers the **Soundscapes** tab: one **category card per row**, each showing the **single active track** for that category, plus volume and intensity controls.

**Sidebar nav item:** Home when in session context; parent sidebar item stays highlighted when opened from Scenes

---

## Entry contexts

| Opened from | Header | Typical state |
|---|---|---|
| **Scenes list** — new scene (after **Create**) | Scene title; breadcrumb **SCENES** (optional back) | Empty categories; **ADD SOUNDSCAPE** primary CTA |
| **Scenes list** — existing scene (row click) | Scene title; breadcrumb **SCENES** | Saved soundscapes / mixer state; playback optional |
| **Session scene list** | **ACTIVE SCENE** badge; **CAMPAIGN > [NAME] > SESSION N** | Same Scene screen as global list; session breadcrumb back to filtered list |
| **Live play** (session) | **ACTIVE SCENE** badge; **CAMPAIGN > [NAME]** | Playback during a game |

Layout, tabs, and controls are **identical** in every context — only header chrome and initial data differ.

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See `home-design.md` for full shell spec.

- **FE sidebar navigation only (no tab bar)**

---

## Scene Screen — Shared Shell

These elements are **identical on both tabs** and **all entry contexts**. See `active-scene-soundboard-design.md` for the Soundboard tab layout.

| Element | Description |
|---|---|
| Scene header | Scene **location name** (gold serif) from create/edit |
| Context badge | **ACTIVE SCENE** when opened from a **session** or live play; omitted when opened from global **Scenes** list only |
| Breadcrumb | **CAMPAIGN > [NAME] > SESSION N** when opened from session list; **SCENES** when opened from global list |
| Header actions | **Save State**, **Stop All** (panic — fades all soundscapes + stops FX), **Session Lock** 🔒 |
| Scene Notes | Expandable markdown area for DM cues (description from create/edit may seed initial content) |
| Tab strip | **Soundscapes** \| Soundboard — active tab: gold text + gold underline |

---

## Layout — Main Content (Soundscapes Tab)

**Session context** (existing scene with categories):

```
┌──────────────────────────────────────────────────────────────────────┐
│  ACTIVE SCENE                              [Save State] [Stop All]   │
│  The Shattered Keep                                                  │
│  CAMPAIGN > ECHOES OF THE VOID                                       │
│                                                                      │
│  SOUNDSCAPES    Soundboard                    (gold underline tabs)  │
│  -----------                                                         │
│                                                                      │
│  ┌─ Master Volume ──────────────────────────────────────────────┐   │
│  │ MASTER VOLUME                              --------●----  82%  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─ WEATHER (3 TRACKS) ───────────────────────────── [▶] [↻] ──┐   │
│  │ Thunderstorm                                                   │   │
│  │ ━━━━━━━━━━━━━━━━━━━  playback progress                         │   │
│  │ INTENSITY   [ I ]  [ II ]  [ III ]                             │   │
│  │ VOLUME      ---------------●------------                        │   │
│  └────────────────────────────────────────────────────────────────┘   │
│  ┌─ INTERIOR (3 TRACKS) ────────────────────────────── [▶] [↻] ──┐   │
│  │ Distant Torches                                                │   │
│  │ ━━━━━━━━━━━━━━━━━━━  (idle — no progress)                    │   │
│  │ INTENSITY   [ I ]  [ II ]  [ III ]                             │   │
│  │ VOLUME      ----●----------------------                        │   │
│  └────────────────────────────────────────────────────────────────┘   │
│  ┌─ MONSTERS (3 TRACKS) ───────────────────────────── [▶] [↻] ──┐   │
│  │ Skittering Swarm                                               │   │
│  │ ━━━━━━━━━━━━━━━━━━━                                          │   │
│  │ INTENSITY   [ I ]  [ II ]  [ III ]                             │   │
│  │ VOLUME      --------------●----------                          │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │              +  ADD SOUNDSCAPE                                 │   │
│  └────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

**New scene from Scenes list** (no **ACTIVE SCENE** badge; empty categories):

```
┌──────────────────────────────────────────────────────────────────────┐
│  Whispering Woods                          [Save State] [Stop All]   │
│  SCENES                                                              │
│                                                                      │
│  SOUNDSCAPES    Soundboard                    (gold underline tabs)  │
│  -----------                                                         │
│                                                                      │
│  ┌─ Master Volume ──────────────────────────────────────────────┐   │
│  │ MASTER VOLUME                              --------●----  100% │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  (no category rows yet)                                              │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │              +  ADD SOUNDSCAPE                                 │   │
│  └────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Components — Soundscapes Tab

### Master Volume (`Card` + `Slider`)
- Label: **MASTER VOLUME** (gold uppercase) + percentage readout (e.g. 82%)
- Full-width gold `Slider`
- Controls overall output volume for all soundscape categories
- Final volume per category = **Master Volume × Volume** (multiplicative)
- **Natural Volume Progression:** **Cubic ($x^3$) mapping**
- Snaps instantly to saved value on scene load — no animation

### Soundscape Category Card (`Card` — one row per category)

Each card represents **one category** with **one active track** shown. There is no stacked list of layer sliders — only a single track row per category.

| Element | Description |
|---|---|
| **Category header** | Category name in gold uppercase + track count, e.g. **WEATHER (3 TRACKS)** |
| **Play / Pause** | Square icon button — ▶ when idle/paused, ⏸ when playing |
| **Loop** | Square icon button — circular-arrow icon only (no text label); gold when loop is on |
| **Track title** | Current track name in white italic serif, e.g. *Thunderstorm* — shown when a track is loaded; placeholder when none |
| **Playback progress** | Thin horizontal bar under track title; fills while playing |
| **Intensity** | Label **INTENSITY** + square toggles **I** – **V** for levels defined on the category; active level has gold border; levels with no tracks greyed out |
| **Volume** | Label **VOLUME** + single `Slider` per card (not per-layer rows) |

The Volume slider sets per-category relative output: **Actual output = Master Volume × Volume**. **Cubic ($x^3$) mapping**.

**Playing state:** progress bar animates; ⏸ shown on play control. **Paused/idle:** progress bar empty or frozen; ▶ shown.

> **Not on this screen:** multi-layer mixing and layer counts belong in the **Category Composer** (Library). Each card shows **one track at a time** for that category.

### Add Soundscape (`Button`)
- Full-width gold `Button` at the bottom of the list
- Label: **+ ADD SOUNDSCAPE**
- Opens **Soundscapes picker modal** — see [`audio-library-soundscapes-modal-design.md`](audio-library-soundscapes-modal-design.md)
- Always visible below the category cards (not a dashed inline tile)

### Drag-to-Reorder
Category cards can be dragged via handle to reorder. **Disabled when Session Lock is active.**

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click **Soundboard** tab | Switch to Soundboard view |
| Drag Master Volume slider | Adjusts overall output volume for all categories in real time |
| Click ▶ on a card | Plays a **random** track from that category's current intensity pool (or resumes paused track) |
| Click ⏸ on a card | Pauses current track; progress bar stops |
| Click Loop (↻) | Toggles looping for that category's track |
| Click intensity toggle (**I – V**) on a card | Changes intensity for that category; **crossfade if already playing** |
| Drag **Volume** slider on a card | Adjusts that category's relative volume in real time |
| Click **ADD SOUNDSCAPE** | Opens Soundscapes picker modal |
| Drag card by handle | Reorders categories. **Disabled if Session Lock is ON.** |
| Click delete on card | Removes category from scene. **Disabled if Session Lock is ON.** |
| Click **Save State** | Persists current scene mixer configuration |
| Click **Stop All** | Fades out all soundscapes and stops all FX |

### Volume Formula
`Actual output = Master Volume × Volume` for each category independently.

### Intensity Levels
- Categories define **1–5** levels in Category Composer (**Level I** – **Level V**)
- Lower levels = calmer; higher levels = tenser/climactic
- Per-card toggles show only levels that exist on the category; GM switches manually
- **Levels with no tracks are greyed out and non-selectable**
- **Seamless Intensity Transitions:** **Web Audio double-buffer crossfade engine** with **2-second crossfade**
- **Equal-Power Crossfading:** $sin/cos$ curves for constant perceived loudness

### Track Selection
- ▶ picks at random from current intensity pool when no track is loaded
- ▶ resumes paused track if one exists
- Changing intensity while playing crossfades to a random track from the new pool
- **Browser Media Session API:** external "Next" may trigger a new random track for the focused category

---

## States

### New scene (just created)
No soundscape categories yet; **Master Volume** at default; **ADD SOUNDSCAPE** is the primary CTA. **Save State** persists first configuration.

### Scene loaded, no playback
Cards show ▶, empty progress bars, saved Volume positions.

### One or more categories playing
Playing cards show ⏸ and animating progress bars.

### No categories in scene
Empty list area; **ADD SOUNDSCAPE** is the primary CTA.

### Category with no track loaded
Track title area shows placeholder; ▶ enabled if intensity pool has tracks.

### All intensities empty for a category
▶ and intensity toggles greyed out. Volume slider still adjustable.

### Loading
Centred spinner; sliders snap to saved values when ready.

### Error state
Scrollable message overlay; does not interrupt other playing categories.

---

## Navigation

| Destination | Trigger |
|---|---|
| Soundboard tab | Click "Soundboard" in tab strip |
| Soundscapes picker modal | **ADD SOUNDSCAPE** button |
| Library page (browse) | Sidebar → Library |
| Campaign context | Breadcrumb |
| Scenes | Sidebar → Scenes |
| Credits | Sidebar → Credits |
| Trash | Sidebar → Trash |
