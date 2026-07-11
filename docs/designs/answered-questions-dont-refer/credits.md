# Credits — open questions (with recommendations)

**Design doc:** [Credits design](../credits-design.md)

← [Index](README.md) · [Platform-wide](platform-wide.md)

---

### CR-01
**Question:** MVP — Buy the Devs a Coffee and Leave a Review required for v1?

**Option A (Recommended):** **Yes, both** — primary monetization/feedback CTAs on Credits screen.

ANSWER: A

**Affected feature scenarios:** **Gap** — no scenarios in `view_credits.feature` for support cards

---

### CR-02
**Question:** URL sources — env, CMS, or hardcoded?

**Option A (Recommended):** **Environment config** per URL; easy swap without redeploy of copy.

ANSWER: A

**Affected feature scenarios:** **Gap**

---

### CR-03
**Question:** Legal pages — in-app routes or external URLs?

**Option A (Recommended):** **In-app routes** for Terms, Privacy, Attributions (markdown or static pages).

ANSWER: A

**Affected feature scenarios:** `view_credits.feature` — *The Arcane Settings screen shows legal links*

---

### CR-04
**Question:** External links — all new tab, or mixed policy?

**Option A (Recommended):** **All external community/support URLs open new tab**; in-app legal routes same tab.

ANSWER: A

**Affected feature scenarios:** **Gap**

---

### CR-05
**Question:** Version/copyright — dynamic from build metadata or static?

**Option A (Recommended):** **Dynamic version** from build metadata; copyright year auto (e.g. © 2026).

ANSWER: A

**Affected feature scenarios:** `view_credits.feature` — *The Arcane Settings screen shows the app version*

---

### CR-06
**Question:** Attributions — sound library only, or OSS/third-party licenses too?

**Option A (Recommended):** **Both** — audio attributions + OSS licenses section.

ANSWER: A

**Affected feature scenarios:** **Gap**

---

### CR-07
**Question:** Community vs Legal layout — side-by-side or stacked on narrow viewports?

**Option A (Recommended):** **Side-by-side on wide**; **stacked** on narrow (Community above Legal).

ANSWER: A

**Affected feature scenarios:** **Gap**

---

### PW-01, PW-02, PW-04, PW-05, PW-48
**Affected feature scenarios:** `view_credits.feature`; `navigation.feature`; `trash_recovery.feature`

---

### New questions from scenario gaps

### F-CR-01
**Question:** Should `view_credits.feature` be rewritten as **Credits sidebar screen** (not Arcane Settings)?

**Option A (Recommended):** **Yes** — rename feature to `view_credits.feature` / "Credits screen"; remove gear scenarios.

**Option B:** Keep Arcane Settings as alias for Credits during migration.

**Affected feature scenarios:** `view_credits.feature` — **all scenarios**

---

### F-CR-02
**Question:** Should `navigation.feature` assert **Credits** and **Trash** as sidebar items (6-item IA)?

**Option A (Recommended):** **Yes** — extend sidebar list to 6 items per PW-01.

**Option B:** Credits/Trash reachable only via deep links.

**Affected feature scenarios:** `navigation.feature` — *The sidebar has exactly four primary items*

---

---

## Principal QA — full scenario notes

**Sign-off status:** ✅ **CR-01–CR-07** decided — author F-52–F-56, F-58, F-59 per table below. **Pending PO:** **F-CR-01**, **F-CR-02**, platform **PW-01**, **PW-02**, **PW-05**, **PW-48** ([platform-wide.md](platform-wide.md)) — Gherkin rewrite scope for `view_credits`, `navigation`, `screen_transitions`, and `trash_recovery` depends on F-CR-01/F-CR-02.

### Gherkin ↔ design — resolved conflicts

| Area | Decision | Gherkin action |
|---|---|---|
| Support CTAs | **Buy Coffee + Leave a Review** required MVP (CR-01 **A**) | **Add** F-52, F-53, F-58 on Credits screen |
| URL config | **Environment config** per URL (CR-02 **A**) | Non-Gherkin — implementation; optional smoke scenario for link targets |
| Legal pages | **In-app routes** Terms, Privacy, Attributions (CR-03 **A**) | **Add** F-59; **rewrite** *The Arcane Settings screen shows legal links* → in-app routes |
| External links | Community/support → **new tab**; legal in-app → **same tab** (CR-04 **A**) | **Add** F-54 |
| Version footer | **Dynamic** version + auto copyright year (CR-05 **A**) | **Rewrite** *The Arcane Settings screen shows the app version* → Credits footer |
| Attributions | **Sound library + OSS licenses** (CR-06 **A**) | **Add** F-55 |
| Layout | **Side-by-side** Community/Legal on wide; **stacked** on narrow (CR-07 **A**) | **Add** F-56 |
| Screen IA | **Credits sidebar screen** — not gear → Arcane Settings (F-CR-01 **pending**, Option A recommended) | **If A:** rewrite entire `view_credits.feature`; retire gear / Arcane Settings / Behind the Screen |
| Sidebar nav | **6 items** including Credits + Trash (F-CR-02 **pending**, PW-01) | **If A:** rewrite `navigation.feature` — *exactly four primary items* → six |
| Trash entry | Trash via **sidebar only** — not from Credits (design + F-57) | **If F-CR-01 A:** retire `view_credits` — *Necromancy Protocol* / Vault of Echoes card |

