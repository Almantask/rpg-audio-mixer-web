# Session Scenes — Screen Design

**Design References:**
- **Same list as global Scenes** — [`scenes-list-design.md`](scenes-list-design.md) (one row per scene, same card chrome and actions); this screen shows only scenes **linked to this session**
- **Scene screen (after open):** [`active-scene-soundscapes-design.md`](active-scene-soundscapes-design.md), [`active-scene-soundboard-design.md`](active-scene-soundboard-design.md) — **identical** to opening from the global Scenes list
- **New source of truth:** FE sidebar layout (Jul 2026 IA redesign)
- **Resolved decisions:** [`answered-questions-dont-refer/session-scenes.md`](answered-questions-dont-refer/session-scenes.md)

---

## Purpose

The **Session Scenes** screen is the **same list UI as Scenes** (`scenes-list-design.md`), filtered to scenes the GM has linked to **this session**. Scenes remain global — editing a scene here updates it everywhere it is used.

**Only differences from global Scenes list:**

| Aspect | Global Scenes list | Session Scenes list |
|---|---|---|
| Scope | All scenes | Scenes linked to this session only |
| Page header | **Scenes** + subtitle | Combined **Session N — Name** + **Session Scenes** subtitle + campaign breadcrumb |
| Sort order | Most recently used or created (default: recent first) | **Last played first** — Last Active scene pinned to top, then recency order |
| Last Active | Not shown | **Required MVP** — pulsing indicator on most recently played linked scene |
| Bottom CTAs | **New Scene** (create globally) | **New Scene** (left) + **Import Scene** (right) — see below |
| **New Scene** result | Creates global scene; appears on global list | Same create dialog as global list; new scene is **also auto-linked** into this session |
| **Duplicate ⧉** result | One-tap **"Copy of [Name]"** — full config, independent | **Identical clone** as global list; copy is **also auto-linked** into this session |
| **Trash** icon | Soft-deletes scene globally → Trash | **Unlinks** scene from session (scene persists globally; **does not** go to Trash) |
| Session Lock | N/A | **Not applied** on this screen — Session Lock is an **Active Scene** feature only |

Row click opens the **same Scene screen** as the global list — Soundscapes tab, no auto-playback. **No ▶ play control** on list cards — open-only entry; playback starts only from the Active Scene screen after opening a scene.

**Sidebar nav item:** Home (active — session scenes are drill-down from Campaign)

---

## App Shell

Shared FE layout for **Arcanum Audio** (left sidebar navigation). See [`platform-design.md`](platform-design.md) for shell spec.

- **FE sidebar navigation only (no tab bar)**
- **Sidebar:** Home active (gold bar + tint)

---

## Information Architecture

| Item | Value |
|---|---|
| **Route** | `/campaigns/:campaignId/sessions/:sessionId/scenes` |
| **Deep-link** | URL survives refresh; browser **Back** returns to Campaign Sessions list |
| **Breadcrumb pattern** | Uppercase trail on drill-down screens (**PW-07 A**) — not a shallow back link |

---

## Layout — Main Content

```
┌──────────────────────────────────────────────────────────────────────┐
│  CAMPAIGN > ECHOES OF THE VOID > SESSION 14                          │
│  Session 14 — The Howling Crags                                      │
│  Session Scenes                                                      │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ [background image]                                             │  │
│  │ ● LAST ACTIVE  COMBAT   Dragon's Lair    4 SC · 12 FX  ✏️ ⧉ 🗑 │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ [background image]                                             │  │
│  │ FOREST   Frostwind Pass                  3 SC · 8 FX   ✏️ ⧉ 🗑 │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌ - - - - - - - - - - - - - - ┐  ┌ - - - - - - - - - - - - - - - +  │
│  │     +  New Scene            │  │       +  Import Scene         │  │
│  └ - - - - - - - - - - - - - - ┘  └ - - - - - - - - - - - - - - - +  │
└──────────────────────────────────────────────────────────────────────┘
```

*(Same row pattern as global Scenes list — background image, gradient overlay, one scene per row. Last Active row pinned to top regardless of when it was linked. Bottom row: **New Scene** to the **left** of **Import Scene**.)*

---

## Components

