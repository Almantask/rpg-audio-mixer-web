@iter3
Feature: Tag scene

  As a GM
  I want to add tags to my scenes
  So that I can quickly recognise and filter between scenes at a glance.

  Scenario: A new scene has no tags by default
    Given I have created a new scene "Tavern"
    When I view the "Tavern" scene card
    Then no tags are shown on the card

  Scenario: Can add a tag from the predefined list
    Given I am editing the "Tavern" scene
    When I add the predefined tag "Tavern"
    And I save
    Then the "Tavern" tag chip is shown on the "Tavern" scene card

  Scenario: Can add a custom tag
    Given I am editing the "Forest Clearing" scene
    When I add a custom tag "boss fight"
    And I save
    Then the "boss fight" tag chip is shown on the "Forest Clearing" scene card

  Scenario: Can add multiple tags
    Given I am editing the "City Streets" scene
    When I add the tags "City", "Combat", and "Night"
    And I save
    Then all three tag chips are shown on the "City Streets" scene card

  Scenario: Can remove a tag from a scene
    Given the "Dungeon" scene has the tag "Combat"
    When I edit "Dungeon" and remove the "Combat" tag
    And I save
    Then the "Combat" tag is no longer shown on the "Dungeon" scene card
