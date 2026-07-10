# Audio Library — Soundscapes Tab — Screen Design

**Design References:**
- [`docs/designs/AudioLibrary-Soundscape-Categories.html`](../../docs/designs/AudioLibrary-Soundscape-Categories.html)
- [`docs/designs/AudioLibrary-Soundscape-Categories.png`](../../docs/designs/AudioLibrary-Soundscape-Categories.png)

---

## Purpose

The Soundscapes tab of the Audio Library is the master catalogue of all Soundscape Categories the GM has created. From here the GM can review, edit, and organise their soundscape content. Editing a category opens the Soundscape Category Composer.

This screen is reached via the **🎵 LIBRARY** bottom nav tab.

---

## Layout

```
┌─────────────────────────────────────┐
│ [←] ARCANUM AUDIO              [⚙️]  │
├─────────────────────────────────────┤
│  Soundscape Library                 │
│  Select an atmospheric core...      │
├─────────────────────────────────────┤
│  [ FREE SOUNDSCAPES DEMO ]          │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ [Icon]                        │  │
│  │ Theme Label                   │  │
│  │ Category Name           [✏️]  │  │
│  │ I: 04    II: 02    III: 01    │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ [ +  NEW COMPOSITION ]        │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│  🏰 HOME 📖 SESSIONS 🖼 SCENES 🎵 LIB│
└─────────────────────────────────────┘
```

---

## Components

### Top App Bar
- **← Back Arrow:** Returns to the previous screen.
- App identity text ("Arcanum Audio").
- ⚙️ Settings icon top-right.

### Editorial Header
- Title "Soundscape Library"
- Description paragraph: "Select an atmospheric core to begin weaving your auditory tapestry..."

### Free Tracks Action Button 
*(Not pictured in HTML mock, but retained for feature parity)*
- A button to fetch the "100 Free Demo Soundscapes" allowing fast population of new categories.

### Bento Grid Categories
Soundscapes are visualised as large, immersive cards in a grid layout (columns scale by screen size).
- **Backgrounds:** Amber/coloured glow borders with a large, faded ghost icon in the bottom right (e.g., cloud, castle).
- **Theme Label:** Small uppercase category group identifier (e.g., Environment, Atmosphere).
- **Category Name:** Large italicized title.
- **Track Counts:** Displays track quantity per intensity Level (I, II, III). **Levels with zero tracks show their count dimmed / greyed out** to signal the GM that those intensities are unfilled and will be non-selectable during active scene playback.
- **Edit Button (✏️):** Located top-right, navigates to the Soundscape Category Composer.

### New Composition Card
- A visually distinct card with a dashed border at the end of the grid.
- Contains a large `+` icon.
- Tapping creates a new empty category and opens the Composer.

### Bottom Navigation Bar
- Active tab is 🎵 Library. Note the Sessions tab uses the `auto_stories` icon.

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Tap **✏️** on category | Navigate to Soundscape Category Composer (edit mode) |
| Tap Card Body | Navigate to Composer or load scenes (TBD by routing logic) |
| Tap **New Composition** | Prompt for name → open Soundscape Category Composer (new) |
| Tap **Free Soundscapes** | Initiates download of 100 demo tracks. Shows loading state |
| Tap ⚙️ | Navigate to Settings screen |

---

## States

### Populated list
Displays all categories as visually rich bento cards. Categories with all intensity levels at 0 tracks are still shown (so the GM can edit them), but their track counts are fully dimmed.

### Empty state
If no categories exist, only the "New Composition" card and "Free Soundscapes" button might be visible, along with an onboarding illustration if implemented.

---

## Navigation

| Destination | Trigger |
|---|---|
| Soundscape Category Composer | Tap ✏️ or card body |
| New category → Composer | New Composition card |
| Settings | ⚙️ gear icon |
| Previous Screen | Back arrow |
