# Active Scene — Soundboard — open questions (with recommendations)

**Design doc:** [Active Scene — Soundboard design](../active-scene-soundboard-design.md)

← [Index](README.md) · [Platform-wide](platform-wide.md)

Each question includes **Option A (Recommended)** and **Option B**, cross-checked against Gherkin by Product Owner and Principal QA.

---

# Active Scene — Soundboard — Product Owner Decisions

**Scope:** `active-scene-soundboard-design.md`, `open-questions/active-scene-soundboard.md`, related `platform-wide.md` items, and feature files: `add_fx_to_soundboard`, `retrigger_soundboard_effect`, `reorder_soundboard_effects`, `soundboard_playing_state`, `play_a_sound_from_soundboard`, `session_lock`, `master_controls`, `play_scene`, `build_your_own_scene`.

**Source-of-truth bias:** Jul 2026 FE redesign (`active-scene-soundboard-design.md`) over older Gherkin where they conflict.

---

## Platform-wide (soundboard-related)

### PW-08

**Question:** Scene tab labels — **Soundscapes / Soundboard** (designs) or **Atmospheres / One-Shots & SFX** (features)?

**Option A (Recommended):** **Soundscapes / Soundboard** everywhere — UI, designs, and Gherkin. Thematic flavor lives in subtitles/tooltips, not primary tab names.

ANSWER: A.

---

### PW-18

**Question:** Does removing an FX from the soundboard send anything to Trash?

**Option A (Recommended):** **Scene unlink only.** Removing a tile from the board detaches the FX from that scene. The library asset is untouched and does not appear in Trash.

ANSWER: A.

--- 

### PW-23

**Question:** Add-to-scene commit model — checkbox batch **Add Selected (N)** or per-row instant **+**?

**Option A (Recommended):** **Checkbox multi-select + Add Selected (N)** per `audio-library-fx-modal-design.md`. Modal stays open after commit for additional picks.

ANSWER: A.

---

### PW-28

**Question:** When Session Lock is on, what is blocked on the FX picker?

**Option A (Recommended):** **Block opening the picker** — the Add Sound tile is disabled/hidden when locked. No path to add FX mid-session.

ANSWER: A.

---

### PW-34

**Question:** Soundboard playing chrome — Pause, stop (⏹), or play-with-glow?

**Option A (Recommended):** **Glow/pulse + ▶ while any instance is playing**; dedicated **⏹** on the tile stops one instance. Tapping the tile body **re-triggers** (new instance, overlap allowed).

ANSWER: A.

---

### PW-35

**Question:** Stop scope — one instance, all instances of that FX, or one per ⏹ tap?

**Option B:** **All instances at once** — one ⏹ or pause tap stops every running instance of that effect immediately.

ANSWER: B.

---

### PW-36

**Question:** Reorder/delete affordances — edit mode, or always-available controls?

**Option A (Recommended):** **No Edit Board mode.** Visible **drag handle** reorders anytime (auto-saves on drop); **tile 🗑** removes from board. No long-press, no flames overlay, no edit-mode toggle.

ANSWER: A.

---

### PW-37

**Question:** Auto-ducking — soundscapes duck to 40% on FX trigger: still required? Configurable?

**Option A (Recommended):** **Required for MVP.** All playing soundscapes duck to **40%** on any soundboard trigger; smooth restore when that FX instance ends. **Not configurable** in v1.

ANSWER: A.

---

### PW-38

**Question:** FX concurrency — global cap, per-effect cap, or both? User feedback on eviction?

**Option A (Recommended):** **Both caps:** global max **5** concurrent FX instances across the board; per-effect max **5** simultaneous instances of the same sound. On exceed, **silently stop oldest** instance — no toast in v1.

ANSWER: A.

---

### PW-40

**Question:** Save State — auto-save on layout changes or explicit Save State only?

**Option A (Recommended):** **Auto-persist layout** (add, reorder, remove FX) immediately — including **reorder on drop**. No Save State button on Soundboard tab.

ANSWER: A.

---

### PW-41

**Question:** Session Lock matrix — which controls are disabled?

**Option A (Recommended):**

