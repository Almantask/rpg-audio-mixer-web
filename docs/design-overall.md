# Arcanum Audio — Design Specification

> Derived from design review sessions. All decisions below are confirmed and ready for implementation.

---

## 1. Branding & Theme

- App name: **Arcanum Audio**
- Theme: dark only
- Colour palette: black backgrounds, gold/amber typography and accents, purple/pink/gold gradient sliders

---

## 2. Navigation

### Bottom Navigation Bar

| Tab | Icon | Label |
|---|---|---|
| 1 | 🏰 Castle | HOME |
| 2 | 📖 Storybook | CAMPAIGNS |
| 3 | 🖼 Picture frame | SCENES |
| 4 | 🎵 Music note | LIBRARY |

### Screen Hierarchy

```
Home
└── Campaigns (tab)
    └── Campaign → Sessions list
        └── Session → Session Scenes list
                       └── Active Scene (Soundscapes + Soundboard tabs)

Scenes (tab) — global flat list of all scenes
Library (tab)
    ├── Soundscapes tab → Soundscape Categories list
    │   └── Soundscape Category Composer
    └── Sound Effects tab → FX Library
```

### Back Navigation

The back arrow always navigates to the previous screen — no contextual parent jumps.

### Gear Icon (⚙️)

The ⚙️ gear icon present on every screen navigates to the **Credits** screen. No separate Settings screen.

---

## 3. Data Model

### Hierarchy

- **Campaign** — the full story arc. If a Campaign is deleted, its Sessions are **orphaned** (hidden) and move to the Trash along with the Campaign. Restoring the Campaign restores all its Sessions.
- **Session** — an individual play night within a campaign.
- **Scene** — a reusable location/moment. Scenes are **global** (not scoped to a session). The same scene can be added to multiple sessions; editing it updates it everywhere.

### Audio Concepts

| Term | Definition |
|---|---|
| **Track** | A single playable audio file. |
| **Soundscape** | A named composition of multiple tracks. Played via **ExoPlayer** for high-quality looping. |
| **Category** | A named group (e.g. Weather) that holds one active Soundscape at a time. |
| **FX / Sound Effect** | A one-shot audio file played from the Soundboard. Played via **SoundPool** for near-zero latency. |
| **Auto-Ducking** | When an FX is triggered, the Master Atmosphere volume automatically "ducks" (lowers) and then smoothly restores once the FX ends. |
| **Global Limiter** | A look-ahead brick-wall limiter on the final output mix to prevent digital clipping when multiple tracks peak. |
| **Organic FX Randomization** | Subtle randomization of pitch (±10%) and volume (±5%) for every FX trigger to avoid repetition fatigue. |
| **Equal-Power Crossfading** | All transitions use $sin/cos$ crossfade curves (instead of linear) to maintain constant perceived loudness. |

### File Ownership & Persistence

To prevent "File Not Found" errors and ensure a stable user experience:
- **Internal Storage Copy**: Once a user selects a file for import (Soundscapes or FX), the app MUST create a copy of that file in its private internal storage.
- **App Ownership**: From the moment of import, the app "owns" its local copy. Deleting or moving the original source file on the device's external storage must NOT affect the app's ability to play the imported track.
- **Cleanup**: When a track or category is deleted within the app, its associated file in internal storage must be purged to reclaim space.

### Soundscape Categories

Entirely user-defined — created, named, and managed through the Soundscape Category Composer. The examples in the designs (Weather, Interior, Monsters, Arcane) are illustrative only.

### Intensity Levels (I / II / III)

Represent dramatic stakes: Level I = calm, Level III = tense/climactic. The DM switches between levels manually — no automatic triggering.

**Greyed-out levels:** If an intensity level has no tracks assigned to it, it is **greyed out (dimmed and non-interactive)** in the Active Scene. The DM can only select levels that contain at least one track.

