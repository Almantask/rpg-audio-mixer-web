# Soundscape Tracks — Track Picker Modal Design

**Design References:**
- **Parent screen:** [`soundscape-category-composer-design.md`](soundscape-category-composer-design.md) — launched from **Add track** on an intensity level
- **Parallel pattern:** [`audio-library-fx-modal-design.md`](audio-library-fx-modal-design.md) (scene picker — no import)
- **Distinct from:** [`audio-library-soundscapes-modal-design.md`](audio-library-soundscapes-modal-design.md) — **Add Soundscape** category picker for Active Scene

---

## Purpose

The **Track Picker** modal lets the GM browse library soundscape **tracks** and attach them to **one intensity level** in Category Composer via checkbox multi-select + **Add Selected (N)**.

**UI title:** **Add track** (or level-scoped subtitle e.g. "Add tracks to Level II") — not "Add Soundscape" (category picker) or "Sound Effects" (FX picker).

**Import** is available **only here** (and on Library page) — not in scene category/FX pickers (**PW-24**, **PW-43**).

---

## Presentation

| Viewport | Container | Filters |
|---|---|---|
| **Mobile** | Full-screen `Sheet`; ← back returns to Composer with same level expanded | Collapsible filter panel in **sheet header** (**PW-27**) |
| **Web** | Large content-area `Sheet` / `Dialog`; sidebar visible | Filter panel in **sidebar footer** |

---

## Layout — Modal

```
┌──────────┬──────────────────────────────────────────────────────────────┐
│ Sidebar  │  ← Back to Category Composer                                 │
│          │  Add track                                                   │
│  Search  │  Add tracks to Level II.                                     │
│  Type    │  [ Import ]                                                  │
│  Sort    │  🔍  Search tracks…                                            │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│          │  │☑ Rain    │ │☐ Wind    │ │☐ Thunder │                       │
│          │  │ MP3 · 3:42│ │ WAV · 2:15│ │ MP3 · 1:08│                       │
│          │  └──────────┘ └──────────┘ └──────────┘                       │
│          │  ┌──────────────────────────────────────────────────────────┐  │
│          │  │              Add Selected (2)                            │  │
│          │  └──────────────────────────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────────────────────────┘
```

---

## Components

### Modal Header
- **Back:** ← **Category Composer** — returns with target level still expanded
- **Title:** **Add track**
- **Subtitle:** Task-specific — e.g. "Add tracks to Level II."

### Import
- **Import** — outline `Button`; browser file picker (audio only)
- New imports appear in grid; auto-checked in selection set; GM taps **Add Selected** to attach to the level

### Track Card (`Card` — grid)
| Element | Description |
|---|---|
| Checkbox | Multi-select; does not preview |
| Title | Track name |
| Metadata | **format · channel · duration** from file metadata |
| Preview | Click card body to preview; one at a time; stops on ← back |

### Footer — Add Selected
- **Add Selected (N)** — commits checked tracks to the **current intensity level** only
- Modal **stays open** after commit (**PW-26**); **Sonner toast** — e.g. "3 tracks added" (**PW-25**)

---

## Rules

| Rule | Detail |
|---|---|
| Duplicate tracks (**PW-45**) | **Blocked within same level**; allowed across levels |
| Remove semantics (**PW-44**) | Composer **×** detaches only — not handled in this modal |
| Already on level | Tracks already on **this level** filtered out of grid |
| Preview on close | Active preview **stops** when modal closes |

---

## Launch Context

| Launched from | Back link | Add Selected attaches to |
|---|---|---|
| **Add track** on Level I–III row | ← Category Composer | Current intensity level only |

---

## Navigation

| Destination | Trigger |
|---|---|
| Category Composer | ← back |
| Browser file picker | **Import** |
| Library (browse) | Sidebar → Library |

---

## Related docs

| Doc | Relationship |
|---|---|
| [`soundscape-category-composer-design.md`](soundscape-category-composer-design.md) | Parent — level rows + **Add track** |
| [`audio-library-soundscapes-modal-design.md`](audio-library-soundscapes-modal-design.md) | Category picker for **scenes** — different modal |
| [`platform-design.md`](platform-design.md) | PW-23–PW-28 picker patterns |
