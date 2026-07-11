@iter8 @iter11
Feature: Soft deletion

  As a GM
  I want deleted items moved to Trash instead of being destroyed immediately
  So that I have a safety net before permanent removal.

  Scenario Outline: Soft-deleting a primary item moves it to Trash
    Given I have a <entity_type> "<name>"
    When I <delete_action>
    Then "<name>" is moved to the Trash <tab> tab
    And "<name>" is temporarily unavailable in the main app lists
    And <confirmation_expectation>

    Examples:
      | entity_type         | name              | delete_action                  | tab         | confirmation_expectation                    |
      | campaign            | Curse of Strahd   | delete the campaign            | Campaigns   | no delete confirmation dialog is shown      |
      | session             | Session 12        | tap delete on the session card | Sessions    | a confirmation dialog is shown before Trash |
      | unlinked scene      | Old Scene         | tap trash on the scene card    | Scenes      | no delete confirmation dialog is shown      |
      | soundscape category | Winter's Breath   | delete the soundscape category | Soundscapes | no delete confirmation dialog is shown      |
      | FX track            | Dragon Roar       | delete the FX track            | FX          | no delete confirmation dialog is shown      |

  Scenario: Unlinking a scene from a session does not create a Trash entry
    Given "Whispering Depths" is linked to a session
    When I unlink "Whispering Depths" from the session
    Then "Whispering Depths" is not in Trash
    And "Whispering Depths" remains in the Scenes list

  Scenario: Deleting a campaign moves it to the Campaigns tab
    Given I have a campaign "Curse of Strahd" with three sessions
    When I delete "Curse of Strahd"
    And I navigate to the Trash screen
    And I open the "Campaigns" tab on the Trash screen
    Then I see "Curse of Strahd" in the grid

  Scenario: Deleting a campaign orphans sessions without listing them on the Sessions tab
    Given I have a campaign "Curse of Strahd" with three sessions in Trash's Campaigns tab
    When I open the "Sessions" tab on the Trash screen
    Then I do not see those orphaned sessions

  Scenario: A deleted session appears on the Sessions tab with expiry metadata
    Given I have a session "Session 12" in campaign "Curse of Strahd"
    When I tap the delete control on the "Session 12" card
    And I confirm moving the session to Trash
    And I navigate to the Trash screen
    And I open the "Sessions" tab on the Trash screen
    Then I see "Session 12" in the grid
    And the card shows how many days remain before permanent deletion

  Scenario: A session deleted after its campaign remains on the Sessions tab when the campaign is restored
    Given campaign "Curse of Strahd" is in Trash with orphaned sessions
    And I have independently deleted "Session 12" to the Sessions tab
    When I restore "Curse of Strahd" from the Campaigns tab
    Then "Session 12" remains on the Sessions tab
    And the restored campaign's other sessions reappear in the active UI

  Scenario: Items are permanently removed after 7 days in Trash
    Given "Winter's Breath" was moved to Trash 7 days ago
    When I open the Trash screen
    And I open the "Soundscapes" tab on the Trash screen
    Then I do not see "Winter's Breath"
    And "Winter's Breath" cannot be restored from Trash
