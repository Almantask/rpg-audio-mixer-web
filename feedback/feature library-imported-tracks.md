# Feature feedback — Library Imported Tracks tab

**Request:** `/plan-feature` — In Library, a third tab for displaying imported tracks; 3 tracks per row; trash button.

**PO Discovery artifact:** [`docs/requirements/library-imported-tracks.md`](../docs/requirements/library-imported-tracks.md)

**Status:** Phase 1 — Principal PO peer review complete. Human gate answered via checkboxes below.  
**Decided:** LIT-00 C, LIT-09 B, LIT-01 A, LIT-02 A, LIT-03 C, LIT-04 A, LIT-05 B, LIT-06 A, LIT-07 A, LIT-08 A  
**Must decide before Design:** *(done — see Decided)*  
**Prefer decide before Design:** *(done — see Decided)*  
**Deferrable with PO defaults if MVP includes them:** *(decided — see Decided)*

---

## Principal PO assessment (peer review)

> "Fall in love with the problem, not the solution." — Melissa Perri, *Escaping the Build Trap*

**Verdict on PO Discovery:** Strong draft. Outcome framing (“see / find / discard without opening Composer”) is clearer than the raw request. AC-1–AC-7 and E-1–E-9 correctly expose the hard edges (in-use delete, Trash home, playlist card shape). **Do not start Design until LIT-00, LIT-03, and LIT-09 are answered.**

### What the PO got right

- Separates **categories** (Soundscapes) from **source tracks** (third tab) and keeps FX out — correct information architecture.
- Treats trash as soft-delete into platform Trash with picker exclusion (AC-5 / AC-7) instead of inventing hard-delete.
- Blocks Design on in-use cascade (LIT-03 / E-1) — this is the real product risk, not the 3-up grid.
- Explicitly defers rename/buy/picker-mode — good anti–build-trap scope.

### Strategic challenges (Principal PO)

1. **The request is a solution shape.** “Third tab + 3/row + trash” may be right, but the outcome to validate is: *GMs can manage soundscape source assets as a library, not only through Composer.* If the pain is only “I can’t find what I imported,” browse + search may beat shipping Trash wiring first. If the pain is “I need to remove bad/unused imports,” trash without “where used” will feel scary. **LIT-00 forces that choice.**

2. **MVP is overloaded if we ship full Trash parity on day one.** Soft-delete + new Trash tab + restore + detach cascade + YouTube/playlist cards is a *management* feature, not a *display* tab. Thin-slice learning (LIT-00 A) is strategically cleaner unless the human confirms discard is the job-to-be-done.

3. **Catalogue membership is underspecified.** The app seeds **bundled** soundscape tracks into `soundscapeTracks`. AC-2 says “imported” but lists local + YouTube + playlist — it does not say whether bundled/demo tracks appear or can be trashed. Shipping “every active track” without LIT-09 risks GMs deleting (or cluttering) seed content.

4. **Cross-feature risk with playlist-as-intensity.** Prior decisions (`feedback/feature youtube-playlist-intensity.md`) allow a playlist to occupy an intensity level. Trashing that playlist entry mid-campaign can empty a live mood tier. LIT-03 must be decided with that model in mind (empty level after detach is acceptable only if Composer/Active Scene already handle empty pools safely).

5. **“Find” is claimed in the outcome but optional in v1 (LIT-07).** If Discovery’s outcome includes find, search should not be casually deferred — either keep find in the outcome and ship LIT-07 A/C, or narrow the outcome wording to *see + discard*.

6. **3-up grid is a layout constraint, not a strategy decision.** Keep as wide-layout target (AC-3); do not let column count expand MVP. Narrow viewports may collapse columns.

7. **Missing “where used” affordance.** For a management tab, knowing which categories reference a track is high leverage before/during trash. Acceptable to defer, but LIT-03 Option B/C become harsher without it — call out in Design if trash ships.

### Recommended MVP (Principal PO — proposal, not decided)

