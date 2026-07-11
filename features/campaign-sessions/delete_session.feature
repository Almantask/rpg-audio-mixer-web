@iter2
Feature: Delete session

  As a GM
  I want to delete sessions from a campaign
  So that I can remove play nights I no longer need.

  Scenario Outline: Deleting a session requires confirmation before Trash
    Given I have session "Session 1" in "Curse of Strahd"
    And I am on the Campaign Sessions screen for "Curse of Strahd"
    When I <gesture> on the "Session 1" card
    And I confirm deletion in the dialog
    Then "Session 1" is no longer in the sessions list
    And "Session 1" is available for recovery in Trash

    Examples:
      | gesture     |
      | tap Trash   |
      | swipe right |

  Scenario: Cancelling delete keeps the session in the list
    Given I have session "Session 1" in "Curse of Strahd"
    And I am on the Campaign Sessions screen for "Curse of Strahd"
    When I initiate deletion of "Session 1"
    And I cancel the confirmation dialog
    Then "Session 1" remains in the sessions list
