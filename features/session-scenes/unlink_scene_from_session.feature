@iter3 @iter11
Feature: Unlink scene from session

  As a GM
  I want to remove a scene from a session without deleting it
  So that the global scene remains available elsewhere.

  Scenario Outline: Unlinking a scene from a session requires confirmation
    Given "Tavern" is linked to "Session 1"
    When I <gesture>
    And I confirm the unlink
    Then "Tavern" is no longer shown in "Session 1"
    And "Tavern" still appears in Scenes
    And "Tavern" does not appear in Trash

    Examples:
      | gesture                                         |
      | choose to unlink "Tavern" from the session      |
      | swipe right on the "Tavern" card to unlink it   |

  Scenario: Cancelling unlink leaves the scene linked
    Given "Tavern" is linked to "Session 1"
    When I choose to unlink "Tavern" from the session
    And I cancel the unlink confirmation
    Then "Tavern" is still shown in "Session 1"

  Scenario: Duplicating a scene from Session Scenes does not link the copy to the session
    Given "Tavern" is linked to "Session 1"
    And I am viewing Session Scenes for "Session 1"
    When I duplicate "Tavern" from the session scene list
    Then "Copy of Tavern" is not linked to "Session 1"

  Scenario: Editing a linked scene from the session list updates it globally
    Given "Tavern" is linked to "Session 1"
    And I am viewing Session Scenes for "Session 1"
    When I edit "Tavern" from the session scene list
    And I change its name to "Busy Tavern"
    Then I see "Busy Tavern" in "Session 1"
    And I see "Busy Tavern" in Scenes
