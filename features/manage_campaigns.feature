@iter2 @core @iter11
Feature: Manage campaigns

  As a GM
  I want to create and manage my campaigns
  So that I can organise my sessions and scenes under distinct story arcs.

  Scenario: Create a new campaign
    When I tap "Scribe New Tale"
    And I enter the name "The Shattered Throne"
    And I confirm creation
    Then I see "The Shattered Throne" in my campaigns list

  Scenario: Campaign list is empty on first launch
    Given I have no campaigns
    When I open the Active Campaigns screen
    Then I see a centred empty-state illustration with a prompt
    And I see a "Scribe New Tale" card

  Scenario: Multiple campaigns appear in the list
    Given I have created campaigns named
      | The Shattered Throne |
      | Curse of Strahd      |
      | The Wild Beyond      |
    When I open the Active Campaigns screen
    Then I see all three campaigns in the list

  Scenario: Campaigns are sorted by most recently played
    Given I have campaigns "Old Campaign" and "New Campaign"
    And "New Campaign" was played more recently
    When I open the Active Campaigns screen
    Then "New Campaign" appears above "Old Campaign"

  Scenario: Active campaign is the most recently played one
    Given I have played "Curse of Strahd" most recently
    When I open the Home screen
    Then "Curse of Strahd" is shown as the active campaign

  Scenario: Resume a campaign from the campaigns list
    Given I have a campaign "The Shattered Throne" with at least one session
    When I tap "Resume" on "The Shattered Throne"
    Then I see the sessions list for "The Shattered Throne"

  Scenario: Campaign cover art can be set from an image upload
    Given I am creating a new campaign "The Wild Beyond"
    When I tap the cover art area
    And I select an image from the browser upload dialog
    Then the selected image is shown as the campaign's cover art

  Scenario: Moving a campaign to the Trash orphans its sessions
    Given I have a campaign "Curse of Strahd" with three sessions
    When I swipe right on the "Curse of Strahd" card
    Then "Curse of Strahd" is moved to the Trash
    And its three sessions are hidden from the sessions list (orphaned)
