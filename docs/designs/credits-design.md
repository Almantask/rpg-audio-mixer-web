# Credits — Screen Design

**Design References:**
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)
- **Companion:** [`trash-design.md`](trash-design.md) — deleted-item recovery (separate sidebar item)
- **Shell:** [`platform-design.md`](platform-design.md) — six-item sidebar IA (Home, Campaign, Scenes, Library, Credits, Trash)

---

## Purpose

The **Credits** screen provides app info, support actions, and legal resources — version, support links, and in-app legal pages.

**Sidebar nav item:** Credits (active on this screen). User-facing label is **Credits** only — no "Behind the Screen" or "Arcane Settings" naming anywhere in the UI.

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See [`platform-design.md`](platform-design.md) for shell spec.

- **Top bar:** hamburger — "Arcanum Audio" (**no gear icon** — Credits is a primary sidebar destination)
- **Sidebar:** six primary items per platform IA; Credits active (gold bar + tint)
- **No profile sidebar footer** in MVP — static avatar placeholder only; no navigation (**PW-05**)
- **FE sidebar navigation only (no tab bar)**

---

## Layout — Main Content

Wide viewport (`≥ lg`) — Support cards side-by-side; Legal links below:

```
┌──────────────────────────────────────────────────────────────────────┐
│  Credits                                                             │
│  App info, support links, and legal.                                 │
│                                                                      │
│  Support -------------------------------------------------           │
│  ┌─ Support Development ─┐  ┌─ Leave a Review ──────────────────┐   │
│  │ ☕ Support ongoing development. │  │ ⭐ Share feedback with other GMs.     │   │
│  │ [Buy the Devs a Coffee ☕]│  │ [Leave a Review ✍️]         │   │
│  └──────────────────────────┘  └─────────────────────────────────┘   │
│                                                                      │
│  Legal                                                               │
│  Terms of Service                                                    │
│  Privacy Policy                                                      │
│  Attributions                                                        │
│                                                                      │
│  © {year} Arcanum Audio. V {version}.                                │
└──────────────────────────────────────────────────────────────────────┘
```

Narrow viewport (`< lg`) — Support cards and Legal section stack vertically:

```
┌──────────────────────────────────────┐
│  Credits                             │
│  App info, support links, and legal. │
│                                      │
│  Support -------------------------   │
│  ┌─ Support Development ─────────┐   │
│  │ [Buy the Devs a Coffee ☕]    │   │
│  └───────────────────────────────┘   │
│  ┌─ Leave a Review ──────────────┐   │
│  │ [Leave a Review ✍️]           │   │
│  └───────────────────────────────┘   │
│                                      │
│  Legal                               │
│  Terms of Service                    │
│  Privacy Policy                      │
│  Attributions                        │
│                                      │
│  © {year} Arcanum Audio. V {version}.│
└──────────────────────────────────────┘
```

---

## Components

### Page Header
- **Title:** "Credits" — large white serif
- **Subtitle:** "App info, support links, and legal."

### Support Section *(MVP required)*
Section heading with horizontal rule extension. Both cards ship in v1.

#### Support Development (`Card`)
- Gold coffee cup icon in circle
- Body copy about supporting server costs and new sound libraries
- **Buy the Devs a Coffee** — gold `Button` (primary) with coffee icon → external tip/donation URL (**new tab**)

#### Leave a Review (`Card`)
- Blue star icon in circle
- Body copy encouraging product reviews
- **Leave a Review** — secondary dark `Button` with scroll/quill icon → external review URL (**new tab**)

### Legal Links
Text links in the Legal section. Each navigates to an **in-app route** in the **same tab**:

| Link | Route | Content |
|---|---|---|
| Terms of Service | `/legal/terms` | Static or markdown page |
| Privacy Policy | `/legal/privacy` | Static or markdown page |
| Attributions | `/credits/attributions` | See [Attributions page](#attributions-page) |

### Attributions page

In-app route reached from Credits → **Attributions**. Two sections on one scrollable page:

1. **Sound library attributions** — credits for bundled/purchased audio assets
2. **Open-source licenses** — third-party OSS dependencies and their license text

Rendered from markdown or static content; no external navigation required.

### Footer
- **Copyright year:** auto-updated from current date (e.g. © 2026)
- **Version:** injected from build metadata at compile time (e.g. `V 2.4.1`)
- Display format: **© {year} Arcanum Audio. V {version}.**

> **Not on this screen:** deleted-item recovery — use sidebar → **Trash** (`trash-design.md`).

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click **Buy the Devs a Coffee** | Open tip/donation URL in a **new browser tab** |
| Click **Leave a Review** | Open external review URL in a **new browser tab** |
| Click **Terms of Service** | Navigate to `/legal/terms` (same tab) |
| Click **Privacy Policy** | Navigate to `/legal/privacy` (same tab) |
| Click **Attributions** | Navigate to `/credits/attributions` (same tab) |
| Click sidebar item | Navigate to that section |

---

## States

### Normal
Full content visible. No loading or empty states needed on the main Credits screen.

### Attributions page
- **Loading:** `Skeleton` blocks for both attribution sections while content loads
- **Success:** Both sound-library and OSS sections rendered
- **Error:** Inline error message with retry; Credits screen remains reachable via back navigation or sidebar

---

## Responsive Behaviour

| Viewport | Layout |
|---|---|
| `< lg` (mobile / narrow tablet) | Support cards stack vertically; **Legal** section below Support (single column) |
| `≥ lg` (desktop / wide tablet) | Support cards side-by-side; **Legal** section below Support |
| Sidebar collapsed | Main content expands; hamburger reveals sidebar overlay |

---

## Accessibility

- Page title uses semantic `<h1>`; section headings `<h2>`
- External support links: visible external-link icon + `aria-label` indicating opens in new tab
- In-app legal links: standard link styling; no new-tab indicator
- Minimum touch target 44×44 px on support buttons and legal links
- Version footer: plain text (not colour-only)

---

## Navigation

| Destination | Trigger |
|---|---|
| External browser (new tab) | Buy Coffee, Leave a Review |
| Terms of Service | Credits → Legal → Terms (in-app, same tab) |
| Privacy Policy | Credits → Legal → Privacy (in-app, same tab) |
| Attributions | Credits → Legal → Attributions (in-app, same tab) |
| Trash | Sidebar → Trash |
| Home | Sidebar → Home |
| Any primary section | Sidebar (six items) |
