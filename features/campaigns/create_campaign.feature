@iter2 @core
Feature: Create campaign

  As a GM
  I want to create new campaigns
  So that I can organise sessions and scenes under distinct story arcs.

  Scenario: Create a new campaign
    When I tap "Create Campaign"
    And I enter the campaign name "The Shattered Throne"
    And I confirm creation
    Then I see "The Shattered Throne" in my campaigns list
    And I see a "Create Campaign" card below the campaign list

  Scenario: Create a campaign with optional description
    When I tap "Create Campaign"
    And I enter the campaign name "Echoes of the Void"
    And I enter the description "Whispers from a shattered keep"
    And I confirm creation
    Then I see "Echoes of the Void" on its campaign card
    And I see the description snippet "Whispers from a shattered keep" on the card

  Scenario: Campaign creation requires a name
    When I tap "Create Campaign"
    And I leave the campaign name empty
    And I attempt to confirm creation
    Then the campaign is not created
    And I see a validation message that a name is required

  Scenario: Cancelling campaign creation leaves the list unchanged
    Given I have no campaigns
    When I tap "Create Campaign"
    And I enter the campaign name "Abandoned Tale"
    And I cancel campaign creation
    Then no campaign named "Abandoned Tale" appears in my campaigns list
    And I see the empty state headline "No campaigns yet"

  Scenario: Campaign cover art can be set from an image upload
    Given I am creating a new campaign "The Wild Beyond"
    When I tap the cover art area
    And I select an image from the browser upload dialog
    Then the selected image is shown as the campaign's cover art
