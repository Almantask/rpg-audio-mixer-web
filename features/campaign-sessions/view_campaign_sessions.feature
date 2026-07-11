@iter2
Feature: View campaign sessions

  As a GM
  I want to see sessions within a campaign
  So that I can pick a play night to continue.

  Scenario: Campaign Sessions screen shows campaign context
    Given I have a campaign "The Shattered Throne" with cover art
    When I open "The Shattered Throne"
    Then I see "The Shattered Throne" as the page heading
    And I see "Campaign Sessions" as the page subtitle
    And I see the campaign hero banner with cover art

  Scenario: Home sidebar stays active while viewing campaign sessions
    Given I have a campaign "The Shattered Throne"
    When I open "The Shattered Throne"
    Then the "Home" sidebar item is the active sidebar item

  Scenario: Campaign Sessions has no explicit back link
    Given I am on the Campaign Sessions screen for "The Shattered Throne"
    Then I do not see an explicit back link to Active Campaigns

  Scenario: Browser back returns to Active Campaigns
    Given I am on the Campaign Sessions screen for "The Shattered Throne" from Active Campaigns
    When I use browser back
    Then I see the Active Campaigns screen

  Scenario Outline: A campaign with no sessions shows an empty sessions list
    Given I have a campaign "<campaign>" with no sessions
    When I <entry_action>
    Then I see the sessions list for "<campaign>"
    And I see the empty-state illustration with "Add New Session" as the sole primary action

    Examples:
      | campaign             | entry_action                                                  |
      | The Shattered Throne | tap "Start" on "The Shattered Throne" from Active Campaigns |
      | Empty Campaign       | open "Empty Campaign"                                         |

  Scenario: Multiple sessions appear in the sessions list
    Given I have a campaign "Curse of Strahd" with sessions
      | number    | name             |
      | Session 1 | The Dark Arrival |
      | Session 2 | Castle Ravenloft |
      | Session 3 | The Final Battle |
    When I open "Curse of Strahd"
    Then I see these sessions in the list:
      | Session 1 | The Dark Arrival |
      | Session 2 | Castle Ravenloft |
      | Session 3 | The Final Battle |
    And I see an "Add New Session" card in the grid

  Scenario: Session cards display number, name, and date with scene count
    Given I have a campaign "Curse of Strahd" with a session
      | number     | name              | date  | scenes |
      | Session 14 | The Howling Crags | Mar 12 | 4      |
    When I open "Curse of Strahd"
    Then I see "Session 14" on the session card
    And I see "The Howling Crags" on the session card
    And I see "Mar 12 · 4 Scenes" on the session card

  Scenario: Sessions are sorted by date, most recent first
    Given I have sessions "Session 1" dated last month and "Session 2" dated today in "Curse of Strahd"
    When I view the Campaign Sessions screen for "Curse of Strahd"
    Then "Session 2" appears above "Session 1"

  Scenario: Last Active badge marks the most recently opened session
    Given I have a campaign "Curse of Strahd" with sessions "Session 1" and "Session 2"
    And I most recently opened session "Session 1"
    When I view the Campaign Sessions screen for "Curse of Strahd"
    Then the "Session 1" card shows a "Last Active" badge
    And the "Session 2" card does not show a "Last Active" badge

  Scenario: Sessions list shows loading skeletons while data loads
    Given sessions for "Curse of Strahd" are still loading
    When I open "Curse of Strahd"
    Then I see loading placeholders for session cards

  Scenario: Tapping a session card body opens its scene list
    Given I have session "Session 1" named "The Dark Arrival" in "Curse of Strahd"
    And I am on the Campaign Sessions screen for "Curse of Strahd"
    When I tap the card body for session "Session 1"
    Then I see the scene list for "Session 1"

  Scenario: Tapping Edit on a session card does not navigate to scenes
    Given I have session "Session 1" in "Curse of Strahd"
    And I am on the Campaign Sessions screen for "Curse of Strahd"
    When I tap Edit on the "Session 1" card
    Then I see the session edit dialog
    And I remain on the Campaign Sessions screen
