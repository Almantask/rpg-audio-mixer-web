# Add FX or Soundscape to Scene — Screen Design

**Design References:**
- [`docs/designs/Add-Fx-Or-Soundscape-ToScene.html`](../../docs/designs/Add-Fx-Or-Soundscape-ToScene.html)
- [`docs/designs/Add-Fx-Or-Soundscape-ToScene.png`](../../docs/designs/Add-Fx-Or-Soundscape-ToScene.png)
- **New source of truth:** FE sidebar layout (Jul 2026 redesign)

---

## Purpose

A selection view that appears when the GM clicks **Add Sound** / **Invoke New Layer** (from Active Scene) or adds items from the library context. It lets the GM browse their entire library and add items to the active scene one click at a time.

The same screen layout is reused for both contexts:
- **Soundscape variant** — lists Soundscape Categories
- **FX variant** — lists FX tracks from the Sound Effects library

**Sidebar nav item:** Current Session (active when launched from Active Scene) or Sound Library (when launched from library context)

---

## App Shell

Shared FE layout with left sidebar ("The Tome"). See `home-design.md` for full shell spec.

- **FE sidebar navigation only (no tab bar)**
- May render as a full-page view or `Sheet` / `Dialog` overlay within the main content area while sidebar remains visible

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  ← Back to Active Scene                                              │
│  Imported Soundscapes                                                │
│  Browse your collection of ancient echoes and ethereal resonances…   │
│                                                                      │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐│
│  │ [img]  Weather           [+]  │  │ [img]  Interior          [+]  ││
│  │        12 TRACKS  PLAYED 84×  │  │        8 TRACKS  PLAYED 142× ││
│  └───────────────────────────────┘  └───────────────────────────────┘│
│  ┌── already in scene ───────────┐  ┌───────────────────────────────┐│
│  │ [img]  Combat            [⚡] │  │ [img]  Monsters          [+]  ││
│  │        24 TRACKS PLAYED 310×  │  │        15 TRACKS PLAYED 67×  ││
│  └───────────────────────────────┘  └───────────────────────────────┘│
│                                                                      │
│  ┌─ Footer card ─────────────────────────────────────────────────┐   │
│  │  Need a custom resonance?                                     │   │
│  │  Summon a new soundscape category from your scrolls.            │   │
│  │  [    Import New    ]                                           │   │
│  └────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Back Link
- **← Back to Active Scene** — returns to the tab that launched this view (Atmospheres or Soundboard)

### Screen Heading
- Large serif title: **"Imported Soundscapes"** (or FX equivalent)
- Subtitle: flavour copy describing the library

### Category / Track Row (`Card` — repeating)

| Element | Description |
|---|---|
| Thumbnail | Category art or track artwork |
| Name | Category or FX name in gold italic serif |
| Track count | "N TRACKS" |
| Play count | "PLAYED N TIMES" |
| **+ button** | Clicking instantly adds item to active scene; no confirm step |
| **Already-added indicator** | Replaces + with distinct icon (e.g. ⚡) — not clickable again |

> **Empty categories are hidden.** Categories with **zero tracks** at all intensity levels are excluded from the list.

### Footer Card (`Card`)
- Flavour headline: *"Need a custom resonance?"*
- Subtitle: *"Summon a new soundscape category from your scrolls."*
- **Import New** `Button`:
  - Soundscape variant → browser file picker → new soundscape → Category Composer
  - FX variant → browser file picker → adds track to FX library

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click **+** on a row | Immediately adds item to active scene; + changes to already-added indicator |
| Click already-added indicator | No action |
| Click **Import New** | Opens browser file picker (audio files only) |
| Click back link | Returns to Active Scene (Atmospheres or Soundboard tab) |
| Click ⚙️ | Navigate to Arcane Settings |
| Click sidebar item | Navigate away (may prompt if unsaved additions pending) |

### Single-click add (no confirm)
No explicit "Done" button. Each **+** click is instant. GM navigates back when finished.

---

## States

### Normal
Full list with + buttons. Already-added items show indicator icon.

### All items already added
All rows show indicator; footer Import New still available.

### Empty library
No rows; footer card with Import New as primary CTA.

---

## Navigation

| Destination | Trigger |
|---|---|
| Active Scene — Atmospheres tab | Back link (launched from Atmospheres) |
| Active Scene — Soundboard tab | Back link (launched from Soundboard) |
| Category Composer | Import New (soundscape variant) |
| Browser file picker | Import New button |
| Arcane Settings | ⚙️ gear or sidebar |