| In MVP | Later |
|---|---|
| Third tab + 3-up grid of **user-relevant** soundscape tracks (per LIT-09) | Inline edit / retag |
| Source-type cues (local / YT / playlist) | Buy / free packs on this tab |
| Empty state pointing at existing import path | Scene-picker mode |
| **If LIT-00 = B:** trash → soft-delete + Trash tab + picker hide + LIT-03 rule | “Where used” panel (unless chosen with LIT-03 C) |
| Search if outcome keeps “find” (prefer LIT-07 A) | Source-type filter (LIT-07 C) |
| Preview nice-to-have (LIT-06 A) | FX-style mini player |

**Human gate:** Yes — checkbox answers below before Design / Gherkin.

---

## LIT-00 — MVP outcome slice *(blocks Design)*

> "Strategy is about focus — choosing what not to do." — Richard Rumelt, *Good Strategy/Bad Strategy*

**Strategic Inquiry:** What must ship in the first slice so we learn whether GMs will use a Library home for soundscape source tracks?

- [x] Option C: **Full library-parity MVP** — Option B **plus** search, inline preview, and Import CTA on this tab in the same slice.

---

## LIT-09 — Catalogue membership (bundled vs user imports) *(blocks Design)*

> "Opportunity solution trees keep us from jumping to a solution before we understand the outcome." — Teresa Torres, *Continuous Discovery Habits*

**Strategic Inquiry:** Bundled/demo soundscape tracks already live in the same track catalogue as user imports. What should the third tab show, and what may be trashed?

- [x] Option B: **All active soundscape tracks** — bundled and user imports share the grid; trash allowed on all (restore/re-seed rules must be defined in Design).

---

## LIT-01 — Tab label

> "The most important thing about a product is not what it does, but the outcome it enables for the customer." — Marty Cagan, *Inspired*

**Strategic Inquiry:** What should the third Library tab be called so GMs understand it holds soundscape **source tracks** (not FX, not categories)?

- [x] Option A (recommended): **Tracks** — short; pairs with Soundscapes / Sound Effects
FX

---

## LIT-02 — Trash destination

> "Good strategy honestly acknowledges the challenges being faced." — Richard Rumelt, *Good Strategy/Bad Strategy*

**Strategic Inquiry:** Soft-deleted imported soundscape tracks must land in Trash for 7-day recovery. Where do they appear? *(Skip if LIT-00 Option A.)*

- [x] Option A (recommended): **New Trash tab — Tracks** — keeps soundscape source tracks separate from FX and from soundscape *categories*

---

## LIT-03 — Delete when track is used in a category *(blocks Design)*

> "Fall in love with the problem, not the solution." — Melissa Perri, *Escaping the Build Trap*

**Strategic Inquiry:** If the GM trashes an imported track that is still assigned to one or more soundscape intensity levels (including a YouTube **playlist occupying a whole intensity level**), what should happen? *(Skip if LIT-00 Option A.)*

- [x] Option C: **Confirm with impact** — show usage count/names (and playlist-as-level warning when relevant), then on confirm detach + soft-delete (exception to no-confirm soft-delete).

---

## LIT-04 — Playlist card shape on the Library tab

> "Opportunity solution trees keep us from jumping to a solution before we understand the outcome." — Teresa Torres, *Continuous Discovery Habits*

**Strategic Inquiry:** A YouTube playlist is stored as one library entry today. How should it appear on the third tab?

- [x] Option A (recommended): **One card per playlist** — badge/cue that it is a playlist; show video count when known; trash removes the whole playlist entry

---

## LIT-05 — Import CTA on the third tab

> "Strategy is about focus — choosing what not to do." — Richard Rumelt, *Good Strategy/Bad Strategy*

**Strategic Inquiry:** Should v1 of the third tab only manage (browse + trash) existing imports, or also be an import entry point?

- [x] Option B: **Import on this tab** — primary Import control for local files and YouTube (parity with “this is where my tracks live”)

---

## LIT-06 — Preview on the third tab

> "Outputs are not outcomes." — Melissa Perri, *Escaping the Build Trap* (paraphrased principle)

**Strategic Inquiry:** Can the GM preview audio from a track card on the third tab in v1?

- [x] Option A (recommended): **Yes — inline card preview** (one at a time; no sticky mini player; stop on leave/tab switch)

---

## LIT-07 — Search on the third tab

> "Strategy is about focus — choosing what not to do." — Richard Rumelt, *Good Strategy/Bad Strategy*

