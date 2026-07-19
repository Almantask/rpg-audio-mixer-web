# Feature feedback — YouTube playlist as intensity level

**Request:** Add a whole YouTube playlist as a single intensity level in soundscape  
**PO framing (hypothesis — challenged below):** In Category Composer, the GM binds a YouTube playlist URL to **one** of the three fixed intensity levels (I / II / III). That level’s playable pool is the playlist’s videos. Other levels stay normal imported-track pools. The playlist does **not** replace the whole category.

**Principal PO assessment (Discovery):** **Reshape or split before designing.** The request names a *solution shape* (playlist = intensity level) that collides with today’s model: intensity is a **mood-tiered random pool of owned local tracks**, not a streaming playlist slot. Shipping “playlist-as-intensity” without deciding the outcome risks building the wrong YouTube surface (composer convenience vs library source vs live streaming pillar).

**Status:** First-round answers recorded. **Blocked on follow-ups YT-07–YT-09** (ambiguities in YT-05 D / YT-01 dual / YT-03 nested playlist) before Phase 2 Design.

**Decided (round 1):** YT-05 D · YT-01 A+B (user-selectable) · YT-02 B · YT-03 A (+ playlist nested pick) · YT-04 B · YT-06 C  
**Must decide now (block Design):** YT-07, YT-08, YT-09  
**Deferrable after follow-ups:** playlist refresh UX chrome, partial-unavailable video handling, attribution detail, API/ToS path, exact “offline-ready” mechanics beyond YT-06 C.

---

## YT-05 — Outcome framing (playlist-as-intensity vs alternatives)

> "Fall in love with the problem, not the solution." — Melissa Perri, *Escaping the Build Trap*

**Strategic Inquiry:** What outcome should Discovery optimize for? (The wording “playlist as a single intensity level” is one possible solution — confirm or reshape before Design.)

- [x] Option D: Depending on what is the URL for, if it's a playlist - a whole intensity level is ocupied by it, if it's a single song - it's just another soundscape track, like local files. Allow it to mix with everything else (like another URL or local tracks).

---

## YT-01 — Playlist binding model

> "The most important thing about a product is not what it does, but the outcome it enables for the customer." — Marty Cagan, *Inspired*

**Strategic Inquiry:** When the GM attaches a YouTube playlist (under Option A in YT-05, or as a bulk source under B/C), what is the lasting relationship between Arcanum and that playlist?

Both options can be true, depending on what the user want.

- [x] Option A (recommended if keeping live streaming): **Live-linked playlist** — Arcanum stores the playlist URL; the playable set is “whatever that playlist contains” after Arcanum next resolves it. Changes on YouTube affect future play once refreshed.
- [x] Option B (recommended if reshaping to track-source): **One-time snapshot** — attaching expands the playlist’s *current* videos into items.

---

## YT-02 — Mixing local tracks and a playlist on the same level

> "Strategy is about focus — choosing what not to do." — Richard Rumelt, *Good Strategy/Bad Strategy*

**Strategic Inquiry:** On a single intensity level, may imported library tracks and a YouTube playlist (or its videos) coexist? *(Skip if YT-05 Option B and snapshot import always yields ordinary tracks with no playlist object.)*

- [x] Option B: **Mixed pool** — playlist videos and imported tracks share one intensity pool;

---

## YT-03 — How the Scene picks the next item from a playlist-backed (or playlist-sourced) level

> "Outputs are not outcomes. Shipping a playlist feature is worthless if GMs still cannot run a reliable table mood." — Melissa Perri, *Escaping the Build Trap* (paraphrased principle)

**Strategic Inquiry:** When the active intensity’s pool came from a YouTube playlist and the GM uses d20, Play Scene, or natural track-end chaining, how should the next item be chosen?

- [x] Option A (recommended): **Same as today — random** from the playable items in that intensity pool. If the playable item is a playlist - play the playlist from a random track.


---

## YT-04 — v1 YouTube URL scope

> "Opportunity solution trees keep us from jumping to a solution before we understand the outcome." — Teresa Torres, *Continuous Discovery Habits*

**Strategic Inquiry:** For the first shippable slice, what YouTube inputs can the GM use?

- [x] Option B: **Playlist URLs and individual video URLs** — playlists for bulk attach/import; single videos via the same YouTube entry path.

---

## YT-06 — Live-table product promise (reliability)

> "Good strategy honestly acknowledges the challenges being faced." — Richard Rumelt, *Good Strategy/Bad Strategy*

**Strategic Inquiry:** Arcanum’s soundscapes today assume **local, owned audio** the GM can rely on at the table. What promise do we make for YouTube-backed intensity content during a live session?

- [x] Option C: **Hybrid** — compose/preview may stream; **Play Scene / live session** requires a prior “make offline-ready” (or equivalent) step, or those levels stay disabled until resolved.

---

## Round-1 decisions (locked)

| ID | Selection |
|---|---|
| **YT-05** | **D (custom)** — Playlist URL → playlist as a level pool member; single-video URL → ordinary track; mixing allowed |
| **YT-01** | **A and B** — both available depending on what the GM wants |
| **YT-02** | **B** — Mixed pool |
| **YT-03** | **A** — Random from pool; if picked item is a playlist, start from a random video in it |
| **YT-04** | **B** — Playlist URLs and individual video URLs |
| **YT-06** | **C** — Hybrid: compose/preview may stream; Play Scene needs offline-ready |

---

## Follow-ups (need checkbox answers)

### YT-07 — What “playlist occupies a level” means with mixed pools

> "Strategy is about focus — choosing what not to do." — Richard Rumelt, *Good Strategy/Bad Strategy*

**Strategic Inquiry:** YT-05 D says a playlist URL means “a whole intensity level is occupied by it,” but also “allow it to mix with everything else,” and YT-02 B allows mixed pools. Which is correct?

- [x] Option A: **Playlist is one pool member among many** — the level can hold local tracks, single YouTube videos, *and* playlist members. “Occupied” only means the playlist counts as content so the level is non-empty.

---

### YT-08 — Choosing live-link vs snapshot when attaching a playlist

> "The most important thing about a product is not what it does, but the outcome it enables for the customer." — Marty Cagan, *Inspired*

**Strategic Inquiry:** YT-01 allows both live-linked and one-time snapshot. How does the GM choose?

- [x] Option A: **Ask every time** — after a valid playlist URL, Composer offers “Keep linked to YouTube” vs “Import current videos as items.”

---

### YT-09 — After a playlist member is randomly picked, what plays next?

> "Outputs are not outcomes." — Melissa Perri, *Escaping the Build Trap* (principle)

**Strategic Inquiry:** Pool pick is random. If the picked item is a **playlist**, playback starts at a random video in that playlist (YT-03). When that video ends — or the GM hits d20 — what happens?

- [x] Option A (recommended): **Stay inside the playlist until intensity/category leaves it** — natural end → another random video **inside that playlist**; **d20** re-picks inside the same playlist. Full level-pool re-roll only on intensity change / stop / new Play Scene.