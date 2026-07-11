@iter3 @iter11
Feature: Import scene to session

  As a GM
  I want to link existing scenes to a session
  So that I can reuse audio setups across play nights.

  Scenario Outline: Import existing scenes into a session
    Given I have scenes <available> in Scenes
    And I have a session "Session 1" with no scenes
    When I import <selected> into "Session 1"
    Then <expected> appear in "Session 1"

    Examples:
      | available                         | selected                          | expected                          |
      | "Tavern"                          | "Tavern"                          | "Tavern"                          |
      | "Tavern", "Forest", and "Dungeon" | "Tavern", "Forest", and "Dungeon" | "Tavern", "Forest", and "Dungeon" |

  Scenario: Import Scene picker can be searched
    Given I have scenes "Tavern", "Forest", and "Dungeon" in Scenes
    And I have a session "Session 1" with no scenes
    When I open "Session 1"
    And I open the Import Scene picker
    And I search the picker for "Forest"
    Then I see "Forest" in the scene picker
    And I do not see "Tavern" in the scene picker

  Scenario: Import picker excludes scenes already linked to the session
    Given "Tavern" is linked to "Session 1"
    And I have a scene "Forest" in Scenes that is not linked to "Session 1"
    When I open the Import Scene picker for "Session 1"
    Then I do not see "Tavern" in the scene picker
    And I see "Forest" in the scene picker

  Scenario: Import picker shows a message when all global scenes are already linked
    Given all global scenes are linked to "Session 1"
    When I open the Import Scene picker for "Session 1"
    Then I see "All scenes are already in this session"
    And I see a link to create a new scene in Scenes