**Seamless Intensity Transitions:** Switching between intensity levels (or triggering a new random track) requires a **Double-Buffer Player** setup to ensure a smooth **2-second crossfade** between the outgoing and incoming audio.

---

## 4. Screen-by-Screen Specification

### 4.1 Home

- **Active Campaign hero card:** always the most recently played campaign (automatic, no manual control). Tapping **ENTER DOMAIN** navigates to that campaign's Sessions list.
- **Resume Journey card:** shows the last scene opened in the active campaign. Tapping **ENTER** starts that scene fresh with a ~2–3 s fade-in. Remove the "Progress: 65%" element — design mistake.
- **Top Atmosphere:** global all-time most-played loopable track.
- **Legendary Action:** global all-time most-played FX.

### 4.2 Campaigns

- List sorted by most recently played, most recent at top.
- **RESUME** button on any campaign card navigates to that campaign's Sessions list (same behaviour as ENTER DOMAIN).
- **Empty state:** illustration + "Scribe New Tale" prompt button.
- Cover art: user picks an image from the device's photo library.
- **Data Portability**: Campaigns can be exported to a single `.arcanum` file (a ZIP archive containing the database entry and all associated local audio files). This file can be imported to restore the full campaign on another device.
- Remove the CURRENT badge inconsistency — active campaign is always the most recently played one.

### 4.3 Sessions (within a Campaign)

- Sorted by date, most recent at top.
- Remove the **FILTER** button — no explicit filtering needed.
- Cover art: user picks from device photo library.
- **ADD NEW SESSION** button at bottom.

### 4.4 Scenes (Global — SCENES Tab)

- Flat list of all scenes ever created, regardless of campaign/session.
- **Tapping a scene card** → opens the Active Scene screen (no playback starts).
- **Tapping ▶ on a scene card** → opens the Active Scene screen AND starts playback (fresh start, ~2–3 s fade-in).
- Scene **tags:** user picks from a fixed list + can add custom tags.
- **Scene Cloning**: Ability to clone any scene from the list, creating a duplicate with the same configuration.
- **Add New Scene** button at bottom.

### 4.5 Session Scenes (within a Session)

- Same card behaviour as global Scenes list (card = open only, ▶ = open + play).
- **Scene Cloning**: Users can clone any scene within the session list.
- **Import Scene** button at bottom to add existing global scenes to the session.

### 4.6 Active Scene — Common Controls

These controls are persistent across both the Soundscapes and Soundboard tabs.

- **Global Master Stop (Panic Button)**: A prominent button in the top bar that immediately fades out all soundscapes and stops all sound effects.
- **Master Intensity Switcher (I, II, III)**: A global selector that updates the intensity level for *all* soundscape categories in the scene simultaneously.
- **Session Lock Mode**: A toggle that disables destructive gestures (reordering, deleting) and scene switching to prevent accidents during live play.
- **Session Scene Notes**: A markdown-capable text area for storing DM cues, descriptions, and reminders specific to the scene.

### 4.7 Active Scene — Soundscapes Tab

- **Master Atmosphere slider:** controls overall output. Final volume per category = Master × MIX (multiplicative).
- **Per-category MIX slider:** controls relative balance of that category.
- **Sliders on scene load:** snap instantly to saved values (no animation).
- **d20 die button**: picks a random track from that category and starts playing it.
- **Play/pause button:** plays or pauses the current track in the category. If no track is loaded, pressing play picks a **random** track from the current intensity pool.
- **Track selection is always random** within the current intensity pool.
- **Playing state:** coloured glow / highlight border around the card.
- **Category cards:** drag to reorder.
- **ADD NEW SOUNDSCAPE:** opens a simplified Soundscape Categories selection view (not the full Library) with a back button and multi-selection — user picks one or more categories to add to the scene. **Categories with zero tracks are excluded from this list.**

### 4.8 Active Scene — Soundboard Tab

