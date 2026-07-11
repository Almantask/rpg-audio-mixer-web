# Audio Library — open questions

**Status:** ✅ **Resolved** — all decisions applied to [Audio Library design](../audio-library-design.md) and [FX tab design](../audio-library-fx-design.md).

← [Index](README.md) · [Platform-wide](platform-wide.md)

---

## Applied decisions (summary)

| ID | Decision |
|---|---|
| **AL-01** | Composer header delete + grid 🗑/swipe → Trash **Soundscapes** tab; 7-day soft-delete |
| **AL-02** | Full **`I: n · II: n · III: n`** on every composition card |
| **AL-03** | **Single search bar** in main content only (no sidebar search) |
| **AL-04** | Soundscape **inline card preview** only; no sticky mini player |
| **AL-05** | FX **inline edit on card** — no separate edit screen |
| **AL-06** | Base Intensity **filter** (≤ selected level); **I / II / III** only |
| **AL-07** | **Variable demo pack** with progress UI (not fixed "100 tracks") |
| **AL-08** | Scene filter **deferred P2** |
| **F-AL-01** | **Client-only** tab state — no `/library/soundscapes` ↔ `/library/fx` URLs |
| **F-AL-02** | Leaving Library **stops FX preview** and hides mini player |
| **F-AL-03** | FX soft-delete **retains audio blob** 7 days on Trash **FX** tab |
| **PW-13** | **Free Compositions** + **+ Add Soundscape** (SC); **Free Tracks** (FX) |
| **PW-14** | **Literal** filtered-empty copy |
| **PW-15** | 🗑 icon (web/tablet) + swipe (touch) delete affordance |
| **PW-20** | FX audio retained in Trash until purge |
| **PW-47** | Split tab-specific filter/search scenarios; retire unified `search_sounds` model |

**Cross-ref:** soft-deletes land on Trash **Soundscapes** / **FX** tabs ([PW-16](platform-wide.md#pw-16), [TR-10](trash.md#tr-10)).

---

## Gherkin follow-up (for feature authors)

Principal QA sign-off: **rewrite** `manage_soundscape_categories`, `manage_fx_library`, and `search_sounds` per the table below.

### Gherkin ↔ design — resolved conflicts

| Area | Decision | Gherkin action |
|---|---|---|
| Category delete | Composer header **+** grid swipe/🗑 → Trash **Soundscapes** tab (AL-01, **TR-10**) | **Extend** `manage_soundscape_categories` — add Composer delete path |
| Card metadata | **I: n · II: n · III: n** on every card (AL-02 **B**) | **Keep/align** per-intensity assertions in `manage_soundscape_categories` |
| Search UI | **Single search bar** in main content only (AL-03 **B**) | **Retire** sidebar-sync search scenarios in `search_sounds`; **add** main-bar-only filter scenarios |
| Soundscape preview | **Inline card preview** only; no sticky mini player (AL-04) | **Add** F-25; **retire** Soundscapes-tab sticky mini player if present in `screen_transitions` |
| FX edit | **Inline edit on library card** (AL-05 **B**) | **Rewrite** `manage_fx_library` edit flows — no separate edit screen/route |
| Base Intensity | **Filter** FX grid; levels **I, II, III** only (AL-06) | **Add** F-26; **retire** unified-library intensity scenarios in `search_sounds` |
| Free pack | **Variable demo pack**; no hard-coded 100 (AL-07) | **Rewrite** download scenarios in `manage_soundscape_categories`, `manage_fx_library` |
| Scene filter | **Defer P2** (AL-08) | **Retire/deprecate** `search_sounds` — *Filter sounds by scene* |
| Tab routing | **Client-only** tab state (F-AL-01 **B**) | **Do not add** URL `/library/soundscapes` ↔ `/library/fx` scenarios |
| Leave Library | **Stop FX preview**; hide mini player (F-AL-02) | **Extend** `screen_transitions` / `preview_fx_track` — preview stops on nav away |
| FX Trash retention | **Retain audio blob 7 days** on **FX** tab (F-AL-03, PW-20, **TR-10**) | **Rewrite** `manage_fx_library` — *Delete an FX track* |

### Scenarios to author

| ID | Scenario |
|---|---|
| **F-25** | Soundscapes tab: clicking category card previews inline (gold border + ● PLAYING); no sticky mini player |
| **F-26** | FX tab: Base Intensity slider filters grid (I / II / III); only tracks ≤ selected level visible |
| **F-27** | Library Soundscapes tab shows **Free Compositions** + **+ Add Soundscape** CTAs |
| **F-28** | Category delete soft-deletes to Trash **Soundscapes** tab; recoverable 7 days |
| **F-29** | FX soft-delete retains audio blob; item appears on Trash **FX** tab until purge |
| **F-AL-04** | Library uses **main content search bar only** (no sidebar search field) |
| **F-AL-05** | FX inline edit on library card updates name/tags without navigation |
| **F-AL-06** | Navigating away from Library stops FX preview and dismisses mini player |

### Scenarios to retire or rewrite

| Feature file | Retire / rewrite |
|---|---|
| `search_sounds.feature` | **Split/deprecate** unified type + scene + sidebar search (PW-47); remove scene filter (AL-08); remove sidebar-sync search (AL-03 B); move intensity filter to FX-only F-26 |
| `manage_soundscape_categories.feature` | Add Composer delete path (AL-01); keep per-intensity card counts (AL-02 B); variable free-pack copy (AL-07) |
| `manage_fx_library.feature` | Inline edit on card (AL-05 B); soft-delete retains file (F-AL-03); variable free-pack (AL-07) |
| `screen_transitions.feature` | Mini player persists on FX tab only; stops on Library exit (F-AL-02); no Soundscapes sticky player (AL-04) |
| `trash_recovery.feature` | FX restore after soft-delete requires retained blob (F-AL-03) |
