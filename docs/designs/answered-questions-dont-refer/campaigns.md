# Campaigns — open questions (with recommendations)

**Design doc:** [Campaigns design](../campaigns-design.md)

← [Index](README.md) · [Platform-wide](platform-wide.md)

## Platform questions (with options)

### PW-10

**Question:** Create campaign CTA — **Create Campaign** (design) or **Scribe New Tale** (features)? Empty state headline — **No campaigns yet** (design) or generic prompt (features)?

ANSWER: A

**Affected feature scenarios:**
- `manage_campaigns.feature` — Create a new campaign; Campaign list is empty on first launch
- `campaign_crud.feature` — Create my first campaign

---

### PW-15

**Question:** Delete affordance on campaign cards — trailing 🗑 icon (design: "click delete"), swipe-right (features), overflow menu, or hybrid (icon + swipe on touch)?

**Option A (Recommended):** Trailing 🗑 icon on web/tablet; swipe-right as an additional touch gesture on mobile. Both trigger the same soft-delete flow.

ANSWER: A

**Affected feature scenarios:**
- `manage_campaigns.feature` — Moving a campaign to the Trash orphans its sessions
- `campaign_crud.feature` — Delete a campaign via swipe (Soft-Delete)

---

### PW-16

**Question:** Campaign delete model — always soft-delete to Trash (7-day retention), or any instant/hard delete from the list?

