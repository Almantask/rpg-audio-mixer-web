# Campaigns — Screen Design

**Design References:**
- [`docs/designs/Campaigns.html`](../../docs/designs/Campaigns.html)
- [`docs/designs/Campaigns.png`](../../docs/designs/Campaigns.png)

---

## Purpose

The Campaigns screen lists all the GM's campaigns. It is the primary entry point when the GM wants to jump into a specific story arc they haven't recently played.

---

## Layout

```
┌─────────────────────────────────────┐
│  ← Campaigns                  [⚙️]  │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ [Hero Cover art]              │  │
│  │ Last Played                   │  │
│  │ Featured Campaign name        │  │
│  │ Description                   │  │
│  │              [RESUME]         │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ [Cover]  Campaign name        │  │
│  │          Last played          │  │
│  │          Description          │  │
│  │          [RESUME]             │  │
│  └───────────────────────────────┘  │
│  …                                  │
│                                     │
│  [ + SCRIBE NEW TALE ]              │
├─────────────────────────────────────┤
│  🏰 HOME  📖 CAMPAIGNS  🖼 SCENES  🎵 LIBRARY │
└─────────────────────────────────────┘
```

---

## Components

### Top Bar
- Screen title "Campaigns" left-aligned with back arrow (when navigated to from elsewhere)
- ⚙️ gear icon top-right

### Campaign Card (repeating)
- Cover art thumbnail (user-selected from device photo library; placeholder illustration when none set)
- Campaign name in gold typography
- Last played date in subdued text
- **RESUME** button → navigates to that campaign's Sessions list
- ~~CURRENT badge~~ — removed; active campaign is determined automatically as most recently played

### Empty State
- Centred illustration (fantasy/scroll theme)
- Headline: *"No campaigns yet"*
- **Scribe New Tale** button → opens the new campaign creation flow

### New Campaign Button
- Persistent **+ NEW CAMPAIGN** at the bottom of the list (or FAB)
- Opens campaign creation flow: name, cover art selection

### Bottom Navigation Bar
- 📖 CAMPAIGNS tab is active

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Tap **RESUME** on a card | Navigate to that campaign's Sessions list |
| Tap campaign card body | Navigate to that campaign's Sessions list |
| Swipe right on card | Instantly removes the campaign |
| Tap **+ NEW CAMPAIGN** | Open new campaign creation screen/dialog |
| Tap ⚙️ | Navigate to Credits screen |

### Sorting
Campaigns are sorted by most recently played, descending. No manual sort or filter control.

### Cover Art
Tapping the cover art area (during creation or edit) opens the device's native photo picker.

---

## States

### Populated list
One card per campaign, sorted most recent first.

### Empty state
Illustration + "Scribe New Tale" CTA button.

### Creating a campaign
Inline or modal form: name input, optional cover art picker, confirm/cancel.

---

## Navigation

| Destination | Trigger |
|---|---|
| Campaign Sessions | Tap card or RESUME button |
| New campaign creation | + NEW CAMPAIGN / Scribe New Tale button |
| Credits | ⚙️ gear icon |
| Home tab | 🏰 bottom nav |
| Scenes tab | 🖼 bottom nav |
| Library tab | 🎵 bottom nav |
