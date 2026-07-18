@iter2
Feature: Edit campaign

  As a GM
  I want to edit a campaign's name, description, and cover art
  So that my campaign list and sessions hero stay accurate.

  Scenario: Edit opens from the campaign card pencil
    Given I have a campaign "Curse of Strahd"
    And I am on the Active Campaigns screen
    When I tap Edit on the "Curse of Strahd" campaign card
    Then I see the Edit Campaign dialog for "Curse of Strahd"

  Scenario: Saving campaign edits updates the campaigns list
    Given I have a campaign "Curse of Strahd" with description "Old lore"
    And I am on the Active Campaigns screen
    When I tap Edit on the "Curse of Strahd" campaign card
    And I enter the campaign name "Barovia"
    And I enter the description "A land of mist and dread"
    And I save the campaign edits
    Then I see "Barovia" in my campaigns list
    And I see the description snippet "A land of mist and dread" on the "Barovia" campaign card

  Scenario: Campaign edit requires a name
    Given I have a campaign "Curse of Strahd"
    And I am on the Active Campaigns screen
    When I tap Edit on the "Curse of Strahd" campaign card
    And I leave the campaign name empty
    And I attempt to save the campaign edits
    Then I see a validation message that a name is required
    And I still see the Edit Campaign dialog for "Curse of Strahd"

  Scenario: Cancelling campaign edit leaves the campaign unchanged
    Given I have a campaign "Curse of Strahd" with description "Original description"
    And I am on the Active Campaigns screen
    When I tap Edit on the "Curse of Strahd" campaign card
    And I enter the campaign name "Abandoned Rename"
    And I cancel campaign edit
    Then I see "Curse of Strahd" in my campaigns list
    And no campaign named "Abandoned Rename" appears in my campaigns list

  Scenario: Edit opens from the Campaign Sessions hero pencil
    Given I have a campaign "The Shattered Throne"
    When I open "The Shattered Throne"
    And I tap Edit on the Campaign Sessions hero for "The Shattered Throne"
    Then I see the Edit Campaign dialog for "The Shattered Throne"

  Scenario: Add cover art opens the Edit Campaign dialog
    Given I have a campaign "New Adventure" with no description
    When I open "New Adventure"
    And I tap "Add cover art"
    Then I see the Edit Campaign dialog for "New Adventure"

  Scenario: Add a description opens the Edit Campaign dialog
    Given I have a campaign "New Adventure" with no description
    When I open "New Adventure"
    And I tap "Add a description" on the Campaign Sessions hero
    Then I see the Edit Campaign dialog for "New Adventure"
