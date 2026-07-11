# Scenes List — open questions (with recommendations)

**Design doc:** [Scenes List design](../scenes-list-design.md)

← [Index](README.md) · [Platform-wide](platform-wide.md)

---

### SL-01
**Question:** Play button on cards — see PW-29.

**Option A (Recommended):** **No play button** on global Scenes list; row body opens Active Scene without playback.

ANSWER: A

**Affected feature scenarios:** `play_scene.feature` — all play-button scenarios; `view_created_scenes.feature` (indirect)

---

### SL-02
**Question:** Delete pattern — see PW-15, PW-17.

**Option A (Recommended):** **🗑 icon** + optional swipe on touch; soft-delete to **Trash**; no confirmation; optional undo toast.

ANSWER: A

**Affected feature scenarios:** `delete_scene.feature` — all scenarios; `trash_recovery.feature`

---

### SL-03
**Question:** Clone — auto **Copy of [Name]** or name prompt dialog?

**Option A (Recommended):** **Auto-name** "Copy of [Scene Name]" immediately; GM renames via Edit if needed.

ANSWER: A

**Affected feature scenarios:** `scene_cloning.feature` — *Cloning a scene duplicates all configuration* (uses custom name "Forest Storm")

---

### SL-04
**Question:** Description on list cards (truncated) or Edit/Scene only?

**Option A (Recommended):** **Edit/Scene only** — cards show location name, tags, SC · FX; description not on list rows.

ANSWER: A

**Affected feature scenarios:** `add_description_to_scene.feature` — *Scene description is visible when viewing scenes*

---

### SL-05
**Question:** Find/filter — search by name, tag chips, both, or defer?

**Option B:** Search-by-name field above list in MVP.

ANSWER: B

**Affected feature scenarios:** **Gap**

---

### SL-06
**Question:** Default sort — recently played, recently edited, or alphabetical?

**Option A (Recommended):** **Recently used** (played or edited) first, per design "TBD — default: recent first".

ANSWER: A

**Affected feature scenarios:** **Gap**

---

### SL-07
**Question:** Delete confirmation warns when scene linked to active sessions?

**Option A (Recommended):** **Yes** — one-time warning: "This scene is linked to N sessions. It will be unlinked from those sessions and moved to Trash."

ANSWER: A

**Affected feature scenarios:** `delete_scene.feature` — delete scenarios; `session_scenes.feature` — linked scene behavior

---

### SL-08
**Question:** Large libraries (50+) — pagination, virtual scroll, infinite scroll?

**Option A (Recommended):** **Virtual scroll** in MVP; no pagination UI.

ANSWER: A

**Affected feature scenarios:** **Gap**

---

