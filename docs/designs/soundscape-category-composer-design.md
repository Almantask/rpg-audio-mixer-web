# Soundscape Category Composer — Screen Design

**Design References:**
- [`docs/designs/Soundscape-Category-Composer.html`](../../docs/designs/Soundscape-Category-Composer.html)
- [`docs/designs/Soundscape-Category-Composer.png`](../../docs/designs/Soundscape-Category-Composer.png)

---

## Purpose

The Composer is where the GM assembles a Soundscape Category by combining multiple soundscapes, one per intensity level. Adding a new soundscape means importing an audio file from the device. Saving applies the composition globally — any scene using this category will immediately reflect the change.

---

## Layout

```
┌─────────────────────────────────────┐
│  ← [Category Name]             [⚙️]  │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │  Soundscape name      [🗑️]  │    │
│  │  Intensity: II              │    │
│  │  MIX  ════════◉═══════      │    │
│  │  [Track list: track1, ...]  │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │  Soundscape name      [🗑️]  │    │
│  │  Intensity: I               │    │
│  │  MIX  ═══◉═════════════     │    │
│  └─────────────────────────────┘    │
│  …                                  │
│                                     │
│  [ + INVOKE NEW SOUNDSCAPE ]        │
│                                     │
│  [ SAVE COMPOSITION ]               │
├─────────────────────────────────────┤
│  🏰 HOME  📖 CAMPAIGNS  🖼 SCENES  🎵 LIBRARY │
└─────────────────────────────────────┘
```

---

## Components

### Top Bar
- Back arrow → returns to Audio Library — Soundscapes tab
- Category name as title
- ⚙️ gear icon top-right

### Soundscape Card (repeating)
Each soundscape within the category has:

| Element | Description |
|---|---|
| Soundscape name | Editable text input for this soundscape |
| Delete button | A trash icon button to remove the soundscape from the category |
| Intensity level | Which intensity pool this soundscape belongs to (I, II, or III), presented as a segmented control |
| MIX slider | Per-soundscape relative volume; used in the Active Scene's multiplicative calculation. Uses **Cubic ($x^3$) mapping** for natural hearing progression. |
| Track list | Names of audio files associated with this soundscape |

### Add Soundscape Button
- **+ INVOKE NEW SOUNDSCAPE** — opens the device's native file picker, filtered to audio files only
- On file selection, a new soundscape is created using that file's name, default intensity I, default MIX 100%
- There is **no limit** on number of soundscapes

### Save Composition Button
- **SAVE COMPOSITION** — saves the entire category composition globally
- Changes are reflected everywhere this category is used — no per-scene versioning

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Tap **+ INVOKE NEW SOUNDSCAPE** | Opens device file picker; selected audio file becomes a new soundscape |
| Adjust a MIX slider | Changes that soundscape's relative volume (live preview if the category is currently in a playing scene) |
| Change intensity level on a soundscape | Reassigns that soundscape to a different intensity pool |
| Edit soundscape name | In-line text edit |
| Swipe right on the soundscape card | Removes a soundscape |
| Tap **SAVE COMPOSITION** | Persists the composition globally; navigates back or shows success confirmation |
| Tap back arrow | Returns to Soundscapes Library (prompts to save if unsaved changes) |
| Tap ⚙️ | Navigate to Credits screen |

---

## States

### New category (empty)
Empty soundscape list with **+ INVOKE NEW SOUNDSCAPE** and **SAVE COMPOSITION** as primary CTAs.

### One or more soundscapes present
Soundscapes displayed as cards, draggable to reorder.

### File picker open
Native OS picker overlay; composer screen waits behind it.

### Unsaved changes
Back navigation shows a discard-changes confirmation dialog.

---

## Navigation

| Destination | Trigger |
|---|---|
| Audio Library — Soundscapes tab | Back arrow (after save or discard confirm) |
| Device file picker (OS overlay) | + INVOKE NEW SOUNDSCAPE |
| Credits | ⚙️ gear icon |
