# Credits — Screen Design

**Design References:**
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)
- **Companion:** [`trash-design.md`](trash-design.md) — deleted-item recovery (separate sidebar item)

---

## Purpose

The **Credits** screen provides app info, support links, and community portals — version, legal links, and ways to support development.

**Sidebar nav item:** Credits (active on this screen)

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See `home-design.md` for full shell spec.

- **Top bar:** hamburger — "Arcanum Audio" (no gear icon)
- **Sidebar:** Credits active (gold bar + tint)
- **Sidebar footer:** "Profile" section with avatar icon (optional)
- **FE sidebar navigation only (no tab bar)**

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  Credits                                                             │
│  App info, support links, and community.                             │
│                                                                      │
│  Support -------------------------------------------------           │
│  ┌─ Support Development ─┐  ┌─ Leave a Review ──────────────────┐   │
│  │ ☕ Support ongoing development. │  │ ⭐ Share feedback with other GMs.     │   │
│  │ [Buy the Devs a Coffee ☕]│  │ [Leave a Review ✍️]         │   │
│  └──────────────────────────┘  └─────────────────────────────────┘   │
│                                                                      │
│  Community          Legal                                            │
│  💬 Discord                 Terms of Service                         │
│  📧 Support Email           Privacy Policy                           │
│  </> GitHub Repository      Attributions                               │
│  📜 Patch Notes                                                      │
│                                                                      │
│  © 2024 Arcanum Audio. V 2.4.1.                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Page Header
- **Title:** "Credits" — large white serif
- **Subtitle:** "App info, support links, and community."

### Support Section
Section heading with horizontal rule extension.

#### Support Development (`Card`)
- Gold coffee cup icon in circle
- Body copy about supporting server costs and new sound libraries
- **Buy the Devs a Coffee** — gold `Button` (primary) with coffee icon → external tip/donation URL

#### Leave a Review (`Card`)
- Blue star icon in circle
- Body copy encouraging product reviews
- **Leave a Review** — secondary dark `Button` with scroll/quill icon → external review URL

### Community (`Card`)
Clickable link rows with external-link arrow:

| Link | Icon |
|---|---|
| Discord | Blue chat bubble |
| Support Email | @ / envelope |
| GitHub Repository | Code brackets |
| Patch Notes | Document |

Each opens the relevant URL in the browser or a new browser tab.

### Legal Links
Text links below Community:
- Terms of Service
- Privacy Policy
- Attributions

### Footer
- Copyright: **© 2024 Arcanum Audio. V 2.4.1.**

> **Not on this screen:** deleted-item recovery — use sidebar → **Trash** (`trash-design.md`).

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click **Buy the Devs a Coffee** | Open tip/donation URL in browser |
| Click **Leave a Review** | Open external review URL |
| Click community portal row | Open URL in a new browser tab |
| Click legal link | Open respective policy page |
| Click sidebar item | Navigate to that section |

---

## States

### Normal
Full content visible. No loading or empty states needed.

---

## Navigation

| Destination | Trigger |
|---|---|
| External browser | Community portals, legal links, support URLs |
| Trash | Sidebar → Trash |
| Home | Sidebar → Home |
| Any primary section | Sidebar |
