# Sound Library — Screen Design

**Design References:**
- [`docs/designs/AudioLibrary-Soundscape-Categories.html`](../../docs/designs/AudioLibrary-Soundscape-Categories.html)
- [`docs/designs/AudioLibrary-Soundscape-Categories.png`](../../docs/designs/AudioLibrary-Soundscape-Categories.png)
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)

---

## Purpose

The Sound Library is the master catalogue of all Soundscape Categories the GM has created. From here the GM can review, edit, and organise soundscape content. Editing a category opens the Category Composer (Global Mixer).

**Sidebar nav item:** Sound Library (active on this screen)

Sound Effects are accessed as a sub-view within Sound Library (see `audio-library-fx-design.md`).

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See `home-design.md` for full shell spec.

- **Sidebar footer:** user profile — avatar, name (e.g. "Grand Alchemist"), studio/campaign context
- **FE sidebar navigation only (no tab bar)**

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  Sound Library                              [ Filter ]  [ Search ]   │
│  Curate and compose your acoustic environments.                      │
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                 │
│  │ ┌ ─ ─ ─     │ │ ☁ Meteorolog.│ │ 🍺 Tavern &  │                 │
│  │    +         │ │ 2 active     │ │    Hearth    │                 │
│  │ New          │ │ Heavy Rain ══│ │ Crowd ══════ │                 │
│  │ Composition  │ │ Distant Thnd ═│ │ Crackling ═══ │                 │
│  └──────────────┘ └──────────────┘ └──────────────┘                 │
│  ┌──────────────┐ ┌────────────────────────────────────────────┐    │
│  │ ✨ Ethereal  │ │ 🐉 Creatures of the Deep (wide — 2 cols)   │    │
│  │ 2 active     │ │ Goblin ═══  │ Wolf ═════  │ Dragon ══ │ …  │    │
│  └──────────────┘ └────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Page Header
- **Title:** "Sound Library" — large gold serif
- **Subtitle:** "Curate and compose your acoustic environments."
- **Filter** — outline `Button` (top right)
- **Search** — gold `Button` (top right) → opens search/filter panel or `Command` palette

### Free Tracks Action Button
*(Retained for feature parity — may appear in header actions or empty state)*
- Fetches "100 Free Demo Soundscapes" for fast category population

### New Composition Card (`Card` — dashed border)
- Centred **+** icon
- **New Composition** title
- Description: "Blend categories to create a new master atmosphere."
- Clicking creates a new empty category and opens the Category Composer

### Category Card (`Card` — grid, repeating)
- Thematic icon (top-left)
- Category name — gold serif
- **N active layers** count
- Sample layer rows with inline `Slider` previews (e.g. "Heavy Rain", "Distant Thunder")
- **Edit** action → navigates to Category Composer
- Track counts per intensity (I, II, III) — **levels with zero tracks show count dimmed/greyed**

**Wide cards:** some categories (e.g. "Creatures of the Deep") span **2 columns** with a two-column layer grid.

### Bento Grid Behaviour
- Responsive grid; columns scale by viewport width
- Amber/gold accent borders with faded ghost icon in card background (optional)

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click **✏️** / edit on category | Navigate to Category Composer (edit mode) |
| Click category card body | Navigate to Category Composer |
| Click **New Composition** | Prompt for name → open Category Composer (new) |
| Click **Filter** / **Search** | Open filter/search UI |
| Click **Free Soundscapes** | Initiates download of 100 demo tracks; shows loading state |
| Click ⚙️ | Navigate to Arcane Settings |
| Navigate to Sound Effects | Sub-nav or library tab switch (within Sound Library context) |

---

## States

### Populated grid
All categories as rich cards. Categories with all intensity levels at 0 tracks still shown (counts dimmed).

### Empty state
Only New Composition card + Free Soundscapes button + optional onboarding illustration.

### Loading
`Skeleton` cards while library data loads.

---

## Navigation

| Destination | Trigger |
|---|---|
| Category Composer (Global Mixer) | Edit on category or New Composition |
| Sound Effects sub-view | Library navigation (see `audio-library-fx-design.md`) |
| Arcane Settings | ⚙️ gear or sidebar |
| Global Mixer | Sidebar |