| Disabled when locked | Still enabled |
|---|---|
| Add Sound, drag-reorder, tile 🗑 delete | Tap FX tiles (play/retrigger) |
| Add Soundscape, category reorder/remove | Soundboard Master + Soundscapes Master sliders |
| Navigate to different scene | Per-soundscape volume sliders, play/pause, d20 |
| | Stop All, Lock toggle, tab switch (Soundscapes ↔ Soundboard) |

ANSWER: A.

---

## Screen-specific

### AS-B-01

**Question:** Tab names for this screen (see PW-08).

**Option A (Recommended):** **Soundscapes / Soundboard** on the Active Scene tab strip.

ANSWER: A.

---

### AS-B-02

**Question:** Add FX model for Soundboard tab (see PW-23).

**Option A (Recommended):** Checkbox picker + **Add Selected (N)**; modal remains open for batch adds.

ANSWER: A.

---

### AS-B-03

**Question:** Playing/stop chrome (see PW-34, PW-35).

**Option A (Recommended):** Glow + ▶ while playing; ⏹ stops one instance; tile tap retriggers.

ANSWER: A.

---

### AS-B-04

**Question:** Reorder/delete affordances (see PW-36).

**Option A (Recommended):** **No edit mode** — drag handle reorders (auto-save); tile 🗑 removes from board.

ANSWER: A.

---

### AS-B-05

**Question:** Hotkeys Num 1–7: hard-bound? Profile-configurable? Tiles 8+?

**Option A (Recommended):** **Auto-assign Num 1–9** to grid order (left-to-right, top-to-bottom). Labels shown on tile. **Tiles 10+** show no hotkey label. **Not profile-configurable** in v1.

ANSWER: A.

---

### AS-B-06

**Question:** Stop All — do soundboard tiles visually reset to idle?

**Option A (Recommended):** **Yes** — all tiles return to idle chrome immediately when Stop All is tapped (consistent with soundscape play buttons resetting to ▶ per `master_controls.feature`).

ANSWER: A.

---

### AS-B-07

**Question:** Responsive grid — column counts; tablet one-handed priority?

**Option A (Recommended):** **4 columns** desktop (≥1024px), **3 columns** tablet (768–1023px), **2 columns** phone (&lt;768px). Minimum **44×44px** touch targets. Add Sound tile always last in grid.

ANSWER: A.

---

### AS-B-08

**Question:** Delete FX from board — confirmation when Session Lock is off?

**Option A (Recommended):** **No confirmation** — tap tile 🗑 is a deliberate action. Optional undo toast is P2.

ANSWER: A.

---

### AS-B-09

**Question:** Max soundboard size / overflow UX?

**Option A (Recommended):** **Soft cap of 24 tiles.** At cap, Add Sound is replaced with inline message: *"Board full — remove an effect to add more."*

ANSWER: A.

---

## New feature questions (gaps & conflicts)

### FX-01

**Question:** `build_your_own_scene.feature` and `add_fx_to_soundboard.feature` reference **"One-Shots & SFX"** tab — update Gherkin to match design tab name?

**Option A (Recommended):** **Rewrite features** to use **Soundboard** tab label (per PW-08).

ANSWER: A.

---

### FX-02

**Question:** `add_fx_to_soundboard` — already-added indicator: what happens on tap?

**Option A (Recommended):** Already added fx should be filtered out in the add fx modal.

ANSWER: A.

---

### FX-03

**Question:** `retrigger_soundboard_effect.feature` — "tap pause stops all three instances" conflicts with design single-instance ⏹. Which wins?

**Option B:** **Keep feature** — stop all control stops all instances of FX.

ANSWER: B

---

### FX-04

**Question:** `soundboard_playing_state.feature` — idle tiles show "idle play state." What does idle look like?

**Option B:** **Idle** shows subtle ▶ affordance; **playing** swaps to pause icon.

ANSWER: B

---

### FX-05

**Question:** `session_lock.feature` does not mention **Add Sound** — blocked when locked?

**Option A (Recommended):** There is no such thing as session lock. Only active scene lock. Rewrite the feature for active scene lock.

ANSWER: A

---

### FX-06

**Question:** `session_lock.feature` references **Master Volume** sliders — is **Soundboard Master** independently adjustable when locked?

**Option A (Recommended):** **Yes** — both Soundscapes Master and Soundboard Master sliders remain draggable when locked.

ANSWER: A.

---

