# Credits ("Behind the Screen") — Screen Design

**Design References:**
- [`docs/designs/Credits.html`](../../docs/designs/Credits.html)
- [`docs/designs/Credits.png`](../../docs/designs/Credits.png)

---

## Purpose

The Credits screen provides info about the app, its creators, and external links. It doubles as the only "Settings"-adjacent screen in the app. Reached by tapping the ⚙️ gear icon on any screen.

---

## Layout

```
┌─────────────────────────────────────┐
│  ← ARCANUM AUDIO               [⚙️]  │
├─────────────────────────────────────┤
│  Behind the Screen                  │
│  The scribes and sorcerers...       │
│                                     │
│  [ 🗑️ VAULT OF ECHOES ]              │
│  ┌───────────────────────────────┐  │
│  │ Arcanum Audio is a labor of...│  │
│  └───────────────────────────────┘  │
│                                     │
│  [Author Card]     [Version Card]   │
│                                     │
│  ─── CONNECT WITH THE GUILD ─────   │
│  📄  Tome of Knowledge (Docs)       │
│  💬  The Discord Tavern             │
│  ✉️   Summon via Email               │
│                                     │
│  "The music is the magic..."        │
│  © 2024 Arcanum Systems             │
├─────────────────────────────────────┤
│  🏰 HOME  📖 CAMPAIGNS  🖼 SCENES  🎵 LIBRARY │
└─────────────────────────────────────┘
```

---

## Components

### Top Bar
- Back arrow → returns to whichever screen the user came from
- Screen title "Behind the Screen"
- ⚙️ gear icon (present but navigates to self — no-op or scrolls to top)

### App Identity & Header
- Screen title "Behind the Screen" and descriptive subtitle.

### Support Section (Bento Highlight)
- **VAULT OF ECHOES**
  - Navigates to the Trash screen to restore soft-deleted categories or scenes. Replaces the former 'RESTORE RECENT DELETES' button.
- A card expressing gratitude to the users ("labor of passion").

### Author & App Info Grid
- **Author Card**: Shows the Lead Developer ("The Arch-Mage").
- **Version Card**: Shows the current version and codename ("Chronicle").

### Links Section
Each link is a tappable row that opens the relevant URL or email in the appropriate OS handler:

| Link | Behaviour |
|---|---|
| Tome of Knowledge (Docs) | Opens docs URL in browser |
| The Discord Tavern | Opens Discord invite link in browser or Discord app |
| Summon via Email | Opens email client with pre-filled address |

### Footer
- Stylised quote and copyright text.

### Bottom Navigation Bar
- The tab that was previously active remains active (Credits is a modal-style overlay in the navigation hierarchy, not a new tab)

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Tap back arrow | Return to previous screen |
| Tap VAULT OF ECHOES | Navigate to Trash screen |
| Tap Documentation link | Open in device browser |
| Tap Discord link | Open Discord (app or browser) |
| Tap email link | Open device email client |
| Tap bottom nav tab | Switch to that section (back stack cleared to tab root) |

---

## States

### Normal
Full content visible. No loading or empty states needed.

---

## Navigation

| Destination | Trigger |
|---|---|
| Previous screen | Back arrow |
| Trash screen | VAULT OF ECHOES |
| External browser | Documentation or Discord link |
| Email client | Contact/email link |
