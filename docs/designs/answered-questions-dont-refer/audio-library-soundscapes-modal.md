# Soundscapes Category Picker Modal — open questions (with recommendations)

**Design doc:** [Soundscapes Category Picker Modal design](../audio-library-soundscapes-modal-design.md)

← [Index](README.md) · [Platform-wide](platform-wide.md)

**Picker exclusion:** Soundscape categories **already on the scene** are **omitted from the picker grid**. Same rule as [F-FXM-01](audio-library-fx-modal.md#f-fxm-01) and [SS-10](session-scenes.md#ss-10--import-picker-exclude-already-linked-scenes).

---

### SCM-01
**Question:** Checkbox + Add Selected replaces + instant add — see [PW-23](active-scene-soundboard.md#pw-23).

**Decided:** Option A — **Checkbox + Add Selected (N)**. Same as [FXM-01](audio-library-fx-modal.md#fxm-01).

**Affected feature scenarios:** `add_soundscape_to_scene.feature` — all + button scenarios

---

### SCM-02
**Question:** Rename modals — **Category Picker** vs **Track Picker** to avoid composer confusion?

**Option A (Recommended):** **Yes** — UI titles: **Add Soundscape** (category picker) vs **Add FX** (composer fx picker, PW-43).

ANSWER: A

**Affected feature scenarios:** `add_soundscape_to_scene.feature`; `compose_soundscape.feature` (track vs category confusion)

---

### SCM-03
**Question:** In-modal Buy / Free Compositions in MVP, or Library only?

**Option A (Recommended):** **Include in modal** — GM can acquire content without leaving Active Scene picker.

ANSWER: A

**Affected feature scenarios:** **Gap** — no buy/free scenarios in `add_soundscape_to_scene.feature`

---

### SCM-04
**Question:** Card metadata format — see AL-02.

**Option A (Recommended):** Track count + layer count on picker cards.

ANSWER: A

**Affected feature scenarios:** **Gap**

---

### SCM-05
**Question:** Default scene card values on add — see active-scene-soundscapes AS-S-11 (out of scope here).

**Option A (Recommended):** Category added **inactive** (not playing); default volume 100%; intesity II.

ANSWER: A

**Affected feature scenarios:** `add_soundscape_to_scene.feature` — add scenarios (playback state unspecified)

---

### SCM-06
**Question:** Preview on modal close — stop or continue? (parallel [FXM-04](audio-library-fx-modal.md#fxm-04))

**Decided:** Option A — **Stop preview** when modal closes (← back).

**Affected feature scenarios:** **Gap**; align with [FXM-04](audio-library-fx-modal.md#fxm-04) scenario **F-32**

---

### SCM-07
**Question:** Insertion order after batch add? (parallel [FXM-05](audio-library-fx-modal.md#fxm-05))

**Decided:** Option A — append after existing categories in **selection order**. (No hotkeys on soundscape cards.)

**Affected feature scenarios:** `add_soundscape_to_scene.feature` — *Multiple … in one visit*; align with [FXM-05](audio-library-fx-modal.md#fxm-05) scenario **F-33**

---

### SCM-08
**Question:** Picker subtitle — task-specific vs browse copy? (parallel [FXM-06](audio-library-fx-modal.md#fxm-06))

**Decided:** Option A — task-specific: **"Select soundscapes for this scene."**

**Affected feature scenarios:** **Gap**; parallel to [FXM-06](audio-library-fx-modal.md#fxm-06)

---

### PW-24, PW-25, PW-26, PW-27, PW-43
**Affected feature scenarios:** `add_soundscape_to_scene.feature`; `session_lock.feature`

**Decided elsewhere:** [PW-23](active-scene-soundboard.md#pw-23), [PW-28](active-scene-soundboard.md#pw-28) — see [active-scene-soundboard.md](active-scene-soundboard.md) and [F-FXM-02](audio-library-fx-modal.md#f-fxm-02).

---

### New questions from scenario gaps

### F-SCM-03
**Question:** Should **already-on-scene** soundscape categories appear in the Add Soundscape picker? (parallel [F-FXM-01](audio-library-fx-modal.md#f-fxm-01))

**Decided:** Option A — **No**; filtered out of picker. Same as [F-FXM-01](audio-library-fx-modal.md#f-fxm-01).

**Affected feature scenarios:** `add_soundscape_to_scene.feature` — already-added indicator scenarios (rewrite: already-added categories absent from picker)

---

### F-SCM-04
**Question:** Should Session Lock hide/disable Add Soundscape entirely? (parallel [F-FXM-02](audio-library-fx-modal.md#f-fxm-02))

**Decided:** Option A — disable/hide Add Soundscape when locked. See [PW-28](active-scene-soundboard.md#pw-28) and [F-FXM-02](audio-library-fx-modal.md#f-fxm-02).

**Affected feature scenarios:** `session_lock.feature`; **new:** F-41

---

### F-SCM-01
**Question:** Should adding categories via **Add Selected** leave Active Scene **without starting playback**?

**Option A (Recommended):** **Yes** — per design ("does not start playback").

ANSWER: A

**Affected feature scenarios:** **Gap** in `add_soundscape_to_scene.feature`

---

### F-SCM-02
**Question:** Should **Import** be removed from category picker and moved to Composer track picker only?

**Option A (Recommended):** **Yes** — per PW-24 Option A and design browse-vs-picker table.

ANSWER: A

**Affected feature scenarios:** `add_soundscape_to_scene.feature` — *The Import button opens the browser file picker*; *Importing a file via Import creates a soundscape category*

---

## Principal QA — full scenario notes

**Sign-off status:** ✅ Decisions complete — rewrite `add_soundscape_to_scene.feature` and extend `session_lock.feature` per table below.

### Gherkin ↔ design — resolved conflicts

| Area | Decision | Gherkin action |
|---|---|---|
| Commit model | Checkbox + **Add Selected (N)** (SCM-01) | **Rewrite** all instant **+** scenarios in `add_soundscape_to_scene` |
| Already on scene | **Filtered out** of picker (F-SCM-03) | **Remove/rewrite** already-added indicator scenarios |
| Import in picker | **Not in category picker** (F-SCM-02, PW-24) | **Retire** Import footer / Composer redirect scenarios in `add_soundscape_to_scene` |
| Playback on add | **Idle** — no auto-play (F-SCM-01) | **Add** scenario; remove any implicit play-on-add |
| Session Lock | Block Add Soundscape + picker (F-SCM-04) | **Extend** `session_lock` (F-41) |
| Modal copy | Task subtitle + **Add Soundscape** title (SCM-02, SCM-08) | **Update** assertions in open-picker scenarios (F-37) |
| Preview | Stop on close (SCM-06) | **Add** F-32 parallel scenario if category preview exists |
| Batch order | Append in checkbox order (SCM-07) | **Add** F-40; align multi-add scenario |

### Decisions — scenario impact

#### SCM-01 — Commit model (P0) → **Decided** [PW-23](active-scene-soundboard.md#pw-23), [FXM-01](audio-library-fx-modal.md#fxm-01)
- **Decision:** Checkbox + **Add Selected (N)** footer commit.
- **Affected scenarios:** `add_soundscape_to_scene` — **all scenarios** require rewrite.

#### SCM-02 — Modal naming (P1) → **Decided A**
- **Decision:** UI titles **Add Soundscape** (category picker) vs **Add FX** (composer track picker, PW-43).
- **Affected scenarios:** `add_soundscape_to_scene`, `compose_soundscape`; **new:** F-37.

#### SCM-03 — Buy / Free in modal MVP (P1) → **Decided A**
- **Decision:** **Include** Buy Composition + Free Compositions CTAs in picker modal.
- **Affected scenarios:** **new:** F-38.

#### SCM-04 — Card metadata (P1) → **Decided A**, aligns **AL-02**
- **Decision:** **Track count + layer count** on picker cards (not per-intensity breakdown).
- **Affected scenarios:** `add_soundscape_to_scene` (implicit card copy); `manage_soundscape_categories` (consistent metadata).

#### SCM-05 — Default scene values on add (P1) → **Decided A**, aligns [AS-S-11](active-scene-soundscapes.md#as-s-11--default-mixer-values-for-newly-added-category)
- **Decision:** Category added **idle** (not playing); **Volume 100%**; **Intensity II**; append to bottom of list.
- **Affected scenarios:** `add_soundscape_to_scene`, `category_playing_state`; **new:** F-39.

#### SCM-06 — Preview on modal close (P1) → **Decided A**, parallel [FXM-04](audio-library-fx-modal.md#fxm-04)
- **Decision:** **Stop preview** when modal closes (← back).
- **Affected scenarios:** **new:** F-32 (if category preview in picker).

#### SCM-07 — Insertion order after batch add (P1) → **Decided A**, parallel [FXM-05](audio-library-fx-modal.md#fxm-05)
- **Decision:** Append after existing categories in **selection order**.
- **Affected scenarios:** `add_soundscape_to_scene` (multi-add); **new:** F-40.

#### SCM-08 — Picker subtitle (P1) → **Decided A**, parallel [FXM-06](audio-library-fx-modal.md#fxm-06)
- **Decision:** Task-specific subtitle: *Select soundscapes for this scene.*
- **Affected scenarios:** **new:** F-37 (with SCM-02).

#### F-SCM-01 — Add does not start playback (P1) → **Decided A**
- **Decision:** **Add Selected** does not start playback; categories land **idle**.
- **Affected scenarios:** **new:** assert no play-on-add in `add_soundscape_to_scene`.

#### F-SCM-02 — Import removed from category picker (P1) → **Decided A**, **PW-24**
- **Decision:** **No Import** in category picker; import via Library / Composer track picker only.
- **Affected scenarios:** **Retire** `add_soundscape_to_scene` — *Import button opens file picker*; *Import creates category → Composer*.

#### F-SCM-03 — Exclude already-on-scene categories (P0) → **Decided A**, parallel [F-FXM-01](audio-library-fx-modal.md#f-fxm-01)
- **Decision:** Categories already on the scene **do not appear** in picker grid.
- **Affected scenarios:** **new:** F-43; rewrite already-added indicator scenarios.

#### F-SCM-04 — Session Lock (P0) → **Decided A**, parallel [F-FXM-02](audio-library-fx-modal.md#f-fxm-02), [PW-28](active-scene-soundboard.md#pw-28)
- **Decision:** **Disable/hide Add Soundscape** when locked; picker cannot open.
- **Affected scenarios:** `session_lock`; **new:** F-41.

### Scenarios to author

| ID | Scenario |
|---|---|
| **F-37** | Add Soundscape modal title **Add Soundscape**; subtitle *Select soundscapes for this scene.* |
| **F-38** | Free Compositions (and Buy Composition) CTAs visible inside soundscapes picker modal |
| **F-39** | Added category appears idle at Volume 100%, Intensity II, appended to list bottom |
| **F-40** | Add Selected (3) adds three categories in one commit, in checkbox order |
| **F-41** | Session Lock disables Add Soundscape; picker cannot open |
| **F-43** | Picker grid excludes categories already on the scene |

### Scenarios to retire or rewrite

| Feature file | Retire / rewrite |
|---|---|
| `add_soundscape_to_scene.feature` | Instant **+** add → **Add Selected** batch; remove Import-in-picker flows; remove already-added-in-list assertions → assert absence from picker |
| `session_lock.feature` | Add Soundscape disabled when locked (mirror FX F-34/F-41) |

---
