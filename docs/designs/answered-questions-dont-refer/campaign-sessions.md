# Campaign Sessions — open questions (with recommendations)

**Design doc:** [Campaign Sessions design](../campaign-sessions-design.md)

← [Index](README.md) · [Platform-wide](platform-wide.md)

---

## Principal QA — full scenario notes

**Sign-off status:** ✅ Campaign Sessions open questions complete — decisions synced to [Campaign Sessions design](../campaign-sessions-design.md). **Rewrite** `manage_sessions.feature` delete flows for **soft-delete to Trash Sessions tab** (CS-01, PW-16). **Extend** `trash_recovery` session scenarios.

**Resolved conflict:** **F-CS-03 B** (browser back only — no explicit ← Active Campaigns link) supersedes **PW-07 A** for this screen.

### Gherkin ↔ design — resolved conflicts

| Area | Decision | Gherkin action |
|---|---|---|
| Session delete | **Soft-delete to Trash** — **Sessions** tab (CS-01 **A**, PW-16 **A**) | **Rewrite** `manage_sessions` — *Swipe to move a session to the Trash* → confirm → Trash entry |
| Delete confirmation | **Always confirm** via AlertDialog before soft-delete (PW-17 **B**) | **Add** F-09 confirm-before-Trash scenario |
| Delete affordance | **🗑 web/tablet** + swipe touch (PW-15 **A**) | **Extend** swipe scenarios with 🗑 path |
| Session numbering | **Session N** label + separate name (CS-02 **A**) | **Rewrite** `manage_sessions` add/list assertions — not combined `Session N – Title` only |
| List layout | **2-column grid** (CS-03 **A**) | **Add** F-01 layout scenario |
| Session edit | **Rename, date, cover, description** in MVP (CS-04 **A**) | **Add** F-02–F-04 edit scenarios (beyond cover-only today) |
| Date field | **Required**, default **today**, **future dates allowed** (CS-05 **A**) | **Update** sort scenario with date rules |
| Hero banner | **Always visible** (CS-06 **A**) | **Add** F-06 — banner persists after Container Transform |
| Last Active | **Pulsing badge** on last-opened session (CS-07 **B**) | **Add** F-07; mirror `session_scenes` Last Active pattern |
| Card metadata | **Date · scene count** on cards (F-CS-01 **A**) | **Add** F-08 |
| Gear / Settings | **Retire gear** → sidebar Credits/Trash (F-CS-02 **A**) | **Retire** `screen_transitions` / `navigation` gear → Arcane Settings scenarios |
| Back navigation | **Browser back only** (F-CS-03 **B**; supersedes PW-07 **A** on this screen) | Do not add explicit ← Active Campaigns link scenario |
| Sidebar highlight | **Home** active on drill-down (PW-06 **A**) | **Extend** `navigation.feature` |
| Home CTA | **Open Campaign** (PW-09 **A**) | **Rewrite** *Enter Domain* scenario in `navigation` |

### Decisions — scenario impact

#### CS-01 — Delete model (P0) → **Decided A** [PW-16](platform-wide.md#pw-16), [TR-10](trash.md#tr-10)
- **Decision:** **Soft-delete to Trash** (7-day retention); session appears on Trash **Sessions** tab.
- **Affected scenarios:** **Rewrite** `manage_sessions` — delete → confirm → Trash; **extend** `trash_recovery` on **Sessions** tab.

#### CS-02 — Session numbering (P1) → **Decided A**
- **Decision:** Auto-increment **Session N** label plus separate **session name** field.
- **Affected scenarios:** `manage_sessions` — *Add a new session*, *Multiple sessions appear*; `session_scenes` session headers.

#### CS-03 — List layout (P1) → **Decided A**
- **Decision:** **2-column responsive grid** (1 column on narrow viewports).
- **Affected scenarios:** **new:** F-01.

#### CS-04 — Session edit in MVP (P1) → **Decided A**
- **Decision:** **All four** — rename, date, cover upload, optional description via edit dialog.
- **Affected scenarios:** **new:** F-02 (rename), F-03 (date), F-04 (description); extend existing cover scenario in `manage_sessions`.

#### CS-05 — Date field (P1) → **Decided A**
- **Decision:** **Required**; defaults to **today**; **future dates allowed**.
- **Affected scenarios:** `manage_sessions` — *Sessions are sorted by date, most recent first*.

