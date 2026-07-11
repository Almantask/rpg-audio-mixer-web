# Active Campaigns — Screen Design

**Design References:**
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)

---

## Purpose

The Active Campaigns screen lists all the GM's campaigns in a **vertical list** — **one card per row**. It is the primary view for the **Campaign** sidebar item.

**Sidebar nav item:** Campaign (active on this screen)

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See `home-design.md` for full shell spec.

- **Top bar:** hamburger — "Arcanum Audio"
- **Sidebar:** Campaign active (gold bar + tint)
- **FE sidebar navigation only (no tab bar)**

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  Active Campaigns                                                    │
│  Manage your campaigns.                                              │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ [Cover]  Shadows of the Underdark                              │  │
│  │          A long-running descent into the underdark…            │  │
│  │          14 sessions                              [ Resume ]   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ [Cover]  Echoes of the Void                                    │  │
│  │          Whispers from a shattered keep…                       │  │
│  │          5 sessions                               [ Resume ]   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ [Cover]  Curse of Strahd                                       │  │
│  │          Gothic horror across Barovia…                         │  │
│  │          22 sessions                              [ Resume ]   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +  │
│  │              +  Create Campaign                                 │  │
│  └ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Page Header
- **Title:** "Active Campaigns" — large gold serif
- **Subtitle:** "Manage your campaigns." — subdued sans-serif

### Campaign Card (`Card` — repeating, **one per row**)

Full-width row layout:

| Element | Description |
|---|---|
| **Cover thumbnail** | Square cover art on the left (fixed size, e.g. 80×80 px) |
| **Campaign title** | Gold serif (e.g. *Shadows of the Underdark*) |
| **Description** | Truncated snippet — one or two lines max |
| **Sessions count** | Total sessions in this campaign — e.g. **14 sessions**, **1 session**, **0 sessions** (muted label below description) |
| **Resume** | Gold `Button` (right-aligned) → navigates to that campaign's Sessions list |

- Clicking the card body (outside **Resume**) → same navigation as **Resume**
- ~~CURRENT badge~~ — removed; active campaign is determined automatically as most recently played
- Cards stack vertically with consistent gap; no horizontal grid

### Create Campaign Card (`Card` — dashed border, full-width row)
- Dashed gold border, centred **+** icon
- Label: **Create Campaign**
- Opens campaign creation flow: name, cover art selection
- Always shown **below** the campaign list (or alone when empty)

### Empty State
- Only the **Create Campaign** card visible
- Centred illustration with headline *"No campaigns yet"*

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click **Resume** on a card | Navigate to that campaign's Sessions list |
| Click campaign card body | Navigate to that campaign's Sessions list |
| Click delete on card | Instantly removes the campaign (with confirmation if configured) |
| Click **Create Campaign** | Open new campaign creation screen/dialog |

### Sorting
Campaigns are sorted by most recently played, descending. No manual sort or filter control.

### Sessions count
- Reflects the **total number of sessions** belonging to the campaign (not the latest session number)
- Updates when sessions are added or removed
- Singular/plural: **1 session** vs **N sessions**

### Cover Art
Clicking the cover art area (during creation or edit) opens the browser image upload dialog.

---

## States

### Populated list
One row per campaign plus **Create Campaign** row at the bottom, sorted most recent first.

### Empty state
**Create Campaign** card + onboarding illustration.

### Creating a campaign
Inline or modal `Dialog`: name input, optional cover art picker, confirm/cancel.

---

## Navigation

| Destination | Trigger |
|---|---|
| Home dashboard | Sidebar → Home |
| Campaign Sessions | Click card or **Resume** button |
| New campaign creation | **Create Campaign** card |
| Credits | Sidebar → Credits |
| Trash | Sidebar → Trash |
