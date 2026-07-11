# Campaign Sessions — Screen Design

**Design References:**
- **New source of truth:** FE sidebar layout (inferred from Jul 2026 IA redesign)

---

## Purpose

Lists all play sessions belonging to a single campaign. The GM navigates here to open a session and access its associated scenes.

**Sidebar nav item:** Home (active — campaign sessions are drill-down from Campaign or Home)

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See `home-design.md` for full shell spec.

- **FE sidebar navigation only (no tab bar)**
- Breadcrumb or inline back link replaces former bottom-tab "Campaigns" entry

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  ← Active Campaigns                                                  │
│  [Campaign Name]                                                     │
│  Campaign Sessions                                                   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  [Campaign cover art — hero banner]                            │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐│
│  │ [Cover]  Session 14           │  │ [Cover]  Session 13           ││
│  │          The Howling Crags    │  │          Sunken Temple        ││
│  │          Mar 12 · 4 Scenes    │  │          Feb 28 · 3 Scenes    ││
│  └───────────────────────────────┘  └───────────────────────────────┘│
│                                                                      │
│  ┌ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +  │
│  │              +  Add New Session                                 │  │
│  └ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Breadcrumb / Back Link
- **← Active Campaigns** — returns to Active Campaigns grid (not a sidebar item)

### Page Header
- Campaign name — large gold serif
- **Campaign Sessions** subtitle — subdued uppercase or small caps

### Campaign Hero Banner (`Card`)
- Full-width campaign cover art with gradient overlay
- Optional campaign description snippet

### Session Card (`Card` — grid or list, repeating)
- Cover art thumbnail (user-selected from browser image upload; placeholder when none set)
- Session number label (e.g. "Session 14")
- Session name
- Date of session · scene count (e.g. "Mar 12 · 4 Scenes")
- Italicised session description snippet (optional)
- Clicking the card navigates to that session's Scene list

### Add New Session (`Card` — dashed border)
- Centred **+** icon
- **Add New Session** label
- Opens session creation flow: name, date, optional cover art

### Empty State
- Centred illustration
- Add New Session as primary CTA

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click a session card | Navigate to Session Scenes list |
| Click delete on card | Instantly removes the session |
| Click **Add New Session** | Open new session creation |
| Click ← Active Campaigns | Return to Active Campaigns grid |

### Sorting
Sessions sorted by date, most recent first. No manual sort or filter controls.

### Cover Art
Clicking cover art during creation or edit opens the browser image upload dialog.

---

## States

### Populated list
One card per session, most recent at top, plus Add New Session card.

### Empty state
Illustration + Add New Session CTA.

### Creating a session
`Dialog` or inline form: name input, date picker, optional cover art selection.

---

## Navigation

| Destination | Trigger |
|---|---|
| Active Campaigns | ← back link |
| Session Scenes | Click session card |
| New session creation | Add New Session |
| Credits | Sidebar → Credits |
| Trash | Sidebar → Trash |
| Home | Sidebar → Home |