### FX-07

**Question:** `session_lock.feature` does not specify tab switching — allowed when locked?

**Option A (Recommended):** **Allowed** — switching Soundscapes ↔ Soundboard is non-destructive and supports live play.

ANSWER: A.

---

### FX-08

**Question:** `master_controls.feature` — Stop All: soundscapes fade, but how do soundboard FX stop?

**Option B:** **Uniform fade** — all audio including FX fades out together over the same duration.

ANSWER: B

---

### FX-09

**Question:** `master_controls.feature` — does **Master Intensity Switcher** affect soundboard FX volume?

**Option A (Recommended):** **No** — intensity is soundscapes-only. Soundboard Master is the sole board-level volume control.

ANSWER: A.

---

### FX-10

**Question:** `play_scene.feature` — scene crossfade: what happens to in-flight soundboard FX?

**Option B:** **FX persist** until natural end even after scene switch (only soundscapes crossfade).

ANSWER: B.

---

### FX-11

**Question:** `build_your_own_scene.feature` — after creating a scene, where does the GM land?

**Option A (Recommended):** **Navigate to Active Scene** on the **Soundscapes** tab (empty state, Add Soundscape CTA). GM configures before play.

ANSWER: A.

---

### FX-12

**Question:** `reorder_soundboard_effects.feature` — "persists after close and reopen" — requires Save State tap?

**Option A (Recommended):** **Reorder auto-saves on drop** — order persists immediately (per PW-40). Update Gherkin to assert persistence without Save State.

ANSWER: A.

---

### FX-13

**Question:** `add_fx_to_soundboard.feature` — Import from picker: after import, is FX auto-added to board?

**Option A (Recommended):** There is no import from picker. You can only add an existing sound via the add sound button.

ANSWER: A.

---

## Principal QA — full scenario notes

**Sign-off status:** ✅ Decisions complete — rewrite `add_fx_to_soundboard.feature`, `reorder_soundboard_effects.feature`, `soundboard_playing_state.feature`, `session_lock.feature`, and `build_your_own_scene.feature`; extend `master_controls.feature` and `play_scene.feature` for gaps; per table below.

### Gherkin ↔ design — resolved conflicts

| Area | Decision | Gherkin action |
|---|---|---|
| Tab labels | **Soundscapes / Soundboard** everywhere (PW-08, AS-B-01, FX-01) | **Rewrite** "One-Shots & SFX" refs in `build_your_own_scene`, `add_fx_to_soundboard` → "Soundboard" |
| Add FX commit model | Checkbox + **Add Selected (N)** (PW-23, AS-B-02, FXM-01) | **Rewrite** all instant **+** scenarios in `add_fx_to_soundboard` |
| Already-on-board FX | **Filtered out** of picker, not shown disabled (FX-02, F-FXM-01) | **Remove/rewrite** already-added-indicator scenarios in `add_fx_to_soundboard` |
| Import in Add Sound modal | **No import from picker** — Add Sound only (FX-13) | **Retire** Import button / file-picker scenarios in `add_fx_to_soundboard` |
| ⚠️ Stop scope (internal tension) | PW-35 / **FX-03 Option B wins**: ⏹ / pause tap stops **all** running instances of that FX — overrides the PW-34 / AS-B-03 Option A text ("dedicated ⏹ stops **one** instance") | **Keep** `retrigger_soundboard_effect` — *"Tapping pause… stops all three instances"* as source of truth; **rewrite** PW-34/AS-B-03 design-copy assertions and `soundboard_playing_state` pause scenario to say "all instances," not "the effect" |
| Reorder affordance | **No edit mode** — drag handle always visible, no long-press (PW-36, AS-B-04) | **Rewrite** `reorder_soundboard_effects` — *"Long-pressing… activates drag mode"* → always-available drag handle |
| Delete affordance | Tile **🗑**, no flames-overlay drag-delete (PW-36, AS-B-04, AS-B-08) | **Retire** `build_your_own_scene` flames-overlay drag-delete scenario; **rewrite** to tile 🗑 tap, no confirmation |
| Reorder persistence | **Auto-saves on drop**, no Save State button (PW-40, FX-12) | **Rewrite** `reorder_soundboard_effects` — *"persists after closing and reopening"* → assert immediate auto-save on drop |
| Lock naming | No "session lock" — **active scene lock** (FX-05) | **Rename** `session_lock.feature` (title, Background, steps) to active scene lock |
| Lock matrix | Add Sound + tile 🗑 + drag-reorder disabled; Soundboard Master slider, tap-to-play/retrigger, and tab switch stay enabled (PW-41, FX-06, FX-07) | **Extend** active-scene-lock feature disabled/enabled lists; **remove** flames-delete-when-locked line |
| Stop All | FX stop immediately, uniform fade, tiles reset to idle (AS-B-06, FX-08) | **Extend** `master_controls` — *"Stop All resets play/pause buttons"* to also cover soundboard tiles |
| Master Intensity scope | Soundscapes-only; soundboard unaffected (FX-09) | **Gap** — add negative assertion to `master_controls` |
| In-flight FX on scene switch | FX **persist** to natural end; only soundscapes crossfade (FX-10) | **Gap** in `play_scene` — add scenario |
| New scene landing | Lands on **Active Scene → Soundscapes** tab, not Soundboard (FX-11) | **Gap** — align `build_your_own_scene` scene-creation flow |