- **Master slider:** single volume control for all effects (no per-effect volume).
- **Effect buttons:** 4-column grid; drag to reorder; no grouping.
- **Tapping an effect while playing**: re-triggers — a new instance starts from the beginning, overlapping. Response MUST be **near-zero latency** (SoundPool).
- **ADD NEW EFFECT:** opens a simplified FX selection view with a back button and multi-selection.
- **Playing state:** button glows/pulses and switches to ⏸; tapping ⏸ stops and reverts to ▶.

### 4.9 Switching Scenes

Back to Scenes list → select new scene → old scene crossfades out while new scene fades in simultaneously over **~2–3 seconds**.

### 4.10 Audio Library — Soundscapes Tab

- Lists all user-created Soundscape Categories with track counts per intensity level.
- Remove **"The Archivist's Choice"** section — design mistake.
- **✏️ edit icon** on a category → opens the Soundscape Category Composer for that category.

### 4.11 Soundscape Category Composer

- Shows current soundscapes with intensity level and individual MIX sliders.
- **INVOKE NEW SOUNDSCAPE:** opens the device's native file picker to select a local audio file.
- No limit on number of soundscapes.
- **SAVE COMPOSITION:** saves globally to the category — updates everywhere that category is used (no per-scene versioning).

### 4.12 Audio Library — Sound Effects Tab

- Remove **BUY MORE** button (out of scope).
- Remove **heart / favourite** icon — design mistake.
- Replace **⋮ three-dot menu** with a **✏️ pencil icon** → opens a track edit screen with: Name, Tags, Delete.
- **IMPORT FX** button: opens device's native file picker; imported track is added to the global FX library.
- **Mini player** (bottom bar): visible on Library screen only; navigating away stops playback and hides it.

### 4.13 Credits ("Behind the Screen")

- Reached via the ⚙️ gear icon from any screen.
- Contains: developer credits, app version, support link, docs link, Discord link, email link.

---

## 5. Design Corrections (Remove from Designs)

| Element | Location | Action |
|---|---|---|
| Progress: 65% bar | Home — Resume Journey card | Remove |
| The Archivist's Choice | Audio Library — Soundscapes | Remove |
| Heart / favourite icon | Audio Library — FX track rows | Remove |
| ⋮ three-dot menu | Audio Library — FX track rows | Replace with ✏️ |
| ↺ refresh icon | Active Scene — Soundscape category cards | Replace with d20 icon |
| FILTER button | Sessions screen | Remove |
| BUY MORE / BUY SOUNDS buttons | FX Library, various | Remove (out of scope) |
| CURRENT badge | Campaigns screen | Remove |

---

## 6. Animation

### Screen Transitions — "Arcanum Motion System"

Utilizes a tiered spatial system using modern Compose concepts. Top Bar and Bottom Navigation remain fixed across transitions.

| Navigation Type | Pattern | Behaviour |
|---|---|---|
| **Hierarchical** (Card → Details) | Container Transform | Tapped card expands and morphs into the background/header of the incoming screen. |
| **Lateral** (Tab Switching) | Shared X-Axis | Outgoing screen fades and slides slightly left/right. Incoming fades and slides in. |
| **Drill-Down** (Sub-menus, `+`) | Shared Z-Axis | Outgoing fades out + scales up (100%→102%). Incoming fades in + scales up (98%→100%). Reverses on back. |
| **Overlays** (Mini-player) | Shared Y-Axis | Slides up smoothly from the bottom, anchoring to the nav bar. |

### Component Animations

| Component | Behaviour |
|---|---|
| Sliders (programmatic change) | Instant snap — no animation |
| ▶ Play button (playing state) | Glow/pulse + switches to ⏸ |
| Soundscape category card (playing) | Coloured glow / highlight border |
| Mini player entrance / exit | Shared Y-Axis: Slides up from bottom edge / slides down to dismiss |
| Loading state | Centred spinner |

