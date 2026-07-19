# Library — Imported Tracks Tab (Discovery)

**Status:** Phase 1 — Discovery (Acceptance Criteria draft) · **Principal PO peer-reviewed** — human gate open  
**Request:** In Library, add a third tab that displays imported soundscape tracks — **3 tracks per row**, with a **trash** control on each track.  
**Related designs (existing, not yet updated for this feature):**
- [`docs/designs/audio-library-design.md`](../designs/audio-library-design.md) — Library browse (today: Soundscapes + Sound Effects only)
- [`docs/designs/audio-library-soundscape-tracks-modal-design.md`](../designs/audio-library-soundscape-tracks-modal-design.md) — Track Picker (only place tracks are browsable today)
- [`docs/designs/trash-design.md`](../designs/trash-design.md) — Soft-delete / Trash (no track-level tab yet)
- [`docs/designs/soundscape-category-composer-design.md`](../designs/soundscape-category-composer-design.md) — Categories that *use* these tracks

**Open product decisions:** [`/feedback/feature library-imported-tracks.md`](../../feedback/feature%20library-imported-tracks.md)  
**Principal PO gate:** Answer **LIT-00** (MVP slice), **LIT-03** (in-use delete, if manage), **LIT-09** (bundled vs user imports) before Design. Full critique lives in that feedback file.

**Out of scope for this Discovery artifact:** Gherkin, visual design, production code.

---

## Problem / outcome

GMs import soundscape tracks (local audio, YouTube videos, YouTube playlists) for use in Category Composer, but today those imports are only discoverable inside the Track Picker. The GM needs a first-class Library place to **see**, **find**, and **discard** imported tracks without opening a composer flow.

---

## Non-negotiable Acceptance Criteria

These are user-facing outcomes. Labels in quotes are proposed defaults pending LIT-01.

### AC-1 — Third Library tab

Given the GM opens **Library**,  
they can switch among **three** tabs: Soundscapes, Sound Effects, and a third tab for imported soundscape tracks (proposed label: **Tracks**).  
The third tab is equal in prominence to the existing two (same tab-strip pattern).

### AC-2 — Catalogue of imported soundscape tracks

On the third tab, the GM sees every **active** (not soft-deleted) imported soundscape track in their library, including:

- Local file imports  
- YouTube single-video imports  
- YouTube playlist imports (as catalogue entries — see Edge Cases and LIT-04)

FX library tracks do **not** appear here (they remain on **Sound Effects**).  
Soundscape **categories** do **not** appear here (they remain on **Soundscapes**).

### AC-3 — Three tracks per row

On the primary desktop / wide Library layout, the third-tab grid shows **exactly three track cards per row**.  
Narrower viewports may reduce columns for readability, but the wide-layout target is **3-up** (not the denser FX grid and not the Soundscapes composition grid).

### AC-4 — Trash control on each track

Each track card exposes a clear **trash** affordance.  
Activating it removes the track from the third-tab grid (soft-delete — see AC-5).  
Affordance style should align with platform delete patterns (🗑 on web/tablet; swipe on touch where Library already uses swipe for delete).

### AC-5 — Soft-delete and recovery (platform Trash model)

Deleting a track from the third tab is a **soft-delete**:

- The track disappears from Library’s third tab immediately.  
- The track is recoverable from **Trash** for **7 days** (same retention as other Library entities).  
- Routine soft-delete does **not** require a confirmation dialog (same as FX / soundscape category soft-delete).  
- Purge / Empty Trash still require destructive confirmation.

**Pending LIT-02:** which Trash tab hosts these items (new **Tracks** tab vs reuse of an existing tab).

### AC-6 — Empty and filtered-empty states

| State | Expected experience |
|---|---|
| **No imported tracks** | Centred empty state explaining that imported soundscape tracks will appear here, with a clear next step (import path TBD — LIT-05). |
| **Search/filter yields nothing** | Literal copy in the style of PW-14, e.g. “No tracks match your filters”, plus a way to clear the filter. |
| **Loading** | Skeleton / loading treatment consistent with other Library tabs. |

### AC-7 — Soft-deleted tracks stay out of active pickers

While a track is in Trash (soft-deleted), it must **not** appear as selectable content in Category Composer’s Track Picker.  
After restore from Trash, it reappears in the third Library tab and again in Track Picker.

---

## Edge cases (dictated)

### E-1 — Track is attached to one or more soundscape categories

**Question for decision:** LIT-03.

**Product rule required before Design:** Deleting an imported track that is still assigned to intensity levels must have a single, GM-clear outcome. Candidate outcomes (choose one in feedback):

