@iter7 @core
Feature: Home active campaign hero

  As a GM
  I want the Home screen to highlight my current campaign
  So that I can resume play quickly.

  Scenario: Home shows the most recently played campaign
    Given I have played "Shadows of the Underdark" most recently
    And "Shadows of the Underdark" has session data for "Session 14: The Whispering Gallery awaits your party's next move."
    When I open the Home screen
    Then I see the "Active Campaigns" section
    And I see "Shadows of the Underdark" in the Active Campaigns hero
    And I see "Session 14: The Whispering Gallery awaits your party's next move." in the Active Campaigns hero
    And I see a "Resume" button in the Active Campaigns hero

  Scenario: Hero omits session subtitle when the campaign has no sessions yet
    Given I have played "New Realm" most recently
    And "New Realm" has no sessions yet
    When I open the Home screen
    Then I see "New Realm" in the Active Campaigns hero
    And I do not see a session context line in the Active Campaigns hero

  Scenario: Resume navigates to the active campaign's sessions list
    Given "Shadows of the Underdark" is the active campaign on the Home screen
    When I tap "Resume" on the Active Campaigns hero
    Then I see the sessions list for "Shadows of the Underdark"

  @home @transitions
  Scenario: Resume expands the hero card into the sessions screen
    Given "Shadows of the Underdark" is the active campaign on the Home screen
    When I tap "Resume" on the Active Campaigns hero
    Then the Active Campaigns hero expands smoothly to fill the screen background

  Scenario: Resume Journey is not shown on Home
    Given "Shadows of the Underdark" is the active campaign on the Home screen
    When I open the Home screen
    Then I do not see a "Resume Journey" card on the Home screen

  Scenario: Home shows an empty state when no campaigns exist
    Given I have no campaigns
    When I open the Home screen
    Then the Active Campaigns hero shows "Create your first campaign"
    And I see a "Create your first campaign" button in the Active Campaigns hero
    And the Top Soundscape section is not shown
    And the Top FX section is not shown

  Scenario: Empty hero CTA navigates to the Campaign list
    Given I have no campaigns
    When I open the Home screen
    And I tap "Create your first campaign" in the Active Campaigns hero
    Then I see the Active Campaigns screen