### Decisions — scenario impact

#### CR-01 — Support cards in MVP → **Decided A**
- **Decision:** **Buy the Devs a Coffee** and **Leave a Review** both required on Credits screen.
- **Affected scenarios:** **new:** F-52, F-53.

#### CR-02 — URL sources → **Decided A**
- **Decision:** **Environment config** per external URL.
- **Affected scenarios:** Implementation note; community link scenarios in rewritten `view_credits`.

#### CR-03 — Legal pages → **Decided A**
- **Decision:** **In-app routes** for Terms, Privacy, Attributions (markdown/static).
- **Affected scenarios:** **Rewrite** `view_credits` — *The Arcane Settings screen shows legal links* → navigate to in-app legal routes.

#### CR-04 — External link policy → **Decided A**
- **Decision:** External community/support URLs → **new tab**; in-app legal routes → **same tab**.
- **Affected scenarios:** **new:** F-54.

#### CR-05 — Version/copyright → **Decided A**
- **Decision:** **Dynamic version** from build metadata; copyright year auto-updates.
- **Affected scenarios:** **Rewrite** *The Arcane Settings screen shows the app version* → Credits screen footer.

#### CR-06 — Attributions scope → **Decided A**
- **Decision:** **Both** sound-library attributions and OSS/third-party licenses.
- **Affected scenarios:** **new:** F-55.

#### CR-07 — Responsive layout → **Decided A**
- **Decision:** **Side-by-side** Community and Legal on wide viewports; **stacked** (Community above Legal) on narrow.
- **Affected scenarios:** **new:** F-56.

#### F-CR-01 — Credits vs Arcane Settings → **Pending** (Option A recommended)
- **If A:** **Credits** sidebar destination; remove gear → Arcane Settings flow.
- **Affected scenarios:** **Rewrite all** `view_credits.feature` scenarios; **retire** gear scenarios in `navigation.feature`, `screen_transitions.feature`.

#### F-CR-02 — Six-item sidebar → **Pending** (Option A recommended, depends PW-01)
- **If A:** **Credits** and **Trash** as primary sidebar items (6 total).
- **Affected scenarios:** **Rewrite** `navigation.feature` — sidebar count and highlight scenarios.

### Scenarios to author

| ID | Scenario |
|---|---|
| **F-52** | Sidebar **Credits** navigates to Credits screen with Support cards (Coffee + Review) — *requires F-CR-01 A + F-CR-02 A* |
| **F-53** | **Buy the Devs a Coffee** opens external donation URL in a new tab |
| **F-54** | External community/support links open in new tab; in-app legal links open same tab |
| **F-55** | Attributions in-app page includes sound library credits and OSS license section |
| **F-56** | Credits layout: Community and Legal side-by-side on wide viewport; stacked on narrow |
| **F-57** | Trash is reachable via sidebar **Trash** only — no Vault/Necromancy card on Credits — *requires F-CR-01 A* |
| **F-58** | **Leave a Review** CTA opens store/review URL in new tab |
| **F-59** | Terms, Privacy, and Attributions navigate to in-app routes (CR-03) |

### Scenarios to retire or rewrite

| Feature file | Retire / rewrite |
|---|---|
| `view_credits.feature` | **If F-CR-01 A:** rename feature to *View Credits*; remove gear icon, "Behind the Screen", Arcane Settings, Necromancy Protocol → Vault flows; add Support cards, in-app legal routes, dynamic version, responsive layout. **Regardless:** update legal/version scenarios per CR-03–CR-07 |
| `navigation.feature` | **If F-CR-02 A:** retire gear icon scenarios; rewrite sidebar to **6 items** (Home, Campaign, Scenes, Library, Credits, Trash); add Credits sidebar navigation |
| `screen_transitions.feature` | **If F-CR-01 A:** retire gear → Arcane Settings / Shared Z-Axis scenarios |
| `trash_recovery.feature` | **If F-CR-01 A:** retire *Vault reachable from Arcane Settings* entry path; Trash via sidebar only (cross-ref [trash.md](trash.md)) |

---
