@iter3
Feature: Tag scene

  As a GM
  I want to add tags to my scenes
  So that I can quickly recognise scenes at a glance.

  Scenario: A new scene has no tags by default
    Given a scene named "Tavern" exists
    When I view the "Tavern" scene card
    Then no tags are shown on the "Tavern" scene card

  Scenario: The New Scene dialog does not collect tags
    When I open the New Scene dialog
    Then I do not see a tags field

  Scenario: Adding a predefined tag via Edit shows it on the scene card
    Given I am editing the "Tavern" scene
    When I add the predefined tag "Tavern"
    And I save
    Then the "Tavern" tag chip is shown on the "Tavern" scene card

  Scenario: Adding a custom tag via Edit shows it on the scene card
    Given I am editing the "Forest Clearing" scene
    When I add a custom tag "boss fight"
    And I save
    Then the "boss fight" tag chip is shown on the "Forest Clearing" scene card

  Scenario: Adding multiple tags via Edit shows all on the scene card
    Given I am editing the "City Streets" scene
    When I add the tags "City", "Combat", and "Night"
    And I save
    Then all three tag chips are shown on the "City Streets" scene card

  Scenario: Removing a tag via Edit hides it from the scene card
    Given the "Dungeon" scene has the tag "Combat"
    When I edit "Dungeon" and remove the "Combat" tag
    And I save
    Then the "Combat" tag is no longer shown on the "Dungeon" scene card
