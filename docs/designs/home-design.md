# Home — Screen Design

**Design References:**
- Mobile Home mockup (Jul 2026) — active campaign hero, top soundscape, top sound effect
- **Source of truth:** this document adapted for FE sidebar layout

---

## Purpose

The Home screen is the app's entry point. It surfaces three high-signal items at a glance — no deep navigation required:

1. **Current campaign** — the most recently played campaign (hero card with **Open Campaign**)
2. **Top Soundscape** — the globally most-played soundscape **category**
3. **Top Sound Effect** — the globally most-played soundboard effect

Resume Journey is **not** shown on Home — the Active Campaign hero already provides the primary re-entry path into the current campaign.

**Sidebar nav item:** Home (active on this screen)

---

## App Shell

All screens share the Arcanum Audio FE layout (sidebar + top bar). See shell spec below.

```
┌──────────────────────────────────────────────────────────────────────┐
│ [☰]                 Arcanum Audio                                      │
├──────────────────────────────────────────────────────────────────────┤
│ Home │  Active Campaigns                                                │
│ Camp │  ┌────────────────────────────────────────────────────────┐  │
│ Scene│  │  [Hero — current campaign cover art]                   │  │
│ Lib  │  │  Shadows of the Underdark                              │  │
│ Cred │  │  Session 14: The Whispering Gallery awaits…            │  │
│ Trash│  │                              [ Open Campaign ]          │  │
│      │  └────────────────────────────────────────────────────────┘  │
│      │                                                                  │
│      │  Top Soundscape              Top Sound Effect   (2-col @ lg)    │
│      │  ┌─────────────────────┐    ┌─────────────────────────────┐   │
│      │  │ Ominous Chant       │    │ Dragon Roar                 │   │
│      │  │ SOUNDSCAPE · LOOPABLE │    │ FX · SUDDEN                 │   │
│      │  │ [42 PLAYS]    [▶]   │    │ [128 PLAYS]           [▶]   │   │
│      │  └─────────────────────┘    └─────────────────────────────┘   │
│      │  (stacked single-column on narrow viewports)                   │
└──────────────────────────────────────────────────────────────────────┘
```

### Top Bar (`NavigationMenu` region)
- **Hamburger menu** (left) — toggles sidebar collapse on narrow viewports
- **"Arcanum Audio"** — centred app name, italic gold serif (`Cinzel` / `Playfair`); decorative star clusters optional on wide viewports
- **No gear icon** — Credits and Trash are sidebar items

### Left Sidebar (`Sidebar`)

| Item | Icon | Route |
|---|---|---|
| **Home** *(active)* | Home / castle | `/` |
| **Campaign** | Storybook | `/campaigns` |
| **Scenes** | Picture frame | `/scenes` |
| **Library** | Music note | `/library` |
| **Credits** | Scroll / quill | `/credits` |
| **Trash** | Trash can | `/trash` |

Full sidebar spec is in this document. See also [`credits-design.md`](credits-design.md) and [`trash-design.md`](trash-design.md).

**Active state:** gold vertical bar on left edge, subtle gold background tint, gold text and icon.

**Theme:** dark charcoal background (`#0D0D0D`–`#121212`), gold accents (`#D4AF37` / `#EAB308`), purple accent for Top Sound Effect (`#A855F7`), serif headings, sans-serif body (`Inter`).

---

## Layout — Main Content

Single-column stack on narrow viewports. From `lg` breakpoint upward, **Top Soundscape** and **Top Sound Effect** sit side-by-side in a two-column row below the full-width hero.

Max content width: `max-w-4xl` centred in the main pane — keeps cards readable on ultrawide displays.

---

## Components

### Section: Active Campaigns
- Section label: **Active Campaigns** — thin gold serif, left-aligned
- One hero `Card` only — always the most recently played campaign (automatic; no manual pin)

