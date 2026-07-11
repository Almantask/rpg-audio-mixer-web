# Scene Screen — Soundscapes Tab — Screen Design

**Design References:**
- **Same screen for new and existing scenes** — one layout whether the scene is empty (just created) or already configured
- **Mobile reference:** one category card per row, current track visible, **ADD SOUNDSCAPE** footer button
- **Companion:** [`active-scene-soundboard-design.md`](active-scene-soundboard-design.md) — Soundboard tab
- **Opened from:** [`scenes-list-design.md`](scenes-list-design.md), session scene lists, campaign play

---

## Purpose

The **Scene screen** is the single place to view and configure a scene’s audio — **Soundscapes** and **Soundboard** tabs and mixer controls. All changes **auto-save immediately**; there is no **Save State** button. The **same screen** is used for:

- A **new scene** (just created via **New Scene** on the Scenes list — typically empty soundscapes and FX)
- An **existing scene** opened from the global Scenes list, a session’s scene list, or during live play

This document covers the **Soundscapes** tab: one **category card per row**, each showing the **single active track** for that category, plus volume and intensity controls.

**Sidebar nav item:** **Home** when opened from session drill-down; **Scenes** when opened from global Scenes list — see [`platform-design.md`](platform-design.md) (PW-06).

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

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See [`platform-design.md`](platform-design.md) for shell spec.

- **FE sidebar navigation only (no tab bar)**

---

## Scene Screen — Shared Shell

These elements are **identical on both tabs** and **all entry contexts**. See `active-scene-soundboard-design.md` for the Soundboard tab layout.

| Element | Description |
|---|---|
| Scene header | Scene **location name** (gold serif) from create/edit |
| Context badge | **ACTIVE SCENE** when opened from a **session** or live play; omitted when opened from global **Scenes** list only |
| Breadcrumb | **CAMPAIGN > [NAME] > SESSION N** when opened from session list; **SCENES** when opened from global list |
| Header actions | **Stop All** (panic — fades all soundscapes + stops FX), **Session Lock** 🔒 |
| Scene Notes | Expandable markdown area for DM cues (description from create/edit may seed initial content) |
| Tab strip | **Soundscapes** \| **Soundboard** — active tab: gold text + gold underline |

---

## Layout — Main Content (Soundscapes Tab)

**Session context** (existing scene with categories):

