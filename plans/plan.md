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

## Iteration 3 — Scenes catalogue & soundscape library

GM can browse and manage scenes, link scenes to sessions, and build soundscape categories in the library.

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
| `features/session-scenes/unlink_scene_from_session.feature` | Unlink scene from session |
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

## Iteration 4 — Add soundscapes to scene

GM can open the soundscape picker on Active Scene and commit categories to a scene.

| Feature file | Feature |
|---|---|
| `features/active-scene/soundscapes/add-modal/open_soundscape_picker.feature` | Open soundscape picker on Active Scene |
| `features/active-scene/soundscapes/add-modal/close_soundscape_picker.feature` | Close soundscape picker |
| `features/active-scene/soundscapes/add-modal/filter_soundscape_picker.feature` | Filter soundscape picker |
| `features/active-scene/soundscapes/add-modal/preview_soundscape_in_picker.feature` | Preview soundscape in picker |
| `features/active-scene/soundscapes/add-modal/commit_soundscape_to_scene.feature` | Commit soundscape selection to scene |

---

## Iteration 5 — FX library & add FX to soundboard

GM can manage the FX library and add effects to a scene's soundboard via the picker modal.

| Feature file | Feature |
|---|---|
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

## Iteration 6 — Active Scene playback core

GM can play layered soundscapes and trigger soundboard FX with real-time mixing controls.

| Feature file | Feature |
|---|---|
| `features/active-scene/soundscapes/play_a_track_in_a_loop_from_category_pool.feature` | Play soundscape category |
| `features/active-scene/soundscapes/category_playing_state.feature` | Soundscape category playing state |
| `features/active-scene/soundscapes/modify_intensity_level_of_loopable_track.feature` | Intensity level of soundscape category |
| `features/active-scene/soundscapes/soundscape_volume_control.feature` | Soundscape volume control |
| `features/active-scene/soundscapes/reorder_soundscape_categories.feature` | Reorder soundscape categories |
| `features/active-scene/soundboard/play_a_sound_from_soundboard.feature` | Soundboard playback |
| `features/active-scene/soundboard/soundboard_playing_state.feature` | Soundboard playing state |
| `features/active-scene/soundboard/soundboard_volume_control.feature` | Soundboard volume control |
| `features/active-scene/soundboard/reorder_soundboard_effects.feature` | Reorder soundboard effects |
| `features/active-scene/soundboard/retrigger_soundboard_effect.feature` | Retrigger soundboard effect |
| `features/platform/play_mixed_track_loops_and_sounds.feature` | Play mixed track loops and sounds |

---

## Iteration 7 — Home dashboard & scene play

GM lands on a useful Home screen and can resume or play scenes from there.

| Feature file | Feature |
|---|---|
| `features/home/home_active_campaign.feature` | Home active campaign hero |
| `features/home/home_loading_error.feature` | Home loading and error states |
| `features/home/home_preview_behavior.feature` | Home inline preview behavior |
| `features/home/home_top_fx.feature` | Home Top FX stat |
| `features/home/home_top_soundscape.feature` | Home Top Soundscape stat |
| `features/active-scene/soundscapes/play_scene.feature` | Play scene |
| `features/active-scene/soundscapes/play_random_track.feature` | Play random track (d20) |

---

## Iteration 8 — Search, trash & credits

GM can find library content quickly, recover soft-deleted items, and read credits/attributions.

| Feature file | Feature |
|---|---|
| `features/library/search_fx_library.feature` | Search and filter FX library |
| `features/library/search_soundscape_categories.feature` | Search and filter soundscape categories |
| `features/trash/select_trash_items.feature` | Select items in Trash |
| `features/trash/restore_from_trash.feature` | Restore from Trash |
| `features/trash/purge_from_trash.feature` | Purge from Trash |
| `features/credits/view_attributions.feature` | View Attributions |
| `features/credits/credits_support_links.feature` | Credits support links |

---

## Iteration 9 — Screen transitions

GM experiences smooth animated transitions between screens and modals.

| Feature file | Feature |
|---|---|
| `features/platform/screen_transitions.feature` | Screen transitions |

---

## Iteration 10 — Session safety & advanced controls

GM gets session lock, master/system audio controls, and scene cloning for faster prep.

| Feature file | Feature |
|---|---|
| `features/platform/session_lock.feature` | Session Lock |
| `features/platform/system_audio_handling.feature` | System audio handling |
| `features/active-scene/soundscapes/master_controls.feature` | Master controls |
| `features/scenes/scene_cloning.feature` | Scene cloning |

---

## Iteration 11 — Resilience & mixer polish

GM gets persistent mixer state, scene notes, mute/volume refinements, and robust error/audio behavior.

| Feature file | Feature |
|---|---|
| `features/platform/error_handling.feature` | Error handling |
| `features/platform/audio_engineering.feature` | Audio engineering |
| `features/active-scene/soundscapes/mixer_persistence.feature` | Mixer persistence on Active Scene |
| `features/active-scene/soundscapes/scene_notes.feature` | Scene notes on Active Scene |
| `features/active-scene/soundscapes/soundscape_mute.feature` | Mute soundscape output on Active Scene |
| `features/active-scene/soundscapes/category_volume_slider.feature` | Category volume slider on Active Scene |

---

## Deferred — Out of MVP scope

| Feature file | Feature |
|---|---|
| `features/campaigns/campaign_portability.feature` | Campaign portability |
