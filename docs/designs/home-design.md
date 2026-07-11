# Home — Screen Design

**Design References:**
- Mobile Home mockup (Jul 2026) — active campaign hero, top soundscape, top FX
- **Platform shell:** [`platform-design.md`](platform-design.md)
- **Prototype:** ASCII + markdown sufficient for MVP (no HTML prototype required)

**Open questions:** [home.md](open-questions/home.md) — all items resolved; decisions integrated below.

---

## Purpose

The Home screen is the app's entry point. It surfaces three high-signal items at a glance — no deep navigation required:

1. **Current campaign** — the most recently played campaign (hero card with **Resume**)
2. **Top Soundscape** — this GM's all-time most-played soundscape **category**
3. **Top FX** — this GM's all-time most-played soundboard effect

Resume Journey is **not** shown on Home — the Active Campaign hero is the sole re-entry path into the current campaign.

**Sidebar nav item:** Home (active on this screen)

---

## App Shell

All screens share the Arcanum Audio FE layout (sidebar + top bar). **Canonical shell spec:** [`platform-design.md`](platform-design.md). Abbreviated layout below.

```
┌──────────────────────────────────────────────────────────────────────┐
│ [☰]                 Arcanum Audio                                      │
├──────────────────────────────────────────────────────────────────────┤
│ Home │  Active Campaigns                                                │
│ Camp │  ┌────────────────────────────────────────────────────────┐  │
│ Scene│  │  [Hero — current campaign cover art]                   │  │
│ Lib  │  │  Shadows of the Underdark                              │  │
│ Cred │  │  Session 14: The Whispering Gallery awaits…            │  │
│ Trash│  │                              [ Resume ]          │  │
│      │  └────────────────────────────────────────────────────────┘  │
│      │                                                                  │
│      │  Top Soundscape              Top FX   (2-col @ lg)    │
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
- **No gear icon** — Credits and Trash are first-class sidebar items (PW-01, PW-04)

### Left Sidebar (`Sidebar`)

| Item | Icon | Route |
|---|---|---|
| **Home** *(active)* | Home / castle | `/` |
| **Campaign** | Storybook | `/campaigns` |
| **Scenes** | Picture frame | `/scenes` |
| **Library** | Music note | `/library` |
| **Credits** | Scroll / quill | `/credits` |
| **Trash** | Trash can | `/trash` |

Six primary sidebar peers — no profile footer in this iteration (PW-05). Full sidebar spec: [`platform-design.md`](platform-design.md). See also [`credits-design.md`](credits-design.md) and [`trash-design.md`](trash-design.md).

**Active state:** gold vertical bar on left edge, subtle gold background tint, gold text and icon.

**Theme:** dark charcoal background (`#0D0D0D`–`#121212`), gold accents (`#D4AF37` / `#EAB308`), purple accent for Top FX (`#A855F7`), serif headings, sans-serif body (`Inter`).

---

## Layout — Main Content

Single-column stack on narrow viewports. From `lg` breakpoint upward, **Top Soundscape** and **Top FX** sit side-by-side in a two-column row below the full-width hero.

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
| Subtitle | Session context line when session data exists — subdued body (e.g. "Session 14: The Whispering Gallery awaits your party's next move."); omit gracefully when the campaign has no sessions yet (H-F-03) |
| **Resume** | Gold filled `Button` → navigates to that campaign's **Sessions list** only (**PW-09**, **PW-32**); uses Container Transform expanding from the hero card (H-F-11) |

---

### Section: Top Soundscape
- Section label: **Top Soundscape** — gold serif
- Single `Card` — this GM's all-time most-played soundscape **category** (per-GM scope only; no cross-user analytics — H-02)

| Element | Description |
|---|---|
| Category name | Primary title — serif (e.g. "Ominous Chant") |
| Type badges | `Badge` row: **SOUNDSCAPE** · **LOOPABLE** — muted gold outline (H-F-02) |
| Play count | **N PLAYS** — gold-bordered pill (e.g. "42 PLAYS"); incremented on loop start in Active Scene only — Home preview taps do not count (H-03) |
| Preview controls | Circular gold `Button` (▶ / pause toggle) + `Progress` bar with elapsed / total while previewing (H-F-09) |
| Inline preview | Tapping ▶ plays the category's designated default track, or the first loopable track if no default is set (H-04); in-card only — no bottom mini player on Home (H-F-08) |

Accent colour: gold throughout.

---

### Section: Top FX
- Section label: **Top FX** — gold serif
- Single `Card` — this GM's all-time most-played soundboard effect (per-GM scope only — H-02)

| Element | Description |
|---|---|
| Effect name | Primary title — serif (e.g. "Dragon Roar") |
| Type badges | `Badge` row: **FX** · **SUDDEN** — purple outline (H-F-02) |
| Play count | **N PLAYS** — purple-bordered pill (e.g. "128 PLAYS"); uniform **PLAYS** label on both stat cards (PW-12) |
| Preview controls | Circular purple `Button` (▶ / pause toggle) + short `Progress` bar for one-shot duration (H-F-09) |
| Inline preview | Tapping ▶ triggers a one-shot preview via Web Audio buffer pool; in-card only — no bottom mini player on Home (H-F-08) |

