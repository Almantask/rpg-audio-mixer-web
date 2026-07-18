# Session Scenes — open questions (with recommendations)

**Design doc:** [Session Scenes design](../session-scenes-design.md)

← [Index](README.md) · [Platform-wide](platform-wide.md)

---

### SS-01
**Question:** Play from list — see PW-29.

**Option A (Recommended):** **Open-only** — no ▶ on session scene cards; playback only from Active Scene (design source of truth).

ANSWER: A

**Affected feature scenarios:** `session_scenes.feature` — *Tapping the play button on a scene card starts playback*; `play_scene.feature` — play-button and crossfade scenarios

---

### SS-02
**Question:** Last Active — see PW-30.

**Option A (Recommended):** **Required for MVP** on session scene list — pulsing indicator on most recently played linked scene; does not change global Scenes list.

ANSWER: A

**Affected feature scenarios:** `session_scenes.feature` — *The most recently played scene in a session shows a Last Active indicator*

---

### SS-03
**Question:** Unlink gesture — 🗑 only, swipe only, or both?

**Option A (Recommended):** **🗑 icon** on web/tablet; **swipe-right** on touch/narrow viewports (same as global scene delete pattern).

ANSWER: A

**Affected feature scenarios:** `session_scenes.feature` — *Removing a scene from a session does not delete the scene globally*

---

### SS-04
**Question:** Unlink confirmation — always, never, or user preference?

**Option B:** Always confirm before unlink.

ANSWER: B

**Affected feature scenarios:** `session_scenes.feature` — unlink scenario (no confirmation asserted)

---

### SS-05
**Question:** Session Lock — block import, unlink, open other scene from list?

**Option A (Recommended):** Remove locking capability from sessions. It's a feature only for active session.

ANSWER: A

**Affected feature scenarios:** `session_lock.feature` — *Locking the session disables… navigating to a different scene should be blocked* (Active Scene only; list context unspecified)

---

### SS-06
**Question:** Sort order of linked scenes — last played, alphabetical, import order, manual?

**Option A (Recommended):** **Last played first** (Last Active scene pinned to top, then recency order).

ANSWER: A

**Affected feature scenarios:** **Gap** — no sort scenarios

---

### SS-07
**Question:** Import picker empty state when all global scenes already linked?

**Option A (Recommended):** Show empty picker message: "All scenes are already in this session" + link to **Scenes → New Scene**. Occurs when **SS-10** filter excludes every global scene.

ANSWER: A.

**Affected feature scenarios:** **Gap**

---

### SS-10 — Import picker: exclude already-linked scenes

**Question:** Should scenes already linked to this session appear in the Import Scene picker?

**Option A (Recommended):** **No** — scenes already in the session are **filtered out** and not shown in the picker. Only global scenes not yet linked are selectable.

ANSWER: A.

**Affected feature scenarios:** `session_scenes.feature` — import scenarios (rewrite to assert linked scenes absent from picker)

---

### SS-08
**Question:** Session header — session name, session number, or combined label primary?

**Option B:** Combined **Session 14 — The Howling Crags** as primary heading.

ANSWER: B

**Affected feature scenarios:** **Gap** — `session_scenes.feature` uses "Session 1" shorthand only

---

### SS-09
**Question:** Route spec — e.g. `/campaigns/:id/sessions/:sessionId/scenes`?

**Option A (Recommended):** **Yes** — hierarchical RESTful routes for deep-linking and browser back.

ANSWER: A

**Affected feature scenarios:** **Gap** — routes not in Gherkin (acceptable if covered in navigation feature separately)

---

### PW-06, PW-07, PW-15, PW-17, PW-29, PW-30
(See [platform-wide.md](platform-wide.md) for full Option A/B. Session Scenes–specific impact below.)

