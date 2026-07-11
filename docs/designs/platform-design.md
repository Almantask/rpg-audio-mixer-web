# Platform — Shell & Cross-Cutting Patterns

**Canonical reference** for app shell, navigation, destructive actions, pickers, scene lists, Active Scene audio behavior, and Category Composer rules. Screen-specific layouts live in sibling `*-design.md` files.

**Open questions resolved:** [platform-wide.md](answered-questions-dont-refer/platform-wide.md) (PW-01–PW-50, F-67–F-72)

---

## Purpose

Arcanum Audio shares one **session-safe, low-glance** shell across every screen. This document defines patterns that must stay consistent so GMs can navigate campaigns, scenes, and audio without relearning controls.

---

## App Shell & Sidebar IA (PW-01–PW-05)

### Six primary sidebar items

| Item | Icon | Route | Notes |
|---|---|---|---|
| **Home** | Home / castle | `/` | Entry dashboard |
| **Campaign** | Storybook | `/campaigns` | Active Campaigns list |
| **Scenes** | Picture frame | `/scenes` | Global scenes catalogue |
| **Library** | Music note | `/library` | Soundscapes + Sound Effects tabs |
| **Credits** | Scroll / quill | `/credits` | App info & support |
| **Trash** | Trash can | `/trash` | Soft-deleted items (7-day retention) |

- **No gear icon** — retire Arcane Settings entry path entirely (**PW-01**).
- **Credits** and **Trash** are **primary-tier** items — same visual weight as Home–Library (**PW-04**). No secondary utility grouping or divider.
- **Credits screen title:** **Credits** only — no "Behind the Screen" or Arcane Settings copy anywhere in UI (**PW-02**).
- **Trash naming:** **Trash** everywhere — sidebar label, screen title, empty states (**PW-03**). No "Vault of Echoes" in primary chrome.

### Top bar

- **Hamburger** (left) — toggles sidebar collapse on narrow viewports.
- **"Arcanum Audio"** — centred app name, italic gold serif.
- **No gear**, no settings icon in the top bar.

### Profile footer (PW-05)

**Deferred for MVP.** Sidebar footer shows a **static avatar placeholder** only — no tap action, no account screen.

### Active highlight (PW-06)

| Context | Sidebar item highlighted |
|---|---|
| Home | `/` |
| Active Campaigns | **Campaign** |
| Global Scenes list | **Scenes** |
| Library (any tab) | **Library** |
| Credits | **Credits** |
| Trash | **Trash** |
| Campaign → Sessions → Session Scenes → Active Scene (session drill-down) | **Home** |
| Active Scene opened from global Scenes list | **Scenes** |

Campaign hierarchy drill-down keeps **Home** highlighted so the GM retains a stable "session context" anchor.

### Theme

Dark charcoal background (`#0D0D0D`–`#121212`), gold accents (`#D4AF37` / `#EAB308`), purple accent for FX (`#A855F7`), serif headings, sans-serif body (`Inter`).

**Active sidebar state:** gold vertical bar on left edge, subtle gold tint, gold text and icon.

---

## Navigation & Breadcrumbs (PW-06–PW-07)

### Shallow parents — back link

Screens one level below a sidebar destination use a **← Back** text link to the parent list:

| Screen | Back link |
|---|---|
| Category Composer | ← **Library** |

**Campaign Sessions** uses **browser back only** — no explicit ← Active Campaigns link ([F-CS-03](answered-questions-dont-refer/campaign-sessions.md)).

### Drill-down — uppercase breadcrumb

**Session Scenes** and **Active Scene** (session context) use an **uppercase sans-serif breadcrumb trail**:

- **CAMPAIGN > [CAMPAIGN NAME] > SESSION N** — on Session Scenes
- **CAMPAIGN > [CAMPAIGN NAME]** (± session segment) — on Active Scene when in live play

Breadcrumb segments are tappable where they represent a navigable parent.

### Hero & campaign re-entry (PW-09, PW-32, PW-33)

