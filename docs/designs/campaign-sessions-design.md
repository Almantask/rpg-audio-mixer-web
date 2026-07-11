# Campaign Sessions — Screen Design

**Design References:**
- **Parent screen:** [`campaigns-design.md`](campaigns-design.md) — entry via **Resume** / **Start** (Container Transform)
- **Child screen:** [`session-scenes-design.md`](session-scenes-design.md) — uppercase breadcrumb trail reserved for Session Scenes depth
- **Trash:** [`trash-design.md`](trash-design.md) — soft-deleted sessions appear on **Sessions** tab (7-day retention)
- **New source of truth:** FE sidebar layout (Jul 2026 IA redesign)

---

## Purpose

Lists all play sessions belonging to a single campaign. The GM navigates here to open a session and access its associated scenes.

**Sidebar nav item:** Home (active — campaign sessions are drill-down from Campaign or Home)

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See [`platform-design.md`](platform-design.md) for shell spec.

- **FE sidebar navigation only (no tab bar)**
- **Sidebar:** Home active (gold bar + tint) when drilled into Campaign → Sessions
- **No explicit back link** on this screen — GM returns to Active Campaigns via **browser back** (history)
- **Container Transform** animation when entering from a campaign card on Active Campaigns or Home hero **Resume** CTA; campaign hero banner persists after transition

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Campaign Name]                                                     │
│  Campaign Sessions                                                   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  [Campaign cover art — hero banner]                            │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐│
│  │ [Cover]  Session 14  Last Act │  │ [Cover]  Session 13      ✏️ 🗑 ││
│  │          The Howling Crags    │  │          Sunken Temple        ││
│  │          Mar 12 · 4 Scenes    │  │          Feb 28 · 3 Scenes    ││
│  └───────────────────────────────┘  └───────────────────────────────┘│
│                                                                      │
│  ┌ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +  │
│  │              +  Add New Session                                 │  │
│  └ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +  │
└──────────────────────────────────────────────────────────────────────┘
```

*(2-column responsive grid on wide viewports; stacks to 1 column on narrow viewports.)*

---

## Components

### Page Header
- **Campaign name** — large gold serif
- **Campaign Sessions** subtitle — subdued uppercase or small caps

### Campaign Hero Banner (`Card`)
- Full-width campaign cover art with gradient overlay
- **Always visible** on Campaign Sessions screen for campaign context and cover-art continuity
- Optional campaign description snippet below or overlaid on banner

### Session Card (`Card` — repeating, **2-column grid**)

| Element | Description |
|---|---|
| **Cover thumbnail** | User-selected cover art (browser image upload); placeholder when none set |
| **Session number** | Auto-increment read-only label — e.g. **Session 14** (separate from name) |
| **Session name** | GM-chosen title — e.g. *The Howling Crags* |
| **Metadata** | **Date · scene count** — e.g. **Mar 12 · 4 Scenes** (always visible on populated cards) |
| **Description** | Optional italicised snippet when set |
| **Last Active** | Pulsing **Last Active** `Badge` on the most recently **opened** session card |
| **Edit** | ✏️ icon `Button` — opens session edit dialog |
| **Trash** | 🗑 icon `Button` — soft-deletes session → Trash **Sessions** tab |

- Action icon clicks do **not** navigate to Session Scenes
- Clicking the card body (outside action icons) navigates to that session's Scene list
- Cards render in a **2-column responsive grid** (1 column on narrow viewports)
- On touch/narrow viewports, **swipe-right** on a card is an alternative delete gesture (same flow as 🗑)

### Session numbering
- **Session N** label auto-increments per campaign (e.g. Session 1, Session 14)
- **Session name** is a separate field — not combined as "Session 14 – Title" only
- Both appear on the card: number label above or beside the name

### Add New Session (`Card` — dashed border)
- Centred **+** icon
- **Add New Session** label
- Opens session creation dialog

### Empty State
- Centred illustration (parchment / scroll)
- **Add New Session** as primary CTA (sole action when no sessions exist)

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click session card body | Navigate to Session Scenes list; marks session as **Last Active** |
| Click **✏️ Edit** | Open session edit `Dialog` — name, date, cover, optional description |
| Click **🗑 Trash** (or swipe-right on touch) | Opens `AlertDialog` confirmation; on confirm soft-deletes session → Trash **Sessions** tab (**PW-15**, **PW-16**, **PW-17 B**) |
| Swipe-right on card (touch/narrow) | Same flow as **🗑** — confirm then soft-delete |
| Click **Add New Session** | Open new session creation `Dialog` |
| Browser back | Return to Active Campaigns grid |

### Soft-delete
- Session soft-delete moves card to Trash **Sessions** tab with **7-day retention** (**PW-16**)
- **Always** show `AlertDialog` before soft-delete (**PW-17 B**)
- Restore from Trash returns session to this list

### Session creation (`Dialog`)

| Field | Required | Default / rules |
|---|---|---|
| **Session name** | Yes | Empty until GM enters (e.g. *The Howling Crags*) |
| **Session number** | Auto | Next increment — e.g. Session 15 (read-only in create flow) |
| **Date** | Yes | Defaults to **today**; **future dates allowed** (pre-planned sessions) |
| **Cover art** | No | Browser image upload; placeholder when unset |
| **Description** | No | Optional multiline text |

- **Create** / **Cancel** actions
- On success: new card appears in grid, sorted by date

### Session edit (`Dialog`)
- Same fields as creation — **all four** editable in MVP: rename, date, cover upload, optional description
- Opened via **✏️ Edit** icon or card overflow affordance
- Date changes re-sort the list (most recent first)

### Sorting
- Sessions sorted by **date**, most recent first
- **Last Active** badge is visual only — does not change sort order
- No manual sort or filter controls

### Cover art
- Set during session creation or via **Edit**
- Clicking cover area in the dialog opens browser image upload

---

## States

### Populated list
One card per session in 2-column grid (1 column narrow), sorted by date (most recent first), plus **Add New Session** card. **Last Active** badge on most recently opened session.

### Empty state
Illustration + **Add New Session** CTA.

### Creating a session
`Dialog` with name (required), date (required, default today), optional cover and description.

### Editing a session
Same `Dialog` prefilled with current values.

### Deleting a session
`AlertDialog` confirms before soft-delete. On confirm, session removed from list and appears on Trash **Sessions** tab with 7-day countdown.

### Loading
Skeleton `Card` placeholders in grid layout while sessions load.

### Error
Inline error or `Toast` if create/edit/delete fails; list state unchanged.

---

## Navigation

| Destination | Trigger |
|---|---|
| Active Campaigns | Browser back (no explicit ← back link on this screen) |
| Session Scenes | Click session card body |
| Session edit | ✏️ Edit icon |
| New session creation | **Add New Session** |
| Trash (restore) | Sidebar → Trash → **Sessions** tab |
| Credits | Sidebar → Credits |
| Home | Sidebar → Home |

**Entry paths:** Active Campaigns **Resume** / **Start** button, or Home hero **Resume** CTA — all land on this screen (sessions list only; no deep-link to last scene).

**Retired:** gear icon → Arcane Settings — settings live in sidebar **Credits** / **Trash** only.

---

## Accessibility

- [ ] Session cards, **✏️**, and **🗑** have visible labels or `aria-label`
- [ ] Delete `AlertDialog` traps focus; destructive confirm uses `Button` variant `destructive`
- [ ] **Last Active** badge includes text — not colour alone
- [ ] Date picker announces selected date; required field errors are associated with inputs
- [ ] 2-column grid reflows to single column without horizontal scroll on narrow viewports
