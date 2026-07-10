# Active Scene — Soundscapes Tab — Screen Design

**Design References:**
- [`docs/designs/ActiveScene-Soundscapes.html`](../../docs/designs/ActiveScene-Soundscapes.html)
- [`docs/designs/ActiveScene-Soundscapes.png`](../../docs/designs/ActiveScene-Soundscapes.png)

---

## Purpose

The primary scene-control screen during a game session. The Soundscapes tab lets the GM manage looping atmospheric categories: starting/stopping playback, adjusting volume, picking random tracks, and switching intensity levels.

---

## Layout

```
┌─────────────────────────────────────┐
│  ← [Scene Name]                [⚙️]  │
├─────────────────────────────────────┤
│  [Soundscapes]  |  [Soundboard]     │  ← tab strip
├─────────────────────────────────────┤
│  Master Atmosphere                  │
│  ════════════════◉═══════           │  ← Master slider
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Category name    [🎲] [▶/⏸]  │  │
│  │ Current track name            │  │
│  │ MIX  ════════◉════════        │  │
│  │ I ──────── II ──────── III    │  │  ← Intensity selector
│  └───────────────────────────────┘  │
│  ┌─ playing (glow border) ────────┐  │
│  │ Category name    [🎲] [⏸]    │  │
│  │ Current track name            │  │
│  │ MIX  ══════════◉══════        │  │
│  │ I ──────── II ──────── III    │  │
│  └───────────────────────────────┘  │
│  …                                  │
│                                     │
│  [ + ADD NEW SOUNDSCAPE ]           │
├─────────────────────────────────────┤
│  🏰 HOME  📖 CAMPAIGNS  🖼 SCENES  🎵 LIBRARY │
└─────────────────────────────────────┘
```

---

## Components

### Top Bar
- Back arrow → returns to previous screen (Scenes list or Session Scenes)
- Scene name as title
- **Session Lock Toggle** (🔒) → Disables destructive gestures (reordering, deleting) and scene switching to prevent accidents during live play.
- ⚙️ gear icon top-right → navigates to Credits

### Session Control Bar
- **Global Master Stop (Panic Button)**: A prominent button that immediately fades out all soundscapes and stops all sound effects.
- **Master Intensity Switcher (I, II, III)**: A global selector that updates the intensity level for *all* soundscape categories in the scene simultaneously. Includes descriptive labels (Calm, Tense, Climactic) beneath the roman numerals.

### Scene Notes
- Expandable markdown-capable text area for storing DM cues, descriptions, and reminders specific to the scene.

### Master Atmosphere Slider
- Full-width horizontal slider
- Controls the overall output volume for all soundscape categories
- Final volume per category = **Master × MIX** (multiplicative)
- **Natural Volume Progression**: Uses a **Cubic ($x^3$) mapping** for the volume scale to ensure a natural hearing progression.
- **Arcanum Motion**: Sliders use specific motion tokens for tactile feedback.
- Snaps instantly to saved value on scene load — no animation

### Soundscape Category Card (repeating)
Each category card contains:

| Element | Description |
|---|---|
| Category name | Displayed prominently |
| 🎲 d20 icon button | Picks a random track from this category and plays it immediately |
| ▶ / ⏸ button | Play or pause the current track |
| Current track name | Name of the track currently loaded/playing |
| MIX slider | Per-category relative volume; multiplicative with Master. Uses **Cubic ($x^3$) mapping**. |
| Intensity selector | Three-position toggle: **I · II · III** — changes which tracks are eligible to play. **Levels that contain no tracks are greyed out and non-selectable.** |

**Playing state:** the card shows a coloured glow / highlight border when audio is active.

**MIX slider snap:** snaps instantly to saved value on scene load.

### Drag-to-Reorder
Category cards can be long-pressed or dragged via a handle to reorder them. **Disabled when Session Lock is active.**

### Add New Soundscape Button
- **+ ADD NEW SOUNDSCAPE** at the bottom of the category list
- Opens the Soundscape Selection view (see below)

### Bottom Navigation Bar
- No tab is highlighted (Active Scene is not a tab-level screen)

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Drag Master slider | Adjusts overall output volume for all categories in real time |
| Tap 🎲 d20 | Picks a **random** track from that category's current intensity pool; starts playing |
| Tap ▶ | Plays a **random** track from that category's current intensity pool (or resumes the paused track if one exists) |
| Tap ⏸ | Pauses current track; card loses playing state |
| Drag MIX slider | Adjusts that category's relative volume in real time |
| Tap I / II / III (Global) | Updates all categories to the selected intensity. **Individual categories will crossfade if already playing.** |
| Tap I / II / III (Card) | Changes intensity level for that category specifically. |
| Drag card by handle | Reorders categories in the list. **Disabled if Session Lock is ON.** |
| Swipe right on card | Removes the category from the Scene. **Disabled if Session Lock is ON.** |
| Tap **+ ADD NEW SOUNDSCAPE** | Opens the Soundscape Selection overlay |

### Volume Formula
`Actual output = Master × MIX` for each category independently.

### Intensity Levels
- **I** = calm/ambient — least tense
- **II** = moderate tension
- **III** = climactic/dramatic — most tense
- The GM switches manually; there is no automatic trigger
- **If a level has no tracks assigned, its button is greyed out (visually dimmed, non-interactive).** The GM can only select levels that contain at least one track.
- **Seamless Intensity Transitions**: Switching between intensity levels (or triggering a new random track via d20/Next) requires a **Double-Buffer Player** setup to ensure a smooth **2-second crossfade** between the outgoing and incoming audio.
- **Equal-Power Crossfading**: All transitions use $sin/cos$ crossfade curves (instead of linear) to maintain constant perceived loudness during the transition.

### Random Track Selection
- When the GM taps ▶ or 🎲, the app picks a track **at random** from the current intensity pool.
- The d20 button always picks a fresh random track (even if one is currently playing).
- The ▶ button resumes the paused track if one exists; otherwise it picks a new random track.
- **MediaSession Control**: Tapping "Next" on external controls (lock screen, notification, Bluetooth) MUST trigger the **d20 randomization logic** for the currently prominent category.

### Soundscape Selection View (ADD NEW SOUNDSCAPE)
- A simplified overlay with:
  - Back button (closes overlay, returns to Active Scene)
  - Scrollable list of all Soundscape Categories from the Library
  - Multi-select: GM taps one or more categories to add them to the scene
  - Confirm/add button

---

## States

### Scene loaded, no playback
All category cards show ▶. No glow borders. Sliders at saved positions. Intensity levels without tracks are greyed out.

### One or more categories playing
Relevant cards show ⏸ and a coloured glow border.

### No categories in scene
Empty area + **+ ADD NEW SOUNDSCAPE** as the primary CTA.

### All intensities empty for a category
If a category has **no tracks at any intensity level**, its 🎲 and ▶ buttons are disabled. All three intensity toggles (I / II / III) are greyed out. The card remains visible with **MIX slider** still adjustable (so saved position is preserved), but no audio can play.

### Loading (scene opening)
Centred spinner until scene data is ready; sliders then snap to saved values.

### Error state
If an error occurs (e.g. audio file not found, playback failure), a **scrollable message box** appears as an overlay on the screen. The message box contains the error details and a dismiss button. It does not interrupt other categories that are playing successfully.

---

## Navigation

| Destination | Trigger |
|---|---|
| Soundboard tab | Tap "Soundboard" in tab strip |
| Soundscape Selection overlay | Tap + ADD NEW SOUNDSCAPE |
| Previous screen | Back arrow |
| Credits | ⚙️ gear icon |
