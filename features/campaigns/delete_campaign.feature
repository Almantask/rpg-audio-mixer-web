@iter2 @core
Feature: Delete campaign

  As a GM
  I want to soft-delete campaigns from the list
  So that I can recover them from Trash if needed.

  Scenario Outline: Soft-deleting a campaign moves it to Trash
    Given I have a campaign "Curse of Strahd" with three sessions
    And I am on the Active Campaigns screen
    When I <delete_action> on the "Curse of Strahd" campaign card
    Then "Curse of Strahd" is moved to the Trash Campaigns tab
    And its three sessions are hidden from the sessions list
    And no confirmation dialog is shown

    Examples:
      | delete_action          |
      | tap the delete control |
      | swipe right            |

  Scenario: Soft-deleting a campaign offers undo
    Given I have a campaign "Curse of Strahd"
    When I delete "Curse of Strahd" from the campaigns list
    Then I see an undo action to restore the campaign
