# Feature feedback — Library Imported Tracks tab

**Request:** `/plan-feature` — In Library, a third tab for displaying imported tracks; 3 tracks per row; trash button.

**PO Discovery artifact:** [`docs/requirements/library-imported-tracks.md`](../docs/requirements/library-imported-tracks.md)

**Status:** Phase 1 — Principal PO peer review complete. **Human gate required before Design.**  
**Decided:** *(none yet)*  
**Must decide before Design:** **LIT-00**, **LIT-03**, **LIT-09** (plus LIT-01 / LIT-02 once MVP includes trash)  
**Prefer decide before Design:** LIT-04, LIT-05  
**Deferrable with PO defaults if MVP includes them:** LIT-06, LIT-07, LIT-08

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

## Round-1 decisions (to fill after human responds)

| ID | Decision | Notes |
|---|---|---|
| LIT-00 | | MVP slice (browse vs manage) |
| LIT-09 | | Bundled vs user-import catalogue |
| LIT-01 | | Tab label |
| LIT-02 | | Trash tab (if manage) |
| LIT-03 | | In-use delete behaviour (if manage) |
| LIT-04 | | Playlist card shape |
| LIT-05 | | Import CTA scope |
| LIT-06 | | Preview |
| LIT-07 | | Search |
| LIT-08 | | URL `?tab=` |