#### Hero Banner (`Card` — full-width)
| Element | Description |
|---|---|
| Background | Campaign cover art with dark gradient overlay |
| Title | Campaign name — large white/gold serif (e.g. "Shadows of the Underdark") |
| Subtitle | Session context line — subdued body (e.g. "Session 14: The Whispering Gallery awaits your party's next move.") |
| **Open Campaign** | Gold filled `Button` → navigates to that campaign's Sessions list |

---

### Section: Top Soundscape
- Section label: **Top Soundscape** — gold serif
- Single `Card` — globally most-played soundscape **category** (all-time play count aggregated per category)

| Element | Description |
|---|---|
| Category name | Primary title — serif (e.g. "Ominous Chant") |
| Type badges | `Badge` row: **SOUNDSCAPE** · **LOOPABLE** — muted gold outline |
| Play count | **N PLAYS** — gold-bordered pill (e.g. "42 PLAYS") |
| Preview controls | Circular gold `Button` (▶) + `Progress` bar with elapsed / total when previewing |
| Inline preview | Tapping ▶ plays the category's current/default loopable track without leaving Home |

Accent colour: gold throughout.

---

### Section: Top Sound Effect
- Section label: **Top Sound Effect** — gold serif
- Single `Card` — globally most-played soundboard effect (all-time trigger count)

| Element | Description |
|---|---|
| Effect name | Primary title — serif (e.g. "Dragon Roar") |
| Type badges | `Badge` row: **FX** · **SUDDEN** — purple outline |
| Cast count | **N PLAYS** — purple-bordered pill (e.g. "128 PLAYS") |
| Preview controls | Circular purple `Button` (▶) + short `Progress` bar for one-shot duration |
| Inline preview | Tapping → triggers a one-shot preview via Web Audio buffer pool |

Accent colour: purple (`#A855F7`) to distinguish from soundscape gold.

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click **Open Campaign** | Navigate to active campaign's Sessions list |
| Click **▶** on Top Soundscape | Inline preview of that category's loopable track |
| Click **▶** on Top Sound Effect | Inline one-shot preview of that FX |
| Click sidebar item | Navigate to that section (Home, Campaign, Scenes, Library, Credits, Trash) |

Playback on Home is **preview-only** — does not replace an already-playing Active Scene session in the background unless the user navigates to that scene.

---

## States

### Normal state
Hero plus Top Soundscape and Top Sound Effect cards populated with live data.

### No active campaign
- Hero shows centred empty illustration + prompt: "Create your first campaign" with CTA → Sidebar → **Campaign**
- Top Soundscape and Top Sound Effect hidden or show muted placeholders

### No soundscape play history
- Top Soundscape card shows: "No soundscapes played yet" with link → Sidebar → **Library**

### No soundboard play history
- Top Sound Effect card shows: "No sound effects played yet" with link → Sidebar → **Scenes** or **Library**

### Loading
- `Skeleton` placeholders for hero + two stat cards

### Error
- Scrollable error overlay per global error spec; partial data may still render

---

## Responsive Behaviour

| Viewport | Layout |
|---|---|
| `< lg` (mobile / narrow tablet) | Vertical stack: hero, then Top Soundscape, then Top Sound Effect |
| `= lg` (desktop / wide tablet) | Hero full-width; Top Soundscape + Top Sound Effect in 2-column grid |
| Sidebar collapsed | Main content expands; hamburger reveals sidebar overlay |

---

## Accessibility

- Section headings use semantic `<h2>`; card titles `<h3>`
- Play buttons: `aria-label="Preview {name}"`
- Progress bars: `aria-valuenow` / `aria-valuemin` / `aria-valuemax`
- Play count badges: visible text (not colour-only)
- Minimum touch target 44×44 px on Open Campaign and ▶ controls

---

## Navigation

| Destination | Trigger |
|---|---|
| Campaign list | Sidebar → Campaign, or hero empty-state CTA |
| Campaign Sessions list | Open Campaign |
| Library | Sidebar → Library |
| Scenes | Sidebar → Scenes |
| Credits | Sidebar → Credits |
| Trash | Sidebar → Trash |
