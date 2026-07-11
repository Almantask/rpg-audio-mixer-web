@iter2 @core
Feature: Open campaign sessions

  As a GM
  I want to open a campaign's sessions from its card
  So that I can continue or start a campaign.

  Scenario: A campaign with no sessions shows Start
    Given I have a campaign "New Adventure" with 0 sessions
    And I am on the Active Campaigns screen
    Then I see a "Start" button on the "New Adventure" card

  Scenario: Start opens the campaign sessions list
    Given I have a campaign "New Adventure" with 0 sessions
    And I am on the Active Campaigns screen
    When I tap "Start" on "New Adventure"
    Then I see the sessions list for "New Adventure"

  Scenario: A campaign with sessions shows Resume
    Given I have a campaign "The Shattered Throne" with at least one session
    And I am on the Active Campaigns screen
    Then I see a "Resume" button on the "The Shattered Throne" card

  Scenario: Resume opens the campaign sessions list
    Given I have a campaign "The Shattered Throne" with at least one session
    And I am on the Active Campaigns screen
    When I tap "Resume" on "The Shattered Throne"
    Then I see the sessions list for "The Shattered Throne"

  Scenario: Tapping a campaign card body does not navigate
    Given I have a campaign "The Shattered Throne" with at least one session
    When I open the Active Campaigns screen
    And I tap the campaign title "The Shattered Throne"
    Then I remain on the Active Campaigns screen