### PW-03, PW-15, PW-17, PW-29, PW-31
(PW-08 decided — see [active-scene-soundboard.md](active-scene-soundboard.md#pw-08). Other impacts in [platform-wide.md](platform-wide.md).)

**Affected feature scenarios:** `delete_scene.feature`; `view_created_scenes.feature`; `build_your_own_scene.feature`; `play_scene.feature`

---

### New questions from scenario gaps

### F-SL-01
**Question:** Should **New Scene** creation use a modal dialog (name, optional description, optional image) before landing on Scene screen?

**Option A (Recommended):** **Yes** — dialog on Scenes list per design; on success add row and optionally navigate to empty Scene screen (PW-31).

ANSWER: A

**Affected feature scenarios:** `build_your_own_scene.feature` — *New scene has Atmospheres and One-Shots tabs*; **Gap** for dialog fields

---

### F-SL-02
**Question:** Should scene cards display **SC · FX** counts?

**Option A (Recommended):** **Yes** — e.g. "4 SC · 12 FX" on every populated row.

ANSWER: A

**Affected feature scenarios:** **Gap** in `view_created_scenes.feature`

---

### F-SL-03
**Question:** Should **Duplicate ⧉** be a one-tap action (no dialog) separate from clone-with-custom-name?

**Option A (Recommended):** **Yes** — one tap creates "Copy of [Name]" (align SL-03 Option A).

ANSWER: A

**Affected feature scenarios:** `scene_cloning.feature` — all scenarios

---

---

## Principal QA — full scenario notes

**Sign-off status:** ✅ Scenes List open questions complete — **rewrite** `play_scene`, `delete_scene`, `scene_cloning`, and `add_description_to_scene`; **extend** `view_created_scenes` and `build_your_own_scene` per table below. **Pending PO:** **PW-31** post-create navigation ([platform-wide.md](platform-wide.md)). **Cross-ref:** all deletes → Trash **Scenes** tab ([PW-16](platform-wide.md#pw-16), [TR-10](trash.md#tr-10)).

### Gherkin ↔ design — resolved conflicts

| Area | Decision | Gherkin action |
|---|---|---|
| List playback | **No ▶ on scene cards** — row opens Active Scene only (**SL-01 A**, **PW-29**) | **Retire** `play_scene` — play-button + crossfade scenarios; **keep** tap-card opens without playback |
| Delete affordance | **🗑 icon** + optional swipe on touch (**SL-02 A**, **PW-15**) | **Rewrite** `delete_scene` — Vault → **Trash**; **add** 🗑-icon path alongside swipe |
| Delete confirm | **No confirm** on routine soft-delete; optional undo toast (**SL-02 A**, **PW-17** Option A for scenes) | **Do not** add always-on AlertDialog for scene delete; differs from sessions (**PW-17 B** in campaign-sessions) |
| Linked-session delete | **Warn** when scene linked to sessions — then soft-delete to **Scenes** tab (**SL-07 A**, **PW-16**) | **Add** **F-18** — confirmation mentions session unlink + move to Trash |
| Clone naming | **Auto "Copy of [Name]"** — no dialog (**SL-03 A**, **F-SL-03 A**) | **Rewrite** `scene_cloning` — remove `clone … as "Forest Storm"` name prompt |
| List description | **Edit/Scene only** — not on list cards (**SL-04 A**) | **Retire** `add_description_to_scene` — *Scene description is visible when viewing scenes* |
| Find/filter | **Search-by-name** field in MVP (**SL-05 B**) | **Add** **F-15**; tag-chip **filter** deferred (tags may display via `tag_scene` but not filter MVP) |
| Default sort | **Recently used** (played or edited) first (**SL-06 A**) | **Add** **F-17** |
| Large libraries | **Virtual scroll** at 50+ (**SL-08 A**) | **Add** **F-19** (`@slow` perf smoke) |
| New Scene create | **Modal dialog** — name (required), description + cover optional (**F-SL-01 A**) | **Add** **F-22**; **extend** `build_your_own_scene` / `view_created_scenes` create flows |
| Card metadata | **SC · FX** counts on every populated row (**F-SL-02 A**) | **Add** **F-24** |
| Duplicate action | **One-tap ⧉** → "Copy of [Name]" (**F-SL-03 A**) | **Add** **F-20** |
| Post-create nav | **PW-31** open — stay on list vs auto-open Scene screen | **Add** **F-23** once **PW-31** decided |
| Tab labels | **PW-08** — Soundscapes / Soundboard | **Rewrite** `view_created_scenes`, `build_your_own_scene` — Atmospheres / One-Shots & SFX → Soundscapes / Soundboard |

### Decisions — scenario impact

#### SL-01 — Play on cards (P0) → **Decided A** [PW-29](platform-wide.md#pw-29)
- **Decision:** **No play button** on global Scenes list; row body opens Active Scene without starting playback.
- **Affected scenarios:** **Retire** `play_scene` — *Tapping the play button on a scene card…*, *Switching from one scene to another crossfades…*, *Opening a scene without the play button…* (partial — keep open-without-play assertions only).

#### SL-02 — Delete pattern (P0) → **Decided A** [PW-15](platform-wide.md#pw-15), [PW-17](platform-wide.md#pw-17)
- **Decision:** Trailing **🗑** + optional swipe; **soft-delete → Trash**; **no confirmation** on routine delete; optional undo toast.
- **Affected scenarios:** **Rewrite all** `delete_scene` — Vault of Echoes → **Trash**; **add** 🗑 path (**F-21**); cross-ref `trash_recovery` naming (**PW-03**).

#### SL-03 — Clone naming (P1) → **Decided A**
- **Decision:** **Auto-name** "Copy of [Scene Name]" immediately; GM renames via Edit if needed.
- **Affected scenarios:** **Rewrite** `scene_cloning` — *Cloning a scene duplicates all configuration* (drop custom clone name Given/When).

#### SL-04 — Description on list cards (P1) → **Decided A**
- **Decision:** Description **Edit/Scene only**; cards show location name, tags, **SC · FX** stats.
- **Affected scenarios:** **Retire** `add_description_to_scene` — *Scene description is visible when viewing scenes*; keep add/update/optional scenarios.

#### SL-05 — Find/filter (P1) → **Decided B**
- **Decision:** **Search-by-name** field above list in MVP; tag-chip filters deferred.
- **Affected scenarios:** **new:** **F-15**; `tag_scene` unchanged (no list filter scenarios today).

#### SL-06 — Default sort (P1) → **Decided A**
- **Decision:** **Recently used** (played **or** edited) first.
- **Affected scenarios:** **new:** **F-17**.

#### SL-07 — Delete warns when linked to sessions (P1) → **Decided A**
- **Decision:** **Yes** — one-time warning when linked: scene unlinked from all sessions and **soft-deleted to Trash Scenes tab**.
- **Affected scenarios:** `delete_scene`; **new:** **F-18**; `session_scenes` — linked scene removal behavior.

#### SL-08 — Large libraries (P2) → **Decided A**
- **Decision:** **Virtual scroll** in MVP; no pagination UI.
- **Affected scenarios:** **new:** **F-19**.

#### F-SL-01 — New Scene modal (P1) → **Decided A**
- **Decision:** **Yes** — dialog on Scenes list (name required, description + cover optional); on success add row (**PW-31** governs navigate vs stay).
- **Affected scenarios:** **Rewrite** `build_your_own_scene` — *New scene has Atmospheres and One-Shots tabs* (create path via dialog first); **new:** **F-22**, **F-23**.

#### F-SL-02 — SC · FX counts (P1) → **Decided A**
- **Decision:** **Yes** — e.g. "4 SC · 12 FX" on every populated row.
- **Affected scenarios:** **new:** **F-24** in `view_created_scenes`.

#### F-SL-03 — One-tap Duplicate (P1) → **Decided A**
- **Decision:** **Yes** — one tap **Duplicate ⧉** creates "Copy of [Name]" with no dialog (aligns **SL-03**).
- **Affected scenarios:** **Rewrite all** `scene_cloning`; **new:** **F-20**.

### Scenarios to author

| ID | Scenario |
|---|---|
| **F-15** | Search scenes by name on Scenes list (**SL-05 B**) |
| **F-17** | Scenes list default sort is recently used (played or edited first) |
| **F-18** | Deleting a scene linked to one or more sessions shows warning before delete |
| **F-19** | Scenes list remains usable with 50+ scenes (virtual scroll, `@slow`) |
| **F-20** | Duplicate scene creates "Copy of Tavern" without name prompt |
| **F-21** | Delete scene via 🗑 icon moves to Trash (not Vault) |
| **F-22** | New Scene dialog collects name (required), description (optional), cover (optional) |
| **F-23** | After New Scene create — stay on list vs navigate to empty Scene screen (**PW-31** pending) |
| **F-24** | Scene list card shows **SC · FX** counts (e.g. "4 SC · 12 FX") |

### Scenarios to retire or rewrite

| Feature file | Retire / rewrite |
|---|---|
| `play_scene.feature` | **Retire** all list **▶ play-button** and **crossfade-from-list** scenarios; **keep** tap-card opens Active Scene without playback; slider/ducking scenarios unchanged |
| `delete_scene.feature` | **Rewrite** Vault → **Trash** naming; swipe + **🗑** paths; no confirm except **F-18** linked-session case |
| `scene_cloning.feature` | **Rewrite** custom clone name → one-tap **Copy of [Name]** (**SL-03**, **F-SL-03**) |
| `add_description_to_scene.feature` | **Retire** list visibility scenario; description remains Edit/Scene only (**SL-04**) |
| `view_created_scenes.feature` | **Add** SC · FX counts (**F-24**); **rewrite** tab labels per **PW-08**; align create flow with **F-SL-01** dialog |
| `build_your_own_scene.feature` | **Rewrite** implicit create → **New Scene** dialog entry (**F-22**); tab labels **Soundscapes** / **Soundboard** |
| `trash_recovery.feature` | **Rename** Vault → Trash in scene-restore scenarios (cross-ref [trash.md](trash.md)) |
| `session_scenes.feature` | Cross-check play-from-list scenarios delegate to **PW-29** / **SL-01** (no ▶ on session scene list if aligned) |

---
