@iter11
Feature: Audio engineering

  As a GM
  I want high-quality audio processing under the hood
  So that mixed playback sounds natural, varied, and never clips.

  Scenario: Repeated soundboard triggers sound varied each time
    Given "Sword Clash" is on the soundboard
    When I trigger "Sword Clash" ten times in succession
    Then each trigger sounds noticeably different from the last

  Scenario: Loud mixed playback does not clip or crackle
    Given a scene has three soundscape categories playing at full volume
    When I trigger three soundboard effects simultaneously
    Then the mixed output remains free of digital clipping at normal listening levels
    And loud moments do not crackle or distort

  # Scope: scene-switch crossfade behaviour — see play_scene.feature.

  Scenario: Switching scenes crossfades without a noticeable volume dip
    Given "Tavern" is playing at full volume
    When I switch to the "Forest" scene with playback
    Then the transition crossfades smoothly without a momentary drop in loudness

  # Scope: intensity transition behaviour — see modify_intensity_level_of_loopable_track.feature.

  Scenario: Intensity changes crossfade without a noticeable volume dip
    Given the "Weather" category is playing at intensity level I
    When I tap "Intensity Level II" on the "Weather" category
    Then the intensity transition crossfades smoothly without a momentary drop in loudness