### Decisions — scenario impact

#### PW-08 / AS-B-01 / FX-01 — Tab labels (P0) → **Decided A**
- **Decision:** **Soundscapes / Soundboard** everywhere; thematic names ("Atmospheres", "One-Shots & SFX") retired from primary tab labels.
- **Affected scenarios:** `build_your_own_scene` — *"New scene has Atmospheres and One-Shots tabs"* and all `"One-Shots & SFX"` tab references; `add_fx_to_soundboard` — *"I am on the Active Scene — One-Shots & SFX tab"* Given step.

#### PW-18 — FX removal → no Trash (P2) → **Decided A**
- **Decision:** Removing a tile is a scene unlink only; library asset untouched, nothing sent to Trash.
- **Affected scenarios:** `build_your_own_scene` — *"An effect can be removed from the soundboard"* (add assertion that the FX still exists in the library/no Trash entry).

#### PW-23 / AS-B-02 / FXM-01 — Add FX commit model (P0) → **Decided A**
- **Decision:** Checkbox multi-select + **Add Selected (N)**; modal stays open after commit.
- **Affected scenarios:** `add_fx_to_soundboard` — **all** `+`-button scenarios require rewrite (row `+`, no-confirm, multiple-in-one-visit, back-link scenarios).

#### FX-02 / F-FXM-01 — Already-on-board filtering (P0) → **Decided A**
- **Decision:** FX already on the soundboard are **filtered out** of the Add Sound picker grid — no already-added indicator is shown.
- **Affected scenarios:** `add_fx_to_soundboard` — *"An effect already in the soundboard shows an already-added indicator instead of +"* and *"An already-added effect cannot be added again"* → **rewrite** to assert absence from the grid instead.

#### PW-28 / PW-41 / FX-05 / FX-06 / FX-07 — Active scene lock matrix (P0) → **Decided A**
- **Decision:** Locked disables Add Sound (picker cannot open), drag-reorder, and tile 🗑 delete, plus Add Soundscape / category reorder / scene navigation. Tap-to-play/retrigger FX tiles, Soundboard Master + Soundscapes Master sliders, per-soundscape controls, Stop All, Lock toggle, and Soundscapes ↔ Soundboard tab switching remain enabled. There is no separate "session lock" — it is the **active scene lock**.
- **Affected scenarios:** `session_lock` — **rename** feature to active scene lock; **add** Add Sound disabled, tile 🗑 disabled; **remove** "dragging soundboard effects to the flames to delete" line (flames overlay retired, see PW-36); **add** Soundboard Master slider to the still-enabled list; **add** tab-switch-allowed assertion.

#### PW-34 / PW-35 / AS-B-03 / FX-03 / FX-04 — Playing / stop chrome (P0) → **Decided A + B (tension resolved)**
- **Decision:** Idle tiles show ▶; tapping plays with glow/pulse + pause icon; tapping again while playing **retriggers** a new overlapping instance (no interruption). The pause/⏹ action stops **all** running instances of that FX at once (PW-35/FX-03 Option B), not a single instance — this **supersedes** the PW-34/AS-B-03 Option A text describing a "dedicated ⏹ [that] stops one instance."
- **Affected scenarios:** `retrigger_soundboard_effect` — *"Tapping pause… stops all three instances"* is already correct and becomes the canonical scenario; `soundboard_playing_state` — *"Tapping pause on a playing tile stops the effect and reverts to idle"* → **rewrite** to explicitly assert **all** instances stop, matching the multi-instance case.

