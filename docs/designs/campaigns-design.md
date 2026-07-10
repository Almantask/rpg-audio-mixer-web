# Active Campaigns — Screen Design

**Design References:**
- [`docs/designs/Campaigns.html`](../../docs/designs/Campaigns.html)
- [`docs/designs/Campaigns.png`](../../docs/designs/Campaigns.png)
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)

---

## Purpose

The Active Campaigns screen lists all the GM's campaigns in a visual grid. It is reached from the Current Session dashboard (not a top-level sidebar item) when the GM wants to jump into a specific story arc or create a new campaign.

**Sidebar nav item:** Current Session (active — campaigns are a sub-view of session context)

---

## App Shell

Shared FE layout with left sidebar ("The Tome"). See `home-design.md` for full shell spec.

- **Top bar:** hamburger · "Alchemist's Console" · ⚙️
- **Sidebar:** Current Session active (gold bar + tint)
- **FE sidebar navigation only (no tab bar)**

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  Active Campaigns                                                    │
│  Manage your ongoing tales and orchestrate new adventures.           │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │ ┌ ─ ─ ─ │ │ [Cover]  │ │ [Cover]  │ │ [Cover]  │                │
│  │    +     │ │ Overview │ │          │ │          │                │
│  │ Scribe   │ │ Map Lore │ │ Campaign │ │ Campaign │                │
│  │ New Tale │ │ …        │ │ name     │ │ name     │                │
│  └──────────┘ │ desc…    │ │ desc…    │ │ desc…    │                │
│               │ Sess 14  │ │ Sess 5   │ │ Sess 22  │                │
│               │ [Resume] │ │ [Resume] │ │ [Resume] │                │
│               └──────────┘ └──────────┘ └──────────┘                │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Page Header
- **Title:** "Active Campaigns" — large gold serif
- **Subtitle:** "Manage your ongoing tales and orchestrate new adventures." — subdued sans-serif

### Campaign Card (`Card` — repeating, horizontal grid)
- Cover art as card background with gradient overlay
- Campaign title in gold serif
- Description snippet (truncated)
- Session count label (e.g. "Session 14")
- **Resume** — gold `Button` (default) → navigates to that campaign's Sessions list
- Clicking card body (outside Resume) → same navigation as Resume
- ~~CURRENT badge~~ — removed; active campaign is determined automatically as most recently played

#### Campaign Card Chrome (optional sub-nav tabs)
Some campaign cards display an embedded tab strip for future campaign-management features:
- **Overview · Map · Lore · Party · Quests · Settings**
- Document as decorative / forthcoming chrome — audio playback is not gated on these tabs
- Tabs are part of the card visual, not global navigation

### Scribe New Tale Card (`Card` — dashed border)
- Dashed gold border, centred **+** icon
- Label: **Scribe New Tale**
- Opens campaign creation flow: name, cover art selection

### Empty State
- Only the Scribe New Tale card visible
- Centred illustration (fantasy/scroll theme) with headline *"No campaigns yet"*

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click **Resume** on a card | Navigate to that campaign's Sessions list |
| Click campaign card body | Navigate to that campaign's Sessions list |
| Click delete on card | Instantly removes the campaign (with confirmation if configured) |
| Click **Scribe New Tale** | Open new campaign creation screen/dialog |
| Click ⚙️ | Navigate to Arcane Settings |

### Sorting
Campaigns are sorted by most recently played, descending. No manual sort or filter control.

### Cover Art
Clicking the cover art area (during creation or edit) opens the browser image upload dialog.

---

## States

### Populated grid
One card per campaign plus Scribe New Tale card, sorted most recent first.

### Empty state
Scribe New Tale card + onboarding illustration.

### Creating a campaign
Inline or modal `Dialog`: name input, optional cover art picker, confirm/cancel.

---

## Navigation

| Destination | Trigger |
|---|---|
| Current Session dashboard | Sidebar → Current Session |
| Campaign Sessions | Click card or Resume button |
| New campaign creation | Scribe New Tale card |
| Arcane Settings | ⚙️ gear or sidebar |