1. **Detach + delete** — soft-delete the track; automatically remove it from every intensity level that referenced it; categories remain.  
2. **Block delete** — refuse soft-delete while any category still uses the track; tell the GM where it is used.  
3. **Confirm with impact** — warn with usage count / names, then detach + soft-delete on confirm (exception to “no routine confirm”).

Until decided, Design and Gherkin must not invent cascade behaviour.

### E-2 — Local vs YouTube vs playlist display

Each card must be distinguishable by source type at a glance (local file vs YouTube video vs YouTube playlist), using source-appropriate metadata:

| Kind | Minimum card identity |
|---|---|
| **Local** | Display name; duration and/or format when available |
| **YouTube video** | Display name; clear YouTube/source cue; duration when available |
| **YouTube playlist** | Display name; clear playlist cue; indication of how many videos the playlist represents (when known) |

Playlist entries remain **one catalogue card** on this tab (not an expanded list of every video), unless LIT-04 chooses otherwise.

### E-3 — Preview

**Proposed default (align with Track Picker / Library preview norms):** GM can preview a track from the card (one at a time). Leaving Library or switching away stops preview.  
**Pending LIT-06** whether v1 includes preview on this tab or defers it.

### E-4 — Search

**Proposed default (align with other Library tabs):** Main-content search filters the third-tab grid by track name (debounced). No new sidebar filter panel required for v1.  
**Pending LIT-07** whether search ships in v1.

### E-5 — Import from this tab

Today import of soundscape tracks happens from Composer Track Picker (and related import flows).  
**Pending LIT-05** whether the third tab also offers **Import** (local / YouTube) as a primary CTA, or is browse+delete only in v1.

### E-6 — Restore from Trash

Restoring a soft-deleted track:

- Returns it to the third Library tab.  
- Makes it available again in Track Picker.  
- **Pending LIT-03:** whether prior category intensity attachments are restored, left detached, or were never removed.

### E-7 — Permanent purge

After 7 days or manual purge from Trash, the track is gone permanently and cannot be restored. Any remaining category references (if detach was deferred) must not leave the GM with silent “ghost” playables — behaviour must match the chosen LIT-03 rule.

### E-8 — Tab memory / deep link

Existing Library design says tab choice is client-only; the running app may already use `?tab=`.  
**Pending LIT-08:** whether the third tab participates in URL `?tab=` deep-linking or stays client-only like the documented Soundscapes/FX behaviour. Discovery does not change that platform rule; Design must reconcile doc vs current app.

### E-9 — Concurrent preview / mini player

If preview ships (LIT-06): this tab should **not** introduce a second sticky mini-player pattern unless Design intentionally mirrors FX. Prefer inline card playing state (Soundscapes / Track Picker style) unless LIT-06 chooses FX-style mini player.

---

## Explicitly out of scope (v1 Discovery)

Unless feedback expands scope:

- Renaming / retagging / editing track metadata on this tab (FX-style inline edit)  
- Purchasing / “Buy” / free demo packs for soundscape tracks on this tab  
- Using this tab as a scene picker (no checkboxes / Add Selected)  
- Hard-delete without Trash  
- Showing FX tracks mixed into this grid  

---

## Documentation sync notes (for later phases)

When Design proceeds, these docs will need updates (not done in Phase 1):

| Doc | Expected change |
|---|---|
| `audio-library-design.md` | Third tab; purpose line; grid density; soft-delete row for tracks |
| `trash-design.md` | Trash tab / entity row for soundscape tracks (per LIT-02) |
| Track Picker design | Cross-link: catalogue also browsable from Library third tab; soft-deleted hidden |
| `answered-questions-dont-refer/audio-library.md` | Record LIT decisions once answered |

---

## Sign-off checklist (PO — later phases)

- [ ] Human answers recorded in `/feedback/feature library-imported-tracks.md`  
- [ ] Design + prototype exist for third tab (empty / populated / filtered-empty / trash)  
- [ ] Gherkin covers AC-1–AC-7 and chosen edge-case rules  
- [ ] Trash recovery path verified for restored tracks  
- [ ] Final walkthrough matches AC before feature complete sign-off  

**Phase 1 PO verdict:** Acceptance Criteria and edge cases are ready for principal/human decision on open questions; **not** ready for Design until LIT-00, LIT-03, and LIT-09 are decided (LIT-01–LIT-02 required when MVP includes trash).

**Phase 1 Principal PO verdict:** Discovery is directionally sound; challenge MVP overload (display vs full Trash management), catalogue membership for bundled seeds, and playlist-as-intensity delete impact. **Human gate required before Design.**
