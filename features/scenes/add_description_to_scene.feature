@iter3
Feature: Add description to scene

  As a GM
  I want to add a description to my scenes
  So that I can remember the purpose and context of each scene.

  Scenario: Can add a description when creating a scene
    When I create a new scene named "Tavern" with description "A lively inn with music and chatter" via the New Scene dialog
    Then the "Tavern" scene has the description "A lively inn with music and chatter"

  Scenario: Creating a scene without a description leaves it blank
    When I create a new scene named "Tavern" via the New Scene dialog
    Then the "Tavern" scene has no description

  Scenario: Can add a description to a scene via Edit
    Given a scene named "Tavern" exists
    When I add the description "A lively inn with music and chatter" to the "Tavern" scene via Edit
    Then the "Tavern" scene has the description "A lively inn with music and chatter"

  Scenario: Scene description is visible on the Active Scene screen
    Given a scene named "Tavern" exists
    And the "Tavern" scene has the description "A lively inn with music and chatter"
    When I open the "Tavern" scene
    Then I see the description "A lively inn with music and chatter" on the Active Scene screen

  Scenario: Scene description is not shown on Scenes list cards
    Given a scene named "Tavern" exists
    And the "Tavern" scene has the description "A lively inn with music and chatter"
    When I view Scenes
    Then the "Tavern" scene card does not show its description

  Scenario: Can update an existing description via Edit
    Given a scene named "Tavern" exists
    And the "Tavern" scene has the description "An old inn"
    When I update the description of the "Tavern" scene to "A lively inn with music and chatter"
    Then the "Tavern" scene has the description "A lively inn with music and chatter"

  Scenario: Clearing a description via Edit removes it from the Active Scene screen
    Given the "Tavern" scene has the description "An old inn"
    When I clear the description of the "Tavern" scene via Edit
    Then the "Tavern" scene has no description

  Scenario: A scene cover image appears on its list card
    Given a scene named "Tavern" with cover image "tavern.jpg" exists
    When I view Scenes
    Then the "Tavern" scene card shows its cover image
