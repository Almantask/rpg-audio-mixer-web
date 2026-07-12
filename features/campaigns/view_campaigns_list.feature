@iter2 @core
Feature: View campaigns list

  As a GM
  I want to browse my campaigns on the Active Campaigns screen
  So that I can see session counts and pick where to continue.

  # Active campaign hero behaviour: see home_active_campaign.feature

  Scenario: First launch shows an empty campaigns screen
    Given I have no campaigns
    When I open the Active Campaigns screen
    Then I see the page title "Active Campaigns"
    And I see the subtitle "Manage your campaigns."
    And I see the empty state headline "No campaigns yet"
    And I see a "Create Campaign" card

  Scenario: Multiple campaigns appear in the list
    Given I have created campaigns named
      | The Shattered Throne |
      | Curse of Strahd      |
      | The Wild Beyond      |
    When I open the Active Campaigns screen
    Then I see all three campaigns in the list
    And I see a "Create Campaign" card below the campaign list

  Scenario: Campaign card hides description when empty
    Given I have a campaign "New Adventure" with no description
    When I open the Active Campaigns screen
    Then I see "New Adventure" on its campaign card
    And I do not see a description on the "New Adventure" campaign card

  Scenario: Session count uses singular and plural labels
    Given I have a campaign "New Adventure" with 0 sessions
    And I have a campaign "One Shot" with 1 sessions
    And I have a campaign "Epic Saga" with 14 sessions
    When I open the Active Campaigns screen
    Then I see "0 sessions" on the "New Adventure" campaign card
    And I see "1 session" on the "One Shot" campaign card
    And I see "14 sessions" on the "Epic Saga" campaign card

  Scenario: Campaigns are sorted by most recently played
    Given I have campaigns "Old Campaign" and "New Campaign"
    And "New Campaign" was played more recently
    When I open the Active Campaigns screen
    Then "New Campaign" appears above "Old Campaign"

  Scenario: Resuming a campaign updates its play order
    Given I have a campaign "Old Tale" with last played date "Yesterday"
    And I have a campaign "New Tale" with last played date "Today"
    When I tap "Resume" on the "Old Tale" campaign card
    And I open the Active Campaigns screen
    Then "Old Tale" appears above "New Tale"

  Scenario: Active Campaigns shows skeletons while loading
    Given campaign list data is still loading
    When I open the Active Campaigns screen
    Then I see skeleton placeholders until campaigns load

  Scenario: Active Campaigns shows an error with retry when load fails
    Given the campaign list fails to load
    When I open the Active Campaigns screen
    Then I see an error message with a retry action
