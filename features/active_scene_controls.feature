@iter11
Feature: Active scene controls

  As a GM
  I want additional controls on the Active Scene screen
  So that I can take notes, start all atmospheres at once, mute output, and save my mixer state during play.

  Background:
    Given I have a scene "Dragon's Lair" with soundscape categories "Weather" and "Interior"
    And I am on the Active Scene screen for "Dragon's Lair"

  Scenario: Scene Notes accepts markdown-formatted DM cues
    When I expand the Scene Notes area
    And I enter markdown text "## Trap\nWatch the **pit** near the altar"
    And I save the scene
    Then the Scene Notes area displays formatted markdown with a heading and bold text

  Scenario: Play Scene starts all configured atmospheres
    Given "Weather" and "Interior" are configured but not playing
    When I tap "Play Scene"
    Then both "Weather" and "Interior" begin playing
    And both category cards show the playing state

  Scenario: Mute silences all atmosphere output without changing slider positions
    Given "Weather" is playing with Master Atmosphere at 85%
    When I tap the mute button on the Master Atmosphere bar
    Then all atmosphere audio is silenced
    And the Master Atmosphere slider still reads 85%

  Scenario: Unmuting restores atmosphere output at the saved slider level
    Given atmosphere output is muted with Master Atmosphere at 85%
    When I tap the mute button again
    Then atmosphere audio resumes at the mapped volume for 85%

  Scenario: Save State persists the current mixer configuration
    Given I set Master Atmosphere to 60%
    And I set the "Weather" MIX slider to 40%
    When I tap "Save State"
    And I leave and reopen the "Dragon's Lair" scene
    Then the Master Atmosphere slider is immediately at 60%
    And the "Weather" MIX slider is immediately at 40%

  Scenario: Per-layer sliders adjust individual tracks within a category
    Given the "Weather" category has active layers "Gale Force Winds" and "Heavy Rain"
    When I set the "Gale Force Winds" layer slider to 90%
    And I set the "Heavy Rain" layer slider to 65%
    Then "Gale Force Winds" plays louder than "Heavy Rain" relative to their layer sliders

  Scenario: Loop toggle disables looping for a category
    Given the "Weather" category is looping
    When I toggle the loop control off for "Weather"
    Then the current track plays to completion and does not restart
