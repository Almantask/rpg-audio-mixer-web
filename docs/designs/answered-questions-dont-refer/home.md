# Home — open questions (with recommendations)

**Design doc:** [Home design](../home-design.md)

← [Index](README.md) · [Platform-wide](platform-wide.md)

---

## Related platform questions

### PW-01: Sidebar IA (6 items, no gear)
**Question:** Is the Jul 2026 six-item sidebar (Home, Campaign, Scenes, Library, Credits, Trash) the source of truth, retiring the top-bar gear icon?
**Option A (Recommended):** Adopt the 6-item sidebar with no gear; Credits and Trash are first-class nav destinations — matches current Home design and consolidates settings/trash access.

ANSWER: A

**Affected feature scenarios:**
- The app shell shows Arcanum Audio and primary navigation
- The sidebar has exactly four primary items
- The gear icon navigates to Arcane Settings from any screen
- Drill-down navigation uses Shared Z-Axis

### PW-02: Credits vs Arcane Settings
**Question:** Should the user-facing destination be labeled **Credits** only, or retain themed naming like **Arcane Settings** / **Behind the Screen**?
**Option A (Recommended):** Sidebar label **Credits**; optional themed heading inside the screen body — aligns with Jul 2026 IA and literal navigation.

ANSWER: A

**Affected feature scenarios:**
- The gear icon navigates to Arcane Settings from any screen
- Drill-down navigation uses Shared Z-Axis
- None — design-only (Home shell references Credits sidebar item)

### PW-04: Credits/Trash sidebar tier
**Question:** Are Credits and Trash primary nav peers of Home/Campaign/Scenes/Library, or secondary utilities below the main four?
**Option A (Recommended):** Primary peers in the same sidebar list — matches Home ASCII shell and equal discoverability.

ANSWER: A

**Affected feature scenarios:**
- The app shell shows Arcanum Audio and primary navigation
- The sidebar has exactly four primary items

### PW-05: Profile sidebar footer
**Question:** Is a profile avatar/footer in the sidebar in scope for this iteration, and where does it navigate?
**Option A (Recommended):** Defer profile footer to post-MVP unless Credits design mandates it — keeps Home shell scope focused.

ANSWER: A

**Affected feature scenarios:**
- None — design-only

### PW-09: Hero CTA label
**Question:** What is the Home hero button label — **Open Campaign**, **Enter Domain**, or **Resume** — and should it match the Campaign list CTA?
**Option A (Recommended):** **Resume** on Home; Campaign list keeps **Resume** — literal re-entry on dashboard, thematic continuation on list.

ANSWER: A

**Affected feature scenarios:**
- Home shows the most recently played campaign
- Enter Domain navigates to the active campaign's sessions
- Enter Domain on Home navigates to the active campaign's sessions

### PW-10: Create campaign CTA
**Question:** For empty/no-campaign states, use **Create Campaign**, **Scribe New Tale**, or design copy like **Create your first campaign**?
**Option A (Recommended):** Home empty hero: **Create your first campaign** with CTA routing to Campaign; list-level creation keeps **Scribe New Tale** / **Create Campaign** per campaigns spec — context-appropriate copy.

ANSWER: A

**Affected feature scenarios:**
- Home shows an empty state when no campaigns exist

### PW-11: Stat card naming
**Question:** Are Home stat sections named **Top Soundscape / Top Sound Effect** or **Top Atmosphere / Legendary Action**?
**Option A (Recommended):** **Top Soundscape** / **Top FX** — matches Library/Scenes vocabulary and Jul 2026 design.

ANSWER: A

**Affected feature scenarios:**
- Top Atmosphere shows the globally most played soundscape category
- Tapping play on Top Atmosphere previews that category inline
- Top Atmosphere shows a placeholder when no categories have been played yet
- Legendary Action shows the globally most played soundboard effect
- Tapping play on Legendary Action previews that effect inline
- Legendary Action shows a placeholder when no effects have been cast yet

### PW-12: PLAYS vs CASTS
**Question:** Should the FX stat pill read **PLAYS** (uniform) or **CASTS** (action-specific)?

**Option B:** **PLAYS** for both cards — visual uniformity per Jul 2026 design mockup.

