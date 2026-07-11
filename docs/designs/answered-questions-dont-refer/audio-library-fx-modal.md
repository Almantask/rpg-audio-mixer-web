# FX Picker Modal — open questions (with recommendations)

**Design doc:** [FX Picker Modal design](../audio-library-fx-modal-design.md)

← [Index](README.md) · [Platform-wide](platform-wide.md)

**Picker exclusion:** FX tracks **already on the scene soundboard** are **omitted from the picker grid** (not shown as disabled rows). Same rule as [FX-02](active-scene-soundboard.md#fx-02) and soundscape/scene pickers below.

---

### FXM-01
**Question:** Add interaction — see [PW-23](active-scene-soundboard.md#pw-23).

**Decided:** Option A — checkbox multi-select + **Add Selected (N)** footer commit.

**Affected feature scenarios:** `add_fx_to_soundboard.feature` — all + button scenarios

---

### FXM-02
**Question:** Base Intensity in picker — filter grid, preview volume, or both?

**Option A (Recommended):** **Filter grid only** (same semantics as AL-06); preview uses track default volume.

ANSWER: A.

---

### FXM-03
**Question:** Import FX — auto-check new imports by default?

**Option A (Recommended):** **Yes** — newly imported tracks auto-checked in selection set; GM taps Add Selected to commit.

ANSWER: A.

---

### FXM-04
**Question:** Preview on modal close — stop or continue?

**Option A (Recommended):** **Stop preview** when modal closes (← back).

ANSWER: A.

---

### FXM-05
**Question:** Soundboard insertion order and hotkey assignment after batch add?

**Option A (Recommended):** Append after existing tiles in **selection order**; hotkeys assigned sequentially to new tiles only.

ANSWER: A.

---

### FXM-06
**Question:** Picker subtitle — task-specific vs browse copy?

**Option A (Recommended):** Task-specific: **"Select effects for this scene's soundboard."**

ANSWER: A.

---

### PW-14, PW-24, PW-25, PW-26, PW-27, PW-47
**Affected feature scenarios:** `add_fx_to_soundboard.feature`; `session_lock.feature`; `search_sounds.feature`

**Decided elsewhere:** [PW-23](active-scene-soundboard.md#pw-23), [PW-28](active-scene-soundboard.md#pw-28) — see [active-scene-soundboard.md](active-scene-soundboard.md).

---

### New questions from scenario gaps

### F-FXM-01
**Question:** Should **already-on-scene** FX appear in the Add Sound picker?

**Option A (Recommended):** **No** — tracks already on the scene soundboard are **filtered out** and not shown in the picker.

ANSWER: A.

**Affected feature scenarios:** `add_fx_to_soundboard.feature` — *An effect already in the soundboard shows an already-added indicator* (rewrite: already-added FX absent from picker)

---

### F-FXM-02
**Question:** Should Session Lock hide/disable Add Sound entirely?

**Decided:** Option A — disable/hide Add Sound when locked. See [PW-28](active-scene-soundboard.md#pw-28).

**Affected feature scenarios:** `session_lock.feature` — lock scenario (Add Soundscape mentioned, not Add Sound)

## Principal QA — full scenario notes

**Sign-off status:** ✅ Decisions complete — rewrite `add_fx_to_soundboard.feature` and extend `session_lock.feature` per table below.

### Gherkin ↔ design — resolved conflicts

| Area | Decision | Gherkin action |
|---|---|---|
| Commit model | Checkbox + **Add Selected (N)** (FXM-01) | **Rewrite** all instant **+** scenarios in `add_fx_to_soundboard` |
| Already on scene | **Filtered out** of picker (F-FXM-01) | **Remove/rewrite** already-added indicator scenarios |
| Import in picker | **No Import** action in the Add Sound picker (FX-13, supersedes FXM-03 and the design's *Import FX* button) | **Retire** Import button / imported-file scenarios in `add_fx_to_soundboard`; import stays Library-page only ([`audio-library-fx-design.md`](../audio-library-fx-design.md)) |
| Base Intensity filter | **Filters grid only**, preview volume unaffected (FXM-02) | **Add** filter-by-intensity scenario, parallel to `search_sounds.feature` |
| Preview | Stop on close (FXM-04) | **Add** F-32 scenario |
| Batch order / hotkeys | Append in selection order; hotkeys assigned sequentially to new tiles (FXM-01 + FXM-05) | **Add** F-33; align multi-add scenario |
| Modal copy | Task subtitle *"Select effects for this scene's soundboard."* (FXM-06) | **Add** F-31; update subtitle assertion |
| Session Lock | Block Add Sound + picker (F-FXM-02, [PW-28](active-scene-soundboard.md#pw-28)) | **Extend** `session_lock` (F-34, F-35) |

### Decisions — scenario impact

#### FXM-01 — Add interaction / commit model (P0) → **Decided** [PW-23](active-scene-soundboard.md#pw-23)
- **Decision:** Checkbox multi-select + **Add Selected (N)** footer commit; modal stays open for additional picks.
- **Affected scenarios:** `add_fx_to_soundboard` — **all + button scenarios** require rewrite; **new:** F-33.

#### FXM-02 — Base Intensity in picker (P1) → **Decided A**
- **Decision:** **Filter grid only** (same semantics as AL-06); preview uses the track's saved default volume, unaffected by the filter.
- **Affected scenarios:** **new:** F-30.

#### FXM-03 — Import auto-check (P1) → **Superseded by FX-13**
- **Decision:** **Moot** — [FX-13](active-scene-soundboard.md#fx-13) establishes there is **no Import action** in the Add Sound picker, so "auto-check new imports" does not apply in this launch context. Import (and any auto-check behavior) lives on the Library page only.
- **Affected scenarios:** retire Import-in-picker scenarios in `add_fx_to_soundboard`; **new:** F-36 (asserts absence).

#### FXM-04 — Preview on modal close (P1) → **Decided A**
- **Decision:** **Stop preview** when modal closes (← Back to Active Scene). Distinct from `preview_fx_track.feature`, which covers Library-page preview only.
- **Affected scenarios:** **new:** F-32.

#### FXM-05 — Insertion order / hotkeys after batch add (P1) → **Decided A**
- **Decision:** Append after existing tiles in **selection order**; hotkeys assigned sequentially to new tiles only.
- **Affected scenarios:** `add_fx_to_soundboard` (multi-add); **new:** F-33 (combined with FXM-01).

#### FXM-06 — Picker subtitle (P1) → **Decided A**
- **Decision:** Task-specific subtitle: *"Select effects for this scene's soundboard."* Modal title remains **"Sound Effects"** per design.
- **Affected scenarios:** **new:** F-31.

#### F-FXM-01 — Exclude already-on-scene FX (P0) → **Decided A**
- **Decision:** FX already on the scene soundboard **do not appear** in the Add Sound picker grid (filtered out, not shown disabled).
- **Affected scenarios:** `add_fx_to_soundboard` — rewrite *already-added indicator* scenarios; **new:** F-37.

#### F-FXM-02 — Session Lock blocks Add Sound (P0) → **Decided A**, [PW-28](active-scene-soundboard.md#pw-28)
- **Decision:** **Add Sound tile disabled/hidden** when Session Lock is on; no path to open the picker or add FX mid-session.
- **Affected scenarios:** `session_lock`; **new:** F-34, F-35.

#### FX-13 — No import from picker (P1) → **Decided A**, cross-ref [active-scene-soundboard.md#fx-13](active-scene-soundboard.md#fx-13)
- **Decision:** There is **no Import action** inside the Add Sound picker; the GM can only add existing library FX via checkbox selection + Add Selected. Import/Buy More/Free Tracks actions belong to the Library page only.
- **Affected scenarios:** retire `add_fx_to_soundboard` — *The Import button opens the browser file picker*; *A file imported via Import appears in the FX library and selection list*; **new:** F-36.

### Scenarios to author

| ID | Scenario |
|---|---|
| **F-30** | Adjusting the Base Intensity filter narrows the picker grid to matching tracks; preview volume is unaffected |
| **F-31** | Add Sound modal shows title **Sound Effects** with subtitle *Select effects for this scene's soundboard.* |
| **F-32** | Preview stops when the GM closes the picker via ← Back to Active Scene |
| **F-33** | Add Selected (2) commits two effects in one action, appended to the soundboard in selection order with sequential hotkeys |
| **F-34** | Session Lock disables/hides the Add Sound tile on the soundboard |
| **F-35** | Session Lock blocks opening the Add Sound picker by any other path |
| **F-36** | Add Sound picker modal has no Import action; import remains Library-page only |
| **F-37** | Picker grid excludes FX tracks already on the scene soundboard |

### Scenarios to retire or rewrite

| Feature file | Retire / rewrite |
|---|---|
| `add_fx_to_soundboard.feature` | Instant **+** add → **Add Selected** batch commit (rewrite); remove already-added-in-list assertions → assert absence from picker; **retire** *Import button opens the browser file picker* and *A file imported via Import appears in the FX library and selection list* (no import in this picker, FX-13); rewrite tab label **One-Shots & SFX** → **Soundboard** (FX-01) |
| `session_lock.feature` | Add Sound disabled when locked (**new:** F-34, F-35) |

---
