# Category Composer (Global Mixer) — Screen Design

**Design References:**
- [`docs/designs/Soundscape-Category-Composer.html`](../../docs/designs/Soundscape-Category-Composer.html)
- [`docs/designs/Soundscape-Category-Composer.png`](../../docs/designs/Soundscape-Category-Composer.png)
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)

---

## Purpose

The Category Composer (Global Mixer) is where the GM orchestrates elemental audio layers across intensity tiers. The GM balances Foundation, Atmosphere, and Incantation levels, manages active layers, and saves compositions globally — any scene using affected categories reflects changes immediately.

**Sidebar nav item:** Global Mixer (active on this screen)

---

## App Shell

Shared FE layout with left sidebar ("The Tome"). See `home-design.md` for full shell spec.

- **FE sidebar navigation only (no tab bar)**
- Main content area may use a lighter off-white panel (`#F5F5F0`) contrasting the dark sidebar

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  Category Composer                          [ Save Composition ✨ ]  │
│  Orchestrate and balance the elemental layers of your active session.│
│                                                                      │
│  ┌─ Level I ──────┐ ┌─ Level II ─────┐ ┌─ Level III ────┐           │
│  │ 💧 Foundation  │ │ 🌬 Atmosphere  │ │ ☀ Incantations │           │
│  │ Intensity ═◉══ │ │ Intensity ═══◉ │ │ Intensity ═◉══ │           │
│  │           45%  │ │           72%  │ │           15%  │           │
│  └────────────────┘ └────────────────┘ └────────────────┘           │
│                                                                      │
│  ◆ Current Layers                                    [ 2 Active ]    │
│  ┌─ Thunderous Downpour ────────────────────────────────────── [×] ┐ │
│  │ ⠿ [thumb] LVL II  Continuous · Wide Stereo  ════════◉══  75%  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌─ Howling Gorges ─────────────────────────────────────────── [×] ┐ │
│  │ ⠿ [thumb] LVL I   Dynamic · Binaural        ════◉══════  40%  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│  │              +  Invoke New Layer                                │ │
│  │   Browse the Grimoire to add more atmospheric elements…       │ │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Page Header
- **Title:** "Category Composer" — large serif
- **Subtitle:** "Orchestrate and balance the elemental layers of your active session."
- **Save Composition** — gold `Button` with wand icon (top right)

### Elemental Level Cards (`Card` — 3-column row)
Three tier cards representing intensity pools:

| Card | Icon | Label | Control |
|---|---|---|---|
| Level I | Water drop | Foundation | Intensity `Slider` |
| Level II | Wind | Atmosphere | Intensity `Slider` |
| Level III | Sun/sparkle | Incantations | Intensity `Slider` |

Each shows percentage readout. Sliders use **Cubic ($x^3$) mapping**.

### Current Layers Section
- Header: diamond icon + **Current Layers** + `Badge` "N Active"
- Layer cards (`Card` — repeating, draggable):

| Element | Description |
|---|---|
| Drag handle | Reorder layers in the stack |
| Thumbnail | Layer artwork with **LVL I/II/III** `Badge` |
| Title + subtitle | e.g. "Thunderous Downpour" / "Continuous · Wide Stereo" |
| Volume `Slider` | Per-layer mix; **Cubic ($x^3$) mapping** |
| Remove **×** | Removes layer from composition |

### Invoke New Layer (`Card` — dashed border)
- Centred **+** icon in circle
- **Invoke New Layer** title
- Description: "Browse the Grimoire to add more atmospheric elements to your composition."
- Opens layer picker / Sound Library browse

### Soundscape Card (per-category edit mode)
When editing a single category (navigated from Sound Library), each soundscape within the category retains:

| Element | Description |
|---|---|
| Soundscape name | Editable text input |
| Delete button | Remove soundscape from category |
| Intensity level | Segmented control (I, II, III) |
| MIX slider | Per-soundscape relative volume |
| Track list | Names of associated audio files |

### Add Soundscape
- **+ INVOKE NEW SOUNDSCAPE** — opens browser file picker (audio only)
- On selection: new soundscape created with file name, default intensity I, default MIX 100%
- No limit on number of soundscapes

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Adjust Elemental Level slider | Changes tier intensity for session-wide balance |
| Drag layer by handle | Reorders layers in Current Layers stack |
| Adjust layer volume slider | Changes layer mix (live preview if playing) |
| Click **×** on layer | Removes layer from composition |
| Click **Invoke New Layer** | Opens Grimoire / Sound Library layer picker |
| Click **+ INVOKE NEW SOUNDSCAPE** | Opens browser file picker (category edit mode) |
| Click **Save Composition** | Persists globally; success confirmation or navigate back |
| Click ⚙️ | Navigate to Arcane Settings |

Changes apply globally — no per-scene versioning.

---

## States

### New / empty composition
Elemental cards at defaults; Invoke New Layer as primary CTA.

### Layers present
Draggable layer cards with active count badge.

### File picker open
Browser file picker dialog; composer waits behind it.

### Unsaved changes
Navigation away shows discard-changes `AlertDialog`.

---

## Navigation

| Destination | Trigger |
|---|---|
| Sound Library | Sidebar or back navigation |
| Layer picker / Grimoire | Invoke New Layer |
| Browser file picker | Invoke New Soundscape |
| Arcane Settings | ⚙️ gear or sidebar |