ANSWER: B

**Affected feature scenarios:**
- Top Atmosphere shows the globally most played soundscape category
- Legendary Action shows the globally most played soundboard effect

### PW-32: Hero CTA destination
**Question:** Does the Home hero CTA open the campaign Sessions list only, or deep-link to the last played scene?
**Option A (Recommended):** Sessions list only — matches design, current features, and predictable hierarchy.

ANSWER: A

**Affected feature scenarios:**
- Enter Domain navigates to the active campaign's sessions
- Enter Domain on Home navigates to the active campaign's sessions

### PW-33: Resume Journey removal
**Question:** Is removing the Resume Journey card acceptable for mid-session GMs who must use hero → Sessions → Scene?
**Option A (Recommended):** Confirmed removed for MVP; Active Campaign hero is the sole Home re-entry path — simpler dashboard, design intent.

ANSWER: A

**Affected feature scenarios:**
- None — design-only (no Resume Journey scenarios in Home features)

### PW-50: HTML prototypes
**Question:** Is an HTML prototype required before Home dev kickoff, or are ASCII + markdown sufficient for MVP?
**Option A (Recommended):** ASCII + markdown sufficient for Home MVP — design doc is detailed enough for FE sidebar layout.

ANSWER: A

**Affected feature scenarios:**
- None — design-only

---

## Screen-specific questions

### H-01: Preview vs Active Scene audio
**Question:** While an Active Scene session is playing, should Home inline previews mix, duck, or be blocked?
**Option A (Recommended):** Block Home previews while a session is active — prevents accidental disruption during live play.

ANSWER: A

**Affected feature scenarios:**
- Tapping play on Top Atmosphere previews that category inline
- Tapping play on Legendary Action previews that effect inline

### H-02: Global stats scope
**Question:** Is "globally most-played" scoped to this GM's all-time history only, or cross-user platform analytics?
**Option A (Recommended):** Per-GM all-time only — privacy-friendly, no shared analytics backend for MVP.

ANSWER: A

**Affected feature scenarios:**
- Top Atmosphere shows the globally most played soundscape category
- Legendary Action shows the globally most played soundboard effect

### H-03: Soundscape play aggregation
**Question:** What event increments the Top Soundscape play count — preview tap, loop start in Active Scene, or duration threshold?
**Option A (Recommended):** Loop start in Active Scene only (exclude Home preview taps) — stats reflect real session use.

ANSWER: A

**Affected feature scenarios:**
- Top Atmosphere shows the globally most played soundscape category

### H-04: Default preview track
**Question:** When a soundscape category has multiple loopable tracks, which track plays on Home ▶ preview?
**Option A (Recommended):** Category's designated default (or first loopable) track — predictable, matches "category preview" mental model.

ANSWER: A

**Affected feature scenarios:**
- Tapping play on Top Atmosphere previews that category inline

### H-05: Empty campaign stat cards
**Question:** When no campaigns exist, hide Top Soundscape and Top Sound Effect entirely or show muted placeholders?
**Option A (Recommended):** Hide stat sections entirely — matches `home_screen.feature` and reduces noise for first-time GMs.

ANSWER: A

**Affected feature scenarios:**
- Home shows an empty state when no campaigns exist

### H-06: FX empty-state CTA destination
**Question:** When no soundboard effects have been cast, should the empty-state link target Library only, or also Scenes?
**Option A (Recommended):** Library only — effects are authored/imported there before scene assignment.

ANSWER: A

**Affected feature scenarios:**
- Legendary Action shows a placeholder when no effects have been cast yet

### H-07: MVP offline behavior
**Question:** Should Home cache campaign hero and stat-card data for offline viewing in MVP?
**Option A (Recommended):** Show last cached hero + stats with subtle stale/offline indicator — usable between sessions without connectivity.

ANSWER: A

**Affected feature scenarios:**
- None — design-only (no offline scenarios)

### H-08: Preview interaction matrix
**Question:** What are the Home preview rules for play/pause toggle, one-at-a-time playback, playing visuals, and navigate-away behavior?
**Option A (Recommended):** One preview at a time; ▶ toggles play/pause; progress bar while active; preview stops on navigate away — clear, non-overlapping Home audio.