- Home hero CTA: **Resume** → active campaign's **Sessions list** (**PW-09** per [home.md](answered-questions-dont-refer/home.md); **PW-32**).
- Campaign list cards use **Resume** (≥1 session) or **Start** (0 sessions) — see [`campaigns-design.md`](campaigns-design.md).
- **Resume Journey** is **not** shown on Home — extra navigation step accepted (**PW-33**).

---

## Screen Transitions (F-PW-01)

**Shared Z-Axis** animation applies to **modal and sheet presentation** — add-to-scene pickers, import flows, Category Composer track picker — not to a retired gear → Settings path.

Drill-down list navigation (Campaign → Sessions → Scenes) uses standard push transitions or instant route change; pickers slide/fade over the Active Scene or Library context.

---

## Naming & Copy (PW-08–PW-14)

| Surface | Copy |
|---|---|
| Active Scene tabs | **Soundscapes** \| **Soundboard** (**PW-08**) |
| Home hero CTA | **Resume** |
| Create campaign | **Create Campaign**; empty state **No campaigns yet** |
| Home stat cards | **Top Soundscape** / **Top FX** |
| Play count labels | **PLAYS** for both soundscapes and FX |
| Library — Soundscapes tab | **Free Compositions**, **+ Add Soundscape** |
| Library — FX tab | **Free Tracks** |
| Filtered-empty (library/pickers) | Literal: "No compositions match your filters" / "No effects match your filters" |

Thematic flavor belongs in subtitles and illustrations — not primary labels.

---

## Destructive Actions & Trash (PW-15–PW-22)

### Delete affordance (PW-15)

| Viewport | Affordance |
|---|---|
| Web / tablet | Trailing **🗑** icon `Button` on list/card rows |
| Touch | **Swipe-right** on row (same action as 🗑) |

### Soft-delete model (PW-16)

**Always soft-delete** to Trash for **7 days** — campaigns, sessions, scenes, soundscape categories, and FX tracks. No instant permanent delete from list screens.

**Trash UI:** **Tab menu per entity type** — **Campaigns**, **Sessions**, **Scenes**, **Soundscapes**, **FX**. Grid, Select all, Restore All, and Empty Trash are scoped to the **active tab**. See [`trash-design.md`](trash-design.md).

### Confirmation (PW-17)

Entity-specific rules ([campaign-sessions.md](answered-questions-dont-refer/campaign-sessions.md), [scenes-list.md](answered-questions-dont-refer/scenes-list.md)):