- **PW-18:** Unlink from session **does not** go to Trash — decided in [active-scene-soundboard.md](active-scene-soundboard.md#pw-18); only global scene delete goes to Trash.
- **PW-41 / SS-05:** Session Lock is **Active Scene only** — do **not** extend lock to session scene list (New Scene, Import, Duplicate, unlink, open-from-list stay available). Lock matrix in [active-scene-soundboard.md](active-scene-soundboard.md#pw-41).

**Affected feature scenarios:** `session_scenes.feature` — unlink scenario; `session_lock.feature` — lock/unlock scenarios; `trash_recovery.feature` — Trash boundary

---

### New questions from scenario gaps

### F-SS-01
**Question:** Should Edit ✏️ and Duplicate ⧉ on session scene rows behave identically to global Scenes list (global mutations)?

**Option A (Recommended):** **Yes** — same icons; Edit is a global mutation. Duplicate ⧉ is **one-tap** **"Copy of [Name]"** with **full configuration** and **independence** from the original — identical to global Scenes list (**SL-03**, **F-SL-03**). Only 🗑 differs (unlink vs delete). Auto-link of the copy into the current session is **F-SS-05**.

ANSWER: A

**Affected feature scenarios:** **Gap** in `session_scenes.feature`; extend `scene_cloning.feature` (Iteration 10) for Session Scenes entry point

---

### F-SS-02
**Question:** Should breadcrumb segments (campaign name, session number) be individually tappable for hierarchy navigation?

**Option A (Recommended):** **Yes** — campaign segment → Campaign Sessions; session segment → refresh session scenes.

ANSWER: A

**Affected feature scenarios:** **Gap**

---

### F-SS-03
**Question:** Should session scene cards show **SC · FX** stats like global scene cards?

**Option A (Recommended):** **Yes** — identical row chrome per design.

ANSWER: A

**Affected feature scenarios:** **Gap**

---

### F-SS-04
**Question:** Should Session Scenes offer a **New Scene** control, and where relative to **Import Scene**?

**Option A (Recommended):** **Yes** — **New Scene** to the **left** of **Import Scene** (populated bottom row and empty state). Uses the **same create dialog** as the global Scenes list (name required; description and cover optional).

ANSWER: A

**Affected feature scenarios:** **Gap** — author under Iteration 3 `features/session-scenes/` (alongside import / `build_your_own_scene`)

---

### F-SS-05
**Question:** After **New Scene** or **Duplicate ⧉** from Session Scenes, should the result appear in that session’s list?

**Option A (Recommended):** **Yes — auto-link.** Create and Duplicate still produce **global** scenes (visible on the global Scenes list); they are **also linked** into the current session so the GM does not need a separate Import step.

ANSWER: A

**Affected feature scenarios:** **Gap** — New Scene auto-link in Iteration 3 session-scenes create scenarios; Duplicate auto-link in Iteration 10 `scene_cloning.feature` (or companion session-scenes scenario tagged `@iter10`)

---


## Principal QA — full scenario notes

**Sign-off status:** ✅ Session Scenes open questions complete — **rewrite** `session_scenes` and **align** `session_lock` per table below. **Conflicts:** **SS-08 B** (combined **Session N — Name** header) vs **CS-02 A** (separate number + name in [campaign-sessions.md](campaign-sessions.md)) — pick display rule before **F-09**. Body cross-ref at PW-41 / SS-05 is **stale** — **SS-05 A** keeps lock **Active Scene only** (do not block session scene list).

### Gherkin ↔ design — resolved conflicts

| Area | Decision | Gherkin action |
|---|---|---|
| List playback | **No ▶** on session scene cards — open-only (**SS-01 A**, **PW-29**) | **Retire** `session_scenes` — *Tapping the play button on a scene card starts playback*; cross-ref `play_scene` list play retire ([scenes-list.md](scenes-list.md) **SL-01**) |
| Last Active | **Required MVP** on session scene list (**SS-02 A**, **PW-30**) | **Keep** Last Active scenario; extend sort assertions (**SS-06**) |
| Unlink affordance | **🗑 icon** + swipe-right on touch (**SS-03 A**, **PW-15**) | **Extend** unlink scenario with 🗑 path (**F-14**); keep swipe as touch alternative |
| Unlink confirm | **Always confirm** before unlink (**SS-04 B**) | **Add** confirmation step to unlink scenarios; unlink **does not** go to Trash (**PW-18**) |
| Session Lock scope | **Active Scene only** — not on session scene list (**SS-05 A**) | **Do not add** list-lock scenarios; **rewrite** `session_lock` scope to active-scene controls only ([PW-41](active-scene-soundboard.md#pw-41)) |
| Sort order | **Last played first** — Last Active pinned top (**SS-06 A**) | **Add** **F-07** |
| Import empty state | Prefer **New Scene** on this screen when picker empty (**SS-07 A**, **F-SS-04**); optional Scenes → New Scene | **Rewrite** **F-08** |
| Picker exclusion | Already-linked scenes **omitted** from Import picker (**SS-10 A**) | **Add** **F-15**; rewrite import scenarios |
| Session header | Combined **Session N — Name** primary (**SS-08 B**) | **Add** **F-09** — **conflicts CS-02 A** separate fields |
| Routes | Hierarchical REST routes (**SS-09 A**) | **Add** **F-10** (deep-link / back nav); optional URL assertion |
| Row actions | Edit ✏️ + Duplicate ⧉ same as global Scenes list (**F-SS-01 A**) | **Add** **F-16**; **F-17** → Iteration 10 `scene_cloning` |
| Bottom CTAs | **New Scene** left of **Import Scene**; same create dialog as global (**F-SS-04 A**) | **Add** **F-22**, **F-23** (Iteration 3) |
| Auto-link | New Scene / Duplicate from Session Scenes **auto-link** into current session (**F-SS-05 A**) | **Add** **F-23** (create), extend **F-17** / `scene_cloning` (duplicate) |
| Breadcrumbs | Tappable campaign + session segments (**F-SS-02 A**) | **Add** **F-18**, **F-19** |
| Card metadata | **SC · FX** counts on session scene rows (**F-SS-03 A**) | **Add** **F-20** — align [scenes-list.md](scenes-list.md) **F-SL-02** |

### Decisions — scenario impact

#### SS-01 — Play from list (P0) → **Decided A** [PW-29](platform-wide.md#pw-29)
- **Decision:** **Open-only** — no ▶ on session scene cards; playback from Active Scene after open.
- **Affected scenarios:** **Retire** `session_scenes` — *Tapping the play button on a scene card starts playback*; **keep** *Tapping a scene card… opens it without starting playback*.

#### SS-02 — Last Active (P0) → **Decided A** [PW-30](platform-wide.md#pw-30)
- **Decision:** **Required MVP** — pulsing indicator on most recently played linked scene.
- **Affected scenarios:** **Keep** `session_scenes` — *The most recently played scene in a session shows a Last Active indicator*.

#### SS-03 — Unlink gesture (P1) → **Decided A** [PW-15](platform-wide.md#pw-15)
- **Decision:** **🗑 icon** on web/tablet; **swipe-right** on touch/narrow viewports.
- **Affected scenarios:** **Extend** unlink scenario beyond swipe-only; **new:** **F-14**.

#### SS-04 — Unlink confirmation (P1) → **Decided B**
- **Decision:** **Always confirm** before unlink (non-destructive globally but requires explicit OK).
- **Affected scenarios:** **Rewrite** `session_scenes` — *Removing a scene from a session…* to include confirmation dialog.

#### SS-05 — Session Lock on session list (P1) → **Decided A**
- **Decision:** **Remove locking from session scene list** — Session Lock is an **Active Scene** feature only; New Scene, Import, Duplicate, unlink, and opening scenes from the list stay available.
- **Affected scenarios:** **Retire** stale **F-11–F-13** (list lock blockers); **rewrite** `session_lock.feature` naming/scope to active-scene lock — do not extend matrix to session scenes list.

#### SS-06 — Sort order (P1) → **Decided A**
- **Decision:** **Last played first** — Last Active scene pinned to top, then recency order.
- **Affected scenarios:** **new:** **F-07**; align with Last Active scenario.

#### SS-07 — Import picker empty state (P1) → **Decided A**
- **Decision:** Empty picker copy when **SS-10** filter excludes all global scenes; prefer **New Scene** on this screen (**F-SS-04**); optional link to **Scenes → New Scene**.
- **Affected scenarios:** **rewrite:** **F-08**.

#### SS-10 — Exclude already-linked scenes (P0) → **Decided A**
- **Decision:** Scenes already in session **filtered out** of Import Scene picker.
- **Affected scenarios:** **Rewrite** import scenarios; **new:** **F-15**.

#### SS-08 — Session header label (P1) → **Decided B**
- **Decision:** Combined **Session 14 — The Howling Crags** as primary heading.
- **Affected scenarios:** **new:** **F-09**; **conflict** with **CS-02 A** (separate Session N + name in campaign-sessions).

#### SS-09 — Route spec (P1) → **Decided A**
- **Decision:** Hierarchical routes e.g. `/campaigns/:id/sessions/:sessionId/scenes` for deep-linking and browser back.
- **Affected scenarios:** **new:** **F-10**; indirect `navigation`, `screen_transitions`.

#### F-SS-01 — Edit / Duplicate on session rows (P1) → **Decided A**
- **Decision:** Same ✏️ edit as global list. Duplicate ⧉ is one-tap **"Copy of [Name]"**, full config, independent — identical to global Scenes list (**SL-03**); only 🗑 differs (unlink vs delete). Auto-link of the copy → **F-SS-05**.
- **Affected scenarios:** **new:** **F-16** (edit, Iteration 3); **F-17** (duplicate + auto-link → Iteration 10 `scene_cloning.feature`).

#### F-SS-02 — Tappable breadcrumbs (P1) → **Decided A**
- **Decision:** Campaign segment → Campaign Sessions; session segment → session scenes (refresh).
- **Affected scenarios:** **new:** **F-18**, **F-19**.

#### F-SS-03 — SC · FX on session cards (P1) → **Decided A**
- **Decision:** Identical row chrome to global Scenes list.
- **Affected scenarios:** **new:** **F-20**.

#### F-SS-04 — New Scene control (P0) → **Decided A**
- **Decision:** **New Scene** appears to the **left** of **Import Scene**; same create dialog as global Scenes list (name required).
- **Affected scenarios:** **new:** **F-22**, **F-23** — Iteration 3 `features/session-scenes/` (with `build_your_own_scene` create parity).

#### F-SS-05 — Auto-link after New Scene / Duplicate (P0) → **Decided A**
- **Decision:** **Yes — auto-link** into the current session; scene also exists globally. No separate Import step required.
- **Affected scenarios:** **F-23** (New Scene, Iteration 3); **F-17** (Duplicate, Iteration 10 with `scene_cloning.feature`).

### Scenarios to author

| ID | Scenario | Iteration home |
|---|---|---|
| **F-07** | Linked scenes sorted last-played first; Last Active scene pinned to top (**SS-06**) | Iter 3 session-scenes |
| **F-08** | Import picker empty → guidance to **New Scene** on this screen (**SS-07**, **F-SS-04**) | Iter 3 session-scenes |
| **F-09** | Session header shows combined **Session N — Name** primary title (**SS-08 B** — resolve **CS-02** conflict first) | Iter 3 session-scenes |
| **F-10** | Session scenes deep-link URL survives refresh; browser back returns to sessions list (**SS-09**) | Iter 3 session-scenes |
| **F-14** | Unlink via 🗑 icon removes scene from session but preserves global scene (**SS-03**) | Iter 3 session-scenes |
| **F-15** | Import Scene picker lists only scenes not yet linked to this session (**SS-10**) | Iter 3 session-scenes |
| **F-16** | Edit ✏️ on session scene row opens same global edit flow as Scenes list (**F-SS-01**) | Iter 3 session-scenes |
| **F-17** | Duplicate ⧉ from Session Scenes = one-tap **"Copy of [Name]"**, full config, independent + **auto-linked** to session (**F-SS-01**, **F-SS-05**, **SL-03**) | **Iter 10** — extend `scene_cloning.feature` |
| **F-18** | Breadcrumb campaign segment navigates to Campaign Sessions list (**F-SS-02**) | Iter 3 session-scenes |
| **F-19** | Breadcrumb session segment navigates/refreshes session scenes (**F-SS-02**) | Iter 3 session-scenes |
| **F-20** | Session scene card shows **SC · FX** counts (**F-SS-03**) | Iter 3 session-scenes |
| **F-21** | Unlink from session always shows confirmation dialog before removing link (**SS-04 B**) | Iter 3 session-scenes |
| **F-22** | **New Scene** appears left of **Import Scene** (populated + empty); opens same create dialog as global list (**F-SS-04**) | **Iter 3** session-scenes |
| **F-23** | After **New Scene** from Session Scenes, scene appears in that session’s list (auto-linked) and on global Scenes list (**F-SS-05**) | **Iter 3** session-scenes |

### Scenarios to retire or rewrite

| Feature file | Retire / rewrite |
|---|---|
| `session_scenes.feature` / Iter 3 session-scenes files | **Retire** list play-button (**SS-01**); **rewrite** unlink confirm + 🗑 (**SS-04**, **SS-03**); **rewrite** import exclusion (**SS-10**); **add** empty picker (**SS-07**), sort (**SS-06**), header (**SS-08**), SC·FX (**F-SS-03**), **New Scene** left of Import + create dialog (**F-22**), create auto-link (**F-23**) |
| `scene_cloning.feature` | **Extend** (Iteration 10): Session Scenes entry point — one-tap clone parity + auto-link into current session (**F-17**, **F-SS-01**, **F-SS-05**) |
| `session_lock.feature` | **Scope to Active Scene only** (**SS-05 A**, **PW-41**) — do **not** block New Scene / Import / Duplicate / unlink / scene-open from session scenes list |
| `play_scene.feature` | Cross-ref **SS-01** / **PW-29** — list play-button scenarios retired (shared with global Scenes list) |
| `trash_recovery.feature` | Unlink from session **never** creates Trash entry (**PW-18**); scene/campaign/session soft-deletes use respective tabs ([TR-10](trash.md#tr-10)) |
| `build_your_own_scene.feature` | Create-dialog parity reference for Session Scenes **New Scene** (**F-22**); Session Scenes auto-link is session-scenes / **F-23**, not this file |

---