### Breadcrumb
- **CAMPAIGN > [CAMPAIGN NAME] > SESSION N** — uppercase sans-serif trail (**PW-07 A**)
- **Campaign segment** — tappable; navigates to **Campaign Sessions** list for that campaign
- **Session segment** — tappable; navigates to / refreshes this **Session Scenes** screen

### Page Header
- **Primary title:** combined **Session N — Name** (e.g. **Session 14 — The Howling Crags**) — large gold serif
- **Subtitle:** **Session Scenes** — below the primary title

> **Note:** Campaign Sessions list uses separate Session N label + session name fields (**CS-02 A**). This drill-down screen uses the combined **Session N — Name** form as the page heading (**SS-08 B**).

### Scene Card (`Card` — repeating, **one per row**)

**Identical to** `scenes-list-design.md` — Scene Card:

| Element | Description |
|---|---|
| **Background image** | Scene cover art fills the row; dark gradient overlay |
| **Last Active** | Pulsing **Last Active** `Badge` on the most recently **played** linked scene in this session — **required MVP**; pinned to top of list (**SS-02**, **PW-30**) |
| **Category tags** | Optional `Badge` chips (COMBAT, FOREST, etc.) |
| **Scene title** | Location name in white/gold serif |
| **Stats** | **SC · FX** — e.g. **4 SC · 12 FX** (identical row chrome to global Scenes list) |
| **Edit** | ✏️ — scene metadata (global); same flow as global Scenes list |
| **Duplicate** | ⧉ — **one-tap** clone, same as global Scenes list (**SL-03**, **F-SL-03**): named **"Copy of [Scene Name]"**, **full configuration** (soundscapes, FX, volumes, tags, description, cover), **independent** of the original; no name prompt. Copy is created globally **and auto-linked** into this session (**F-SS-01**, **F-SS-05**) |
| **Trash** | 🗑 — **unlinks from this session** (does not delete globally; **does not** go to Trash) |

- Action icon clicks do **not** navigate to the Scene screen
- Row body click navigates to the Scene screen
- **Sort:** Last Active scene always first; remaining rows ordered by last-played recency (**SS-06**)

**Not on cards:** play button, ▶ control, **⋯** menu, or list-level playback (**SS-01**, **PW-29**).

### Unlink (`AlertDialog`)
- **🗑 icon** on web/tablet; **swipe-right** on touch / narrow viewports — same hybrid pattern as global delete (**SS-03**, **PW-15**)
- **Always confirm** before unlink via `AlertDialog` — explicit OK required (**SS-04**); unlink is non-destructive globally but removes the session link
- On confirm: scene removed from this session list only; global scene unchanged; **no Trash entry** (**PW-18**)
- **Cancel** dismisses without changes

### Bottom CTAs — New Scene + Import Scene

Two dashed-row controls sit at the **bottom** of the list (and as empty-state CTAs). Layout order is fixed:

1. **New Scene** — **left** of Import Scene (**F-SS-04**)
2. **Import Scene** — **right** of New Scene

#### New Scene (`Button` / dashed row)
- Same dashed-row chrome and **create flow** as **New Scene** on the global Scenes list (`scenes-list-design.md`)
- Opens the same creation `Dialog`:

| Field | Required | Description |
|---|---|---|
| **Scene name** | Yes | Location name for the scene |
| **Description** | No | Optional text |
| **Background image** | No | Optional cover art via browser image upload |

- **Create** adds a **global** scene (appears on the global Scenes list) **and auto-links it into this session** so it appears immediately on Session Scenes (**F-SS-05**)
- GM **remains on Session Scenes** after create — no auto-navigation to the Scene screen (aligned with global list **PW-31** recommendation)
- **Cancel** dismisses without changes
- Tags are **not** collected here — add later via **Edit** if needed

#### Import Scene (`Button` / dashed row)
- Opens a searchable picker listing global scenes **not yet linked** to this session — already-linked scenes are **filtered out** and not shown (**SS-10**)
- Multi-select + confirm links selected scenes to the session list

**Import picker — all scenes already linked (SS-07):**
- Empty picker message: **"All scenes are already in this session"**
- Secondary affordance: use **New Scene** on this screen (preferred) — or navigate **Scenes → New Scene** then return and **Import Scene**

