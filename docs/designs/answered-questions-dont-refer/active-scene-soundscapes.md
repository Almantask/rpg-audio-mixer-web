# Active Scene — Soundscapes — open questions (with recommendations)

**Design doc:** [Active Scene — Soundscapes design](../active-scene-soundscapes-design.md)

← [Index](README.md) · [Platform-wide](platform-wide.md)

---

## Platform-wide (cross-cutting)

Decided in [active-scene-soundboard.md](active-scene-soundboard.md): **PW-08**, **PW-18**, **PW-23**, **PW-28**, **PW-37**, **PW-41**.

### PW-15 — Delete affordance (web/tablet)

**Option A (recommended):** **Trailing trash icon on every category card** + **swipe-right on touch** — icon is discoverable on desktop/tablet; swipe satisfies mobile muscle memory (`build_your_own_scene`, `session_lock`).

ANSWER: A.

---

### PW-39 — Soundscape concurrency cap (10 playing categories)

**Option A (recommended):** **Silent oldest-stop** — when an 11th category starts playing, the oldest playing category stops with no toast. Live session must not interrupt narrative.

ANSWER: A.

---

## Screen-specific (Active Scene — Soundscapes)

### AS-S-01 — Add Soundscape modal commit model

**Decided:** Same as [PW-23](active-scene-soundboard.md#pw-23) — checkbox + **Add Selected (N)**.

---

### AS-S-02 — d20 vs ▶ play/resume

**Option A (recommended):** **Split controls** — **d20** = new random track from current intensity pool (replaces playing track); **▶/⏸** = play/resume/pause only (no re-roll on ▶). When a track **ends naturally**, the next track is a **new random pick from the same intensity level** of the same category (no loop toggle). Matches `play_random_track.feature` and keeps live play predictable.

ANSWER: A.

---

### AS-S-03 — Master Intensity Switcher placement

**Option A (recommended):** There is no need for master itensity, it's per soundscape only.

ANSWER: A.

---

### AS-S-04 — Play Scene and Mute placement

**Option A (recommended):** **Master Volume bar** — `[Play Scene]` and mute icon inline with MASTER VOLUME slider (`active_scene_controls.feature`). Header keeps **Save State**, **Stop All**, **Session Lock** only.

ANSWER: A.

---

### AS-S-05 — Delete category affordance

**Option A (recommended):** **Trash icon on card header** (web/tablet) **+ swipe-right** (touch). Disabled when Session Lock ON.

ANSWER: A.

---

### AS-S-06 — Reorder interaction

**Option A (recommended):** **No edit mode.** Visible **drag handle** on each card reorders anytime; order **auto-saves on drop**. Align `reorder_soundscape_categories.feature` to handle-based drag (not long-press). Disabled when Session Lock is ON.

ANSWER: A.

---

### AS-S-07 — Media Session Next scope

**Option A (recommended):** “Next” = new random track for the category of the same intensity level.

ANSWER: A.

---

### AS-S-08 — Playing state chrome

**Option A (recommended):** **Coloured glow border on card** + progress bar + ⏸ icon — align with Soundboard playing chrome and `category_playing_state.feature`. Glow = “this category is outputting audio.”

ANSWER: A.

---

### AS-S-09 — Track count `(N TRACKS)` meaning

**Option A (recommended):** **Total tracks in category across all intensity levels** — e.g. **WEATHER (12 TRACKS)**. Stable label; GM uses Intensity toggles to narrow pool.

ANSWER: A.

---

### AS-S-10 — ADD SOUNDSCAPE under Session Lock

**Option A (recommended):** **Disabled (greyed), still visible** — GM sees the affordance exists but lock prevents use. Matches `session_lock.feature` “disabled or hidden” with preference for disabled.

ANSWER: A.

---

### AS-S-11 — Default mixer values for newly added category

**Option A (recommended):**

| Setting | Default |
|---|---|
| Volume | 100% |
| Intensity | **Lowest level that has tracks** (e.g. I if populated) |
| List order | **Append to bottom** |
| Playback | **Idle** (not auto-play) |
| Track end | **No loop control** — when playing, each finished track triggers a **new random track** at the **same intensity** of that category |

ANSWER: A.

---

## New feature scenario questions (design ↔ Gherkin gaps)

*Not yet in open-questions files; surfaced from comparing design doc + features.*

### FSQ-AS-01 — Mute scope

**Option A (recommended):** **Soundscapes only** — mute on Master Volume bar silences atmosphere output; soundboard FX unchanged (`play_mixed_track_loops_and_sounds.feature` separation).

ANSWER: A.

---

### FSQ-AS-02 — Play Scene start behavior

**Option A (recommended):** **Random pick per idle category** from each category’s current intensity pool; **resume** if category was paused mid-track. Categories already playing are left unchanged. Playing categories **chain random tracks** at end of each track (same intensity, same category — no loop toggle).

ANSWER: A.

---

### FSQ-AS-03 — Reorder persistence without Save State

**Option A (recommended):** **Reorder auto-persists on drop** — no Save State tap required. Update `reorder_soundscape_categories.feature` “persists after close and reopen” to assert immediate persistence.

ANSWER: A.

---

### FSQ-AS-04 — Concurrency cap scope

**Option A (recommended):** **Cap applies to categories with active playback** (playing or paused-with-loaded-track count toward limit only while playing). Paused categories free a slot.

ANSWER: A.

---

### FSQ-AS-05 — Background audio when opening another scene (no play)

**Option A (recommended):** **Fade out the old scene, fade in the new scene audio**

ANSWER: A.

---

### FSQ-AS-06 — Empty intensity pool feedback (d20 / ▶)

**Option A (recommended):** **Block the button** — disabled (greyed), still visible — GM sees the affordance exists but lock prevents use. Matches `session_lock.feature`

ANSWER: A.

---

### FSQ-AS-07 — Soundboard Master slider placement

**Option A (recommended):** **Soundboard tab only** — Soundscapes tab shows soundscape Master Volume only (`active-scene-soundscapes-design.md`). Move soundboard Master scenarios out of `soundscape_volume_control.feature` into a Soundboard volume feature.

ANSWER: A.

---

### FSQ-AS-08 — Track end behavior (no loop toggle)

**Question:** Per-card Loop ↻ toggle, or automatic random chain?

**Option A (recommended):** **No loop toggle.** Remove Loop ↻ from UI. When a track finishes, **automatically play a new random track** from the **same intensity level** of the **same soundscape category**. Retire loop on/off scenarios in `active_scene_controls.feature` and related Gherkin.

ANSWER: A.

---

### FSQ-AS-09 — Save State while Session Lock ON

**Option A (recommended):** Remove save state altogether. It auto saves and only lock prevents editing.

ANSWER: A.

---

### FSQ-AS-10 — Import from Add Soundscape picker (PW-24 overlap)

**Option A (recommended):** **No Import in scene picker MVP** — import via Library / Category Composer only; picker is select-and-add. Retire Import scenarios from `add_soundscape_to_scene.feature` or mark `@deprecated`. Keep the add ADD SOUNDSCAPE button.

ANSWER: A.

---

## Principal QA — full scenario notes

**Sign-off status:** ✅ Decisions complete — every PW/AS-S/FSQ-AS item above is answered (A). Several answers **conflict with current Gherkin** and require rewrite/retirement, not just extension; see table below before touching `add_soundscape_to_scene.feature`, `active_scene_controls.feature`, `reorder_soundscape_categories.feature`, `play_random_track.feature`, `master_controls.feature`, and `play_scene.feature`.

**Scope:** `active-scene-soundscapes-design.md`, this file, `platform-wide.md` PW-15/PW-39, and feature files: `play_random_track`, `reorder_soundscape_categories`, `active_scene_controls`, `category_playing_state`, `session_lock`, `master_controls`, `play_scene`, `play_mixed_track_loops_and_sounds`, `soundscape_volume_control`, `build_your_own_scene`, `add_soundscape_to_scene`.

**Shared with Soundboard:** [PW-08](active-scene-soundboard.md#pw-08) (tab labels), [PW-37](active-scene-soundboard.md#pw-37) (auto-ducking to 40%), [PW-41](active-scene-soundboard.md#pw-41) (Session Lock matrix) are decided in [active-scene-soundboard.md](active-scene-soundboard.md) and only cross-checked here for Soundscapes-tab impact — not re-litigated.

### Gherkin ↔ design — resolved conflicts

| Area | Decision | Gherkin action |
|---|---|---|
| Loop toggle (**FSQ-AS-08**) | **No Loop ↻ toggle.** Track end auto-chains a new random track, same intensity, same category | **Retire** *Loop toggle disables looping for a category* in `active_scene_controls`; keep "looping" `Given` steps in `play_mixed_track_loops_and_sounds` as the auto-chain behavior (no user toggle implied), **add** auto-chain scenario to `play_random_track` |
| Master Intensity (**AS-S-03**) | **No master-level intensity control** on Active Scene — intensity is per-soundscape only | **Retire** the 3 *Master Intensity Switcher* scenarios in `master_controls.feature` (sets-all, gold highlight, greyed-out) |
| Auto-save reorder (**FSQ-AS-03**, **AS-S-06**) | Reorder **auto-persists on drop**; no Save State needed | **Rewrite** `reorder_soundscape_categories` — drag **handle** replaces long-press; assert persistence without requiring close/reopen |
| Remove Save State (**FSQ-AS-09**) | Save State button removed; **everything auto-saves**; lock only blocks *editing* | **Retire** *Save State persists the current mixer configuration* in `active_scene_controls`; **replace** with auto-save-on-change assertion |
| Long-press reorder → handle drag (**AS-S-06**) | Visible drag handle, no edit mode, no long-press | **Rewrite** *Long-pressing a category card activates drag mode* in `reorder_soundscape_categories` |
| Swipe delete → trash icon (**PW-15**, **AS-S-05**) | **Both** trash icon (header) **and** swipe-right (touch) | **Add** trash-icon scenario alongside existing swipe scenario in `build_your_own_scene`; keep swipe, don't retire it |
| Scene switch crossfade (**FSQ-AS-05**) | Opening another scene **without** tapping play still **fades out old / fades in new** background audio | **Rewrite** *Opening a scene without the play button does not stop the currently playing scene* in `play_scene` — current text implies no-op background continuation, contradicts the fade decision |
| Empty pool feedback (**FSQ-AS-06**) | d20/▶ is **disabled (greyed)**, not tappable-then-warned | **Rewrite** *Tapping d20 on a category with no tracks at the selected intensity shows an empty pool warning* in `play_random_track` — assert disabled state, not a post-tap warning |
| Soundboard Master placement (**FSQ-AS-07**) | Soundboard Master lives on the **Soundboard tab only** | **Move** *Soundboard Master slider controls all FX output* and *Soundboard Master volume does not affect soundscape categories* out of `soundscape_volume_control.feature` into a Soundboard-scoped volume feature |
| Import in picker (**FSQ-AS-10**) | **No Import** in Add Soundscape picker | **Retire** Import scenarios in `add_soundscape_to_scene` — same decision as [F-SCM-02](audio-library-soundscapes-modal.md#f-scm-02); don't duplicate the fix, just apply it here too |

### Decisions — scenario impact

#### PW-15 — Delete affordance (web/tablet) (P0) → **Decided A**
- **Decision:** Trailing trash icon on every category card **+** swipe-right on touch — both affordances coexist.
- **Affected scenarios:** `build_your_own_scene` — **add** trash-icon path; keep existing swipe scenario; **new:** F-75.

#### PW-39 — Soundscape concurrency cap (P0) → **Decided A**
- **Decision:** Silent oldest-stop at 11 concurrent playing categories, no toast.
- **Affected scenarios:** `play_mixed_track_loops_and_sounds` — *Setting a concurrency limit on soundscapes* already matches; scope nuance in **FSQ-AS-04** needs a companion scenario (**new:** F-82).

#### AS-S-01 — Add Soundscape commit model (P0) → **Decided**, same as [PW-23](active-scene-soundboard.md#pw-23)
- **Decision:** Checkbox + **Add Selected (N)**, not instant **+**.
- **Affected scenarios:** Already tracked in [audio-library-soundscapes-modal.md § SCM-01](audio-library-soundscapes-modal.md#scm-01--commit-model-p0--decided-pw-23-fxm-01) — do not duplicate the rewrite here; `add_soundscape_to_scene` all-scenario rewrite lives there.

#### AS-S-02 — d20 vs ▶/⏸ split, track-end chaining (P0) → **Decided A**
- **Decision:** d20 = re-roll from current intensity pool; ▶/⏸ = play/resume/pause only, never re-rolls; natural track end auto-chains a new random pick at the same intensity.
- **Affected scenarios:** `play_random_track` — existing 3 scenarios (start, respects intensity, d20 replaces playing track) hold; **gap** on natural-end chaining and on ▶ not re-rolling. **New:** F-73, F-74.

#### AS-S-03 — No master intensity switcher (P0) → **Decided A**
- **Decision:** Intensity is per-soundscape only; no master-level control on this screen.
- **Affected scenarios:** **Retire** the 3 Master Intensity Switcher scenarios in `master_controls.feature` (see conflicts table).

#### AS-S-04 — Play Scene / Mute placement (P1) → **Decided A**
- **Decision:** `[Play Scene]` and mute inline with the Master Volume bar; header keeps Save State... **but see FSQ-AS-09 — Save State is removed**, so header keeps only Stop All + Session Lock.
- **Affected scenarios:** `active_scene_controls` — Mute/unmute scenarios hold as behavior; header layout is UI-only (no new Gherkin), Save State scenario is retired per FSQ-AS-09.

#### AS-S-05 — Delete category affordance (P0) → **Decided A**, same as PW-15
- **Decision:** Trash icon on card header + swipe-right; both disabled when Session Lock is ON.
- **Affected scenarios:** `build_your_own_scene` (add trash-icon scenario, F-75); `session_lock` — add trash-icon-disabled assertion alongside existing swipe-disabled assertion.

#### AS-S-06 — Reorder interaction (P0) → **Decided A**
- **Decision:** No edit mode; visible drag handle reorders anytime; auto-saves on drop; disabled under Session Lock.
- **Affected scenarios:** `reorder_soundscape_categories` — rewrite long-press scenario to handle-based drag; strengthen persistence scenario to assert immediate save. **New:** F-76.

#### AS-S-07 — Media Session Next scope (P1) → **Decided A**
- **Decision:** "Next" = new random track for the category at its current intensity level.
- **Affected scenarios:** `play_random_track` — *Tapping Next on external controls randomizes all playing categories* already matches this decision. No change needed.

#### AS-S-08 — Playing state chrome (P1) → **Decided A**
- **Decision:** Coloured glow border + progress bar + ⏸ icon.
- **Affected scenarios:** `category_playing_state` — glow-border scenarios match; **progress bar is a gap**. **New:** F-79.

#### AS-S-09 — Track count `(N TRACKS)` meaning (P2) → **Decided A**
- **Decision:** Total tracks in category across **all** intensity levels, not just the active one.
- **Affected scenarios:** **Gap** — no scenario asserts the count source today. **New:** F-80.

#### AS-S-10 — ADD SOUNDSCAPE under Session Lock (P0) → **Decided A**
- **Decision:** Disabled (greyed), still visible — not hidden.
- **Affected scenarios:** `session_lock` — *the "Add Soundscape" button should be disabled or hidden* is worded as an either/or; **tighten** to assert specifically **disabled and visible**, matching [PW-41](active-scene-soundboard.md#pw-41).

#### AS-S-11 — Default mixer values on add (P1) → **Decided A**
- **Decision:** Volume 100%, intensity = lowest populated level, appended to bottom, idle (no autoplay), no loop control (chains on natural end once playing).
- **Affected scenarios:** **Gap** in `add_soundscape_to_scene`. **New:** F-81. Cross-check against [SCM-05](audio-library-soundscapes-modal.md#scm-05) which independently states Intensity **II** as default — **flag for Product Owner: AS-S-11 says "lowest populated level" but SCM-05 says "Intensity II" — these can disagree if level I is empty. Needs reconciliation before F-81/F-39 are authored.**

#### FSQ-AS-01 — Mute scope (P1) → **Decided A**
- **Decision:** Master mute silences soundscapes only; soundboard FX are unaffected.
- **Affected scenarios:** `active_scene_controls` mute scenarios hold; **gap** on asserting soundboard FX continue during mute. **New:** F-78 (parallel to the existing "Master Volume slider does not affect soundboard volume" scenario in `play_mixed_track_loops_and_sounds`).

#### FSQ-AS-02 — Play Scene start behavior (P0) → **Decided A**
- **Decision:** Random pick per **idle** category from its current intensity pool; **resume** if paused mid-track; already-playing categories untouched; playing categories chain random tracks at track end.
- **Affected scenarios:** `active_scene_controls` — *Play Scene starts all configured atmospheres* is too coarse (doesn't distinguish idle/paused/playing). **Rewrite.** **New:** F-77.

#### FSQ-AS-03 — Reorder persistence without Save State (P0) → **Decided A**
- **Decision:** Reorder auto-persists on drop.
- **Affected scenarios:** `reorder_soundscape_categories` — *Reordering persists after closing and reopening the scene* should assert immediate persistence, not merely survive a close/reopen cycle. Folded into F-76.

#### FSQ-AS-04 — Concurrency cap scope (P1) → **Decided A**
- **Decision:** Cap counts only categories with **active playback**; pausing a category frees its slot.
- **Affected scenarios:** `play_mixed_track_loops_and_sounds` — existing 10/11th scenario doesn't cover pause-frees-slot. **New:** F-82.

#### FSQ-AS-05 — Background audio on scene switch without play (P0) → **Decided A**
- **Decision:** Fade out the old scene, fade in the new scene's audio — even when the new scene is opened without tapping its play button.
- **Affected scenarios:** `play_scene` — **direct conflict**, see conflicts table. *Rewrite.* **New:** F-83.

#### FSQ-AS-06 — Empty intensity pool feedback (P1) → **Decided A**
- **Decision:** Block the d20/▶ button (disabled, greyed) instead of a post-tap warning.
- **Affected scenarios:** `play_random_track` — **direct conflict** with existing empty-pool-warning scenario. *Rewrite.* **New:** F-84.

#### FSQ-AS-07 — Soundboard Master slider placement (P1) → **Decided A**
- **Decision:** Soundboard Master lives on the Soundboard tab only; Soundscapes tab shows soundscape Master Volume only.
- **Affected scenarios:** `soundscape_volume_control` — **move** the two Soundboard Master scenarios to a Soundboard-scoped volume feature (new file or `master_controls`). No new scenario ID needed, just relocation.

#### FSQ-AS-08 — Track end behavior, no loop toggle (P0) → **Decided A**
- **Decision:** No Loop ↻ toggle; natural track end auto-chains a new random track at the same intensity, same category.
- **Affected scenarios:** `active_scene_controls` — **retire** *Loop toggle disables looping for a category* (direct conflict). `play_mixed_track_loops_and_sounds` — keep "looping" `Given` steps as shorthand for continuous auto-chained playback (no Gherkin rename required for MVP). **New:** F-73 covers the chaining assertion in `play_random_track`.

#### FSQ-AS-09 — Save State removed (P0) → **Decided A**
- **Decision:** No Save State control anywhere on Active Scene; everything auto-saves; Session Lock only blocks editing, not saving.
- **Affected scenarios:** `active_scene_controls` — **retire** *Save State persists the current mixer configuration* (direct conflict). **New:** F-85 (auto-save-on-change replacement).

#### FSQ-AS-10 — No Import in Add Soundscape picker (P0) → **Decided A**, same as [F-SCM-02](audio-library-soundscapes-modal.md#f-scm-02--import-removed-from-category-picker-p1--decided-a-pw-24)
- **Decision:** No Import in the scene picker; import via Library / Category Composer only.
- **Affected scenarios:** `add_soundscape_to_scene` — **retire** *The Import button opens the browser file picker* and *Importing a file via Import creates a soundscape category*. This is the same fix as F-SCM-02 in the modal doc — apply once, don't duplicate the rewrite reasoning.

### Scenarios to author

| ID | Scenario |
|---|---|
| **F-73** | When a playing track ends naturally, a new random track from the same intensity level of the same category begins automatically (no loop toggle) |
| **F-74** | Tapping ▶/⏸ resumes or pauses the current track without re-rolling; only d20 re-rolls |
| **F-75** | Tapping the trash icon on a category card header removes it from the scene (parallel to swipe-right) |
| **F-76** | Dragging a category by its visible handle reorders the list; new order persists immediately on drop, no close/reopen required |
| **F-77** | Play Scene starts idle categories with a random pick, resumes paused categories from their current track, and leaves already-playing categories untouched |
| **F-78** | Muting the Master Volume bar silences soundscapes only; a soundboard effect triggered during mute is still audible |
| **F-79** | A playing category card shows a progress bar in addition to the glow border and pause icon |
| **F-80** | Category `(N TRACKS)` count reflects tracks across all intensity levels, not just the active one |
| **F-81** | A newly added category defaults to Volume 100%, lowest populated intensity level, bottom of the list, and idle (not auto-playing) |
| **F-82** | Pausing a playing category frees a concurrency slot, allowing an 11th category to start without evicting another |
| **F-83** | Opening another scene without tapping its play button still fades out the previous scene's audio while fading in the new scene's audio |
| **F-84** | The d20/▶ button is disabled (greyed) on a category with no tracks at the selected intensity, rather than tappable with a warning |
| **F-85** | Changing Master Volume, a category's Volume slider, or intensity auto-persists immediately with no Save State action required |

### Scenarios to retire or rewrite

| Feature file | Retire / rewrite |
|---|---|
| `active_scene_controls.feature` | **Retire** *Loop toggle disables looping for a category* (FSQ-AS-08); **retire** *Save State persists the current mixer configuration* → replace with auto-save assertion (FSQ-AS-09, F-85); **rewrite** *Play Scene starts all configured atmospheres* for idle/paused/playing distinction (FSQ-AS-02, F-77) |
| `master_controls.feature` | **Retire** all 3 *Master Intensity Switcher* scenarios — no master intensity control exists on this screen (AS-S-03) |
| `reorder_soundscape_categories.feature` | **Rewrite** *Long-pressing a category card activates drag mode* → drag-handle gesture; **strengthen** *Reordering persists after closing and reopening* to assert immediate persistence (AS-S-06, FSQ-AS-03, F-76) |
| `play_random_track.feature` | **Rewrite** *Tapping d20 on a category with no tracks at the selected intensity shows an empty pool warning* → disabled-button assertion (FSQ-AS-06, F-84); **add** track-end auto-chain and ▶/⏸-no-reroll scenarios (AS-S-02, FSQ-AS-08, F-73, F-74) |
| `play_scene.feature` | **Rewrite** *Opening a scene without the play button does not stop the currently playing scene* → assert crossfade fade-out/fade-in instead of no-op (FSQ-AS-05, F-83) |
| `play_mixed_track_loops_and_sounds.feature` | Keep "looping" `Given` steps as auto-chain shorthand (no rename needed); **add** pause-frees-concurrency-slot scenario (FSQ-AS-04, F-82); **move out** the 2 Soundboard Master scenarios (FSQ-AS-07) |
| `soundscape_volume_control.feature` | **Move** *Soundboard Master slider controls all FX output* and *Soundboard Master volume does not affect soundscape categories* to a Soundboard-scoped volume feature (FSQ-AS-07) |
| `build_your_own_scene.feature` | **Add** trash-icon delete scenario alongside existing swipe-right scenario (PW-15, AS-S-05, F-75); tab labels **Atmospheres/One-Shots & SFX** → **Soundscapes/Soundboard** per [PW-08](active-scene-soundboard.md#pw-08) (shared with Soundboard doc, not re-decided here) |
| `add_soundscape_to_scene.feature` | **Retire** both Import scenarios (FSQ-AS-10, same fix as [F-SCM-02](audio-library-soundscapes-modal.md#f-scm-02--import-removed-from-category-picker-p1--decided-a-pw-24)); **add** default-values-on-add scenario (AS-S-11, F-81); commit-model (instant + → Add Selected) rewrite already tracked in [audio-library-soundscapes-modal.md](audio-library-soundscapes-modal.md#scm-01--commit-model-p0--decided-pw-23-fxm-01) — don't duplicate |
| `session_lock.feature` | **Tighten** *the "Add Soundscape" button should be disabled or hidden* → assert **disabled + visible** specifically (AS-S-10); **add** trash-icon-disabled assertion alongside existing swipe-disabled assertion (AS-S-05) |
| `category_playing_state.feature` | **Add** progress-bar assertion to the playing-state scenario (AS-S-08, F-79) |

---