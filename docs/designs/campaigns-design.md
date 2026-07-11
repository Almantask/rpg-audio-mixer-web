# Active Campaigns — Screen Design

**Design References:**
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)
- **Platform shell:** [`platform-design.md`](platform-design.md)
- **Prototype:** ASCII + markdown sufficient for MVP — no HTML prototype required (PW-50)
- **Acceptance criteria:** `manage_campaigns.feature` is the canonical source of truth; merge unique scenarios from `campaign_crud.feature` then deprecate it (PW-49, C-F-07). ⚠️ This conflicts with `platform-wide.md` PW-49 Option A, which names `campaign_crud.feature` as canonical — reconcile with PO before merging or deprecating either file.

**Open questions:** [campaigns.md](open-questions/campaigns.md) — all items resolved; decisions integrated below.

---

## Purpose

The Active Campaigns screen lists all the GM's campaigns in a **vertical list** — **one full-width row per campaign**. It is the primary view for the **Campaign** sidebar item.

**Sidebar nav item:** Campaign (active on this screen)

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See [`platform-design.md`](platform-design.md) for shell spec.

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
│  │ [Cover]  Shadows of the Underdark                         🗑   │  │
│  │          A long-running descent into the underdark…            │  │
│  │          14 sessions                              [ Resume ]   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ [Cover]  Echoes of the Void                               🗑   │  │
│  │          Whispers from a shattered keep…                       │  │
│  │          5 sessions                               [ Resume ]   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ [Cover]  New Adventure                                    🗑   │  │
│  │          (no description)                                      │  │
│  │          0 sessions                                 [ Start ]  │  │
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
| **Cover thumbnail** | Square cover art on the left (fixed size, e.g. 80×80 px); tappable for cover edit (future — not navigation) |
| **Campaign title** | Gold serif (e.g. *Shadows of the Underdark*) |
| **Description** | Optional snippet collected at create; **max 2 lines** with ellipsis; **hidden when empty** (C-05, C-F-04) |
| **Sessions count** | Total sessions — e.g. **14 sessions**, **1 session**, **0 sessions** (muted label below description); live-updating (C-F-02, C-F-03) |
| **Resume / Start** | Gold `Button` (right-aligned) — see CTA rules below |
| **Trash** | Trailing 🗑 icon `Button` — soft-deletes campaign (PW-15) |

**CTA rules (C-03):**
- **Start** — shown when the campaign has **0 sessions** → navigates to that campaign's empty Sessions list
- **Resume** — shown when the campaign has **≥1 session** → navigates to that campaign's Sessions list

**Card interactivity (C-F-01):**
- Only the **Resume** / **Start** button navigates to Sessions
- Card body (title, description, sessions count) is **non-interactive** for navigation
- Cover thumbnail reserved for future cover-art edit affordance
- ~~CURRENT badge~~ — removed; active campaign is determined automatically as most recently played

**Delete affordance (PW-15):**
- Trailing **🗑 icon** on web/tablet
- **Swipe-right** on touch devices as an additional gesture
- Both trigger the same soft-delete flow

Cards stack vertically with consistent gap; **no horizontal grid** (C-06).

### Create Campaign Card (`Card` — dashed border, full-width row)
- Dashed gold border, centred **+** icon
- Label: **Create Campaign** (PW-10)
- Opens campaign creation flow (see below)
- Always shown **below** the campaign list (or alone when empty)

### Empty State
- Only the **Create Campaign** card visible
- Centred illustration with headline **"No campaigns yet"** (PW-10)

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click **Resume** or **Start** on a card | Navigate to that campaign's **Sessions list** only — no deep-link to last session/scene (PW-32, C-02); updates most-recently-played sort order (C-04); Container Transform animation on drill-down (C-F-08) — ⚠️ see [Known conflicts](#known-conflicts) |
| Click campaign card body | **No navigation** — body is non-interactive except cover (C-F-01) |
| Click **🗑 Trash** icon or swipe-right (touch) | Soft-delete campaign → Trash **Campaigns** tab; sessions orphaned/hidden from active UI (PW-16, C-F-05, [TR-03](open-questions/trash.md#tr-03)); **no** confirmation dialog on routine soft-delete — optional undo toast per platform rule (PW-17 Option A via [TR-02](open-questions/trash.md#tr-02)) |
| Click **Create Campaign** | Open create-campaign dialog (C-F-09) |

### Sorting
Campaigns sorted by **most recently played**, descending (C-04). Tapping **Resume** or **Start** updates MRU position — not only scene playback. No manual sort or filter control.

### Sessions count
- Reflects the **total number of sessions** belonging to the campaign (not the latest session number)
- Updates when sessions are added or removed
- Singular/plural enforced: **1 session** vs **N sessions** (C-F-02, C-F-03)

### Soft-delete & Trash
- Campaign soft-delete moves the card to Trash **Campaigns** tab with **7-day retention** (PW-16, C-F-05)
- Associated sessions are **orphaned/hidden** from active UI until the campaign is restored ([TR-03](open-questions/trash.md#tr-03), [PW-19](open-questions/platform-wide.md#pw-19))
- Restore from Trash returns the campaign and its sessions to active lists

### Cover Art
- Set during campaign creation (optional) or via future cover edit on the card thumbnail
- Clicking cover during create opens the browser image upload dialog

### Home cross-reference (C-F-11)
- Home hero CTA reads **Resume**; Campaign list uses **Resume** / **Start** — all navigate to the campaign's Sessions list (PW-32, PW-09)

---

## States

### Populated list
One row per campaign plus **Create Campaign** row at the bottom, sorted most recent first.

### Empty state
**Create Campaign** card + onboarding illustration; headline **"No campaigns yet"**.

### Creating a campaign (C-F-09, C-F-10)
- **Web/tablet:** modal `Dialog`
- **Mobile:** full-screen sheet
- Fields: **name** (required), **cover art** (optional upload), **description** (optional — C-F-04, C-05)
- **Create** confirms and adds the new row to the list
- **Cancel** closes the container with **no campaign created**; returns to prior list state (empty or populated) (C-F-10)
- Post-create edit (rename, cover, description) — **scope pending PO clarification on C-01** (answer recorded as Option A but only Option B text exists in source doc)

---

## Known conflicts

| ID | Conflict | Status |
|---|---|---|
| **PW-49** | This doc and `campaigns.md` name **`manage_campaigns.feature`** canonical; `platform-wide.md` PW-49 Option A names **`campaign_crud.feature`** | PO must pick one before merge/deprecate |
| **C-F-01 vs C-F-08** | Card body is non-interactive (C-F-01 **B**), but `screen_transitions.feature` triggers Container Transform on "tap on a campaign card" | PO must pick: allow card-body tap or rewrite animation trigger to **Resume**/**Start** button |
| **C-01** | Post-create edit scope ambiguous — answer is **A** but only Option B ("full edit in MVP") text is recorded | PO must confirm before authoring edit scenarios |

---

## Navigation

| Destination | Trigger |
|---|---|
| Home dashboard | Sidebar → Home |
| Campaign Sessions | **Resume** or **Start** button only |
| New campaign creation | **Create Campaign** card |
| Credits | Sidebar → Credits |
| Trash | Sidebar → Trash (includes soft-deleted campaigns on **Campaigns** tab) |
