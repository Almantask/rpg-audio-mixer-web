# Platform-wide — open questions (with recommendations)

**Design doc:** [Platform design](../platform-design.md)

← [Index](README.md)

**Archive note:** Answered items live here for traceability. Do **not** treat this file as the active open-questions queue — see design docs for current spec.

---

## Answer status (Jul 2026)

| Status | Count | IDs |
|---|---|---|
| ✅ **Answered** | 44 | PW-01–PW-16, PW-18–PW-30, PW-32–PW-47, PW-50 |
| ⚠️ **Answered with conflict** | 4 | PW-09, PW-17, PW-46, PW-49 |
| ⏳ **Still open** | 4 | **PW-31**, **PW-48**, **F-PW-01**, **F-PW-02** |

*PW-49 is answered in [campaigns.md](campaigns.md) but **contradicts** this doc's Option A — treat as blocked until PO reconciles.*

---

### App shell & navigation

### PW-01
**Question:** Jul 2026 sidebar IA — 6 items (Home, Campaign, Scenes, Library, Credits, Trash)? Retire gear → Arcane Settings?

**Option A (Recommended):** **Yes** — 6 sidebar items; **no gear icon**.

**Option B:** Keep gear + 4 primary items; Credits/Trash nested under Settings.

ANSWER: A — [home.md](home.md), [trash.md](trash.md) TR-01

**Affected feature scenarios:** `navigation.feature` — *The app shell shows…*; *The sidebar has exactly four primary items*; *The gear icon navigates…*; `view_credits.feature`; `trash_recovery.feature`

---

### PW-02
**Question:** Credits vs Arcane Settings — user-facing screen is Credits only, or themed copy anywhere?

**Option A (Recommended):** **Credits** only; no "Behind the Screen" / Arcane Settings in UI.

**Option B:** Credits screen with flavor subtitle "Behind the Screen" only.

ANSWER: A — [home.md](home.md)

**Affected feature scenarios:** `view_credits.feature` — *Behind the Screen heading*

---

### PW-03
**Question:** Trash naming — Trash (designs) or Vault of Echoes (features)?

**Option A (Recommended):** **Trash** everywhere (sidebar, screen title, Gherkin).

**Option B:** Trash label with Vault flavor in empty-state copy only.

ANSWER: A — [trash.md](trash.md) TR-01

**Affected feature scenarios:** `trash_recovery.feature`; `delete_scene.feature`; `campaign_crud.feature`

---

### PW-04
**Question:** Sidebar item tier — Credits and Trash primary or secondary?

**Option A (Recommended):** **Primary sidebar items** (6 equal entries).

**Option B:** Secondary utilities grouped at sidebar bottom below divider.

ANSWER: A — [home.md](home.md)

**Affected feature scenarios:** `navigation.feature` — sidebar item list scenarios

---

### PW-05
**Question:** Profile sidebar footer — in scope for this iteration?

**Option A (Recommended):** **Defer** — show static avatar placeholder; no navigation.

**Option B:** Profile footer links to account/settings screen.

ANSWER: A — [home.md](home.md)

**Affected feature scenarios:** **Gap** — `navigation.feature`, `view_credits.feature`

---

### PW-06
**Question:** Sidebar highlight on drill-down?

**Option A (Recommended):** **Home** highlighted for Campaign → Sessions → Session Scenes drill-down.

**Option B:** Highlight parent entity (Campaign) when in campaign hierarchy.

ANSWER: A — [campaign-sessions.md](campaign-sessions.md) (**Home** highlighted on Campaign → Sessions drill-down)

**Affected feature scenarios:** `navigation.feature` — highlight scenario (Scenes only)

---

### PW-07
**Question:** Breadcrumb pattern?

**Option A (Recommended):** **Back links** on shallow parents; **uppercase breadcrumb** on Session Scenes and Active Scene.

**Option B:** Uppercase breadcrumbs on all drill-down screens.

ANSWER: A — [campaign-sessions.md](campaign-sessions.md), [session-scenes.md](session-scenes.md). **Exception:** Campaign Sessions uses browser back only (F-CS-03 **B** supersedes back link on that screen).

**Affected feature scenarios:** **Gap** across `manage_sessions`, `session_scenes`, `navigation`

---

### Naming & copy

### PW-08
**Question:** Scene tab labels — Soundscapes/Soundboard or Atmospheres/One-Shots & SFX?