**Option A (Recommended):** **Soft-delete to Trash** (7-day retention); campaign appears on Trash **Campaigns** tab; sessions orphaned/hidden until restore ([TR-03](trash.md#tr-03), [PW-19](platform-wide.md#pw-19)).

ANSWER: A

**Affected feature scenarios:**
- `manage_campaigns.feature` — Moving a campaign to the Trash orphans its sessions
- `campaign_crud.feature` — Delete a campaign via swipe (Soft-Delete)
- `trash_recovery.feature` — Restoring a campaign also restores its sessions

---

### PW-32

**Question:** Hero / **Resume** destination — Sessions list only (design), or deep-link to last played scene in the active campaign?

**Option A (Recommended):** Sessions list only for both Home hero (**Open Campaign**) and Campaign list **Resume**. Deep-link deferred; keeps mental model consistent.

ANSWER: A

**Affected feature scenarios:**
- `manage_campaigns.feature` — Resume a campaign from the campaigns list
- `campaign_crud.feature` — Resume a campaign updates its play order
- `home_screen.feature` — Enter Domain navigates to the active campaign's sessions
- `navigation.feature` — Enter Domain on Home navigates to the active campaign's sessions

---

### PW-49

**Question:** Which feature file is the acceptance source of truth for Campaigns — `manage_campaigns.feature` or `campaign_crud.feature`?

**Option A (Recommended):** **`manage_campaigns.feature`** — broader coverage (empty, multi-campaign, sort, cover art, orphan-on-delete, Home cross-ref). Merge unique scenarios from `campaign_crud` (Resume reorder, first-launch background) then deprecate `campaign_crud.feature`.

ANSWER: A

**Affected feature scenarios:**
- All scenarios in both files (7 + 3 = 10, with overlap on create, empty, resume, delete)

---

### PW-50

**Question:** HTML prototypes required before dev kickoff for Campaigns, or ASCII + markdown sufficient for MVP?

**Option A (Recommended):** ASCII + markdown sufficient for Campaigns MVP — layout is simple (vertical list + dashed create card). HTML prototype not needed.

ANSWER: A

**Affected feature scenarios:**
- None directly — affects acceptance criteria authoring and PO sign-off process

---

## Screen-specific questions

### C-01

**Question:** Post-create editing — rename, cover, description in MVP?

**Option B:** Full edit at create and post-create: name, cover, and description all in MVP.

ANSWER: A

**Affected feature scenarios:**
- `manage_campaigns.feature` — Create a new campaign; Campaign cover art can be set from an image upload
- `campaign_crud.feature` — Create my first campaign
- *(Gap — no edit scenario exists in either file)*

---

### C-02

**Question:** **Resume** always opens Sessions list, or deep-link to last session/scene?

**Option A (Recommended):** Always Sessions list. Same rule for card body click and **Resume** button.

ANSWER: A

**Affected feature scenarios:**
- `manage_campaigns.feature` — Resume a campaign from the campaigns list
- `campaign_crud.feature` — Resume a campaign updates its play order
- `screen_transitions.feature` — Hierarchical navigation uses Container Transform (card tap → Sessions)

---

### C-03

**Question:** Zero-session campaigns — show **Resume** or alternate CTA (**Add Session**)?

**Option A (Recommended):** Show **Start**  for zero-session campaigns; **Resume** only when ≥1 session exists. Both navigate to Sessions list (empty state there).

ANSWER: A

**Affected feature scenarios:**
- `manage_campaigns.feature` — Resume a campaign from the campaigns list *(precondition: "at least one session" — contradicts Option B)*
- `manage_sessions.feature` — Sessions list is empty when a campaign has no sessions

---

### C-04

**Question:** Does tapping **Resume** (or opening a campaign) update most-recently-played sort order?

**Option B:** Only actual scene playback updates MRU; list navigation alone does not reorder.

ANSWER: A

**Affected feature scenarios:**
- `manage_campaigns.feature` — Campaigns are sorted by most recently played
- `campaign_crud.feature` — Resume a campaign updates its play order
- `manage_campaigns.feature` — Active campaign is the most recently played one

---

### C-05

**Question:** Campaign description — optional at create? Truncation rules on card?

**Option A (Recommended):** Description optional at create (if field exists at all in MVP per C-01). Card shows max 2 lines with ellipsis; hidden when empty.

ANSWER: A

**Affected feature scenarios:**
- *(Gap — no scenario tests description display or truncation)*

---

### C-06

**Question:** List layout — confirm vertical full-width rows (not grid)?

**Option A (Recommended):** Vertical full-width rows, one campaign per row, **Create Campaign** dashed row at bottom — per Jul 2026 design.

ANSWER: A

**Affected feature scenarios:**
- `manage_campaigns.feature` — Multiple campaigns appear in the list
- *(Gap — neither file asserts layout shape)*

---

## New questions (C-F-XX)

### C-F-01

**Question:** Card body click (outside **Resume**) must navigate to Sessions list — is this a required acceptance criterion?

**Option B:** **Resume** button only; card body is non-interactive except cover (future: edit cover).

ANSWER: B

**Affected feature scenarios:**
- `manage_campaigns.feature` — Resume a campaign from the campaigns list *(Resume button only)*
- `screen_transitions.feature` — Hierarchical navigation uses Container Transform

---

### C-F-02

**Question:** Sessions count label on each campaign card — required in MVP?

**Option A (Recommended):** Yes — show total sessions with correct singular/plural ("0 sessions", "1 session", "N sessions"); updates when sessions added/removed.

ANSWER: A

**Affected feature scenarios:**
- *(Gap — no scenario in either campaigns feature)*
- `manage_sessions.feature` — Add a new session to a campaign *(indirect — count should update on return)*

---

### C-F-03

**Question:** Singular/plural grammar for sessions count — enforce "1 session" vs "N sessions"?

**Option A (Recommended):** Yes — enforce singular/plural per design copy rules.

ANSWER: A

**Affected feature scenarios:**
- *(Gap — add scenario once C-F-02 decided)*

---

### C-F-04

**Question:** Campaign description visible on list cards — when is it collected?

**Option B:** Optional description at create; show truncated snippet on card when present.

ANSWER: B

**Affected feature scenarios:**
- *(Gap — no create or display scenario)*

---

### C-F-05

**Question:** Delete destination — soft-delete to Trash or permanent remove?

**Option A (Recommended):** **Trash** — soft-delete with 7-day retention; campaign card on **Campaigns** tab ([TR-10](trash.md#tr-10), [PW-16](platform-wide.md#pw-16)).

**Option B:** Permanent remove — no Trash entry.

ANSWER: A

**Affected feature scenarios:**
- `manage_campaigns.feature` — Moving a campaign to the Trash orphans its sessions
- `campaign_crud.feature` — Delete a campaign via swipe (Soft-Delete) *(expects "Vault of Echoes" screen)*

---

### C-F-07

**Question:** Duplicate scenarios across `manage_campaigns` and `campaign_crud` — merge strategy?

**Option A (Recommended):** Single canonical file per PW-49; tag removed file `@deprecated` until deleted in cleanup pass (PW-48).

ANSWER: A

**Affected feature scenarios:**
- All 10 scenarios across both files (create ×2, empty ×2, resume ×2, delete ×2, sort ×1, cover ×1)

---

### C-F-08

**Question:** Container Transform animation on campaign card → Sessions drill-down — in scope for Campaigns MVP?

**Option A (Recommended):** Yes — keep `screen_transitions` scenario; campaigns acceptance references it as cross-cutting UX requirement.

ANSWER: A

**Affected feature scenarios:**
- `screen_transitions.feature` — Hierarchical navigation uses Container Transform

---

### C-F-09

**Question:** Create campaign flow container — inline dialog, modal dialog, or dedicated full screen?

**Option A (Recommended):** Modal dialog on web/tablet (name + optional cover); full-screen sheet on mobile. Matches design "inline or modal."

ANSWER: A

**Affected feature scenarios:**
- `manage_campaigns.feature` — Create a new campaign; Campaign cover art can be set from an image upload
- `campaign_crud.feature` — Create my first campaign

---

### C-F-10

**Question:** Cancel/abandon during create — what does the user see?

**Option A (Recommended):** Cancel closes dialog with no campaign created; return to prior list state (empty or populated).

ANSWER: A

**Affected feature scenarios:**
- *(Gap — no cancel scenario in either file)*

---

### C-F-11

**Question:** Home hero CTA (**Open Campaign** / **Enter Domain**) vs Campaign list **Resume** — same label family or screen-specific?

**Option A (Recommended):** Screen-specific labels OK if behavior identical: Home = **Open Campaign**, Campaign list = **Resume**; both → Sessions list (PW-32 Option A).

ANSWER: A

**Affected feature scenarios:**
- `home_screen.feature` — Enter Domain navigates to the active campaign's sessions
- `manage_campaigns.feature` — Resume a campaign from the campaigns list
- `navigation.feature` — Enter Domain on Home navigates to the active campaign's sessions

---

## Principal QA — full scenario notes

**Sign-off status:** ⚠️ Campaigns open questions are decided, but **not clear-to-author as-is** — two decisions have no recorded Option A text (C-01, C-04), one decision directly contradicts the animation spec (C-F-01 vs `screen_transitions.feature` / C-F-08), and this doc's canonical-file call (PW-49 **A** = `manage_campaigns.feature`) **contradicts** `platform-wide.md` PW-49 (**A** = `campaign_crud.feature`). Resolve all three with the Product Owner before merging/deprecating either campaigns feature file.

### Gherkin ↔ design — resolved conflicts

| Area | Decision | Gherkin action |
|---|---|---|
| Create CTA / empty state | **"Create Campaign"** + **"No campaigns yet"** headline win over "Scribe New Tale" / generic prompt (PW-10 **A**) | **Rewrite** `manage_campaigns` — *Create a new campaign*, *Campaign list is empty on first launch*; **rewrite** `campaign_crud` — *Create my first campaign* (then retire per PW-49) |
| Delete affordance | **🗑 icon** (web/tablet) **+ swipe-right** (touch) trigger the same flow (PW-15 **A**) | **Extend** delete scenarios with an icon-tap path; swipe remains as the touch-alternative, not the only path |
| Delete model | **Soft-delete to Trash** — **Campaigns** tab; sessions orphaned/hidden; restore cascade (PW-16 **A**, C-F-05 **A**, [TR-03](trash.md#tr-03)) | **Rewrite** `manage_campaigns` — *Moving a campaign to the Trash orphans its sessions*; **keep/extend** `trash_recovery` — *Restoring a campaign also restores its sessions*; Vault → Trash naming |
| Resume/Open destination | **Sessions list only** for Home hero and Campaign list; deep-link deferred (PW-32 **A**, C-02 **A**) | **Keep** `manage_campaigns`/`campaign_crud`/`home_screen`/`navigation` "navigates to sessions list" scenarios; do **not** add deep-link scenarios |
| Canonical campaigns file | **`manage_campaigns.feature`** is source of truth; merge unique `campaign_crud` scenarios, then deprecate it (PW-49 **A**, C-F-07 **A**) | **Merge + tag `@deprecated`** on `campaign_crud.feature` — ⚠️ **contradicts `platform-wide.md` PW-49 Option A**, which names `campaign_crud.feature` as canonical instead. **Do not deprecate either file** until this is reconciled between the two docs |
| HTML prototypes | **Not required** for Campaigns MVP; ASCII + markdown sufficient (PW-50 **A**) | No Gherkin impact — process note only |
| Post-create edit | **ANSWER A**, but only **Option B** ("full edit: name, cover, description all in MVP") is written in the doc — Option A's scope was never recorded (C-01 **A**, text ambiguous) | **Do not author** an edit scenario yet — flag to PO: confirm whether "A" means *no post-create edit* (opposite of the only option shown) or the doc mislabelled the recommended option |
| Zero-session CTA | **"Start"** for 0-session campaigns, **"Resume"** for ≥1 session; both open Sessions list (C-03 **A**) | **Rewrite** `manage_campaigns` — *Resume a campaign from the campaigns list* precondition to branch on session count; **cross-check** `manage_sessions` — *Sessions list is empty when a campaign has no sessions* as the "Start" landing state |
| MRU sort on resume | **ANSWER A**, but only **Option B** ("only actual scene playback updates MRU") is written — Option A's text is missing, interpreted here as *opening/navigating also updates MRU* per the merged `campaign_crud` "Resume a campaign updates its play order" scenario (C-04 **A**, text ambiguous) | **Extend** the merged Resume-reorder scenario to assert MRU updates on tap/navigation, not only on scene playback — **flag to PO** to backfill the missing Option A wording before sign-off is final |
| Description & truncation | Description **optional** at create (contingent on C-01); card shows **max 2 lines + ellipsis**, hidden when empty (C-05 **A**, C-F-04 **B**) | **Add** new scenario (F-C-06) — currently a total gap |
| List layout | **Vertical full-width rows** + dashed "Create Campaign" row at bottom, not a grid (C-06 **A**) | **Add** layout-assertion scenario; extend *Multiple campaigns appear in the list* |
| Card-body interactivity vs. Container Transform | **Resume button only** is interactive; card body is non-interactive (C-F-01 **B**) **directly conflicts** with `screen_transitions.feature` — *Hierarchical navigation uses Container Transform*, whose Given/When is literally **"I tap on a campaign card"** (C-F-08 **A** keeps that scenario in scope) | **Conflict — do not edit `screen_transitions.feature` or rewrite the Resume scenario** until PO picks one: (a) reverse C-F-01 and allow card-body tap, or (b) rewrite the Container Transform scenario's trigger to the Resume/Start button |
| Sessions count label | Card shows session count with correct singular/plural, live-updating (C-F-02 **A**, C-F-03 **A**) | **Add** new scenario (F-C-05) — currently a total gap in both campaign files |
| Duplicate scenario merge | Single canonical file per PW-49; `@deprecated` tag until deletion (C-F-07 **A**) | Same action as "Canonical campaigns file" row above — subject to the same platform-wide.md conflict |
| Container Transform scope | Keep the Container Transform scenario as a cross-cutting requirement for campaign card → Sessions drill-down (C-F-08 **A**) | **No removal** — but see the card-body-interactivity conflict row; the scenario's current trigger wording may need to change, not the scenario itself |
| Create dialog container | Modal dialog (web/tablet) or full-screen sheet (mobile), name + optional cover (C-F-09 **A**) | **Extend** create scenarios with container-type assertion; currently untested |
| Cancel/abandon create | Cancel closes the dialog, creates nothing, returns to prior list state (C-F-10 **A**) | **Add** new scenario (F-C-07) — currently a total gap |
| Home vs. Campaign-list CTA label | Screen-specific labels OK if behavior matches: Home = **"Open Campaign"**, Campaign list = **"Resume"**; both → Sessions list (C-F-11 **A**) | **Rewrite** `home_screen` — *Enter Domain navigates to the active campaign's sessions*; **rewrite** `navigation` — *Enter Domain on Home navigates to the active campaign's sessions* → "Open Campaign" |

### Decisions — scenario impact

#### PW-10 — Create CTA & empty-state copy → **Decided A**
- **Decision:** CTA reads **"Create Campaign"**; empty-state headline reads **"No campaigns yet"** (design copy wins over "Scribe New Tale" / generic prompt).
- **Affected scenarios:** **Rewrite** `manage_campaigns` — *Create a new campaign*, *Campaign list is empty on first launch*; **rewrite** `campaign_crud` — *Create my first campaign* (pending PW-49 merge/deprecate).

#### PW-15 — Delete affordance → **Decided A**
- **Decision:** Trailing **🗑 icon** on web/tablet; **swipe-right** as an additional touch gesture on mobile; both trigger the same delete flow.
- **Affected scenarios:** **Extend** `manage_campaigns` — *Moving a campaign to the Trash orphans its sessions* and `campaign_crud` — *Delete a campaign via swipe* with an icon-tap path; both scenarios also need rewriting per PW-16/C-F-05 below.

#### PW-16 — Delete model → **Decided A** [TR-10](trash.md#tr-10)
- **Decision:** **Soft-delete to Trash** (7-day retention); campaign on **Campaigns** tab; sessions orphaned/hidden until restore ([TR-03](trash.md#tr-03), [PW-19](platform-wide.md#pw-19)).
- **Affected scenarios:** **Rewrite** `manage_campaigns` — *Moving a campaign to the Trash orphans its sessions*; **rewrite** `campaign_crud` — *Delete a campaign via swipe* → Trash/**Campaigns** tab; **keep/extend** `trash_recovery` — *Restoring a campaign also restores its sessions*. **Cross-ref:** [campaign-sessions.md](campaign-sessions.md) CS-01/PW-16 — sessions also soft-delete to **Sessions** tab.

#### PW-32 — Resume/Open destination → **Decided A**
- **Decision:** Sessions list only for both Home hero and Campaign list Resume; deep-link deferred.
- **Affected scenarios:** No removal — keep `manage_campaigns`/`campaign_crud`/`home_screen`/`navigation` "navigates to sessions list" scenarios as-is; do not add a deep-link scenario.

#### PW-49 — Canonical campaigns file → **Decided A** ⚠️ conflicts `platform-wide.md`
- **Decision (this doc):** **`manage_campaigns.feature`** is canonical (broader coverage); merge unique `campaign_crud` scenarios (Resume reorder, first-launch background), then deprecate `campaign_crud.feature`.
- **Conflict:** `platform-wide.md` PW-49 **Option A** names **`campaign_crud.feature`** as canonical instead — the two docs recommend opposite files as "Option A." **Do not merge or deprecate either file** until the Product Owner picks one canonical answer across both docs.

#### PW-50 — HTML prototypes → **Decided A**
- **Decision:** ASCII + markdown sufficient for Campaigns MVP; no HTML prototype required.
- **Affected scenarios:** None — process/authoring note only.

#### C-01 — Post-create editing → **Decided A** ⚠️ text ambiguous
- **Decision:** ANSWER is **A**, but the only option text recorded in the doc is **Option B** ("Full edit at create and post-create: name, cover, and description all in MVP"). Option A's content was never written down.
- **Affected scenarios:** **Do not author** a post-create-edit scenario yet. **Flag to PO:** confirm what Option A actually means — most likely *no post-create edit in MVP* (the inverse of the only recorded option), but this must be confirmed, not assumed, before `manage_campaigns`/`campaign_crud` create scenarios are extended or a new edit scenario is added.

#### C-02 — Resume destination (screen-specific) → **Decided A**
- **Decision:** Always Sessions list; same rule for card-body click and the **Resume** button. *(Note: "same rule for card-body click" is now superseded by C-F-01 **B**, which makes the card body non-interactive — see that entry.)*
- **Affected scenarios:** `manage_campaigns`/`campaign_crud` Resume scenarios; **cross-ref** `screen_transitions.feature` Container Transform conflict under C-F-01.

#### C-03 — Zero-session CTA → **Decided A**
- **Decision:** **"Start"** for zero-session campaigns; **"Resume"** only when ≥1 session exists. Both navigate to the Sessions list (empty state there for "Start").
- **Affected scenarios:** **Rewrite** `manage_campaigns` — *Resume a campaign from the campaigns list* to branch on session count instead of always assuming "at least one session"; **add** new scenario (F-C-03) for the "Start" path; **cross-check** `manage_sessions` — *Sessions list is empty when a campaign has no sessions* as the landing state.

#### C-04 — MRU sort on resume/navigation → **Decided A** ⚠️ text ambiguous
- **Decision:** ANSWER is **A**, but the only option text recorded is **Option B** ("Only actual scene playback updates MRU; list navigation alone does not reorder"). Per the task's intended reading, Option A means **Resume/navigation also updates MRU sort**, consistent with the existing `campaign_crud` — *Resume a campaign updates its play order* scenario.
- **Affected scenarios:** **Extend/merge** the Resume-reorder scenario (from `campaign_crud` into `manage_campaigns` per PW-49) to assert MRU sort updates on tap/navigation alone, not only on scene playback. **Flag to PO:** backfill the missing Option A text in the source doc so this isn't inferred from context.

#### C-05 — Description optional & truncation → **Decided A**
- **Decision:** Description optional at create (contingent on C-01 resolving to include it at all); card shows max 2 lines with ellipsis, hidden when empty.
- **Affected scenarios:** **Add** new scenario (F-C-06). Blocked on C-01 clarification — if C-01's true Option A excludes description entirely, this decision is moot.

#### C-06 — List layout → **Decided A**
- **Decision:** Vertical full-width rows, one campaign per row, dashed **Create Campaign** row at bottom.
- **Affected scenarios:** **Extend** `manage_campaigns` — *Multiple campaigns appear in the list* with a layout assertion; currently a gap.

#### C-F-01 — Card body interactivity → **Decided B** ⚠️ conflicts C-F-08 / `screen_transitions.feature`
- **Decision:** **Resume** button only; card body is non-interactive except cover (future: edit cover).
- **Conflict:** `screen_transitions.feature` — *Hierarchical navigation uses Container Transform* is written as "When I tap on a campaign card to open its Sessions list" — i.e. the card body **is** the trigger today. C-F-08 (below) explicitly keeps that scenario in scope unchanged. **Do not rewrite either the Resume scenario or `screen_transitions.feature`** until the Product Owner picks one: (a) reverse C-F-01 to allow card-body tap, or (b) rewrite the Container Transform scenario's trigger to the Resume/Start button tap.

#### C-F-02 — Sessions count label → **Decided A**
- **Decision:** Show total sessions on every campaign card with correct singular/plural; updates live when sessions are added/removed.
- **Affected scenarios:** **Add** new scenario (F-C-05) — total gap today in both campaign files.

#### C-F-03 — Singular/plural grammar → **Decided A**
- **Decision:** Enforce "1 session" vs "N sessions" per design copy rules.
- **Affected scenarios:** Folded into F-C-05 (same scenario as C-F-02; grammar is an assertion within it, not a separate scenario).

#### C-F-04 — Description collection timing → **Decided B**
- **Decision:** Optional description collected at create; show truncated snippet on card when present.
- **Affected scenarios:** Same as C-05 → F-C-06. Also blocked on C-01 clarification.

#### C-F-05 — Delete destination → **Decided A**
- **Decision:** **Trash** — soft-delete with 7-day retention; **Campaigns** tab ([TR-10](trash.md#tr-10)).
- **Affected scenarios:** **Rewrite** `manage_campaigns` / `campaign_crud` — Vault → Trash/**Campaigns** tab naming; align with PW-16.

#### C-F-07 — Duplicate scenario merge strategy → **Decided A**
- **Decision:** Single canonical file per PW-49; tag the removed file `@deprecated` until deleted in cleanup pass (PW-48).
- **Affected scenarios:** Same as PW-49 — **blocked on the same `platform-wide.md` PW-49 conflict** (opposite file named canonical there).

#### C-F-08 — Container Transform scope → **Decided A**
- **Decision:** Keep `screen_transitions.feature` — *Hierarchical navigation uses Container Transform* in scope; campaigns acceptance references it as a cross-cutting UX requirement.
- **Affected scenarios:** No removal — but see C-F-01 conflict above; the scenario's trigger wording is disputed, not its existence.

#### C-F-09 — Create-flow container → **Decided A**
- **Decision:** Modal dialog on web/tablet (name + optional cover); full-screen sheet on mobile.
- **Affected scenarios:** **Extend** `manage_campaigns`/`campaign_crud` create scenarios with a container-type assertion (F-C-08); currently untested.

#### C-F-10 — Cancel/abandon during create → **Decided A**
- **Decision:** Cancel closes the dialog with no campaign created; returns to prior list state (empty or populated).
- **Affected scenarios:** **Add** new scenario (F-C-07) — total gap today.

#### C-F-11 — Home vs. Campaign-list CTA label → **Decided A**
- **Decision:** Screen-specific labels OK if behavior is identical: Home = **"Open Campaign"**, Campaign list = **"Resume"**; both → Sessions list per PW-32 **A**.
- **Affected scenarios:** **Rewrite** `home_screen.feature` — *Enter Domain navigates to the active campaign's sessions* and `navigation.feature` — *Enter Domain on Home navigates to the active campaign's sessions*, renaming the button/step text from "Enter Domain" to "Open Campaign."

### Scenarios to author

| ID | Scenario |
|---|---|
| **F-C-01** | Deleting a campaign via the 🗑 icon (web/tablet) soft-deletes to Trash **Campaigns** tab |
| **F-C-02** | Deleted campaign orphans sessions from active UI; restoring campaign from Trash restores sessions ([TR-03](trash.md#tr-03)) |
| **F-C-03** | Campaign card shows a **"Start"** CTA for zero-session campaigns, navigating to an empty Sessions list |
| **F-C-04** | Tapping "Resume"/"Start" (or otherwise opening a campaign) updates its most-recently-played sort position — *pending PO confirmation of C-04's missing Option A text* |
| **F-C-05** | Campaign card displays sessions count with correct singular/plural grammar, updating live as sessions are added/removed |
| **F-C-06** | Campaign card shows a truncated (max 2-line, ellipsis) description snippet when present; hidden when empty — *blocked on C-01 clarification* |
| **F-C-07** | Cancelling the create-campaign dialog creates no campaign and returns to the prior list state |
| **F-C-08** | Create-campaign flow renders as a modal dialog (web/tablet) or full-screen sheet (mobile), with name field and optional cover-art upload |
| **F-C-09** | Post-create campaign edit (rename / cover / description) — **BLOCKED**: do not author until C-01's true Option A scope is confirmed by PO |
| **F-C-10** | Card body tap (outside the Resume/Start button) is non-interactive except for a future cover-art edit affordance — **BLOCKED**: conflicts with `screen_transitions.feature`'s card-tap Container Transform trigger; resolve C-F-01 vs. C-F-08 with PO first |

### Scenarios to retire or rewrite

| Feature file | Retire / rewrite |
|---|---|
| `manage_campaigns.feature` | **Rewrite** CTA copy "Scribe New Tale" → "Create Campaign"; empty-state prompt → literal "No campaigns yet" headline (PW-10). **Rewrite** *Moving a campaign to the Trash orphans its sessions* → soft-delete to **Campaigns** tab + orphan sessions (PW-16, C-F-05, [TR-03](trash.md#tr-03)); **add** 🗑-icon delete path alongside swipe (PW-15). **Rewrite** *Resume a campaign from the campaigns list* to branch "Start" (0 sessions) vs. "Resume" (≥1 session) (C-03). **Merge in** unique scenarios from `campaign_crud.feature` — Resume reorder, first-launch background (PW-49/C-F-07, pending cross-doc conflict resolution). **Extend** merged Resume scenario to assert MRU sort updates on tap (C-04). **Extend** create/list scenarios with sessions-count label (C-F-02/03), description truncation (C-05/C-F-04), and modal/sheet container assertion (C-F-09) |
| `campaign_crud.feature` | Tag **`@deprecated`** once unique scenarios are merged into `manage_campaigns.feature` (PW-49, C-F-07) — **blocked** on reconciling this doc's canonical-file choice with `platform-wide.md` PW-49's opposite recommendation. **Rewrite** *Delete a campaign via swipe (Soft-Delete)* — Vault → Trash/**Campaigns** tab (C-F-05, PW-16) |
| `trash_recovery.feature` | **Keep/extend** *Restoring a campaign also restores its sessions*; **rewrite** Vault → Trash + **tab menu** ([trash.md](trash.md) **TR-10**); campaign/session rows on respective tabs |
| `home_screen.feature` | **Rewrite** *Enter Domain navigates to the active campaign's sessions* — button/step text "Enter Domain" → "Open Campaign" (C-F-11) |
| `navigation.feature` | **Rewrite** *Enter Domain on Home navigates to the active campaign's sessions* — same "Open Campaign" rename (C-F-11) |
| `screen_transitions.feature` | **Conflict — do not edit yet.** *Hierarchical navigation uses Container Transform* triggers on "tap on a campaign card," which contradicts C-F-01's "Resume button only" decision. Hold until PO resolves C-F-01 vs. C-F-08 |
| `manage_sessions.feature` | No campaign-driven changes required beyond cross-checking *Sessions list is empty when a campaign has no sessions* as the landing state for the new "Start" CTA (C-03) |