#### CS-06 — Campaign hero banner (P1) → **Decided A**
- **Decision:** Hero banner **always visible** on Campaign Sessions screen.
- **Affected scenarios:** `screen_transitions` (Container Transform); **new:** F-06.

#### CS-07 — Last active session (P2) → **Decided B**
- **Decision:** **Last Active** pulsing badge on most recently opened session card.
- **Affected scenarios:** **new:** F-07.

#### PW-06 — Sidebar highlight → **Decided A**
- **Decision:** Highlight **Home** when drilled into Campaign → Sessions.
- **Affected scenarios:** `navigation.feature` — active sidebar highlight.

#### PW-07 — Back link vs breadcrumb → **Decided A** (superseded on this screen by F-CS-03)
- **Decision (PW-07):** **← Active Campaigns** back link on Campaign Sessions — **not applied**; see F-CS-03.
- **Platform note:** Uppercase breadcrumb trail reserved for Session Scenes depth.

#### PW-09 — Home hero CTA → **Decided A**
- **Decision:** **Open Campaign** (not Enter Domain).
- **Affected scenarios:** `navigation.feature` — *Enter Domain on Home…*.

#### PW-15 — Delete affordance → **Decided A**
- **Decision:** **Trailing 🗑** on web/tablet; **swipe-right** on touch/narrow viewports; both → soft-delete to Trash.
- **Affected scenarios:** `manage_sessions` — delete gesture scenarios.

#### PW-16 — Soft-delete model → **Decided A**
- **Decision:** **Always soft-delete** — aligns platform [PW-16](platform-wide.md#pw-16); sessions on **Sessions** tab.
- **Affected scenarios:** Align with CS-01; cross-ref [campaigns.md](campaigns.md).

#### PW-17 — Delete confirmation → **Decided B**
- **Decision:** **Always show AlertDialog** before moving session to Trash.
- **Affected scenarios:** **new:** F-09, F-10; differs from scenes (SL-02 no routine confirm).

#### F-CS-01 — Card metadata → **Decided A**
- **Decision:** Show **date · scene count** (e.g. *Mar 12 · 4 Scenes*) on populated session cards.
- **Affected scenarios:** **new:** F-08.

#### F-CS-02 — Retire gear scenarios → **Decided A**
- **Decision:** Drop gear → Arcane Settings; use sidebar Credits/Trash.
- **Affected scenarios:** **Retire** `screen_transitions` — Shared Z-Axis gear; `navigation` — gear icon scenarios.

#### F-CS-03 — Explicit back link → **Decided B**
- **Decision:** **Browser back only**; no explicit **← Active Campaigns** link on Campaign Sessions.
- **Affected scenarios:** Do not add back-link scenario; supersedes PW-07 for this screen.

### Scenarios to author

| ID | Scenario |
|---|---|
| **F-01** | Session cards render in 2-column grid on wide viewport; single column on narrow |
| **F-02** | GM renames an existing session via edit dialog |
| **F-03** | GM changes session date (including future date); list re-sorts most recent first |
| **F-04** | GM edits optional session description via edit dialog |
| **F-06** | Campaign hero banner remains visible on sessions list after Container Transform |
| **F-07** | Most recently opened session shows Last Active pulsing badge |
| **F-08** | Session card shows date · linked scene count metadata |
| **F-09** | Deleting a session (🗑 or swipe) shows confirmation AlertDialog before soft-delete to Trash |
| **F-10** | Confirmed session delete moves session to Trash **Sessions** tab with 7-day countdown |

### Scenarios to retire or rewrite

| Feature file | Retire / rewrite |
|---|---|
| `manage_sessions.feature` | Swipe/🗑 → **confirm** → soft-delete to Trash **Sessions** tab; separate Session N + name; 2-column layout; full edit dialog; date · scene count on cards |
| `trash_recovery.feature` | **Extend** session restore/countdown on **Sessions** tab ([trash.md](trash.md) **TR-10**) |
| `navigation.feature` | Enter Domain → **Open Campaign**; Home highlighted on sessions drill-down; **retire** gear icon |
| `screen_transitions.feature` | **Retire** gear → Arcane Settings; keep/extend Campaign → Sessions Container Transform |
| `session_scenes.feature` | Session header uses separate number + name (CS-02) |
