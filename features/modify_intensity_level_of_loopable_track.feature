@iter6 @iter11
Feature: Intensity level of soundscape category

  As a GM
  I want to change the intensity level of a soundscape category
  So that the right tracks play for the mood of the scene.

  Scenario: Changing intensity on an idle category does not start playback
    Given the "Weather" category is not playing
    And "Weather" has tracks at intensity level II
    When I tap "Intensity Level II" on the "Weather" category
    Then no track from "Weather" begins playing
    And "Intensity Level II" should be highlighted in gold on the "Weather" category

  Scenario: Play after an intensity change picks from the new pool
    Given the "Weather" category is not playing
    And "Weather" has tracks "Drizzle" at level I and "Storm" at level II
    When I tap "Intensity Level II" on the "Weather" category
    And I tap play on the "Weather" category
    Then a track from intensity level II plays (not from level I)

  Scenario: Changing intensity on a playing category transitions with a 2-second crossfade
    Given the "Weather" category is playing at intensity level I
    When I tap "Intensity Level II" on the "Weather" category
    Then the new intensity level II track begins playing immediately
    And the previous intensity level I track remains audible while fading out
    And the 2-second crossfade allows both tracks to be heard simultaneously during the transition
    And there should be no dip in perceived volume during the crossfade

  Scenario: Empty intensity levels are non-interactive and do not change the active level
    Given the "Dungeon" category is currently at "Intensity Level I"
    And the "Dungeon" category has no tracks at "Intensity Level III"
    When I tap "Intensity Level III" on the "Dungeon" card
    Then the active intensity level should remain "Intensity Level I"
    And "Intensity Level III" on the "Dungeon" card should be greyed out