### Empty State
- Centred illustration (parchment / scroll)
- Primary CTAs: **New Scene** (left) + **Import Scene** (right) — same order as populated bottom row
- Optional note: create a scene here, or import an existing global scene

---

## Interactions & Behaviour

| Interaction | Result |
|---|---|
| Click scene card body | Navigate to **Scene screen** (Soundscapes tab) — **no playback starts**; same screen as global Scenes list |
| Click **✏️ Edit** | Open scene edit (metadata + background image) — updates scene globally (same as global Scenes list) |
| Click **⧉ Duplicate** | **One tap** — same clone as global Scenes list: **"Copy of [Scene Name]"**, full config, independent; copy appears on global Scenes list **and** in this session’s list (auto-linked). No name dialog |
| Click **🗑 Trash** | Opens unlink confirmation `AlertDialog`; on confirm, removes scene from session only |
| Swipe-right on card (touch) | Same unlink confirmation flow as **🗑** |
| Click **New Scene** | Opens same creation dialog as global list (name required); on Create, scene is global **and** linked to this session |
| Click **Import Scene** | Open global scene picker (excludes already-linked scenes) |
| Click breadcrumb — campaign | Navigate to **Campaign Sessions** list |
| Click breadcrumb — session | Navigate to / refresh **Session Scenes** for this session |

Playback is controlled only from the **Scene screen** after opening a scene — not from this list.

### Session Lock scope
- **Session Lock does not apply** on the Session Scenes list (**SS-05**, **PW-41**)
- New Scene, Import, unlink, Duplicate, and opening scenes from the list remain available while a session is locked
- Lock restrictions apply only on the **Active Scene** screen (see [`active-scene-soundboard-design.md`](active-scene-soundboard-design.md))

### Scene linking
- **Import Scene** creates a session link to an existing global scene (not a copy)
- **New Scene** from this screen creates a new global scene **and** a session link (auto-link)
- **Duplicate ⧉** from this screen creates an independent global copy **and** a session link (auto-link)
- Unlinking (🗑 or swipe) does not delete the scene globally and **never** creates a Trash entry
- Changes to a linked scene affect the scene everywhere it appears; changes to a **duplicate** do **not** affect the original (independence same as global Scenes list)

---

## States

### Populated list
One row per linked scene (Last Active pinned first, then last-played order) plus bottom row: **New Scene** | **Import Scene**.

### Empty state
Illustration + **New Scene** | **Import Scene**.

### Creating a scene
Modal `Dialog` from **New Scene** — same fields and validation as global Scenes list. On success: new row appears in this session’s list (and on the global Scenes list); GM stays on Session Scenes.

### Duplicating a scene
Immediate one-tap result — new **"Copy of [Name]"** row appears in this session’s list (and on the global Scenes list); original unchanged.

### Importing scenes
Picker overlay with search, multi-select, and confirm. Already-linked global scenes omitted from results.

### Import picker empty (all global scenes linked)
Message **"All scenes are already in this session"** + guidance to use **New Scene** on this screen.

---

## Navigation

| Destination | Trigger |
|---|---|
| Campaign Sessions | Breadcrumb — **campaign** segment |
| Session Scenes (refresh) | Breadcrumb — **session** segment |
| Scene screen | Click scene card body (same as global Scenes list) |
| Scene edit | ✏️ Edit icon |
| New scene creation | **New Scene** (left of Import Scene) |
| Scene picker (import) | **Import Scene** |
| Scenes (global list) | Sidebar → Scenes |
| Credits | Sidebar → Credits |
| Trash | Sidebar → Trash |

**Route:** `/campaigns/:campaignId/sessions/:sessionId/scenes` — deep-linkable; browser **Back** returns to Campaign Sessions.

---

## Acceptance Criteria (user-facing)

1. **Duplicate ⧉** on Session Scenes clones **exactly like** the global Scenes list: one-tap **"Copy of [Name]"**, full configuration, independent of the original.
2. **New Scene** appears to the **left** of **Import Scene** on Session Scenes (populated and empty states).
3. **New Scene** uses the **same create flow** as the global Scenes list (name required; description and cover optional).
4. After **New Scene** or **Duplicate** from Session Scenes, the resulting scene **appears in that session’s list** (auto-linked) and also exists on the global Scenes list.
