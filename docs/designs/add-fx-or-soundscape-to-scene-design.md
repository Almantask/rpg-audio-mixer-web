# Add FX or Soundscape to Scene — Screen Design

**Design References:**
- [`docs/designs/Add-Fx-Or-Soundscape-ToScene.html`](../../docs/designs/Add-Fx-Or-Soundscape-ToScene.html)
- [`docs/designs/Add-Fx-Or-Soundscape-ToScene.png`](../../docs/designs/Add-Fx-Or-Soundscape-ToScene.png)

---

## Purpose

A full-screen selection view that appears when the GM taps **ADD NEW SOUNDSCAPE** (from the Active Scene — Soundscapes tab) or **ADD NEW EFFECT** (from the Active Scene — Soundboard tab). It lets the GM browse their entire library and add items to the active scene one tap at a time.

The same screen layout is reused for both contexts:
- **Soundscape variant** — title "Imported Soundscapes", lists Soundscape Categories
- **FX variant** — lists FX tracks from the Sound Effects library

---

## Layout

```
┌─────────────────────────────────────┐
│  ←  Arcanum Audio              [⚙️]  │
├─────────────────────────────────────┤
│  Imported Soundscapes               │
│  Browse your collection of ancient  │
│  echoes and ethereal resonances…    │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ [img]  Weather           [+]  │  │
│  │        12 TRACKS  PLAYED 84×  │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ [img]  Interior          [+]  │  │
│  │        8 TRACKS   PLAYED 142× │  │
│  └───────────────────────────────┘  │
│  ┌── already in scene ───────────┐  │
│  │ [img]  Combat            [⚡] │  │
│  │        24 TRACKS  PLAYED 310× │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ [img]  Monsters          [+]  │  │
│  │        15 TRACKS  PLAYED 67×  │  │
│  └───────────────────────────────┘  │
│  …                                  │
│                                     │
│  ┌── Footer card ────────────────┐  │
│  │  Need a custom resonance?     │  │
│  │  Summon a new soundscape…     │  │
│  │  [    IMPORT NEW    ]         │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│  🏰 HOME  📖 CAMPAIGNS  🖼 SCENES  🎵 LIBRARY │
└─────────────────────────────────────┘
```

---

## Components

### Top Bar
- Back arrow → returns to the Active Scene screen that launched this view
- App logo / wordmark centred
- ⚙️ gear icon top-right

### Screen Heading
- Large serif title: **"Imported Soundscapes"** (or equivalent for FX variant)
- Subtitle in small text: flavour copy describing the library

### Category / Track Row (repeating)
| Element | Description |
|---|---|
| Thumbnail | Category art or track artwork |
| Name | Category or FX name in gold italic serif |
| Track count | "N TRACKS" |
| Play count | "PLAYED N TIMES" |
| **+ button** | Tapping instantly adds this item to the active scene; no confirm step required |
| **Already-added indicator** | When the item is already in the scene, the + button is replaced by a distinct icon (e.g. lightning bolt ⚡) marking it as active/in-use — it is **not** tappable again |

> **Empty categories are hidden.** Soundscape Categories that contain **zero tracks** (no tracks at any intensity level) are excluded from this list entirely. They do not appear as rows — only categories with at least one track are shown.

### Footer Card
- Flavour headline: *"Need a custom resonance?"*
- Subtitle: *"Summon a new soundscape category from your scrolls."*
- **IMPORT NEW** button:
  - In the Soundscape variant → opens the device's native file picker; on file selection, creates a new soundscape and navigates to the Soundscape Category Composer
  - In the FX variant → opens the device file picker; on file selection, adds the imported track to the FX library and back to this list

### Bottom Navigation Bar
- 🎵 LIBRARY tab is highlighted (this screen flows from the Library's category system)

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Tap **+** on a row | Immediately adds that item to the active scene; + changes to the already-added indicator |
| Tap already-added indicator | No action — item is already in the scene |
| Tap **IMPORT NEW** | Opens device file picker (audio files only) |
| Tap back arrow | Returns to Active Scene (Soundscapes or Soundboard tab, depending on which launched this view) |
| Tap ⚙️ | Navigate to Credits screen |

### Single-tap add (no confirm)
There is no explicit "Done" or "Confirm" button. Each **+** tap is instant and non-destructive — the GM can add however many items they want, then tap back to return to the scene.

### Already-in-scene indicator
Categories or FX tracks that have already been added to the current scene show a distinct visual indicator in place of the + button. This prevents duplicate additions and provides clear feedback about what is already active.

---

## States

### Normal
Full list of all library items (excluding empty categories — those with zero tracks) with + buttons. Already-added items show the indicator icon.

### All items already added
All rows show the indicator, no + buttons. Footer card still available for import.

### Empty library (or all categories empty)
No rows shown. Footer card with **IMPORT NEW** as the primary CTA. This state also applies when all existing categories have zero tracks.

---

## Navigation

| Destination | Trigger |
|---|---|
| Active Scene — Soundscapes tab | Back arrow (launched from Soundscapes) |
| Active Scene — Soundboard tab | Back arrow (launched from Soundboard) |
| Device file picker (OS overlay) | IMPORT NEW button |
| Credits | ⚙️ gear icon |
