@iter2
Feature: Campaign management

  As a Game Master
  I want to manage my campaigns
  So that I can organize my story arcs

  Background:
    Given the app is launched to the Campaigns screen

  Scenario: Create my first campaign
    Given I have no campaigns
    And I see a Large Material 3 icon with a prompt
    When I tap "Scribe New Tale"
    And I enter "Chronicles of Aether" as the name
    And I save the campaign
    Then I should see "Chronicles of Aether" in the campaigns list
    And the empty state should be hidden

  Scenario: Resume a campaign updates its play order
    Given I have a campaign named "Old Tale" with last played date "Yesterday"
    And I have a campaign named "New Tale" with last played date "Today"
    When I tap "RESUME" on the "Old Tale" card
    And I navigate back to the Campaigns list
    Then "Old Tale" should be at the top of the list

  Scenario: Delete a campaign via swipe (Soft-Delete)
    Given I have a campaign named "The Cursed Ring"
    When I swipe right on "The Cursed Ring"
    Then the campaign list should be empty
    And the campaign "The Cursed Ring" should be marked as "isDeleted" in the database
    And I should be able to find "The Cursed Ring" in the "Trash" screen