ANSWER: A

**Affected feature scenarios:**
- Tapping play on Top Atmosphere previews that category inline
- Tapping play on Legendary Action previews that effect inline

---

## New questions from feature cross-check

*Resolved where prior **PW-** / **H-** answers in this doc imply a single option; remaining items stay open for PO.*

### H-F-01: Per-card empty copy wording
**Question:** Should soundscape/FX empty placeholders use design copy ("No soundscapes/sound effects played yet") or feature copy ("No atmospheres/effects cast yet")?

**Option A (Recommended):** Align to **PW-11** labels — **No soundscapes played yet** / **No sound effects played yet** — consistent with Library/Scenes terms.

**Option B:** Keep feature thematic copy — **No atmospheres played yet** / **No effects cast yet**.

ANSWER: A

**Affected feature scenarios:**
- Top Atmosphere shows a placeholder when no categories have been played yet → **rewrite** copy + section title **Top Soundscape**
- Legendary Action shows a placeholder when no effects have been cast yet → **rewrite** copy + section title **Top FX**

---

### H-F-02: Type badge labels
**Question:** What exact badge text should stat cards show — design (**SOUNDSCAPE · LOOPABLE** / **FX · SUDDEN**) or generic "ambience/FX type badges"?

**Option A (Recommended):** Explicit design badges **SOUNDSCAPE · LOOPABLE** and **FX · SUDDEN** — scannable, matches Library taxonomy (**PW-11**).

**Option B:** Themed abbreviated badges (e.g. **AMBIENCE · LOOP**) — softer tone, less literal.

ANSWER: A

**Affected feature scenarios:**
- Top Atmosphere shows the globally most played soundscape category → **rewrite** badge assertions
- Legendary Action shows the globally most played soundboard effect → **rewrite** badge assertions

---

### H-F-03: Hero session subtitle
**Question:** Must the Active Campaign hero always show a session context subtitle (e.g. "Session 14: …") when session data exists?

**Option A (Recommended):** Yes — show latest session name/number subtitle when available; omit gracefully when no sessions — matches design intent for at-a-glance resume context.

ANSWER: A

**Affected feature scenarios:**
- Home shows the most recently played campaign
- None — design-only (subtitle not asserted today)

---

### H-F-04: Loading skeleton states
**Question:** Should Home acceptance include skeleton placeholders for hero and both stat cards while data loads?

**Option A (Recommended):** Yes — add scenarios for skeleton hero + two stat-card placeholders — matches design loading state.

ANSWER: A

**Affected feature scenarios:**
- None — design-only (gap)

---

### H-F-05: Error overlay with partial data
**Question:** When Home data fetch partially fails, should a scrollable error overlay appear while still rendering available hero/stat data?

**Option A (Recommended):** Yes — per global error spec; assert overlay + partial render — resilient UX during flaky connectivity (**H-07** offline/cached context).

ANSWER: A

**Affected feature scenarios:**
- None — design-only (gap; `error_handling.feature` covers other screens)

---

### H-F-06: Empty-state navigation links
**Question:** Should per-card empty states include tappable links to Library as design specifies?

**Option A (Recommended):** Yes — **Top Soundscape** empty state → **Library**; **Top FX** empty state → **Library only** (**H-06**) — assert link presence and navigation target per card.

**Option B:** Copy-only empty states without links — GM uses sidebar manually.

ANSWER: A

**Affected feature scenarios:**
- Top Atmosphere shows a placeholder when no categories have been played yet → add Library link assertion
- Legendary Action shows a placeholder when no effects have been cast yet → add Library link assertion (not Scenes, per **H-06**)

---

### H-F-07: Credits and Trash sidebar navigation
**Question:** Should `navigation.feature` add acceptance for tapping **Credits** and **Trash** from Home (and other screens)?

**Option A (Recommended):** Yes — add scenarios; **PW-01** / **PW-04** adopt six-item sidebar with Credits and Trash as primary peers.

**Option B:** Cover Credits/Trash only in their dedicated feature files — Home navigation file stays focused on core four.

ANSWER: A

