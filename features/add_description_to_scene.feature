@iter3
Feature: Add description to scene

  As a GM
  I want to add a description to my scenes
  So that I can remember the purpose and context of each scene.

  Scenario: Can add a description to a scene
    Given I have created a scene named "Tavern"
    When I add the description "A lively inn with music and chatter" to the "Tavern" scene
    Then the "Tavern" scene has the description "A lively inn with music and chatter"

  Scenario: Scene description is visible when viewing scenes
    Given I have created a scene named "Tavern"
    And the "Tavern" scene has the description "A lively inn with music and chatter"
    When I view my scenes
    Then I see the description "A lively inn with music and chatter" for the "Tavern" scene

  Scenario: Can update an existing description
    Given I have created a scene named "Tavern"
    And the "Tavern" scene has the description "An old inn"
    When I update the description of the "Tavern" scene to "A lively inn with music and chatter"
    Then the "Tavern" scene has the description "A lively inn with music and chatter"

  Scenario: Scene description is optional
    Given I have created a scene named "Tavern"
    Then the "Tavern" scene has no description
