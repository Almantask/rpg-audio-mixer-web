# Vault of Echoes (Trash) — Screen Design

**Design References:**
- [`docs/designs/Trash.html`](../../docs/designs/Trash.html) *(if present)*
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)

---

## Purpose

The Vault of Echoes holds all soft-deleted items across the platform before permanent purge. It provides peace of mind against accidental deletion and a clear management interface for recently discarded campaigns, sessions, scenes, soundscapes, and FX tracks.

**Sidebar nav item:** Vault (active — under SYSTEM section)

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See `home-design.md` for full shell spec.

- **Sidebar:** SYSTEM section visible with **Vault** active (gold bar + tint)
- **FE sidebar navigation only (no tab bar)**

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  The Vault of Echoes                            [ EMPTY VAULT 🗑️ ]   │
│  Discarded spells and shattered atmospheres gather here in the dark. │
│  They linger for a fleeting moment before fading into the abyss…     │
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                 │
│  │ 💧    2 days │ │ 🪄    1 day  │ │ 📖    5 days │                 │
│  │ Whispering   │ │ Ember Swarm  │ │ Cursed Ch.IV │                 │
│  │ Depths       │ │              │ │              │                 │
│  │ ATMOSPHERE   │ │ SPELL        │ │ GRIMOIRE     │                 │
│  │ Deleted 5d   │ │ Deleted 6d   │ │ Deleted 2d   │                 │
│  │ [Restore][×] │ │ [Restore][×] │ │ [Restore][×] │                 │
│  └──────────────┘ └──────────────┘ └──────────────┘                 │
│                                                                      │
│  Artifacts cast into the Vault are permanently dissolved into the    │
│  ether after 7 cycles. This process cannot be reversed.              │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Page Header
- **Title:** "The Vault of Echoes" — large gold serif
- **Subtitle:** Lore-style copy — "Discarded spells and shattered atmospheres gather here in the dark. They linger for a fleeting moment before fading into the abyss entirely."
- **EMPTY VAULT** — red destructive outline `Button` with trash icon (top right)

### Vault Item Card (`Card` — grid, repeating)

| Element | Description |
|---|---|
| Type icon | Circular icon — drop (Atmosphere), wand (Spell), book (Grimoire), etc. |
| Countdown | "N days left" — **red text when urgent** (e.g. 1 day left) |
| Title | Item name in white serif |
| Type `Badge` | ATMOSPHERE (gold), SPELL (purple), GRIMOIRE (blue), etc. |
| Deletion timestamp | "Deleted N days ago" — subdued grey |
| **Restore** | Text `Button` with counter-clockwise arrow → moves item back to active library |
| **Purge** | Text `Button` with × icon in red → permanently deletes item |

### Footer Note
- Centred italic serif: *"Artifacts cast into the Vault are permanently dissolved into the ether after 7 cycles. This process cannot be reversed."*

### Empty State
- Centred visualization when vault is empty
- **Icon:** large gold trash/echo icon
- **Headline:** "The Vault is Quiet"
- **Instructional text:** "No echoes of the past linger here. Your journey continues with a clean slate."
- **Return** action → navigates to Ambience Presets or Current Session

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click **Restore** | Item returns to its original library/list |
| Click **Purge** | Permanent deletion after `AlertDialog` confirmation |
| Click **EMPTY VAULT** | Purges all items after destructive confirmation |
| Card hover | Subtle border brighten / ember glow (FE) |

### Retention Policy
- Items remain in Vault for **7 days** (7 cycles) before automatic permanent deletion
- Countdown displayed per card; urgent styling when ≤ 1 day remains

---

## States

### Populated vault
Horizontal grid of item cards with countdowns and actions.

### Empty vault
Quiet empty state with return CTA.

### Confirm purge / empty
`AlertDialog` (destructive variant) before irreversible actions.

---

## Colors & Theming

- Background: `#0D0D0D`–`#121212`
- Primary accents: gold `#D4AF37` / `#EAB308`
- Destructive: red for Purge, EMPTY VAULT, urgent countdown
- Type badges: colour-coded outlines per item category

---

## Navigation

| Destination | Trigger |
|---|---|
| Ambience Presets / Current Session | Empty state return; sidebar |
| Arcane Settings | Sidebar (Necromancy Protocol also offers restore shortcut) |
| Original item location | Restore action |
