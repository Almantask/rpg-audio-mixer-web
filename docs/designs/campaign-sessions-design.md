# Campaign Sessions — Screen Design

**Design References:**
- [`docs/designs/CampaignSessions.html`](../../docs/designs/CampaignSessions.html)
- [`docs/designs/CampaignSessions.png`](../../docs/designs/CampaignSessions.png)

---

## Purpose

Lists all play sessions belonging to a single campaign. The GM navigates here to open a session and access its associated scenes.

---

## Layout

```
┌─────────────────────────────────────┐
│  ← [Campaign Name]             [⚙️]  │
├─────────────────────────────────────┤
│  [Campaign cover art — full width   │
│   hero banner]                      │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ [Cover]  Session name         │  │
│  │          Date  •  # Scenes    │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ [Cover]  Session name         │  │
│  │          Date  •  # Scenes    │  │
│  └───────────────────────────────┘  │
│  …                                  │
│                                     │
│  [ + ADD NEW SESSION ]              │
├─────────────────────────────────────┤
│  🏰 HOME  📖 CAMPAIGNS  🖼 SCENES  🎵 LIBRARY │
└─────────────────────────────────────┘
```

---

## Components

### Top Bar / Header
- Breadcrumb link "← Back to Campaigns"
- Campaign name as large screen title
- "Campaign Sessions" subtitle
- ⚙️ gear icon top-right

### Session Card (repeating)
- Cover art thumbnail (user-selected from device photo library; placeholder when none set)
- Session number label
- Session name
- Date of session
- Italicised session description snippet
- Tapping the card navigates to that session's Scene list

### Empty State
- Centred illustration
- **Add New Session** button

### Add New Session Button
- Persistent **+ ADD NEW SESSION** at the bottom of the list
- Opens session creation flow: name, date, optional cover art

### ~~FILTER button~~ — removed (no filtering needed; auto-sorted by date)

### Bottom Navigation Bar
- 📖 CAMPAIGNS tab remains active

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Tap a session card | Navigate to Session Scenes list |
| Swipe right on card | Instantly removes the session |
| Tap **+ ADD NEW SESSION** | Open new session creation |
| Tap back arrow | Return to Campaigns list |
| Tap ⚙️ | Navigate to Credits screen |

### Sorting
Sessions are sorted by date, most recent first. No manual sort or filter controls.

### Cover Art
Tapping the cover art area during creation or edit opens the device's native photo picker.

---

## States

### Populated list
One card per session, most recent at top.

### Empty state
Illustration + "Add New Session" CTA button.

### Creating a session
Inline or modal form: name input, date picker, optional cover art selection.

---

## Navigation

| Destination | Trigger |
|---|---|
| Session Scenes | Tap session card |
| New session creation | + ADD NEW SESSION |
| Campaigns list | Back arrow |
| Credits | ⚙️ gear icon |
# Empty state
Illustration + "Add New Session" CTA button.

### Creating a session
Inline or modal form: name input, date picker, optional cover art selection.

---

## Navigation

| Destination | Trigger |
|---|---|
| Session Scenes | Tap session card |
| New session creation | + ADD NEW SESSION |
| Campaigns list | Back arrow |
| Credits | ⚙️ gear icon |