---

## 7. Monetisation

Out of scope for this version. Remove all purchase-related UI.

---

## 8. Empty States

Empty states utilize **Large, stylized Material 3 icons** (e.g., `AutoStories` for Campaigns, `Style` for Scenes) in a muted gold color, accompanied by a prompt button.

---

## 9. Error Handling & System Audio

### 9.1 Error Handling

For the current version, all errors are displayed using a **scrollable message box** overlay on the mobile UI.

| Attribute | Detail |
|---|---|
| Format | Modal overlay with semi-transparent backdrop |
| Content | Scrollable error message text (can be multi-line for stack traces or detailed info) |
| Controls | Dismiss button ("OK" or "Close") |
| Scope | Non-destructive — dismissing the error does not affect ongoing playback or navigation state |
| Trigger | Any runtime error: audio file not found, playback failure, import failure, save failure, etc. |

### 9.2 Smart Auto-Resume (Audio Focus)

- **Phone Calls / External Audio**: The app will **Pause** playback during the interruption.
- **Smart Auto-Resume Rule**: Playback resumes **automatically** only if the interruption lasts **less than 3 minutes**. If focus is lost for longer, the app remains paused and requires a manual Play tap.

### 9.3 MediaSession & External Controls

- **Next Track Command**: Tapping "Next" on the lock screen, notification, or Bluetooth remote MUST trigger the **d20 randomization logic** for the currently prominent category in the active scene.
- **Natural Volume Progression**: All volume sliders (Master and MIX) MUST use a **Cubic ($x^3$) mapping** to ensure a natural hearing progression across the full range of the slider.

---

## 10. Track Selection

Within any Soundscape Category, tracks are selected **at random** from the current intensity pool.

| Control | Behaviour |
|---|---|
| 🎲 d20 button | Always picks a fresh random track from the current intensity pool, even if a track is already playing |
| ▶ Play button | If a paused track exists, resumes it. Otherwise, picks a new random track from the pool |
- **Intensity switch**: Does not auto-play; next ▶ or 🎲 tap picks from the new pool. If a track is already playing, switching intensity triggers a **2-second crossfade** (via Double-Buffer Player) to a new track from the new intensity pool.

---

## 11. Technical Strategy & Platform Requirements

### 11.1 Permission Strategy (Android 13+)
To support importing and playing audio files while respecting modern Android security:
- **Scoped Storage**: The app must use the System File Picker (Storage Access Framework) to access user files. This grants necessary read access without requiring `READ_EXTERNAL_STORAGE` or `READ_MEDIA_AUDIO`.
- **Notification Permissions**: For Android 13 (API 33) and above, the app must request `POST_NOTIFICATIONS` to display the media playback foreground service notification.
- **Graceful Degradation**: If `POST_NOTIFICATIONS` is denied, the app should still function, but standard background playback controls might not be visible in the system shade.

### 11.2 CI & Hardware Compatibility (Real Stack Audio)
To ensure reliable automated testing and Continuous Integration:
- **Real Audio Engine**: The app must be tested using the real Media3/ExoPlayer and SoundPool engines. No "Mock" or "Fake" audio players are permitted in acceptance tests.
- **CI Validation**: Automated tests on headless Linux runners must use a **PulseAudio dummy sink** to provide virtual audio hardware. Tests will use `IdlingResource` and `AudioManager` to verify actual PCM data processing.

---

## 12. Release Readiness (Production Hardening)

### 12.1 Code Optimization
- **R8/Minification Compliance**: The app must be fully compatible with R8 minification and obfuscation. All data models and external libraries must have appropriate ProGuard rules to prevent runtime crashes (e.g., during JSON serialization or reflection).

### 12.2 Security & Signing
- **Secure Signing**: Production builds must be signed using a secure, protected keystore.
- **Integrity**: The release process must ensure that only authorized, signed APKs/Bundles are distributed to end users.

