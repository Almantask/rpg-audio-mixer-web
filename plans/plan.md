# Arcanum Audio — Product Implementation Plan

Each iteration delivers a shippable slice of GM value. Feature files are tagged with a single primary `@iterN` tag matching the iteration below.

**Status key:** `[ ]` not started · `[~]` in progress · `[x]` complete

---

## Iteration 0 — App shell & bootstrap

GM can launch the app and navigate the primary sidebar.

| Feature file | Feature |
|---|---|
| `features/platform/can_launch.feature` | Can launch app |
| `features/platform/sidebar_navigation.feature` | Sidebar navigation |

---

## Iteration 1 — CI readiness

Acceptance-test infrastructure runs reliably in CI before feature delivery scales.

| Feature file | Feature |
|---|---|
| *(no feature file yet — infrastructure-only iteration)* | CI hardware compatibility |

---

## Iteration 2 — Campaigns & sessions

GM can create campaigns, open a campaign, and manage sessions within it.

| Feature file | Feature |
|---|---|
| `features/campaigns/create_campaign.feature` | Create campaign |
| `features/campaigns/view_campaigns_list.feature` | View campaigns list |
| `features/campaigns/open_campaign_sessions.feature` | Open campaign sessions |
| `features/campaigns/delete_campaign.feature` | Delete campaign |
| `features/campaign-sessions/create_session.feature` | Create session |
| `features/campaign-sessions/view_campaign_sessions.feature` | View campaign sessions |
| `features/campaign-sessions/edit_session.feature` | Edit session |
| `features/campaign-sessions/delete_session.feature` | Delete session |

---

## Iteration 3 — Scenes catalogue & soundboard

GM can browse and manage scenes, link scenes to sessions, manage the FX library, and add effects to a scene's soundboard.

| Feature file | Feature |
|---|---|
| `features/scenes/view_created_scenes.feature` | View created scenes |
| `features/scenes/build_your_own_scene.feature` | Build your own scene |
| `features/scenes/delete_scene.feature` | Delete scene |
| `features/scenes/add_description_to_scene.feature` | Add description to scene |
| `features/scenes/tag_scene.feature` | Tag scene |
| `features/scenes/user_owned_scenes.feature` | User-owned scenes are fully editable |
| `features/session-scenes/view_session_scenes.feature` | View session scenes |
| `features/session-scenes/open_scene_from_session.feature` | Open scene from session |
| `features/session-scenes/import_scene_to_session.feature` | Import scene to session |
| `features/session-scenes/create_scene_from_session.feature` | Create scene from session |
| `features/session-scenes/unlink_scene_from_session.feature` | Unlink scene from session |
| `features/library/browse_fx_library.feature` | Browse FX library |
| `features/library/edit_fx_in_library.feature` | Edit FX in library |
| `features/library/import_fx_library.feature` | Import FX to library |
| `features/library/preview_fx_track.feature` | Preview FX track in library |
| `features/active-scene/soundboard/add-modal/open_fx_picker.feature` | Open FX picker on Active Scene |
| `features/active-scene/soundboard/add-modal/close_fx_picker.feature` | Close FX picker |
| `features/active-scene/soundboard/add-modal/filter_fx_picker.feature` | Filter FX picker |
| `features/active-scene/soundboard/add-modal/preview_fx_in_picker.feature` | Preview FX in picker |
| `features/active-scene/soundboard/add-modal/commit_fx_to_soundboard.feature` | Commit FX selection to soundboard |

---

## Iteration 4 — Soundscape library

GM can browse and manage soundscape categories in the library and compose categories.

| Feature file | Feature |
|---|---|
| `features/library/browse_soundscape_categories.feature` | Browse soundscape categories |
| `features/library/create_soundscape_category.feature` | Create soundscape category |
| `features/library/delete_soundscape_category.feature` | Delete soundscape category |
| `features/library/preview_soundscape_category.feature` | Preview soundscape category in library |
| `features/library/composer/compose_soundscape.feature` | Compose soundscape category |
| `features/library/composer/open_track_picker.feature` | Open track picker in Category Composer |
| `features/library/composer/close_track_picker.feature` | Close track picker in Category Composer |
| `features/library/composer/filter_track_picker.feature` | Filter track picker in Category Composer |
| `features/library/composer/preview_track_in_picker.feature` | Preview track in Category Composer picker |
| `features/library/composer/commit_tracks_in_picker.feature` | Commit tracks in Category Composer picker |
| `features/library/composer/import_track_in_picker.feature` | Import track in Category Composer picker |

---

## Iteration 5 — Add soundscapes to scene

GM can open the soundscape picker on Active Scene and commit categories to a scene.

| Feature file | Feature |
|---|---|
| `features/active-scene/soundscapes/add-modal/open_soundscape_picker.feature` | Open soundscape picker on Active Scene |
| `features/active-scene/soundscapes/add-modal/close_soundscape_picker.feature` | Close soundscape picker |
| `features/active-scene/soundscapes/add-modal/filter_soundscape_picker.feature` | Filter soundscape picker |
| `features/active-scene/soundscapes/add-modal/preview_soundscape_in_picker.feature` | Preview soundscape in picker |
| `features/active-scene/soundscapes/add-modal/commit_soundscape_to_scene.feature` | Commit soundscape selection to scene |