| Entity / action | Confirm before soft-delete? |
|---|---|
| Campaign, soundscape category, FX track | **No** — optional undo `Sonner` toast |
| **Session** | **Yes** — always `AlertDialog` before Trash |
| Scene (no session links) | **No** — optional undo toast |
| Scene (linked to sessions) | **Yes** — warning dialog about unlink + Trash ([SL-07](answered-questions-dont-refer/scenes-list.md)) |
| Session unlink / remove from scene | N/A — not soft-delete ([PW-18](answered-questions-dont-refer/platform-wide.md#pw-18)) |
| **Permanent purge** (Trash Purge / Empty Trash) | **Yes** — destructive `AlertDialog` |

### Exclusions — does not go to Trash (PW-18)

| Action | Behavior |
|---|---|
| Unlink scene from session | Removes session link only; global scene persists |
| Remove soundscape category from scene | Detaches from scene only |
| Remove FX tile from soundboard | Detaches from scene only |
| Remove track from composer level | Detaches from intensity level only |

### Restore rules (PW-19–PW-21)

- Restoring a **campaign** **auto-restores** orphaned sessions linked to it.
- **FX audio files** remain in Trash for the full **7 days** (not purged on soft-delete).
- **Name collision on restore:** auto-rename to **`[Name] (restored)`**.

### Expiry (PW-22)

- **In-app badge only** — urgent countdown styling on card when **1 day** remains; no email in MVP.

---

## Add-to-Scene Pickers (PW-23–PW-28)

Shared pattern for **ADD SOUNDSCAPE** and **Add Sound** modals:

| Rule | Detail |
|---|---|
| Commit model (**PW-23**) | Checkbox multi-select + footer **Add Selected (N)** |
| Post-add feedback (**PW-25**) | `Sonner` toast — e.g. "3 effects added" / "2 categories added" |
| Stay open (**PW-26**) | Modal **stays open** after commit; GM closes with **← back** when done |
| Session Lock (**PW-28**) | **Block opening** pickers — ADD SOUNDSCAPE / Add Sound disabled or hidden |

### Import availability (PW-24)

| Picker | Import in modal? |
|---|---|
| FX picker (Add Sound) | **No** — Library page only ([FX-13](answered-questions-dont-refer/active-scene-soundboard.md#fx-13)) |
| Category picker (ADD SOUNDSCAPE) | **No** — use Library or Composer |
| Track picker (Composer Add track) | **Yes** — **Import** in composer track modal |

### Mobile filters (PW-27)

| Viewport | Filter placement |
|---|---|
| Mobile | Collapsible filter panel in **sheet header** |
| Web | Filters in **sidebar footer** (unchanged) |

**Specs:** [`audio-library-soundscapes-modal-design.md`](audio-library-soundscapes-modal-design.md), [`audio-library-fx-modal-design.md`](audio-library-fx-modal-design.md)

---

## Scene Lists & Playback Entry (PW-29–PW-33)

| Rule | Detail |
|---|---|
| List play button (**PW-29**) | **No ▶ on scene list cards** — open-only entry; playback starts on Active Scene screen only |
| Last Active (**PW-30**) | **Required MVP** on **Session Scenes** list only — pulsing badge on most recently **played** linked scene; pinned to top |
| After create scene (**PW-31**) | ⏳ **Recommended:** stay on Scenes list — new row visible; GM opens scene manually. **PO pending** ([scenes-list.md](answered-questions-dont-refer/scenes-list.md)) |
| Delete on global Scenes list | 🗑 soft-delete → Trash; no confirm; optional undo toast |

**Specs:** [`scenes-list-design.md`](scenes-list-design.md), [`session-scenes-design.md`](session-scenes-design.md)

---

## Active Scene — Shared Audio Behavior (PW-34–PW-41)

Tab labels: **Soundscapes** and **Soundboard** (**F-72**).

### Soundboard (PW-34–PW-38, PW-40)

| Behavior | Rule |
|---|---|
| Playing chrome | Tile **glow/pulse + ▶** while any instance plays; dedicated **⏹** on tile |
| Re-trigger | Tile body tap starts **new instance** (overlap allowed) |
| Stop scope (**PW-35**) | **⏹** or pause tap stops **all instances** of that effect at once |
| Edit affordances (**PW-36**) | **No Edit Board mode** — visible **drag handle** reorders (auto-save); tile **🗑** removes from board |
| Auto-ducking (**PW-37**) | All playing soundscapes duck to **40%** on any FX trigger; restore when instance ends — **not configurable** MVP |
| FX concurrency (**PW-38**) | Global max **5** instances + per-effect max **5**; silently stop oldest |
| Layout persistence (**PW-40**) | **Auto-save** add/reorder/remove on Soundboard — **no Save State** button on this tab |

### Soundscapes (PW-39, PW-40)

| Behavior | Rule |
|---|---|
| Concurrency (**PW-39**) | Max **10** playing categories; **silent oldest-stop** when exceeded |
| Layout persistence | Reorder/add/remove **auto-saves** on drop |
| **Save State** button | Persists **mixer state only** — per-category volume, intensity, master mixer — not layout |

### Session Lock matrix (PW-41)

| Disabled when locked | Still enabled |
|---|---|
| Add Sound, Add Soundscape pickers | FX tile play/retrigger |
| Drag-reorder, tile 🗑 remove (both tabs) | Master + per-category volume sliders |
| Navigate to different scene | Play/pause, d20, Stop All, Lock toggle |
| | Tab switch Soundscapes ↔ Soundboard |

Session Lock does **not** apply on Session Scenes list — only on Active Scene.

**Specs:** [`active-scene-soundscapes-design.md`](active-scene-soundscapes-design.md), [`active-scene-soundboard-design.md`](active-scene-soundboard-design.md)

---

## Category Composer (PW-42–PW-46)

| Rule | Detail |
|---|---|
| Legacy features (**PW-42**) | Deprecate legacy `compose_soundscape` scenarios — **level-first Composer** is source of truth |
| Track picker (**PW-43**) | **Distinct** from category picker — scoped to one intensity level; see [`audio-library-soundscape-tracks-modal-design.md`](audio-library-soundscape-tracks-modal-design.md) |
| Remove track (**PW-44**) | **Detach from level only** — does not delete library asset or send to Trash |
| Duplicate tracks (**PW-45**) | **Allowed across levels**; **blocked within the same level** |
| Intensity levels (**PW-46**, **CC-05**) | **Fixed three levels** — **Level I · II · III** always visible; no add/remove level controls (composer-specific; supersedes generic PW-46 append-only I–V) |

---

## Gherkin & Prototype Process (PW-47–PW-50)

Design authoring notes — not implementation scope:

| ID | Decision |
|---|---|
| PW-47 | Split/replace unified `search_sounds.feature` into tab-specific filter features |
| PW-48 | ⏳ **Still open** — delete stale gear/Vault/+ scenarios vs `@deprecated` migration |
| PW-49 | ⚠️ **Unresolved** — see [Conflicts](#unresolved-conflicts) |
| PW-50 | **ASCII + markdown** sufficient for MVP kickoff; HTML prototypes P2 |

### New scenario gaps (F-67–F-72)

| ID | Scenario |
|---|---|
| F-67 | Profile footer avatar visible; no navigation (PW-05 defer) |
| F-68 | Restore renames on collision → `[Name] (restored)` |
| F-69 | Add Selected shows count toast |
| F-70 | Mobile picker filters in sheet header region |
| F-71 | Sidebar shows six primary items including Credits and Trash |
| F-72 | Active Scene tabs labelled Soundscapes and Soundboard |

---

## Unresolved Conflicts

### PW-49 — Canonical campaigns feature file

| Document | Option A names |
|---|---|
| [platform-wide.md](answered-questions-dont-refer/platform-wide.md) | **`campaign_crud.feature`** |
| [campaigns.md](answered-questions-dont-refer/campaigns.md) | **`manage_campaigns.feature`** |

**Do not merge or deprecate either file** until Product Owner picks one canonical source.

### PW-09 — Home hero CTA label

[home.md](answered-questions-dont-refer/home.md) records **Resume**; [campaign-sessions.md](answered-questions-dont-refer/campaign-sessions.md) sign-off still references "Open Campaign". Design docs use **Resume** on Home per home.md.

### PW-31 — Post-create navigation

Recommended Option A is **stay on Scenes list**; PO answer still pending. [`scenes-list-design.md`](scenes-list-design.md) follows the recommendation provisionally.

### F-PW-01 / F-PW-02 — Gherkin structure

Still open — no PO answer. Screen Transitions section above documents **intent** for F-PW-01 (modal/sheet Z-Axis).

---

## Screen Index

| Screen | Design doc |
|---|---|
| Home | [`home-design.md`](home-design.md) |
| Active Campaigns | [`campaigns-design.md`](campaigns-design.md) |
| Campaign Sessions | [`campaign-sessions-design.md`](campaign-sessions-design.md) |
| Session Scenes | [`session-scenes-design.md`](session-scenes-design.md) |
| Scenes (global) | [`scenes-list-design.md`](scenes-list-design.md) |
| Active Scene — Soundscapes | [`active-scene-soundscapes-design.md`](active-scene-soundscapes-design.md) |
| Active Scene — Soundboard | [`active-scene-soundboard-design.md`](active-scene-soundboard-design.md) |
| Library | [`audio-library-design.md`](audio-library-design.md) |
| Category Composer | [`soundscape-category-composer-design.md`](soundscape-category-composer-design.md) |
| Composer track picker | [`audio-library-soundscape-tracks-modal-design.md`](audio-library-soundscape-tracks-modal-design.md) |
| Credits | [`credits-design.md`](credits-design.md) |
| Trash | [`trash-design.md`](trash-design.md) |
