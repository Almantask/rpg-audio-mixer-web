# Arcane Settings ("Behind the Screen") — Screen Design

**Design References:**
- [`docs/designs/Credits.html`](../../docs/designs/Credits.html)
- [`docs/designs/Credits.png`](../../docs/designs/Credits.png)
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)

---

## Purpose

The Arcane Settings screen (titled "Behind the Screen") provides app info, support links, recovery tools, and community portals. Reached via the ⚙️ gear icon (top bar) or the **Arcane Settings** sidebar item.

**Sidebar nav item:** Arcane Settings (active on this screen)

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See `home-design.md` for full shell spec.

- **Sidebar footer:** "ALCHEMIST PROFILE" section with avatar icon
- **FE sidebar navigation only (no tab bar)**

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  Behind the Screen                                                   │
│  The artifacts, incantations, and minds that forged this vessel…       │
│                                                                      │
│  ┌─ Necromancy Protocol (red gradient card) ──────────────────────┐  │
│  │ 📕 Did you accidentally banish a crucial soundscape…?          │  │
│  │                    [ Restore Recent Deletes ↺ ]                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Fuel the Forge ─────────────────────────────────────────────────    │
│  ┌─ Elixir of Wakefulness ─┐  ┌─ Leave a Mark ──────────────────┐   │
│  │ ☕ Keep the midnight oil… │  │ ⭐ A kind word in the town…     │   │
│  │ [Buy the Devs a Potion ☕]│  │ [Inscribe a Review 📜]         │   │
│  └──────────────────────────┘  └─────────────────────────────────┘   │
│                                                                      │
│  Community Portals          Legal                                  │
│  💬 Discord Tavern          Terms of the Pact (TOS)                  │
│  📧 Raven Carrier           Veil of Privacy Policy                   │
│  </> GitHub Repository      Attributions & Runes                     │
│  📄 Patch Notes & Lore                                               │
│                                                                      │
│  "In the spaces between silence, we craft the echoes…"               │
│  © 2024 Arcanum Audio. V 2.4.1.                            │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Page Header
- **Title:** "Behind the Screen" — large white serif
- **Subtitle:** "The artifacts, incantations, and minds that forged this vessel. Support the dark arts of development."

### Necromancy Protocol (`Card` — red gradient)
- Icon: red book with clock symbol
- **Title:** "Necromancy Protocol" — reddish-gold serif
- **Description:** Explains recovery of recently purged spells and atmospheres from local grimoire
- **Restore Recent Deletes** — dark red outline `Button` with ↺ icon → navigates to Vault of Echoes or triggers inline restore flow

### Fuel the Forge Section
Section heading with horizontal rule extension.

#### Elixir of Wakefulness (`Card`)
- Gold coffee cup icon in circle
- Body copy about supporting server costs and new sound libraries
- **Buy the Devs a Potion** — gold `Button` (primary) with coffee icon → external tip/donation URL

#### Leave a Mark (`Card`)
- Blue star icon in circle
- Body copy encouraging product reviews
- **Inscribe a Review** — secondary dark `Button` with scroll/quill icon → external review URL

### Community Portals (`Card`)
Clickable link rows with external-link arrow:

| Link | Icon |
|---|---|
| The Discord Tavern | Blue chat bubble |
| Raven Carrier (Support) | @ / envelope |
| GitHub Repository | Code brackets |
| Patch Notes & Lore | Document |

Each opens the relevant URL in the browser or new browser tab.

### Legal Links
Text links below Community Portals:
- Terms of the Pact (TOS)
- Veil of Privacy Policy
- Attributions & Runes

### Footer
- Italic serif quote: *"In the spaces between silence, we craft the echoes of worlds yet unseen."*
- Copyright: **© 2024 Arcanum Audio. V 2.4.1.**

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click **Restore Recent Deletes** | Navigate to Vault of Echoes |
| Click **Buy the Devs a Potion** | Open tip/donation URL in browser |
| Click **Inscribe a Review** | Open external review URL |
| Click community portal row | Open URL in in a new browser tab |
| Click legal link | Open respective policy page |
| Click ⚙️ (top bar) | No-op or scroll to top (already on settings) |
| Click sidebar item | Navigate to that section |

---

## States

### Normal
Full content visible. No loading or empty states needed.

---

## Navigation

| Destination | Trigger |
|---|---|
| Vault of Echoes | Restore Recent Deletes / sidebar → Vault |
| External browser | Community portals, legal links, support URLs |
| Current Session | Sidebar |
| Any primary section | Sidebar navigation |
