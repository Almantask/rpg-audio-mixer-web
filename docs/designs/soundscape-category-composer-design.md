# Category Composer — Screen Design

**Design References:**
- **Parent screen:** [`audio-library-design.md`](audio-library-design.md) — Soundscapes tab
- **Add track modal:** [`audio-library-soundscape-tracks-modal-design.md`](audio-library-soundscape-tracks-modal-design.md) — track picker (browse library + import)
- **New source of truth:** FE sidebar layout screenshots (Jul 2026 redesign)

---

## Purpose

The **Category Composer** is where the GM organizes **tracks** into **intensity levels** for a soundscape category. Each level is a pool of tracks the Scene screen picks from at random when that intensity is active.

- Every category has exactly **three** fixed intensity levels: **Level I**, **Level II**, **Level III** — always visible; no add/remove level controls (**CC-05**, **F-CC-01**)
- **Level-first model** — assign tracks to levels; no MIX sliders, elemental balance cards, or drag-to-reorder in composer (**PW-42**)
- **No volume mixing** here — balance is handled on the Scene screen (Master Volume × per-category Volume)
- Changes **auto-save** globally — any scene using this category reflects updates immediately
- **Duplicate tracks:** allowed **across** levels; **blocked within the same level** (**PW-45**)

**Sidebar nav item:** Library (Category Composer is a drill-down from Soundscapes tab)

---

## Information Architecture

| Item | Detail |
|---|---|
| **Route** | `/library/soundscapes/:categoryId/compose` — deep-linkable; browser back returns to Library Soundscapes grid |
| **Entry** | Library → Soundscapes tab → category card / **New Composition** |
| **Back** | ← **Library** returns to Soundscapes tab (no unsaved-changes discard prompt — auto-save) |

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See [`platform-design.md`](platform-design.md) for shell spec.

- **FE sidebar navigation only (no tab bar)**
- **Sidebar:** Library active
- **Dark-first** main content — same theme as the rest of the app (no light `#F5F5F0` panel exception)

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
│  │  │ MP3 · Stereo · 3:42                                         │  │ │
│  │  └────────────────────────────────────────────────────────────┘  │ │
│  │  ┌ Distant Rolling Thunder ──────────────────────────── [×] ─┐  │ │
│  │  │ WAV · Wide Stereo · 2:15                                    │  │ │
│  │  └────────────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─ Level II ─────────────────────────────────────────────── [▶] ─┐ │
│  │  (collapsed — 0 tracks)                                          │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─ Level III ────────────────────────────────────────────── [▶] ─┐ │
│  │  (collapsed — 0 tracks)                                          │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

*(Exactly three intensity level rows — **Level I · II · III**. Expanded rows show **Add track** at the top of the track list, then tracks with **×** remove. No **Add intensity level** control.)*

---

## Components

### Page Header
- **Back:** ← **Library** — returns to Soundscapes tab grid
- **Category name** — gold serif (e.g. *Meteorological*)
- **Title:** "Category Composer"
- **Subtitle:** "Assign tracks to intensity levels for this category."
- **Save Composition** — gold `Button` (top right); shows success `Toast` ("Composition saved") and user **remains on Composer**
- **No rename/delete** in composer header (pending decision — see Open Questions)

### Intensity Level Row (`Card` — repeating, **three rows**)

Vertical stack of **Level I**, **Level II**, and **Level III** (roman numerals).

| Element | Description |
|---|---|
| Level label | **Level I** · **Level II** · **Level III** |
| Track count | e.g. **2 tracks** when collapsed |
| Expand / collapse | Chevron **[▼]** expanded / **[▶]** collapsed — toggles track list visibility |
| Track list | Shown when expanded (see below) |

- All three levels are **always present** — no add/remove level UI
- Scene screen intensity toggles mirror all three levels; empty levels **grey out** on Scene screen

### Track List (inside expanded level)