**Decided:** Option A — **Soundscapes / Soundboard**. See [active-scene-soundboard.md](active-scene-soundboard.md#pw-08).

**Affected feature scenarios:** `view_created_scenes.feature`; `build_your_own_scene.feature`; `add_fx_to_soundboard.feature`; `add_soundscape_to_scene.feature`; `session_lock.feature`

---

### PW-09
**Question:** Home hero CTA — Open Campaign, Enter Domain, or Resume?

**Option A (Recommended):** **Open Campaign** (consistent with campaigns list).

**Option B:** **Enter Domain** (current `navigation.feature`).

ANSWER: A — ⚠️ **Label conflict:** [home.md](home.md) records Option A as **Resume** (not "Open Campaign"). Design uses **Resume** per home.md; [campaign-sessions.md](campaign-sessions.md) sign-off still says "Open Campaign".

**Affected feature scenarios:** `navigation.feature` — *Enter Domain on Home…*; `home_screen.feature` (if present)

---

### PW-10
**Question:** Create campaign CTA — Create Campaign or Scribe New Tale?

**Option A (Recommended):** **Create Campaign** (literal, accessible).

**Option B:** **Scribe New Tale** (current `campaign_crud.feature`).

ANSWER: A — [home.md](home.md), [campaigns.md](campaigns.md). Home empty hero uses **Create your first campaign**; list uses **Create Campaign**.

**Affected feature scenarios:** `campaign_crud.feature` — *Create my first campaign*

---

### PW-11
**Question:** Home stat cards — Top Soundscape/Top Sound Effect or Top Atmosphere/Legendary Action?

**Option A (Recommended):** **Top Soundscape / Top Sound Effect**.

**Option B:** Themed Legendary Action / Top Atmosphere.

ANSWER: A — [home.md](home.md). Labels: **Top Soundscape** / **Top FX**.

**Affected feature scenarios:** `home_screen.feature`

---

### PW-12
**Question:** Play count labels — PLAYS or CASTS for FX?

**Option A (Recommended):** **PLAYS** for both.

**Option B:** **CASTS** for FX, PLAYS for soundscapes.

ANSWER: A — [home.md](home.md) (recorded as Option B text; same outcome: **PLAYS** for both).

**Affected feature scenarios:** `home_screen.feature`

---

### PW-13
**Question:** Library CTAs — Free Compositions or Free Tracks? + Add Soundscape or New Composition?

**Option A (Recommended):** Tab-specific: **Free Compositions** + **+ Add Soundscape** (soundscapes); **Free Tracks** (FX tab).

**Option B:** **Free Tracks** and **New Composition** everywhere (current features).

ANSWER: A — [audio-library.md](audio-library.md)

**Affected feature scenarios:** `manage_soundscape_categories.feature` — free download + New Composition scenarios

---

### PW-14
**Question:** Filtered-empty copy — thematic or literal?

**Option A (Recommended):** **Literal** — "No compositions match your filters" / "No effects match your filters".

**Option B:** Thematic — "No incantations match your filters" (current `search_sounds.feature`).

ANSWER: A — [audio-library.md](audio-library.md)

**Affected feature scenarios:** `search_sounds.feature` — *Filtered empty state offers a clear-filters action*

---

### Destructive actions & Trash

### PW-15
**Question:** Delete affordance?

**Option A (Recommended):** **🗑 icon** on web/tablet + **swipe** on touch.

**Option B:** Swipe-only.

ANSWER: A — [scenes-list.md](scenes-list.md), [campaign-sessions.md](campaign-sessions.md), [trash.md](trash.md) TR-02

**Affected feature scenarios:** `delete_scene.feature`; `manage_sessions.feature`; `campaign_crud.feature`; `manage_soundscape_categories.feature`

---

### PW-16
**Question:** Soft-delete model?

**Option A (Recommended):** **Always soft-delete** to Trash (7 days) — campaigns, sessions, scenes, soundscapes, and FX.

**Option B:** Mixed instant delete for some entities.

ANSWER: A

**Trash UI:** Tab menu per entity type — see [TR-10](trash.md#tr-10).

**Affected feature scenarios:** `trash_recovery.feature`; `manage_sessions.feature`; `manage_campaigns.feature`; `delete_scene.feature`; `manage_fx_library.feature`; `manage_soundscape_categories.feature`

---

### PW-17
**Question:** Confirmation on soft-delete?

**Option A (Recommended):** **No confirm** on soft-delete; optional undo toast.

**Option B:** Always confirm.

ANSWER: ⚠️ **Entity-specific** — Option A (no routine confirm) for scenes, campaigns, soundscapes, FX ([scenes-list.md](scenes-list.md) SL-02, [trash.md](trash.md) TR-02); **Option B** (always confirm) for **sessions** ([campaign-sessions.md](campaign-sessions.md) PW-17). Linked-session scene delete shows warning dialog (SL-07).

**Affected feature scenarios:** `trash_recovery.feature` — *no instant permanent deletion dialog unless cascade*; all swipe-delete features

---

### PW-18
**Question:** Trash boundary — what does not go to Trash?

**Decided:** Option A — **Exclude:** session unlink, remove category/FX from scene only, remove track from composer level. See [active-scene-soundboard.md](active-scene-soundboard.md#pw-18).

**Affected feature scenarios:** `session_scenes.feature` — unlink; `build_your_own_scene.feature` — remove from scene; `compose_soundscape.feature` — remove track

---

### PW-19
**Question:** Campaign restore cascade?

**Option A (Recommended):** **Auto-restore orphaned sessions** with campaign.

**Option B:** Sessions restored independently by GM.

ANSWER: A — [trash.md](trash.md) TR-03

**Affected feature scenarios:** `trash_recovery.feature` — *Restoring a campaign also restores its sessions*

---

### PW-20
**Question:** FX in Trash — audio file retained 7 days or purged immediately?

**Option A (Recommended):** **Retained 7 days** until Trash purge.

**Option B:** Purged immediately on soft-delete (current `manage_fx_library.feature`).

ANSWER: A — [trash.md](trash.md) F-TR-03, [audio-library.md](audio-library.md)

**Affected feature scenarios:** `manage_fx_library.feature` — *Delete an FX track*; `trash_recovery.feature`

---

### PW-21
**Question:** Restore name collision?

**Option A (Recommended):** **Auto-rename** restored item to "[Name] (restored)" if collision.

**Option B:** Block restore until GM renames/deletes live item.

ANSWER: A — synced to [trash-design.md](../trash-design.md); scenario gap **F-68**

**Affected feature scenarios:** **Gap** in `trash_recovery.feature`

---

### PW-22
**Question:** Expiry warnings?

**Option A (Recommended):** **In-app badge only** — urgent countdown on card (design); no email MVP.

**Option B:** Toast notification 24 h before purge.

ANSWER: A — synced to [trash-design.md](../trash-design.md); urgent styling at **1 day left**

**Affected feature scenarios:** `trash_recovery.feature` — *Items nearing expiry show urgent countdown styling*

---

### Add-to-scene pickers

### PW-23
**Question:** Add-to-scene commit model?

**Decided:** Option A — **Checkbox + Add Selected (N)**. See [active-scene-soundboard.md](active-scene-soundboard.md#pw-23).

**Affected feature scenarios:** `add_fx_to_soundboard.feature`; `add_soundscape_to_scene.feature`

---

### PW-24
**Question:** Import in pickers?

**Option A (Recommended):** **FX picker: yes** (Import FX); **Category picker: no** (use Library/Composer); **Track picker: yes** (Import in composer modal).

**Option B:** Import available in all pickers including category picker.

ANSWER: A — [audio-library-soundscapes-modal.md](audio-library-soundscapes-modal.md) F-SCM-02, [active-scene-soundboard.md](active-scene-soundboard.md) FX-13. No Import in scene pickers; Import in Library + Composer track picker only.

**Affected feature scenarios:** `add_fx_to_soundboard.feature` — Import scenarios; `add_soundscape_to_scene.feature` — Import scenarios

---

### PW-25
**Question:** Post-add feedback?

**Option A (Recommended):** **Sonner toast** — "N effects added" / "N categories added".

**Option B:** Silent update; selection count reset only.

ANSWER: A — synced to picker design docs; scenario gap **F-69**

**Affected feature scenarios:** **Gap** in picker features

---

### PW-26
**Question:** Modal stay-open after commit?

**Option A (Recommended):** **Stay open** by default; GM closes with ← back when done.

**Option B:** Close modal after first Add Selected batch.

ANSWER: A — synced to picker design docs

**Affected feature scenarios:** `add_fx_to_soundboard.feature` — *Tapping back returns… with all added effects present*

---

### PW-27
**Question:** Mobile picker filters?

**Option A (Recommended):** Filters in **sheet header** collapsible panel on mobile; sidebar filters on web.

**Option B:** Same sidebar footer filters on all viewports.

ANSWER: A — synced to [platform-design.md](../platform-design.md): collapsible **sheet header** on mobile; sidebar footer on web.

**Affected feature scenarios:** **Gap** — **F-70**

---

### PW-28
**Question:** Session Lock on pickers?

**Decided:** Option A — **Block opening pickers** (Add Sound / Add Soundscape disabled). See [active-scene-soundboard.md](active-scene-soundboard.md#pw-28).

**Affected feature scenarios:** `session_lock.feature` — *Add Soundscape button should be disabled or hidden*

---

### Scene lists & playback entry

### PW-29
**Question:** Play button on scene cards?

**Option A (Recommended):** **No play on list** — open-only entry (design).

**Option B:** ▶ play button with crossfade (features).

ANSWER: A — [scenes-list.md](scenes-list.md) SL-01, [session-scenes.md](session-scenes.md) SS-01

**Affected feature scenarios:** `play_scene.feature`; `session_scenes.feature`

---

### PW-30
**Question:** Last Active indicator on session scene list?

**Option A (Recommended):** **Required MVP** on session scenes only.

**Option B:** Defer P2.

ANSWER: A — [session-scenes.md](session-scenes.md) SS-02

**Affected feature scenarios:** `session_scenes.feature` — Last Active scenario

---

### PW-31
**Question:** After Create scene — stay on list or navigate to Scene screen?

**Option A (Recommended):** **Stay on Scenes list** with new row visible; GM opens scene manually.

ANSWER: A

**Affected feature scenarios:** `build_your_own_scene.feature`; `view_created_scenes.feature`

---

### PW-32
**Question:** Hero CTA destination?

**Option A (Recommended):** **Sessions list** for active campaign.

**Option B:** Deep-link to last played scene in active campaign.

ANSWER: A — [home.md](home.md) PW-32

**Affected feature scenarios:** `navigation.feature` — *Enter Domain… sessions list*

---

### PW-33
**Question:** Resume Journey removal acceptable?

**Option A (Recommended):** **Yes** — accept extra navigation step for mid-session GMs.

**Option B:** Restore Resume Journey on Home.

ANSWER: A — [home.md](home.md)

**Affected feature scenarios:** `home_screen.feature` (if Resume scenarios exist)

---

### Active Scene — shared audio behavior

### PW-34
**Question:** Soundboard playing chrome?

**Decided:** Option A — glow/pulse + ▶ while playing; ⏹ stops instances; tile tap re-triggers. See [active-scene-soundboard.md](active-scene-soundboard.md#pw-34).

**Affected feature scenarios:** `soundboard_playing_state.feature`

---

### PW-35
**Question:** Stop scope (soundboard)?

**Decided:** Option B — **All instances at once** per ⏹ or pause tap. See [active-scene-soundboard.md](active-scene-soundboard.md#pw-35).

**Affected feature scenarios:** `retrigger_soundboard_effect.feature`

---

### PW-36
**Question:** Soundboard edit/delete interaction?

**Decided:** Option A — **No Edit Board mode**; drag handle reorders (auto-save); tile 🗑 removes from board. See [active-scene-soundboard.md](active-scene-soundboard.md#pw-36).

**Affected feature scenarios:** `build_your_own_scene.feature` — *drag to flames*; reorder features

---

### PW-37
**Question:** Auto-ducking — soundscapes duck to 40% on FX?

**Decided:** Option A — **Required for MVP**; 40% duck, not configurable. See [active-scene-soundboard.md](active-scene-soundboard.md#pw-37).

**Affected feature scenarios:** `play_scene.feature` — ducking scenario

---

### PW-38
**Question:** FX concurrency cap?

**Decided:** Option A — global max **5** + per-effect max **5**; silent oldest-stop. See [active-scene-soundboard.md](active-scene-soundboard.md#pw-38).

**Affected feature scenarios:** `retrigger_soundboard_effect.feature`; `play_mixed_track_loops_and_sounds.feature`

---

### PW-39
**Question:** Soundscape concurrency (10 playing categories)?

**Decided:** Option A — **Silent oldest-stop** when cap exceeded. See [active-scene-soundscapes.md](active-scene-soundscapes.md#pw-39--soundscape-concurrency-cap-10-playing-categories).

**Affected feature scenarios:** Soundscape playback features

---

### PW-40
**Question:** Save State — auto-save or explicit?

**Decided:** Option A — **Auto-persist layout** (add, reorder, remove) on both tabs. Soundboard: [active-scene-soundboard.md](active-scene-soundboard.md#pw-40). Soundscapes reorder: [FSQ-AS-03](active-scene-soundscapes.md#fsq-as-03-reorder-persistence-without-save-state). Save State on Soundscapes tab persists **mixer** state only (volume, intensity).

**Affected feature scenarios:** Active-scene reorder/add features

---

### PW-41
**Question:** Session Lock matrix?

**Decided:** Option A — full matrix in [active-scene-soundboard.md](active-scene-soundboard.md#pw-41). Extend to session scene list per [session-scenes.md](session-scenes.md) SS-05.

**Affected feature scenarios:** `session_lock.feature` — lock/unlock scenarios

---

### Category Composer vs legacy features

### PW-42
**Question:** `compose_soundscape.feature` reconciliation?

**Option A (Recommended):** **Deprecate legacy**; rewrite for level-first Composer.

**Option B:** Expand design to include MIX, elemental tiers, drag-reorder.

ANSWER: A — [soundscape-category-composer.md](soundscape-category-composer.md)

**Affected feature scenarios:** `compose_soundscape.feature` — **most scenarios**

---

### PW-43
**Question:** Track picker modal spec?

**Option A (Recommended):** **New design doc** for track picker; distinct from category picker.

**Option B:** Reuse category picker with filter flag.

ANSWER: A — design synced; **`audio-library-soundscape-tracks-modal-design.md` not yet authored**

**Affected feature scenarios:** `compose_soundscape.feature`; `add_soundscape_to_scene.feature` (category picker)

---

### PW-44
**Question:** Remove track (composer) semantics?

**Option A (Recommended):** **Detach from level only**.

**Option B:** Purge from storage when unused.

ANSWER: A — [soundscape-category-composer.md](soundscape-category-composer.md)

**Affected feature scenarios:** `compose_soundscape.feature` — remove scenario

---

### PW-45
**Question:** Duplicate tracks in composer?

**Option A (Recommended):** **Allowed across levels**; not within same level.

**Option B:** Disallowed entirely.

ANSWER: A — [soundscape-category-composer.md](soundscape-category-composer.md); scenario gaps **F-44**, **F-45**

**Affected feature scenarios:** **Gap**

---

### PW-46
**Question:** Remove intensity level?

**Option A (Recommended):** **Append-only**; cannot delete levels.

**Option B:** Deletable with renumber.

ANSWER: ⚠️ **A with composer override** — generic append-only I–V not applied; Category Composer uses **fixed Level I · II · III** ([soundscape-category-composer.md](soundscape-category-composer.md))

**Affected feature scenarios:** **Gap** — **F-46**

---

### Gherkin & prototypes

### PW-47
**Question:** `search_sounds.feature` validity?

**Option A (Recommended):** **Split/replace** — FX tab search/filter scenarios + Soundscapes tab scenarios; retire unified type/scene filters.

**Option B:** Keep `search_sounds.feature` as cross-library feature with updated selectors.

ANSWER: A — [audio-library.md](audio-library.md)

**Affected feature scenarios:** `search_sounds.feature` — **all scenarios**

---

### PW-48
**Question:** Feature file cleanup?

**Option A (Recommended):** **Rewrite in same pass** as design decision; remove gear/Vault/+ patterns.

ANSWER: A

**Affected feature scenarios:** `view_credits.feature`; `navigation.feature`; `trash_recovery.feature`; `add_*` features

---

### PW-49
**Question:** `manage_campaigns.feature` vs `campaign_crud.feature`?

**Option A (Recommended):** **`campaign_crud.feature`** as single source of truth; retire duplicate.

**Option B:** Keep both with split scope.

ANSWER: ⚠️ **Blocked conflict** — this doc Option A = **`campaign_crud.feature`**; [campaigns.md](campaigns.md) Option A = **`manage_campaigns.feature`**. **Do not merge/deprecate either file** until PO picks one.

**Affected feature scenarios:** `campaign_crud.feature`; `manage_campaigns.feature`

---

### PW-50
**Question:** HTML prototypes required before dev kickoff?

**Option A (Recommended):** **ASCII + markdown sufficient** for MVP kickoff; HTML for Active Scene + Library if time permits.

**Option B:** HTML prototype required per screen before dev.

ANSWER: A — [home.md](home.md), [campaigns.md](campaigns.md)

**Affected feature scenarios:** None (process question)

---

### New platform gap questions

### F-PW-01
**Question:** Should `screen_transitions.feature` Shared Z-Axis scenario be repurposed for **modal/sheet** presentation (pickers, Composer) instead of gear → Settings?

**Option A (Recommended):** **Yes** — replace stale scenario.

ANSWER: A

**Affected feature scenarios:** `screen_transitions.feature` — *Drill-down navigation uses Shared Z-Axis*

---

### F-PW-02
**Question:** Should a single **`session_lock.feature` Background** cover both Active Scene and picker/list contexts?

**Option A (Recommended):** **Yes** — extend Background with locked navigation from session scenes list and blocked pickers.

ANSWER: A

**Affected feature scenarios:** `session_lock.feature`; `session_scenes.feature`; `add_fx_to_soundboard.feature`; `add_soundscape_to_scene.feature`

---

---

## Principal QA — full scenario notes

> **Recommended sequencing:** PW-01 → PW-03 → PW-08 → PW-15–18 → PW-23 → PW-29 → PW-42 → remaining P1 → P2.

### App shell & navigation

| ID | Option A (Recommended) | Option B | Affected scenarios |
|---|---|---|---|
| **PW-01** | ✅ **6-item sidebar**; **retire gear** | Keep 4-item + gear | `navigation`, `view_credits`, `screen_transitions`, `trash_recovery` |
| **PW-02** | ✅ Screen title **Credits** only | Themed Arcane Settings copy | `view_credits` |
| **PW-03** | ✅ **Trash** primary naming | **Vault of Echoes** primary | `trash_recovery`, `delete_scene`, `campaign_crud`, `manage_sessions` |
| **PW-04** | ✅ Credits + Trash **primary** nav | Secondary utilities below divider | `navigation` |
| **PW-05** | ✅ **Defer** profile footer | Profile footer → account stub | F-67 if B |
| **PW-06** | ✅ Highlight **Home** on campaign drill-down | Highlight **Campaign** | `navigation` |
| **PW-07** | ✅ Back links + uppercase breadcrumb on deep drill-down | Uppercase everywhere | `screen_transitions`; session/campaign headers |

### Naming & copy

| ID | Option A (Recommended) | Option B | Affected scenarios |
|---|---|---|---|
| **PW-08** | ✅ **Decided A** — [Soundboard](active-scene-soundboard.md#pw-08) | — | `view_created_scenes`, `build_your_own_scene`, `add_fx_to_soundboard`, `add_soundscape_to_scene`, `play_scene`, `session_lock` |
| **PW-09** | ✅ **Resume** on Home hero ([home.md](home.md); ⚠️ label differs from this block) | **Enter Domain** (Gherkin) | `navigation`, `home_screen` |
| **PW-10** | ✅ **Create Campaign** + **No campaigns yet** | **Scribe New Tale** | `campaign_crud`, `manage_campaigns` |
| **PW-11** | ✅ **Top Soundscape / Top FX** | **Top Atmosphere / Legendary Action** | `home_screen` |
| **PW-12** | ✅ **PLAYS** for both stat labels | **CASTS** for FX | `home_screen` |
| **PW-13** | ✅ **Free Compositions** + **+ Add Soundscape** | **Free Tracks** everywhere | `manage_soundscape_categories`, Library CTAs |
| **PW-14** | ✅ **Literal** filtered-empty copy | Thematic (*No incantations…*) | `search_sounds`, modal empty states |

### Destructive actions & Trash

| ID | Option A (Recommended) | Option B | Affected scenarios |
|---|---|---|---|
| **PW-15** | ✅ **🗑 icon web** + swipe touch | Swipe-only everywhere | `delete_scene`, `manage_sessions`, `session_scenes`, `manage_soundscape_categories` |
| **PW-16** | ✅ **Always soft-delete** → Trash 7-day; **tab menu** ([TR-10](trash.md#tr-10)) | Some instant hard deletes | All delete features; `trash_recovery` |
| **PW-17** | ⚠️ **No confirm** (scenes/FX/etc.); **sessions always confirm** | Never confirm everywhere | `delete_scene`, `manage_sessions`, `trash_recovery` |
| **PW-18** | ✅ **Decided A** — [Soundboard](active-scene-soundboard.md#pw-18) | — | `session_scenes`, `build_your_own_scene` |
| **PW-19** | ✅ Restore campaign **auto-restores** sessions | Sessions restore independently | `trash_recovery` |
| **PW-20** | ✅ **Retain FX audio file** 7 days | Purge blob immediately | `manage_fx_library`, `trash_recovery` |
| **PW-21** | ✅ **Rename** on collision "(restored)" | Block restore | **F-68** |
| **PW-22** | ✅ **Urgent badge** at 1 day left | + email notification P2 | `trash_recovery` |

### Add-to-scene pickers

| ID | Option A (Recommended) | Option B | Affected scenarios |
|---|---|---|---|
| **PW-23** | ✅ **Decided A** — [Soundboard](active-scene-soundboard.md#pw-23) | — | `add_fx_to_soundboard` (all), `add_soundscape_to_scene` (all) |
| **PW-24** | ✅ Import in **Library + Composer track picker** only | Import in all pickers | `add_fx_to_soundboard`, `add_soundscape_to_scene` |
| **PW-25** | ✅ **Sonner toast** "Added N items" | Silent inline update | **F-69** |
| **PW-26** | ✅ **Stay open** after commit | Close after first batch | `add_fx_to_soundboard` |
| **PW-27** | ✅ **Sheet header** filters on mobile; sidebar on web | Same footer filters everywhere | **F-70** |
| **PW-28** | ✅ **Decided A** — [Soundboard](active-scene-soundboard.md#pw-28) | — | `session_lock`; F-34, F-35, F-41 |

### Scene lists & playback entry

| ID | Option A (Recommended) | Option B | Affected scenarios |
|---|---|---|---|
| **PW-29** | ✅ **No ▶ on list** cards | List play + crossfade | `play_scene`, `session_scenes` |
| **PW-30** | ✅ **Last Active** on session scene list MVP | Defer P2 | `session_scenes` |
| **PW-31** | ⏳ **Stay on Scenes list** after create | Auto-navigate to Scene screen | `view_created_scenes`, `build_your_own_scene`; **F-23** |
| **PW-32** | ✅ Hero CTA → **sessions list** | Deep-link last played scene | `navigation`, `home_screen` |
| **PW-33** | ✅ **Accept** no Resume Journey | Reintroduce Resume Journey | `home_screen`, `campaign_crud` |

### Active Scene — shared audio behavior

| ID | Option A (Recommended) | Option B | Affected scenarios |
|---|---|---|---|
| **PW-34** | ✅ **Decided A** — [Soundboard](active-scene-soundboard.md#pw-34) | — | `soundboard_playing_state` |
| **PW-35** | — | ✅ **Decided B** — [Soundboard](active-scene-soundboard.md#pw-35) | `retrigger_soundboard_effect` |
| **PW-36** | ✅ **Decided A** — no edit mode; handle + tile 🗑 — [Soundboard](active-scene-soundboard.md#pw-36) | — | `build_your_own_scene`, reorder features |
| **PW-37** | ✅ **Decided A** — [Soundboard](active-scene-soundboard.md#pw-37) | — | `play_scene` (ducking scenario) |
| **PW-38** | ✅ **Decided A** — [Soundboard](active-scene-soundboard.md#pw-38) | — | `play_mixed_track_loops_and_sounds`, `retrigger_*` |
| **PW-39** | ✅ **Decided A** — 10 playing categories — [Soundscapes](active-scene-soundscapes.md#pw-39--soundscape-concurrency-cap-10-playing-categories) | — | Soundscape concurrency features |
| **PW-40** | ✅ **Decided A** — layout auto-save both tabs — [Soundboard](active-scene-soundboard.md#pw-40), [FSQ-AS-03](active-scene-soundscapes.md) | Save State = mixer only (Soundscapes) | Active-scene reorder features |
| **PW-41** | ✅ **Decided A** — [Soundboard](active-scene-soundboard.md#pw-41) | — | `session_lock`, F-11–F-13, F-34, F-41 |

### Category Composer vs legacy features

| ID | Option A (Recommended) | Option B | Affected scenarios |
|---|---|---|---|
| **PW-42** | ✅ **Deprecate** legacy composer; level-first wins | Revise for MIX/elemental/drag | `compose_soundscape` |
| **PW-43** | ✅ New **Track Picker** doc (not yet authored) | Conflate with Category Picker | `compose_soundscape`, `add_soundscape_to_scene` |
| **PW-44** | ✅ Remove = **detach level** only | Purge storage | `compose_soundscape` |
| **PW-45** | ✅ Dup **across levels OK**; same level blocked | No duplicates anywhere | **F-44**, **F-45** |
| **PW-46** | ⚠️ **Fixed I · II · III** for composer (not append-only I–V) | Delete & renumber levels | **F-46** |

### Gherkin & prototypes

| ID | Option A (Recommended) | Option B | Affected scenarios |
|---|---|---|---|
| **PW-47** | ✅ **Split** `search_sounds` by tab | Keep monolithic `search_sounds` | `search_sounds` (all scenarios) |
| **PW-48** | ⏳ **Delete** stale gear/Vault/+ in design-sync PR | Tag `@deprecated` during migration | `view_credits`, `navigation`, `delete_scene`, `add_*` |
| **PW-49** | ⚠️ **`campaign_crud.feature`** here vs **`manage_campaigns.feature`** in [campaigns.md](campaigns.md) | Keep both | `campaign_crud`, `manage_campaigns` |
| **PW-50** | ✅ **ASCII + markdown** sufficient MVP | HTML per screen before dev | None |

### Platform new scenario gaps

| ID | Scenario needed |
|---|---|
| **F-67** | Profile footer avatar visible; tap navigates to stub (if PW-05 Option B) |
| **F-68** | Restoring Trash item renames on collision with live item |
| **F-69** | Add Selected shows toast "Added N sound effects/categories" |
| **F-70** | Picker modal on mobile shows filters in sidebar footer region |
| **F-71** | Sidebar shows six primary items including Credits and Trash |
| **F-72** | Active Scene tabs labelled Soundscapes and Soundboard |

---

## Still open — PO action required

| ID | Question | Blocks |
|---|---|---|
| **PW-31** | After **New Scene** — stay on Scenes list or auto-open empty Scene screen? | `build_your_own_scene`, **F-23** |
| **PW-48** | Gherkin cleanup — delete stale scenarios in same PR vs `@deprecated` migration? | `navigation`, `view_credits`, `trash_recovery`, `add_*` |
| **PW-49** | Canonical campaigns file — `campaign_crud.feature` vs `manage_campaigns.feature`? | Campaign feature merge/deprecation |
| **F-PW-01** | Repurpose Shared Z-Axis scenario for modal/sheet presentation? | `screen_transitions.feature` |
| **F-PW-02** | Single `session_lock.feature` Background for all lock contexts? | `session_lock`, picker features |

### Answered with conflicts (resolve before Gherkin rewrite)

| ID | Conflict |
|---|---|
| **PW-09** | [home.md](home.md) = **Resume**; this block Option A label = "Open Campaign"; [campaign-sessions.md](campaign-sessions.md) sign-off = "Open Campaign" |
| **PW-17** | Scenes: no confirm; Sessions: always confirm — document as entity-specific rule |
| **PW-46** | Composer = fixed **I · II · III**; generic platform text still says append-only I–V |

### Related open items outside this file

| ID | Source |
|---|---|
| **CC-12** | [soundscape-category-composer.md](soundscape-category-composer.md) — rename/delete from composer header |
| **F-CR-01 / F-CR-02** | [credits.md](credits.md) — Gherkin rewrite scope for Credits/navigation |
| **C-F-01 vs C-F-08** | [campaigns.md](campaigns.md) — card-body tap vs Resume/Start for Container Transform |
| **SS-08 vs CS-02** | [session-scenes.md](session-scenes.md) — combined vs separate session title display |

---

## Cross-cutting BDD quality notes

| Severity | Finding | Principle (*Formulation*) |
|---|---|---|
| **CRITICAL** | `play_scene` + `session_scenes` assert list ▶ while design forbids — living doc contradicts UX spec | One agreed behaviour per surface |
| **CRITICAL** | `add_fx_to_soundboard` / `add_soundscape_to_scene` use implementation-flavored "instant +" vs design commit batch | Declarative domain language |
| **HIGH** | `view_credits` + `navigation` describe retired gear/Arcane Settings shell | Ubiquitous language / stale examples |
| **HIGH** | `compose_soundscape` scenarios describe superseded composer (MIX, elemental) | Example coverage must match discovery |
| **MEDIUM** | Multiple features use swipe as only delete gesture on web | Prefer role/label affordances in Gherkin |

---