#### PW-36 / AS-B-04 / AS-B-08 — Reorder / delete affordances (P0) → **Decided A**
- **Decision:** No Edit Board mode. Drag handle is always visible and reorders on drop (auto-saves). Tile 🗑 removes from board with **no confirmation dialog**. No long-press, no flames overlay.
- **Affected scenarios:** `reorder_soundboard_effects` — *"Long-pressing an effect button activates drag mode"* → **rewrite** to always-available drag handle, no long-press; `build_your_own_scene` — *"An effect can be removed from the soundboard"* (currently drags to a flames overlay) → **rewrite** to tile 🗑 tap, no confirmation.

#### PW-37 — Auto-ducking (P1) → **Decided A** — no Gherkin change needed
- **Decision:** All playing soundscapes duck to **40%** on any soundboard trigger; smooth restore on instance end; not configurable.
- **Affected scenarios:** `play_scene` — *"Soundscape volume ducks when soundboard effect is triggered"* already matches this decision; no rewrite required.

#### PW-38 — FX concurrency caps (P1) → **Decided A**
- **Decision:** Global cap of **5** concurrent FX instances across the whole board **and** a per-effect cap of **5** simultaneous instances of the same sound; on exceed, **silently stop the oldest** instance, no toast.
- **Affected scenarios:** `retrigger_soundboard_effect` — *"Multiple re-triggers… respect the global FX concurrency limit"* already covers the per-effect case at 5/6 taps; **add** a distinct global-cap scenario (different FX tiles, not the same effect) — see **SB-01**.

#### PW-40 / FX-12 — Auto-persist layout / no Save State (P1) → **Decided A**
- **Decision:** Add, reorder, and remove auto-persist immediately, including reorder-on-drop. No Save State button on the Soundboard tab.
- **Affected scenarios:** `reorder_soundboard_effects` — *"Reordering persists after closing and reopening the scene"* → **rewrite** to assert immediate auto-save on drop, not a save-then-reload flow implying a manual save step.

#### AS-B-05 — Hotkeys Num 1–9 (P2) → **Decided A**
- **Decision:** Auto-assign Num 1–9 to grid order (left-to-right, top-to-bottom); tiles 10+ show no hotkey label; not profile-configurable.
- **Affected scenarios:** **Gap** — no hotkey scenarios exist for the soundboard. See **SB-02**.

#### AS-B-06 / FX-08 — Stop All resets soundboard chrome (P1) → **Decided A + B**
- **Decision:** All FX stop immediately, all audio (including FX) fades uniformly, and soundboard tiles visually return to idle immediately.
- **Affected scenarios:** `master_controls` — *"Stop All resets play/pause buttons"* only asserts soundscape play buttons today → **extend** to also assert soundboard tiles reset to idle chrome.

#### AS-B-07 — Responsive grid (P2) → **Decided A**
- **Decision:** 4 columns desktop, 3 tablet, 2 phone; 44×44px minimum touch targets; Add Sound tile always last.
- **Affected scenarios:** **Gap** — largely a visual-regression concern rather than a behavioral Gherkin scenario; optional lightweight scenario, see **SB-09**.

#### AS-B-09 — Soundboard soft cap (P2) → **Decided A**
- **Decision:** Soft cap of 24 tiles; at cap, Add Sound is replaced with an inline "Board full" message.
- **Affected scenarios:** **Gap** — see **SB-03**.

#### FX-09 — Master Intensity Switcher scope (P1) → **Decided A**
- **Decision:** Master Intensity affects soundscapes only; Soundboard Master is the sole board-level volume control.
- **Affected scenarios:** **Gap** in `master_controls` — see **SB-04**.

#### FX-10 — In-flight FX on scene switch (P1) → **Decided B**
- **Decision:** FX persist until natural end even after a scene switch; only soundscapes crossfade.
- **Affected scenarios:** **Gap** in `play_scene` — see **SB-05**.

