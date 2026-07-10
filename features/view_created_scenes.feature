@iter3
Feature: View created scenes

  As a GM
  I want to see all my created scenes
  So that I can quickly find and open the scene I need.

  Scenario: A newly created scene appears in the scenes list
    When I create a new scene named "Tavern"
    Then I see the "Tavern" scene in my scenes list

  Scenario: All created scenes appear in the scenes list
    Given I have created scenes named
      | Tavern  |
      | Forest  |
      | Dungeon |
    When I view my scenes
    Then I see the "Tavern" scene in my scenes list
    And I see the "Forest" scene in my scenes list
    And I see the "Dungeon" scene in my scenes list

  Scenario: Opening a scene shows its contents
    Given I have created a scene named "Tavern"
    When I open the "Tavern" scene
    Then I see the "Soundscapes" tab
    And I see the "Soundboard" tab