```
┌──────────────────────────────────────────────────────────────────────┐
│  ACTIVE SCENE                                        [Stop All] 🔒   │
│  The Shattered Keep                                                  │
│  CAMPAIGN > ECHOES OF THE VOID                                       │
│                                                                      │
│  SOUNDSCAPES    Soundboard                    (gold underline tabs)  │
│  -----------                                                         │
│                                                                      │
│  ┌─ Master Volume ──────────────────────────────────────────────┐   │
│  │ [Play Scene]  🔇  MASTER VOLUME           --------●----  82%  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌≡ WEATHER (12 TRACKS) ─────────────────── [d20] [⏸] [🗑] ──┐   │
│  │ Thunderstorm                                                   │   │
│  │ ━━━━━━━━━━━━━━━━━━━  playback progress                         │   │
│  │ INTENSITY   [ I ]  [ II ]  [ III ]                             │   │
│  │ VOLUME      ---------------●------------                        │   │
│  └────────────────────────────────────────────────────────────────┘   │
│  ┌≡ INTERIOR (8 TRACKS) ────────────────────── [d20] [▶] [🗑] ──┐   │
│  │ Distant Torches                                                │   │
│  │ (idle — no progress)                                           │   │
│  │ INTENSITY   [ I ]  [ II ]  [ III ]                             │   │
│  │ VOLUME      ----●----------------------                        │   │
│  └────────────────────────────────────────────────────────────────┘   │
│  ┌≡ MONSTERS (5 TRACKS) ────────────────────── [d20] [▶] [🗑] ──┐   │
│  │ Skittering Swarm                                               │   │
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
│  Whispering Woods                                    [Stop All] 🔒   │
│  SCENES                                                              │
│                                                                      │
│  SOUNDSCAPES    Soundboard                    (gold underline tabs)  │
│  -----------                                                         │
│                                                                      │
│  ┌─ Master Volume ──────────────────────────────────────────────┐   │
│  │ [Play Scene]  🔇  MASTER VOLUME           --------●----  100% │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  (no category rows yet)                                              │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │              +  ADD SOUNDSCAPE                                 │   │
│  └────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

> **Not on this tab:** **Soundboard Master** slider lives on the **Soundboard** tab only.

---

## Components — Soundscapes Tab

### Master Volume (`Card` + `Slider` + actions)
- **`[Play Scene]`** button — starts/resumes soundscapes per [Play Scene behavior](#play-scene-behavior)
- **Mute icon** (🔇 / 🔊) — silences **soundscape output only**; soundboard FX remain audible
- Label: **MASTER VOLUME** (gold uppercase) + percentage readout (e.g. 82%)
- Full-width gold `Slider`
- Controls overall output volume for all soundscape categories
- Final volume per category = **Master Volume × Volume** (multiplicative)
- **Natural Volume Progression:** **Cubic ($x^3$) mapping**
- Snaps instantly to saved value on scene load — no animation
- Master Volume slider and mute remain adjustable when **Session Lock** is ON

### Soundscape Category Card (`Card` — one row per category)

Each card represents **one category** with **one active track** shown. There is no stacked list of layer sliders — only a single track row per category.

| Element | Description |
|---|---|
| **Drag handle** | Visible **≡** handle on the card leading edge — reorder anytime; **no edit mode** |
| **Category header** | Category name in gold uppercase + track count, e.g. **WEATHER (12 TRACKS)** — count is **total tracks across all intensity levels**, not just the active level |
| **d20** | Square icon button — picks a **new random track** from the current intensity pool; **replaces** the playing track if one is loaded |
| **Play / Pause** | Square icon button — ▶ when idle/paused, ⏸ when playing; **play/resume/pause only** — never re-rolls |
| **Delete** | Trailing **🗑 trash icon** on card header (web/tablet) **+ swipe-right** (touch) — both affordances coexist |
| **Track title** | Current track name in white italic serif, e.g. *Thunderstorm* — shown when a track is loaded; placeholder when none |
| **Playback progress** | Thin horizontal bar under track title; fills while playing |
| **Intensity** | Label **INTENSITY** + square toggles **I** – **V** for levels defined on the category; active level has gold border; levels with no tracks greyed out |
| **Volume** | Label **VOLUME** + single `Slider` per card (not per-layer rows) |

The Volume slider sets per-category relative output: **Actual output = Master Volume × Volume**. **Cubic ($x^3$) mapping**.

**Playing state:** **coloured glow border** on card + animating progress bar + ⏸ on play control. **Paused/idle:** no glow; progress bar empty or frozen; ▶ shown.

**Empty intensity pool:** **d20** and **▶** are **disabled (greyed)** but remain visible — no post-tap warning.

> **Not on this screen:** multi-layer mixing and layer counts belong in the **Category Composer** (Library). Each card shows **one track at a time** for that category. **No Loop ↻ toggle** — track end auto-chains (see [Track end behavior](#track-end-behavior)).

### Add Soundscape (`Button`)
- Full-width gold `Button` at the bottom of the list
- Label: **+ ADD SOUNDSCAPE**
- Opens **Soundscapes picker modal** — see [`audio-library-soundscapes-modal-design.md`](audio-library-soundscapes-modal-design.md)
- Picker uses **checkbox selection + Add Selected (N)** commit model — not instant **+**
- **No Import** in the scene picker — import via Library / Category Composer only
- Always visible below the category cards (not a dashed inline tile)
- **Disabled (greyed) but visible** when **Session Lock** is ON

### Drag-to-Reorder
- Visible **drag handle** on each card — reorder anytime; **no edit mode**, no long-press
- New order **auto-persists on drop** — no Save State action required
- **Disabled when Session Lock is active**

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click **Soundboard** tab | Switch to Soundboard view (allowed while Session Lock is ON) |
| Click **`[Play Scene]`** | See [Play Scene behavior](#play-scene-behavior) |
| Click mute on Master Volume bar | Toggles mute for **soundscapes only**; soundboard FX unaffected |
| Drag Master Volume slider | Adjusts overall soundscape output in real time; **auto-saves** |
| Click **d20** on a card | New random track from current intensity pool; replaces playing track |
| Click ▶ on a card | **Resumes** paused track, or starts playback if a track is loaded but paused at start |
| Click ▶ on idle card (no loaded track) | Does not re-roll — use **d20** or **Play Scene** to pick a track |
| Click ⏸ on a card | Pauses current track; progress bar stops; **frees a concurrency slot** |
| Click intensity toggle (**I – V**) on a card | Changes intensity for that category; **crossfade if already playing**; **auto-saves** |
| Drag **Volume** slider on a card | Adjusts that category's relative volume in real time; **auto-saves** |
| Click **ADD SOUNDSCAPE** | Opens Soundscapes picker modal (disabled when Session Lock is ON) |
| Drag card by handle | Reorders categories; **auto-persists on drop**. **Disabled if Session Lock is ON.** |
| Tap **🗑** or swipe-right on card | Removes category from scene. **Disabled if Session Lock is ON.** |
| Click **Stop All** | Fades out all soundscapes and stops all FX |
| Toggle **Session Lock** | Blocks add/reorder/delete; playback and volume controls remain enabled |

### Auto-save

All mixer and layout changes **persist immediately** — no **Save State** button anywhere on Active Scene:

| Change | Persists |
|---|---|
| Master Volume, mute, per-card Volume | On change |
| Intensity toggle | On change |
| Category reorder | On drop |
| Add / remove category | On commit / delete |

**Session Lock** blocks **editing** (add, reorder, delete) only — it does not block saving playback or volume adjustments.

### Volume Formula
`Actual output = Master Volume × Volume` for each category independently.

### Intensity Levels
- Categories define **1–5** levels in Category Composer (**Level I** – **Level V**)
- **No master-level intensity control** on Active Scene — intensity is per-soundscape only
- Lower levels = calmer; higher levels = tenser/climactic
- Per-card toggles show only levels that exist on the category; GM switches manually
- **Levels with no tracks are greyed out and non-selectable**
- **Seamless Intensity Transitions:** **Web Audio double-buffer crossfade engine** with **2-second crossfade**
- **Equal-Power Crossfading:** $sin/cos$ curves for constant perceived loudness

### Track Selection & Controls

| Control | Behavior |
|---|---|
| **d20** | New random track from current intensity pool; replaces playing track |
| **▶ / ⏸** | Play, resume, or pause only — **never re-rolls** |
| **Track end (natural)** | Automatically plays a **new random track** from the **same intensity level** of the **same category** — no loop toggle |
| **Intensity change while playing** | Crossfade to a random track from the new pool |
| **Browser Media Session "Next"** | New random track for the focused category at its **current intensity level** |

### Play Scene behavior

When the GM taps **`[Play Scene]`**:

1. **Idle categories** — random pick from each category’s **current intensity pool**
2. **Paused categories** — **resume** from the current track (no re-roll)
3. **Already playing categories** — left unchanged
4. Categories that are playing continue to **auto-chain** random tracks at natural track end (same intensity, same category)

### Track end behavior

There is **no Loop ↻ toggle**. When a playing track finishes:

- A **new random track** from the **same intensity level** of the **same category** begins automatically
- Applies to individual category playback and to categories started via **Play Scene**

### Concurrency cap

- **Maximum 10 categories** with **active playback** (playing or paused-with-loaded-track) at once
- When an **11th** category starts playing, the **oldest playing category stops silently** — no toast
- **Pausing** a category **frees its slot**, allowing another category to start without evicting another

### Auto-ducking (cross-tab)

When any soundboard FX is triggered, all **playing soundscapes duck to 40%**; volume restores smoothly when that FX instance ends. **Not configurable** in v1.

### Scene switch (background audio)

Opening another scene **without** tapping its play button still **fades out the previous scene’s audio** and **fades in the new scene’s audio**.

### Default values — newly added category

| Setting | Default |
|---|---|
| Volume | 100% |
| Intensity | **Lowest level that has tracks** (e.g. I if populated) |
| List order | **Append to bottom** |
| Playback | **Idle** (not auto-play) |
| Track end | Auto-chain random track at same intensity once playing begins |

---

## States

### New scene (just created)
No soundscape categories yet; **Master Volume** at default; **ADD SOUNDSCAPE** is the primary CTA. First add/reorder/volume change auto-persists.

### Scene loaded, no playback
Cards show ▶, empty progress bars, saved Volume and intensity positions.

### One or more categories playing
Playing cards show **glow border**, ⏸, and animating progress bars.

### No categories in scene
Empty list area; **ADD SOUNDSCAPE** is the primary CTA.

### Category with no track loaded
Track title area shows placeholder; **d20** enabled if intensity pool has tracks; ▶ enabled only when a track is loaded and paused.

### Selected intensity has no tracks
**d20** and **▶** disabled (greyed); intensity toggles for empty levels greyed out. Volume slider still adjustable.

### Session Lock ON
**ADD SOUNDSCAPE**, drag-reorder, and delete (🗑 / swipe) **disabled but visible**. Playback, **d20**, ▶/⏸, intensity, Master Volume, mute, and **Play Scene** remain enabled.

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

---

## Edge Cases & Constraints

- **10 playing-category cap** — silent oldest-stop; paused categories do not count toward cap
- **Mute scope** — Master mute affects soundscapes only; FX on Soundboard tab unaffected
- **No Import** in Add Soundscape picker — Library / Category Composer only
- **Track count label** — `(N TRACKS)` reflects all intensity levels combined
- **Tab labels** — **Soundscapes / Soundboard** everywhere (not Atmospheres / One-Shots & SFX)

---

## Accessibility Checklist

- [ ] Interactive elements have visible label or `aria-label`
- [ ] Click/touch targets at least **44 × 44 px**
- [ ] Text contrast **WCAG AA** (4.5:1 body, 3:1 large)
- [ ] Focus order matches reading order; visible focus rings
- [ ] Playing state communicated by glow **and** ⏸ icon — not colour alone
- [ ] Sliders announce value (label + `aria-valuenow`)
- [ ] Disabled d20/▶ when pool empty — state exposed to assistive tech
- [ ] Dialogs trap focus and restore on close
