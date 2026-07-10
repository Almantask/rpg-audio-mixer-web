@iter10
Feature: Master controls

  As a GM
  I want a global control over all scene audio
  So that I can quickly respond to dramatic changes in my game

  Background:
    Given I have a scene "Battle" with "Combat" and "Fire" soundscapes
    And the "Battle" scene is playing
    And I have triggered "Scream" from the soundboard

  Scenario: Global Master Stop silences all audio instantly
    When I tap the "Global Master Stop (Panic Button)"
    Then the "Combat" soundscape should fade out and stop
    And the "Fire" soundscape should fade out and stop
    And the "Scream" sound effect should stop immediately

  Scenario: Master Intensity Switcher sets all soundscape intensities
    Given "Combat" is at Intensity Level II
    And "Fire" is at Intensity Level I
    When I tap "Intensity Level III" on the "Master Intensity Switcher" control
    Then "Combat" should transition to Intensity Level III
    And "Fire" should transition to Intensity Level III

  Scenario: Master Intensity Switcher highlights the active level in gold
    When I tap "Intensity Level II" on the "Master Intensity Switcher" control
    Then "Intensity Level II" on the "Master Intensity Switcher" control should be highlighted in gold

  Scenario: Tapping a greyed-out Master Intensity level has no effect
    Given there are no tracks at Intensity Level III in any soundscape
    When I tap "Intensity Level III" on the "Master Intensity Switcher" control
    Then the "Master Intensity Switcher" level should remain at its previous value
    And the "Master Intensity Switcher" "Intensity Level III" button should be greyed out

  Scenario: Global Master Stop resets play/pause buttons
    Given the "Battle" scene is playing
    When I tap the "Global Master Stop (Panic Button)"
    Then the "Combat" play button should show ▶
    And the "Fire" play button should show ▶