**Strategic Inquiry:** Does v1 include a main-content search bar on the third tab? *(If Discovery keeps “find” in the outcome, prefer A or C.)*

- [x] Option A (recommended): **Yes** — filter by track name (same Library search pattern as other tabs)

---

## LIT-08 — Tab deep link (`?tab=`)

> "Good strategy honestly acknowledges the challenges being faced." — Richard Rumelt, *Good Strategy/Bad Strategy*

**Strategic Inquiry:** Library design historically said tab state is client-only; the app may already use `?tab=`. Should the third tab be addressable in the URL?

- [x] Option A (recommended if URL tabs already exist): **Yes** — third tab has a stable `?tab=` value so GMs can bookmark/share Library → Tracks

---

## Round-1 decisions (filled from checked options)

| ID | Decision | Notes |
|---|---|---|
| LIT-00 | C | Full library-parity MVP (manage + search + preview + Import CTA) |
| LIT-09 | B | All active soundscape tracks; trash allowed on bundled and imports |
| LIT-01 | A | Tab label **Tracks** |
| LIT-02 | A | New Trash tab — Tracks |
| LIT-03 | C | Confirm with impact; detach + soft-delete on confirm |
| LIT-04 | A | One card per playlist with playlist cue + video count |
| LIT-05 | B | Import on this tab (local + YouTube) |
| LIT-06 | A | Inline card preview; one at a time; no mini player; stop on leave/tab switch |
| LIT-07 | A | Main search filters by track name |
| LIT-08 | A | Stable `?tab=` deep link for Tracks |

---

## Gherkin-to-production — Loop 1 design gate *(blocks Loop 2)*

**Status:** Loop 1 Discovery complete. **LIT-G2P-01 = B** — Loop 2 unblocked (Gherkin + peer patterns; design docs after ship).  
**Behavior ready:** `@iter12` features under `features/library/*track*.feature` + Track restore/purge in Trash.  
**Looks:** Match Library FX/Soundscapes + Composer Track Picker patterns until design docs are updated.

### Proposed build order (after gate)

S1 Browse shell → S2 Catalogue 3-up → S3 Card metadata → S4 Search → S5 Preview → S6 Soft-delete → S7 In-use confirm → S8 Import → S9 Trash Tracks → S10 Picker exclusion verify.

---

## LIT-G2P-01 — Design source for Tracks looks *(blocks Loop 2)*

> "A good architecture allows major decisions to be deferred." — Robert C. Martin, *Clean Architecture* (applied: deferring looks without a design source forces guessing)

**Technical Inquiry:** Gherkin defines Tracks behavior, but scene design docs/prototypes do not yet include the third Library tab or Trash Tracks. How should Loop 2 obtain looks (layout, copy, visual states)?

- [ ] Option A: **Pause for Design** — run `product-designer` / update `audio-library-design.md`, `library-prototype.html`, and `trash-design.md` (Tracks tab, 3-up cards, trash, search, import, empty/loading/error, in-use confirm, Trash Tracks) before any production code.
- [x] Option B: **Implement from Gherkin + peer patterns** — waive new scene designs for this slice; match existing Library FX/Soundscapes and Composer Track Picker patterns for looks; update design docs after ship.
- [ ] Option C: **Thin design first** — author a minimal `audio-library-tracks-design.md` (+ Trash Tracks section) covering empty/loading/success/error and in-use dialog copy only, then implement; full prototype HTML can follow.

---

## LIT-G2P-02 — Bundled track trash / re-seed *(prefer before S6/S9)*

> "Strategy is about focus — choosing what not to do." — Richard Rumelt, *Good Strategy/Bad Strategy*

**Technical Inquiry:** LIT-09 B allows trashing bundled tracks. What happens on restore/purge for seed content?

- [x] Option A: Soft-delete/restore like any user track; no automatic re-seed. Purged bundled tracks stay gone until a future seed/reset feature. *(assumed under G2P-01 B unless overridden)*
- [ ] Option B: Soft-delete allowed; restore re-hydrates from seed catalogue if the bundled id is known.
- [ ] Option C: Bundled tracks can appear on Tracks but trash is blocked (conflicts with LIT-09 B — only choose if reversing that decision).
