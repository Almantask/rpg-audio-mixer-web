# Category Composer — Screen Design

**Design References:**
- **Parent screen:** [`audio-library-design.md`](audio-library-design.md) — Soundscapes tab
- **Add track modal:** Soundscapes modal (track picker — browse library + import)
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)

---

## Purpose

The **Category Composer** is where the GM organizes **tracks** into **intensity levels** for a soundscape category. Each level is a pool of tracks the Scene screen picks from at random when that intensity is active.

- Categories start with **one** intensity level
- GM can add up to **five** levels total
- **No volume mixing** here — balance is handled on the Scene screen (Master Volume × per-category Volume)
- Changes save **globally** — any scene using this category reflects updates immediately

**Sidebar nav item:** Library (Category Composer is a drill-down from Soundscapes tab)

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See `home-design.md` for full shell spec.

- **FE sidebar navigation only (no tab bar)**
- **Sidebar:** Library active
- Main content may use a lighter off-white panel (`#F5F5F0`) contrasting the dark sidebar

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  ← Library    Meteorological                    [ Save Composition ] │
│  Category Composer                                                   │
│  Assign tracks to intensity levels for this category.                │
│                                                                      │
│  ┌─ Level I ──────────────────────────────────────────────── [▼] ─┐ │
│  │  [ + Add track ]                                                 │ │
│  │  ┌ Thunderous Downpour ──────────────────────────────── [×] ─┐  │ │
│  │  │ Continuous · Wide Stereo · 3:42                            │  │ │
│  │  └────────────────────────────────────────────────────────────┘  │ │
│  │  ┌ Distant Rolling Thunder ──────────────────────────── [×] ─┐  │ │
│  │  │ Ambient · Stereo · 2:15                                    │  │ │
│  │  └────────────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─ Level II ─────────────────────────────────────────────── [▶] ─┐ │
│  │  (collapsed — 0 tracks)                                          │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - + │
│  │              +  Add intensity level                              │ │
│  └ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - + │
└──────────────────────────────────────────────────────────────────────┘
```

*(One intensity level per row. Expanded rows show **Add track** at the top of the track list, then tracks with **×** remove. Collapsed rows show level label + track count.)*

---

## Components

### Page Header
- **Back:** ← **Library** — returns to Soundscapes tab grid
- **Category name** — gold serif (e.g. *Meteorological*)
- **Title:** "Category Composer"
- **Subtitle:** "Assign tracks to intensity levels for this category."
- **Save Composition** — gold `Button` (top right)

### Intensity Level Row (`Card` — repeating, **one per row**)

Vertical stack of levels — **Level I** through **Level V** (roman numerals).

| Element | Description |
|---|---|
| Level label | **Level I**, **Level II**, … **Level V** |
| Track count | e.g. **2 tracks** when collapsed |
| Expand / collapse | Chevron **[▼]** expanded / **[▶]** collapsed — toggles track list visibility |
| Track list | Shown when expanded (see below) |

- New categories start with **Level I** only (expanded or collapsed — default **expanded** when empty)
- Levels are ordered I → V; Scene screen intensity toggles mirror levels that exist on the category

### Track List (inside expanded level)

| Element | Description |
|---|---|
| **Add track** | Full-width or prominent `Button` at the **top** of the list — opens **Soundscapes modal** (track picker) scoped to this intensity level |
| Track row | Track title + optional subtitle (format, duration); **×** remove `Button` on the trailing edge |
| Empty state | Only **Add track** visible — no placeholder tracks |

**Not in composer:** per-track volume sliders, MIX sliders, drag-to-reorder (unless added later), tier balance sliders.

### Add track → Soundscapes modal

Opens the **Soundscapes modal** (track picker):

- Browse existing soundscape **tracks** in the library and/or **Import Soundscape** (browser file picker — audio only)
- Selected tracks are added to the **current intensity level**
- Modal may support multi-select + confirm (same **Add Selected** pattern as other pickers)
- ← back returns to Category Composer with the same level still expanded

### Add intensity level (`Button` / dashed row)
- Full-width dashed row at the **bottom** of all level rows
- Label: **+ Add intensity level**
- Adds the next level in sequence (**Level II** after I, then III, IV, V)
- **Hidden or disabled** when the category already has **5** levels
- New level starts **empty**; GM adds tracks via **Add track**

### Remove track (**×**)
- Removes the track from **this intensity level** only (not global library delete)
- Confirmation optional if track exists only in this level

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click expand/collapse chevron | Shows or hides track list for that level |
| Click **Add track** | Opens Soundscapes modal; adds chosen tracks to this level |
| Click **×** on track | Removes track from this intensity level |
| Click **Add intensity level** | Appends next level (max 5); empty until tracks added |
| Click **Save Composition** | Persists level + track assignments globally |
| Click ← **Library** | Back to Soundscapes tab (unsaved-changes prompt if dirty) |

Changes apply globally — no per-scene versioning.

### Intensity level rules

| Rule | Detail |
|---|---|
| Starting count | **1** level (**Level I**) on new category |
| Maximum | **5** levels |
| Labels | Roman numerals **I** – **V** |
| Scene screen | Only levels with **≥ 1 track** are selectable; empty levels greyed out |
| Playback | Scene screen picks **at random** from tracks in the active level |

---

## States

### New category
Single **Level I** row; expanded; **Add track** as primary CTA; **Add intensity level** at bottom.

### One level, populated
Level I expanded with track rows and **×** remove buttons.

### Multiple levels
Stack of rows; any mix of expanded/collapsed; **Add intensity level** hidden at 5 levels.

### Maximum levels (5)
**Add intensity level** control not shown.

### Unsaved changes
Navigate away shows discard-changes `AlertDialog`.

### Soundscapes modal open
Composer visible behind modal; ← back restores expanded level context.

---

## Navigation

| Destination | Trigger |
|---|---|
| Library — Soundscapes tab | ← Library |
| Soundscapes modal (track picker) | **Add track** on any level |
| Browser file picker | Import path inside Soundscapes modal |
| Credits | Sidebar → Credits |
| Trash | Sidebar → Trash |

---

## Related screens

| Screen | Relationship |
|---|---|
| [`audio-library-design.md`](audio-library-design.md) | Parent grid; card click opens this composer |
| [`active-scene-soundscapes-design.md`](active-scene-soundscapes-design.md) | Scene playback uses levels + random track from active level |
| [`audio-library-soundscapes-modal-design.md`](audio-library-soundscapes-modal-design.md) | Category picker for Scene screen — distinct from composer **track** picker (same modal pattern family) |
