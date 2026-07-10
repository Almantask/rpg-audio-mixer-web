@iter6
Feature: Intensity level of soundscape category

  As a GM
  I want to change the intensity level of a soundscape category
  So that the right tracks play for the mood of the scene.

  Scenario Outline: Changing intensity plays tracks from the matching pool
    Given the "<category>" category has tracks at intensity level <level>
    When I tap "Intensity Level <level>" on the "<category>" category
    Then a track from the intensity <level> pool plays
    And "Intensity Level <level>" should be highlighted in gold on the "<category>" category

    Examples:
      | category | level |
      | Weather  | I     |
      | Weather  | II    |
      | Weather  | III   |
      | Interior | I     |
      | Combat   | III   |

  Scenario: Changing intensity on a playing category transitions with a 2-second crossfade
    Given the "Weather" category is playing at intensity level I
    When I tap "Intensity Level II" on the "Weather" category
    Then the new intensity level II track begins playing immediately
    And the previous intensity level I track remains audible while fading out
    And the 2-second crossfade allows both tracks to be heard simultaneously during the transition

  Scenario: Empty intensity levels are non-interactive and do not change the active level
    Given the "Dungeon" category is currently at "Intensity Level I"
    And the "Dungeon" category has no tracks at "Intensity Level III"
    When I tap "Intensity Level III" on the "Dungeon" card
    Then the active intensity level should remain "Intensity Level I"
    And "Intensity Level III" on the "Dungeon" card should be greyed out