Accent colour: purple (`#A855F7`) to distinguish from soundscape gold.

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click **Resume** | Navigate to active campaign's Sessions list via Container Transform from hero card |
| Click **▶** on Top Soundscape | Inline preview of that category's default/first loopable track; ▶ toggles play/pause; progress bar visible while playing |
| Click **▶** on Top FX | Inline one-shot preview of that FX; ▶ toggles play/pause; progress bar visible while playing |
| Click sidebar item | Navigate to that section (Home, Campaign, Scenes, Library, Credits, Trash) |

### Preview rules (H-01, H-08)
- **Blocked** while an Active Scene session is playing — prevents accidental disruption during live play
- **One preview at a time** — starting a new preview stops any other Home preview
- **Play/pause toggle** — ▶ becomes pause while preview is active
- **Navigate away** — preview stops when leaving Home
- **No mini player** — Home uses in-card controls only; bottom mini player remains Library-only

Playback on Home is **preview-only** — does not affect an already-playing Active Scene session.

---

## States

### Normal state
Hero plus Top Soundscape and Top FX cards populated with live data.

### No campaigns (empty hero)
- Hero shows centred empty illustration + prompt: **"Create your first campaign"**
- In-hero gold `Button` CTA → Campaign list (PW-10, H-F-10)
- **Top Soundscape and Top FX sections hidden entirely** — no muted placeholders (H-05)

### Campaign exists, no soundscape play history
- Top Soundscape card shows: **"No soundscapes played yet"** with tappable link → **Library** (H-F-01, H-F-06)
- Top FX section still shown per H-F-12

### Campaign exists, no soundboard play history
- Top FX card shows: **"No sound effects played yet"** with tappable link → **Library** only — not Scenes (H-06, H-F-01, H-F-06)
- Top Soundscape section still shown per H-F-12

### Campaign exists, neither stat has history
- Both stat sections visible with per-card empty placeholders and Library links (H-F-12)

### Loading
- `Skeleton` placeholders for hero + two stat cards (H-F-04)

### Error
- Scrollable error overlay per global error spec; partial hero/stat data may still render underneath (H-F-05)

### Offline
- Show last cached hero + stat-card data with a subtle stale/offline indicator (H-07)

---

## Responsive Behaviour

| Viewport | Layout |
|---|---|
| `< lg` (mobile / narrow tablet) | Vertical stack: hero, then Top Soundscape, then Top FX |
| `= lg` (desktop / wide tablet) | Hero full-width; Top Soundscape + Top FX in 2-column grid |
| Sidebar collapsed | Main content expands; hamburger reveals sidebar overlay |

---

## Accessibility

- Section headings use semantic `<h2>`; card titles `<h3>`
- Play buttons: `aria-label="Preview {name}"`
- Progress bars: `aria-valuenow` / `aria-valuemin` / `aria-valuemax`
- Play count badges: visible text (not colour-only)
- Minimum touch target 44×44 px on Resume and ▶ controls

---

## Navigation

| Destination | Trigger |
|---|---|
| Campaign list | Sidebar → Campaign, or empty-hero CTA **Create your first campaign** |
| Campaign Sessions list | **Resume** (hero CTA) |
| Library | Sidebar → Library; stat-card empty-state links |
| Scenes | Sidebar → Scenes |
| Credits | Sidebar → Credits |
| Trash | Sidebar → Trash |

---

## Resolved decisions

All open questions from [home.md](open-questions/home.md) are decided. Key references:

| ID | Decision |
|---|---|
| PW-01 | Six-item sidebar; no gear icon |
| PW-02 | Sidebar label **Credits** (no Arcane Settings in nav) |
| PW-04 | Credits and Trash are primary sidebar peers |
| PW-05 | Profile sidebar footer deferred post-MVP |
| PW-09 | Hero CTA label **Resume** |
| PW-10 | Empty hero copy **Create your first campaign** |
| PW-11 | Stat sections **Top Soundscape** / **Top FX** |
| PW-12 | Uniform **PLAYS** pill on both stat cards |
| PW-32 | Resume → Sessions list only (no deep-link to last scene) |
| PW-33 | Resume Journey card removed for MVP |
| PW-50 | ASCII + markdown sufficient; no HTML prototype |
| H-01 | Block Home previews during Active Scene playback |
| H-02 | Stats scoped to per-GM all-time history |
| H-03 | Soundscape play count = Active Scene loop start only |
| H-04 | Preview plays category default or first loopable track |
| H-05 | Hide stat sections when no campaigns exist |
| H-06 | FX empty-state link → Library only |
| H-07 | Offline: show cached data with stale indicator |
| H-08 | One preview at a time; play/pause toggle; stop on navigate away |