**Affected feature scenarios:**
- The app shell shows Arcanum Audio and primary navigation → extend to **6 items**
- The sidebar has exactly four primary items → **rewrite** to six
- The gear icon navigates to Arcane Settings from any screen → **retire** (no gear per **PW-01**)
- None — design-only (gap for Credits/Trash tap scenarios)

---

### H-F-08: Home preview vs Library mini player
**Question:** Does Home inline preview use the bottom mini player, or only in-card controls with no mini player (Library-only)?

**Option A (Recommended):** **In-card preview only** on Home; mini player remains Library-only — matches **H-08** one-at-a-time in-card matrix.

**Option B:** Mini player appears on Home FX preview too — consistent preview chrome app-wide.

ANSWER: A

**Affected feature scenarios:**
- Tapping play on Top Atmosphere previews that category inline
- Tapping play on Legendary Action previews that effect inline
- The mini player is only visible on the Library screen → **keep**; Home preview must not open mini player

---

### H-F-09: Preview progress bar and playing chrome
**Question:** Should Home preview scenarios assert a visible progress bar and play/pause state change on the stat card?

**Option A (Recommended):** Yes — assert progress bar + ▶/pause toggle while previewing — required by **H-08** preview matrix.

**Option B:** Assert only that audio starts — minimal audio smoke test without UI chrome.

ANSWER: A

**Affected feature scenarios:**
- Tapping play on Top Atmosphere previews that category inline → add progress bar + pause toggle assertions
- Tapping play on Legendary Action previews that effect inline → add progress bar + pause toggle assertions

---

### H-F-10: Empty hero CTA routing
**Question:** When no campaigns exist, does the empty-hero CTA navigate via sidebar Campaign only, or also offer a direct in-hero button?

**Option A (Recommended):** **In-hero CTA button** → Campaign list — **"Create your first campaign"** per **PW-10**; one tap for first-time GMs.

**Option B:** Prompt text only; GM must use sidebar Campaign — matches minimal feature assertion today.

ANSWER: A

**Affected feature scenarios:**
- Home shows an empty state when no campaigns exist → add in-hero CTA tap → Campaign list

---

### H-F-11: Hero → Sessions transition animation
**Question:** Should hero **Resume** → Sessions navigation use Container Transform (expanding hero) or standard hierarchical drill-down?

**Option A (Recommended):** Container Transform from hero card — polished continuity per `screen_transitions.feature` pattern.

ANSWER: A

**Affected feature scenarios:**
- Enter Domain navigates to the active campaign's sessions → **rewrite** CTA **Resume** (**PW-09**); destination Sessions list only (**PW-32**)
- Hierarchical navigation uses Container Transform

---

### H-F-12: Stat cards visible with campaign but no play history
**Question:** When a campaign exists but soundscape/FX history is empty, are both stat sections shown with per-card placeholders (vs hidden)?

**Option A (Recommended):** **Show both sections** with per-card empty placeholders — **H-05** hides stats only when **no campaigns** exist; onboarding links remain visible (**H-F-06**).

**Option B:** Hide sections until first play event — cleaner dashboard for new campaigns.

ANSWER: A

**Affected feature scenarios:**
- Top Atmosphere shows a placeholder when no categories have been played yet
- Legendary Action shows a placeholder when no effects have been cast yet
- Home shows an empty state when no campaigns exist → stat sections **not shown** (**H-05**); distinct from this case

---

## Additional QA scenarios

### H-F-13: Duplicate hero navigation scenarios
**Question:** Should hero **Resume** → Sessions navigation live only in `home_screen.feature` or be duplicated in `navigation.feature`?

**Option A (Recommended):** **Home feature only** — `navigation.feature` covers sidebar routing; hero CTA is Home-specific behavior (**PW-32** destination unchanged).

**Option B:** **Both features** — navigation suite owns all “tap X → see Y” flows including hero CTA for cross-screen regression pack.

**Affected feature scenarios:** `home_screen.feature` — *Enter Domain navigates to the active campaign's sessions* → rewrite CTA **Resume** (**PW-09**); `navigation.feature` — *Enter Domain on Home navigates to the active campaign's sessions* → same rewrite or **retire** duplicate per Option A.