@iter6
Feature: Soundboard volume control

  As a GM
  I want to control the Soundboard Master slider on the Soundboard tab
  So that I can fine-tune one-shot effect output without affecting soundscape ambience.

  Background:
    Given I am on the Active Scene — Soundboard tab
    And the soundboard has effect tiles available for playback

  Scenario: Soundboard Master slider controls all effect output
    Given Soundboard Master is at 100%
    And "Thunder Crack" is playing from the soundboard
    When I set Soundboard Master to 50%
    Then "Thunder Crack" plays at the mapped volume for 50% Soundboard Master

  Scenario: Soundboard Master volume does not affect soundscape categories
    Given Soundboard Master is at 50%
    And "Forest Loop" is playing as a soundscape at Volume 100% and Master Volume 100%
    Then "Forest Loop" plays at the mapped volume for 100% Master Volume × 100% Volume

  # Scope: soundscape Master Volume does not affect soundboard — see play_mixed_track_loops_and_sounds.feature.

  Scenario: Intensity level changes do not alter soundboard output
    Given Soundboard Master is at 80%
    And "Thunder Crack" is playing from the soundboard
    And the "Weather" category intensity is set to Level III on the Soundscapes tab
    Then "Thunder Crack" still plays at the mapped volume for 80% Soundboard Master

  Scenario: Soundboard Master changes auto-save without manual saving
    Given Soundboard Master is at 60%
    When I leave and reopen the scene on the Soundboard tab
    Then Soundboard Master is immediately at 60% with no animation

  # Scope: soundscape mixer persistence — see mixer_persistence.feature.

  # Scope: Session Lock still allows Soundboard Master adjustments — see session_lock.feature.

  Scenario: Soundboard Master remains adjustable when Session Lock is on
    Given the session is locked on the Active Scene — Soundboard tab
    And "Wolf Howl" is playing from the soundboard
    When I set Soundboard Master to 40%
    Then "Wolf Howl" plays at the mapped volume for 40% Soundboard Master