#### FX-11 — New scene landing tab (P1) → **Decided A**
- **Decision:** After creating a scene, GM lands on Active Scene **Soundscapes** tab (empty state, Add Soundscape CTA), not Soundboard.
- **Affected scenarios:** **Gap** in `build_your_own_scene` — see **SB-06**.

#### FX-13 — No import from picker (P1) → **Decided A**
- **Decision:** There is no import affordance in the Add Sound modal; FX can only be added via the existing library through the add-sound flow.
- **Affected scenarios:** `add_fx_to_soundboard` — *"The Import button opens the browser file picker"* and *"A file imported via Import appears…"* → **retire** both entirely.

### Scenarios to author

| ID | Scenario |
|---|---|
| **SB-01** | Global concurrency cap: a 6th total FX instance across **different** tiles silently stops the oldest instance board-wide, with no toast (distinct from the existing same-effect per-effect-cap scenario) |
| **SB-02** | Hotkey labels auto-assign Num 1–9 to grid order; tile 10 shows no hotkey label; hotkeys are not profile-configurable |
| **SB-03** | At the 24-tile soft cap, Add Sound is replaced with an inline "Board full — remove an effect to add more" message |
| **SB-04** | Master Intensity Switcher change does not alter soundboard FX volume; Soundboard Master remains the only board-level control |
| **SB-05** | An FX instance triggered before a scene switch continues playing to its natural end after the crossfade completes |
| **SB-06** | Creating a new scene navigates the GM to the Active Scene **Soundscapes** tab (empty state), not the Soundboard tab |
| **SB-07** | Active scene lock: Soundboard Master slider remains draggable while locked |
| **SB-08** | Active scene lock: switching between Soundscapes and Soundboard tabs is allowed while locked |
| **SB-09** | *(optional)* Soundboard grid shows 4 columns at desktop width, 3 at tablet width, 2 at phone width, with Add Sound tile always last |

### Scenarios to retire or rewrite

| Feature file | Retire / rewrite |
|---|---|
| `add_fx_to_soundboard.feature` | Rewrite `"One-Shots & SFX"` tab references → `"Soundboard"` (PW-08/FX-01); rewrite all instant **+** scenarios → checkbox + **Add Selected (N)** (PW-23); rewrite/remove *"already in soundboard shows already-added indicator"* and *"cannot be added again"* → assert absence from picker grid (FX-02); **retire** *"The Import button opens the browser file picker"* and *"A file imported via Import appears…"* entirely (FX-13) |
| `retrigger_soundboard_effect.feature` | No rewrite — *"Tapping pause on an active effect stops all its running instances"* is the canonical scenario resolving the PW-34/PW-35 stop-scope tension; keep as-is |
| `soundboard_playing_state.feature` | Rewrite *"Tapping pause on a playing tile stops the effect and reverts to idle"* to explicitly assert **all** running instances stop, aligning wording with `retrigger_soundboard_effect` (FX-03/FX-04) |
| `reorder_soundboard_effects.feature` | Rewrite *"Long-pressing an effect button activates drag mode"* → always-visible drag handle, no long-press gesture (PW-36); rewrite *"Reordering persists after closing and reopening the scene"* → assert auto-save on drop, no explicit save step (PW-40/FX-12) |
| `build_your_own_scene.feature` | Rename `"One-Shots & SFX"` tab → `"Soundboard"` throughout (PW-08); rewrite *"An effect can be removed from the soundboard"* (currently drag-to-flames-overlay) → tap tile 🗑, no confirmation dialog (PW-36/AS-B-04/AS-B-08) |
| `session_lock.feature` | Rename feature/Background to **active scene lock** (FX-05); add Add Sound and tile 🗑 delete to the disabled list; remove the *"dragging soundboard effects to the flames to delete"* line (flames overlay retired); add Soundboard Master slider and tab switching to the still-enabled list (FX-06/FX-07/PW-41) |
| `master_controls.feature` | Extend *"Stop All resets play/pause buttons"* to also assert soundboard tiles return to idle chrome (AS-B-06/FX-08) |
| `play_scene.feature` | No rewrite — *"Soundscape volume ducks when soundboard effect is triggered"* already matches PW-37; only an **addition** is needed for FX-10 (see SB-05) |

---