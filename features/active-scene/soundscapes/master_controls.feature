@iter10 @iter11
Feature: Master controls

  As a GM
  I want a global control over all scene audio
  So that I can quickly respond to dramatic changes in my game

  Background:
    Given I have a scene "Battle" with "Combat" and "Fire" soundscapes
    And the "Battle" scene is playing
    And I have triggered "Scream" from the soundboard

  # Scope: Master Volume slider positions persist across Stop All — see mixer_persistence.feature.

  Scenario: Stop All silences all audio and resets play state
    When I tap "Stop All"
    Then the "Combat" soundscape should fade out and stop
    And the "Fire" soundscape should fade out and stop
    And the "Scream" sound effect should stop immediately
    And the "Combat" category shows a paused state
    And the "Fire" category shows a paused state
    And the Master Volume slider position is unchanged