| Element | Description |
|---|---|
| **Add track** | Full-width or prominent `Button` at the **top** of the list — opens **Track Picker modal** scoped to this intensity level |
| Track row | Track title + subtitle (**format · channel · duration** from imported file metadata); **×** remove `Button` on the trailing edge |
| Empty state | Only **Add track** visible — no placeholder tracks, no direct Import on empty row |

**Not in composer (MVP):** per-track volume sliders, MIX sliders, drag-to-reorder, tier/elemental balance sliders, per-track intensity controls, duplicate-track action, inline ▶ preview (deferred to P2).

### Add track → Track Picker modal

Opens **Track Picker modal** (distinct from category picker — **PW-43**; full spec in [`audio-library-soundscape-tracks-modal-design.md`](audio-library-soundscape-tracks-modal-design.md) when authored):

- Browse existing soundscape **tracks** in the library
- **Import** reaches composer **only** via **Add track → Track Picker modal → Import** (browser file picker inside modal — audio only); no direct file picker from composer or empty level row
- Multi-select + **Add Selected** adds chosen tracks to the **current intensity level**
- ← back returns to Category Composer with the same level still expanded

### Remove track (**×**)
- **Detaches** the track from **this intensity level only**
- File **remains** in library/storage until explicitly deleted from Library
- No storage purge on composer remove; confirmation optional

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click expand/collapse chevron | Shows or hides track list for that level |
| Click **Add track** | Opens Track Picker modal; **Add Selected** adds tracks to this level |
| Click **×** on track | Detaches track from this intensity level only; file stays in library (**PW-44**) |
| Click **Save Composition** | Persists composition; success `Toast` "Composition saved"; **stay on Composer** |
| Click ← **Library** | Back to Soundscapes tab (auto-save — no discard-changes prompt) |

Changes apply globally — no per-scene versioning.

### Intensity level rules

| Rule | Detail |
|---|---|
| Count | **3** fixed levels — **Level I · II · III** always visible |
| Labels | Roman numerals **I**, **II**, **III** |
| Scene screen | Levels with **≥ 1 track** are selectable; **empty levels greyed out** |
| Playback | Scene screen picks **at random** from tracks in the active level |

### Duplicate tracks (**PW-45**)

| Rule | Detail |
|---|---|
| Same level | **Blocked** — a track cannot appear twice on one level |
| Across levels | **Allowed** — same library track may appear on multiple levels |

---

## States

### New category
All three level rows present; **Level I** expanded by default; **Add track** as primary CTA.

### One level populated
Expanded level with track rows and **×** detach buttons; other levels may be collapsed and empty.

### Multiple levels populated
All three rows visible; any mix of expanded/collapsed.

### Auto-save
Changes persist automatically; navigate away without discard `AlertDialog`.

### Save Composition
Explicit save shows success `Toast`; user remains on Composer.

### Track Picker modal open
Composer visible behind modal; ← back restores expanded level context.

---

## Navigation

| Destination | Trigger |
|---|---|
| Library — Soundscapes tab | ← Library |
| Track Picker modal | **Add track** on any level |
| Browser file picker | **Import** inside Track Picker modal only |
| Credits | Sidebar → Credits |
| Trash | Sidebar → Trash |

---

## Related screens

| Screen | Relationship |
|---|---|
| [`audio-library-design.md`](audio-library-design.md) | Parent grid; card click opens this composer |
| [`active-scene-soundscapes-design.md`](active-scene-soundscapes-design.md) | Scene playback uses levels + random track from active level; empty levels grey out |
| [`audio-library-soundscapes-modal-design.md`](audio-library-soundscapes-modal-design.md) | **Category** picker for Scene screen — distinct from composer **track** picker |
| [`audio-library-soundscape-tracks-modal-design.md`](audio-library-soundscape-tracks-modal-design.md) | **Track** picker launched from **Add track** on a level row |

---

## Open Questions

### CC-12 — Category rename/delete from composer header (P2)
**Option B recorded:** Rename/delete only from Library grid — no composer-header rename/delete in MVP if **B** is chosen.

**Pending PO answer.**
