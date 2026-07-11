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
- **PW-41 / SS-05:** Session Lock is **Active Scene only** — do **not** extend lock to session scene list (Import, unlink, open-from-list stay available). Lock matrix in [active-scene-soundboard.md](active-scene-soundboard.md#pw-41).

**Affected feature scenarios:** `session_scenes.feature` — unlink scenario; `session_lock.feature` — lock/unlock scenarios; `trash_recovery.feature` — Trash boundary

---

### New questions from scenario gaps

### F-SS-01
**Question:** Should Edit ✏️ and Duplicate ⧉ on session scene rows behave identically to global Scenes list (global mutations)?

**Option A (Recommended):** **Yes** — same icons, same global edit/clone behavior; only 🗑 differs (unlink vs delete).

ANSWER: A

**Affected feature scenarios:** **Gap** in `session_scenes.feature`

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
| Import empty state | Message + link to **Scenes → New Scene** when picker empty (**SS-07 A**, **SS-10**) | **Add** **F-08** |
| Picker exclusion | Already-linked scenes **omitted** from Import picker (**SS-10 A**) | **Add** **F-15**; rewrite import scenarios |
| Session header | Combined **Session N — Name** primary (**SS-08 B**) | **Add** **F-09** — **conflicts CS-02 A** separate fields |
| Routes | Hierarchical REST routes (**SS-09 A**) | **Add** **F-10** (deep-link / back nav); optional URL assertion |
| Row actions | Edit ✏️ + Duplicate ⧉ same as global Scenes list (**F-SS-01 A**) | **Add** **F-16**, **F-17** |
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
- **Decision:** **Remove locking from session scene list** — Session Lock is an **Active Scene** feature only; Import, unlink, and opening scenes from the list stay available.
- **Affected scenarios:** **Retire** stale **F-11–F-13** (list lock blockers); **rewrite** `session_lock.feature` naming/scope to active-scene lock — do not extend matrix to session scenes list.

#### SS-06 — Sort order (P1) → **Decided A**
- **Decision:** **Last played first** — Last Active scene pinned to top, then recency order.
- **Affected scenarios:** **new:** **F-07**; align with Last Active scenario.

#### SS-07 — Import picker empty state (P1) → **Decided A**
- **Decision:** Empty picker copy when **SS-10** filter excludes all global scenes + link to **Scenes → New Scene**.
- **Affected scenarios:** **new:** **F-08**.

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
- **Decision:** Same ✏️ edit and ⧉ duplicate as global Scenes list (global mutations); only 🗑 differs (unlink vs delete).
- **Affected scenarios:** **new:** **F-16** (edit), **F-17** (duplicate).

#### F-SS-02 — Tappable breadcrumbs (P1) → **Decided A**
- **Decision:** Campaign segment → Campaign Sessions; session segment → session scenes (refresh).
- **Affected scenarios:** **new:** **F-18**, **F-19**.

#### F-SS-03 — SC · FX on session cards (P1) → **Decided A**
- **Decision:** Identical row chrome to global Scenes list.
- **Affected scenarios:** **new:** **F-20**.

### Scenarios to author

| ID | Scenario |
|---|---|
| **F-07** | Linked scenes sorted last-played first; Last Active scene pinned to top (**SS-06**) |
| **F-08** | Import Scene picker empty state when all global scenes already linked + link to New Scene (**SS-07**) |
| **F-09** | Session header shows combined **Session N — Name** primary title (**SS-08 B** — resolve **CS-02** conflict first) |
| **F-10** | Session scenes deep-link URL survives refresh; browser back returns to sessions list (**SS-09**) |
| **F-14** | Unlink via 🗑 icon removes scene from session but preserves global scene (**SS-03**) |
| **F-15** | Import Scene picker lists only scenes not yet linked to this session (**SS-10**) |
| **F-16** | Edit ✏️ on session scene row opens same global edit flow as Scenes list (**F-SS-01**) |
| **F-17** | Duplicate ⧉ on session scene row creates global "Copy of [Name]" (**F-SS-01**, aligns **SL-03**) |
| **F-18** | Breadcrumb campaign segment navigates to Campaign Sessions list (**F-SS-02**) |
| **F-19** | Breadcrumb session segment navigates/refreshes session scenes (**F-SS-02**) |
| **F-20** | Session scene card shows **SC · FX** counts (**F-SS-03**) |
| **F-21** | Unlink from session always shows confirmation dialog before removing link (**SS-04 B**) |

### Scenarios to retire or rewrite

| Feature file | Retire / rewrite |
|---|---|
| `session_scenes.feature` | **Retire** *Tapping the play button on a scene card starts playback* (**SS-01**); **rewrite** unlink → confirm dialog (**SS-04 B**) + 🗑 path (**SS-03**); **rewrite** import picker excludes linked scenes (**SS-10**); **add** empty picker (**SS-07**), sort (**SS-06**), header (**SS-08**), SC·FX (**F-SS-03**) |
| `session_lock.feature` | **Scope to Active Scene only** (**SS-05 A**, **PW-41**) — rename feature if needed; **do not** block Import/unlink/scene-open from session scenes list; keep block on navigating away from active scene while locked |
| `play_scene.feature` | Cross-ref **SS-01** / **PW-29** — list play-button scenarios retired (shared with global Scenes list) |
| `trash_recovery.feature` | Unlink from session **never** creates Trash entry (**PW-18**); scene/campaign/session soft-deletes use respective tabs ([TR-10](trash.md#tr-10)) |

---
