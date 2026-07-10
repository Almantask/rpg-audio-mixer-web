# Current Session (Home) — Screen Design

**Design References:**
- [`docs/designs/Home.html`](../../docs/designs/Home.html)
- [`docs/designs/Home.png`](../../docs/designs/Home.png)
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)

---

## Purpose

The Current Session screen is the app's entry point. It gives the GM a quick-access dashboard to their active campaign and highlights recently played scenes and top atmospheres without requiring deep navigation.

**Sidebar nav item:** Current Session (active on this screen)

---

## App Shell

All screens share the FE web layout:

```
┌──────────────────────────────────────────────────────────────────────┐
│ [☰]              Alchemist's Console                    [⚙️]        │
├───┬──────────────────────────────────────────────────────────────────┤
│ T │  ┌────────────────────────────────────────────────────────────┐  │
│ h │  │  Hero banner — Active Campaign                             │  │
│ e │  └────────────────────────────────────────────────────────────┘  │
│   │  ┌──────────────────────┐  ┌─────────────────────────────────┐  │
│ T │  │  Resume Journey      │  │  Top Atmospheres                │  │
│ o │  └──────────────────────┘  └─────────────────────────────────┘  │
│ m │                                                                  │
│ e │                                                                  │
└───┴──────────────────────────────────────────────────────────────────┘
```

### Top Bar (`NavigationMenu` region)
- **Hamburger menu** (left) — toggles sidebar collapse on narrow viewports
- **"Alchemist's Console"** — centred, italic gold serif (`Cinzel` / `Playfair`)
- **⚙️ Settings gear** (right) — navigates to Arcane Settings

### Left Sidebar — "The Tome" (`Sidebar`)
| Item | Icon | Route |
|---|---|---|
| **Current Session** *(active)* | Theater / book | `/` |
| Sound Library | Music note | `/library/soundscapes` |
| Global Mixer | Sliders | `/mixer` |
| Ambience Presets | Mountain | `/scenes` |
| **SYSTEM** | — | section header |
| Vault | Chest | `/vault` |
| Arcane Settings | Gear + spark | `/settings` |

**Active state:** gold vertical bar on left edge, subtle gold background tint, gold text and icon.

**Theme:** dark charcoal background (`#0D0D0D`–`#121212`), gold accents (`#D4AF37` / `#EAB308`), serif headings, sans-serif body (`Inter`).

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  [Forest / campaign cover art — full-width hero]               │  │
│  │  ● ACTIVE CAMPAIGN                                             │  │
│  │  Shadows of the Weald                                          │  │
│  │  The party descends deeper into the ancient woods…             │  │
│  │                                    [ Enter Domain → ]          │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  🧭 Resume Journey                    🌬 Top Atmospheres             │
│  ┌─────────────────────┐              ┌──────────────────────────┐   │
│  │ [▶] The Howling     │              │ ☁ Ominous Fog   2:45 [▶]│   │
│  │     Crags           │              │   ═══◉═══════  -5:15     │   │
│  │ Ch.3 • Frostwind    │              ├──────────────────────────┤   │
│  │ ═══════◉════        │              │ 💧 Dripping Cav… 0:00 [▶]│   │
│  └─────────────────────┘              │   ═◉════════  -8:20     │   │
│  ┌─────────────────────┐              ├──────────────────────────┤   │
│  │ [▶] Sunken Temple   │              │ 🔥 Tavern Hearth 0:00 [▶]│   │
│  │ Side Quest • Coast  │              │   ═◉════════  -12:00    │   │
│  │ ═════◉══════        │              └──────────────────────────┘   │
│  └─────────────────────┘                                            │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Hero Banner (`Card` — full-width)
- Campaign cover art as background with dark gradient overlay
- **● ACTIVE CAMPAIGN** label — gold dot + uppercase sans-serif
- Campaign title — large white/gold serif
- Description snippet — subdued body text
- **Enter Domain →** — gold `Button` (default) → navigates to that campaign's Sessions list
- Always reflects the most recently played campaign (determined automatically — no manual "pin")

### Resume Journey Section
- Section header: compass icon + **Resume Journey** in gold serif
- Horizontal row of `Card` items (scrollable on narrow viewports)
- Each card shows:
  - Circular play `Button`
  - Scene title (e.g. "The Howling Crags")
  - Chapter / subtitle line (e.g. "Chapter 3 • Frostwind Mountains")
  - `Progress` bar showing session progress in gold
- Clicking play or card body → opens that scene's Active Scene screen and starts playback with a **~2–3 s fade-in**
- **Natural Volume Progression:** fade-in MUST follow a **Cubic ($x^3$) mapping** for natural hearing progression

### Top Atmospheres Section
- Section header: wind icon + **Top Atmospheres** in gold serif
- Vertical list of atmosphere rows (`Card` or list item)
- Each row: category icon, track name, elapsed time, mini `Slider` progress, remaining time, play `Button`
- Displays globally most-played loopable tracks (not limited to a single row)

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click **Enter Domain →** | Navigate to active campaign's Sessions list |
| Click Resume Journey card / play | Open Active Scene screen + begin playback (2–3 s fade-in) |
| Click Top Atmosphere play | Preview that loopable track inline |
| Click ⚙️ (top bar) | Navigate to Arcane Settings |
| Click sidebar item | Navigate to that section |

---

## States

### Normal state
Hero banner, Resume Journey cards, and Top Atmospheres list all populated.

### No active campaign
- Hero banner shows placeholder with prompt to create or open a campaign via Active Campaigns
- Resume Journey section hidden or shows prompt to start a campaign

### No scenes played yet
- Resume Journey shows placeholder prompting the GM to open a scene

### Empty Top Atmospheres
- Section shows "No atmospheres played yet" placeholder

---

## Navigation

| Destination | Trigger |
|---|---|
| Active Campaigns grid | Enter Domain → (when no campaign) or campaign management link |
| Campaign Sessions list | Enter Domain → |
| Active Scene (last scene, autoplay) | Resume Journey card / play |
| Arcane Settings | ⚙️ gear (top bar) or sidebar |
| Sound Library | Sidebar |
| Ambience Presets | Sidebar |
