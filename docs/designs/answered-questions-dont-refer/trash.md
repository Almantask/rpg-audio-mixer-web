# Trash — open questions (with recommendations)

**Design doc:** [Trash design](../trash-design.md)

← [Index](README.md) · [Platform-wide](platform-wide.md)

---

### TR-01
**Question:** Platform naming & IA — see PW-01, PW-03.

**Option A (Recommended):** Screen title **Trash**; sidebar label **Trash**; retire Vault of Echoes in Gherkin.

ANSWER: A

**Affected feature scenarios:** `trash_recovery.feature` — **all scenarios**; `delete_scene.feature`; `campaign_crud.feature`

---

### TR-02
**Question:** Delete affordance & confirmation — see PW-15, PW-17.

**Option A (Recommended):** Consistent soft-delete entry via 🗑/swipe; **no** confirm on routine soft-delete (per-entity exceptions e.g. sessions — see [campaign-sessions.md](campaign-sessions.md#pw-17)); **yes** confirm on Purge/Empty Trash.

ANSWER: A

**Option B:** Confirm all deletes including soft-delete.

**Affected feature scenarios:** `trash_recovery.feature`; `delete_scene.feature`; `manage_sessions.feature`; `campaign_crud.feature`

---

### TR-03
**Question:** Campaign/session soft-delete & cascade — see PW-16, PW-19.

**Option A (Recommended):** Deleting campaign **soft-deletes to Campaigns tab**; sessions **orphaned/hidden** from active UI; restore campaign **restores sessions** ([PW-19](platform-wide.md#pw-19)). Session delete **soft-deletes to Sessions tab** independently.

ANSWER: A

**Option B:** Sessions independently listed in Trash when campaign deleted (no orphan/hide).

**Affected feature scenarios:** `trash_recovery.feature` — *Restoring a campaign also restores its sessions*; `campaign_crud.feature` — *Delete a campaign via swipe*

---

### TR-04
**Question:** CAMPAIGN / SESSION card spec in Trash (badges, restore destination)?

**Option A (Recommended):** **Campaigns** and **Sessions** tabs (per **TR-10**); badges **CAMPAIGN** / **SESSION** on cards; restore returns to Active Campaigns / parent campaign sessions list respectively.

ANSWER: A

**Option B:** Campaigns/sessions not shown in Trash (only scenes/audio).

**Affected feature scenarios:** **Gap** — `trash_recovery.feature` lists Soundscape, Scene, FX only today

---

### TR-05
**Question:** Restore All — always confirm, or only when N > threshold?

**Option B:** Always confirm Restore All.

ANSWER: B

---

### TR-06
**Question:** Restore scene still linked in sessions — conflict UI if metadata changed?

**Option A (Recommended):** **Restore as-is**; reappears in Scenes and all prior session links intact.

ANSWER: A

**Affected feature scenarios:** `trash_recovery.feature` — *Restoring an item returns it to its original location*; `session_scenes.feature` — linking scenarios

---

### TR-07
**Question:** Empty Trash CTA — explicit Go to Home button or sidebar-only?

**Option A (Recommended):** **No explicit button** — empty state copy + sidebar navigation (per design).

ANSWER: A

**Affected feature scenarios:** `trash_recovery.feature` — *The Vault is Quiet* empty state (wording mismatch)

---

### TR-08
**Question:** Bulk partial failure UX (3 of 5 restores fail)?

**Option A (Recommended):** **Summary toast** — "Restored 2 of 5"; failed items remain selected with error detail.

ANSWER: A

---

### TR-09
**Question:** Filter/sort/search for large Trash lists?

**Option B:** Single flat list + type filter chips.

ANSWER: B

---

### TR-10
**Question:** Trash list organization — flat mixed grid or **tab menu per entity type**?

**Option A (Recommended):** **Tab menu** — **Campaigns**, **Sessions**, **Scenes**, **Soundscapes**, **FX** tabs; item grid, Select all, bulk actions, Restore All, and Empty Trash scoped to the **active tab**; empty state per tab ("No deleted campaigns", etc.).

ANSWER: A

**Platform rule ([PW-16](platform-wide.md#pw-16)):** All primary entities soft-delete to Trash — tabs organize by type; **PW-18** exclusions (unlink, remove-from-scene, detach track) still do not create Trash entries.

**Affected feature scenarios:** `trash_recovery.feature` — **all scenarios** (layout + naming rewrite); **Gap** for per-tab empty states

---

### PW-01, PW-03, PW-15–PW-22
**Affected feature scenarios:** `trash_recovery.feature`; `delete_scene.feature`; `manage_sessions.feature`; `manage_fx_library.feature`; `campaign_crud.feature`; `manage_soundscape_categories.feature`

---

### New questions from scenario gaps

### F-TR-01
**Question:** Should Trash support **multi-select checkbox + Restore Selected / Purge Selected** bar?

**Option A (Recommended):** **Yes** — per design; scoped to **active tab** (**TR-10**).

ANSWER: A

**Affected feature scenarios:** **Gap** in `trash_recovery.feature`

---

### F-TR-02
**Question:** Should **session unlink** (session scenes) **never** appear in Trash?

**Option A (Recommended):** **Correct** — unlink is not deletion; only global scene delete appears as SCENE in Trash.

ANSWER: A

**Affected feature scenarios:** `session_scenes.feature` — unlink; `trash_recovery.feature` — item types

---

### F-TR-03
**Question:** Should `manage_fx_library.feature` be updated so soft-delete **retains audio** until Trash purge?

**Option A (Recommended):** **Yes** — align with Trash recovery intent (PW-20); FX appear on **FX** tab (**TR-10**).

ANSWER: A

**Affected feature scenarios:** `manage_fx_library.feature` — *Delete an FX track*; `trash_recovery.feature`

---

---

## Principal QA — full scenario notes

**Sign-off status:** ✅ Trash open questions complete — **full rewrite** of `trash_recovery.feature` (Vault → Trash, **tab menu**, campaign/session rows, bulk bar). **Conflict flagged:** **TR-09 B** (flat list + filter chips) **superseded by TR-10 A** (tab menu) — do not author flat-list filter chips. **Cross-ref:** [campaigns.md](campaigns.md), [campaign-sessions.md](campaign-sessions.md), [scenes-list.md](scenes-list.md), [audio-library.md](audio-library.md), [PW-16](platform-wide.md#pw-16).

### Gherkin ↔ design — resolved conflicts

| Area | Decision | Gherkin action |
|---|---|---|
| Delete model | **Always soft-delete** → Trash 7-day (**PW-16 A**) | **Rewrite** all delete features — no instant/permanent remove |
| Trash IA | **Tab menu:** Campaigns · Sessions · Scenes · Soundscapes · FX (**TR-10 A**) | **Rewrite** `trash_recovery` — flat mixed grid → tabbed lists; bulk actions on **active tab** |
| Naming | **Trash** everywhere (**TR-01 A**, **PW-03**) | **Retire** Vault of Echoes / Arcane Settings entry paths |
| Soft-delete confirm | 🗑/swipe; **no** routine confirm (**TR-02 A**); sessions exception **PW-17 B** | Align per-entity confirm rules; **yes** confirm on Purge/Empty Trash |
| Campaign cascade | Soft-delete campaign; sessions orphaned/hidden; restore restores sessions (**TR-03 A**, **PW-19**) | **Keep/extend** *Restoring a campaign also restores its sessions*; **add** F-58–F-60 |
| Session delete | Soft-delete to **Sessions** tab ([campaign-sessions.md](campaign-sessions.md) CS-01) | **Extend** `trash_recovery` + `manage_sessions`; **F-TR-08** |
| Scene restore | **Restore as-is** — Scenes list + session links intact (**TR-06 A**) | **Add** F-62; align *Restoring an item returns it to its original location* |
| Restore All | **Always confirm** before Restore All on active tab (**TR-05 B**) | **Add** F-61 — no threshold shortcut |
| Empty tab state | **Sidebar-only** return — no explicit Go to Home (**TR-07 A**) | **Add** F-63 per tab; retire *The Vault is Quiet* wording |
| Bulk partial failure | **Summary toast** "Restored 2 of 5"; failures stay selected (**TR-08 A**) | **Add** F-64 |
| Bulk selection | Multi-select + Restore/Purge Selected on active tab (**F-TR-01 A**) | **Add** F-65 |
| Trash boundary | Unlink / remove-from-scene / composer detach — **not** Trash (**F-TR-02 A**, **PW-18**) | No Trash entry from `session_scenes` unlink |
| FX retention | Audio blob retained 7 days (**F-TR-03 A**, **PW-20**) | **Rewrite** `manage_fx_library` — *Delete an FX track* |
| Sort/filter | **TR-09 B** (flat filter chips) **conflicts TR-10** — defer in-tab search/filter to P2 | Default sort by days-remaining ascending within active tab only |

### Decisions — scenario impact

#### TR-01 — Platform naming (P0) → **Decided A** [PW-01](platform-wide.md#pw-01), [PW-03](platform-wide.md#pw-03)
- **Decision:** **Trash** screen and sidebar label; retire Vault of Echoes in Gherkin.
- **Affected scenarios:** **Rewrite all** `trash_recovery`; `delete_scene`, `campaign_crud`, `manage_sessions`, `manage_fx_library`, `view_credits`.

#### TR-02 — Delete affordance & confirmation (P0) → **Decided A** [PW-15](platform-wide.md#pw-15), [PW-17](platform-wide.md#pw-17)
- **Decision:** 🗑/swipe soft-delete; **no** routine confirm (sessions: **PW-17 B** always confirm before Trash); **yes** confirm on Purge/Empty Trash.
- **Affected scenarios:** All soft-delete feature files; `trash_recovery` purge/empty flows.

#### TR-03 — Campaign/session cascade (P0) → **Decided A** [PW-16](platform-wide.md#pw-16), [PW-19](platform-wide.md#pw-19)
- **Decision:** Campaign → **Campaigns tab**; sessions hidden from active UI; restore campaign **restores sessions**; independent session delete → **Sessions tab**.
- **Affected scenarios:** **Keep/extend** campaign restore cascade; **new:** F-58; rewrite campaign/session delete in source features.

#### TR-04 — Campaign/session in Trash (P1) → **Decided A**
- **Decision:** **Campaigns** and **Sessions** tabs; **CAMPAIGN** / **SESSION** badges; restore → Active Campaigns / parent sessions list.
- **Affected scenarios:** **new:** F-59, F-60.

#### TR-05 — Restore All confirmation (P1) → **Decided B**
- **Decision:** **Always confirm** Restore All — no N-threshold shortcut.
- **Affected scenarios:** **new:** F-61 (scoped to **active tab** per TR-10).

#### TR-06 — Restore scene with session links (P1) → **Decided A**
- **Decision:** **Restore as-is** — reappears in Scenes with all prior session links intact; no re-link prompt in MVP.
- **Affected scenarios:** **new:** F-62; **rewrite** *Restoring an item returns it to its original location* for SCENE type.

#### TR-07 — Empty tab CTA (P2) → **Decided A**
- **Decision:** **No explicit Go to Home** button — tab-specific empty copy + sidebar navigation only.
- **Affected scenarios:** **new:** F-63 (pattern for all five tabs); **retire** Vault empty-state copy.

#### TR-08 — Bulk partial failure (P2) → **Decided A**
- **Decision:** **Summary toast** (e.g. "Restored 2 of 5"); failed items remain selected with error detail; successful restores persist.
- **Affected scenarios:** **new:** F-64 for Restore Selected and Purge Selected partial failure.

#### TR-09 — Sort/filter/search (P2) → **Decided B** ⚠️ **superseded by TR-10**
- **Body ANSWER B** records flat list + type filter chips — **conflicts TR-10 A** (tab menu). **Authoring rule:** use **tabs** for type separation; **defer** in-tab search and filter chips to P2; default sort = days-remaining ascending within active tab.
- **Affected scenarios:** No MVP filter-chip scenarios; optional P2 gap only.

#### TR-10 — Tab menu per entity (P0) → **Decided A**
- **Decision:** Five tabs — **Campaigns**, **Sessions**, **Scenes**, **Soundscapes**, **FX**; grid, Select all, Restore All, Empty Trash scoped to **active tab**; per-tab empty states.
- **Affected scenarios:** **Rewrite** `trash_recovery` layout; **new:** F-TR-04 through F-TR-08, F-66.

#### F-TR-01 — Bulk selection bar (P1) → **Decided A**
- **Decision:** Multi-select checkbox + **Restore Selected** / **Purge Selected** on **active tab**.
- **Affected scenarios:** **new:** F-65.

#### F-TR-02 — Session unlink not in Trash (P0) → **Decided A** [PW-18](platform-wide.md#pw-18)
- **Decision:** Unlink is not deletion; only **global scene delete** → **Scenes** tab.
- **Affected scenarios:** No Trash entry from `session_scenes` unlink.

#### F-TR-03 — FX file retention (P0) → **Decided A** [PW-20](platform-wide.md#pw-20)
- **Decision:** Soft-deleted FX **retains audio** until purge; listed on **FX** tab.
- **Affected scenarios:** **Rewrite** `manage_fx_library` — *Delete an FX track*.

### Scenarios to author

| ID | Scenario |
|---|---|
| **F-58** | Deleting campaign soft-deletes to **Campaigns** tab; sessions hidden; restoring campaign restores sessions (**TR-03**) |
| **F-59** | **Campaigns** tab shows CAMPAIGN badge card; restore returns to Active Campaigns (**TR-04**) |
| **F-60** | **Sessions** tab shows SESSION badge card; restore returns to parent campaign sessions list (**TR-04**) |
| **F-61** | **Restore All** on active tab always shows confirmation dialog before restoring (**TR-05 B**) |
| **F-62** | Restoring scene from **Scenes** tab preserves all session links (**TR-06 A**) |
| **F-63** | Empty tab state shows tab-specific copy (e.g. "No deleted scenes"); no Go to Home button (**TR-07 A**) |
| **F-64** | Bulk Restore/Purge Selected shows summary toast on partial failure; failed items stay selected (**TR-08 A**) |
| **F-65** | Multi-select **Restore Selected** restores checked items on active tab only (**F-TR-01**) |
| **F-66** | Sidebar **Trash** navigates to Trash screen with tab bar visible (**TR-01**, **TR-10**) |
| **F-TR-04** | Trash tab bar shows Campaigns, Sessions, Scenes, Soundscapes, FX (**TR-10**) |
| **F-TR-05** | Switching tabs shows only that entity type in the grid (**TR-10**) |
| **F-TR-06** | **Restore All** and **Empty Trash** affect **active tab** items only (**TR-10**) |
| **F-TR-07** | Per-tab empty states for all five tabs (**TR-10**, **TR-07**) |
| **F-TR-08** | Deleted session (after confirm) appears on **Sessions** tab with countdown (**TR-03**, campaign-sessions) |

### Scenarios to retire or rewrite

| Feature file | Retire / rewrite |
|---|---|
| `trash_recovery.feature` | **Full rewrite:** Vault → **Trash**; sidebar entry (**F-66**); **tab menu**; CAMPAIGN/SESSION/SCENE/SOUNDSCAPE/FX cards per tab; bulk bar; badge taxonomy; Restore All always confirms (**TR-05 B**); empty states per tab (**TR-07 A**) |
| `delete_scene.feature` | Soft-delete → **Scenes** tab ([scenes-list.md](scenes-list.md)) |
| `manage_campaigns.feature` | Soft-delete → **Campaigns** tab ([campaigns.md](campaigns.md)) |
| `manage_sessions.feature` | Confirm → soft-delete → **Sessions** tab ([campaign-sessions.md](campaign-sessions.md)) |
| `campaign_crud.feature` | Vault → Trash / **Campaigns** tab naming |
| `manage_fx_library.feature` | Soft-delete retains blob; **FX** tab (**F-TR-03**) |
| `manage_soundscape_categories.feature` | Soft-delete → **Soundscapes** tab |
| `view_credits.feature` | **Retire** Vault/Necromancy entry — sidebar Trash only |
| `session_scenes.feature` | Unlink never creates Trash row (**F-TR-02**) |

---
