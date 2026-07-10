@iter3 @iter11
Feature: View created scenes

  As a GM
  I want to see all my created scenes in Ambience Presets
  So that I can quickly find and open the scene I need.

  Scenario: A newly created scene appears in Ambience Presets
    When I create a new scene named "Tavern"
    Then I see the "Tavern" scene in Ambience Presets

  Scenario: All created scenes appear in Ambience Presets
    Given I have created scenes named
      | Tavern  |
      | Forest  |
      | Dungeon |
    When I view Ambience Presets
    Then I see the "Tavern" scene in Ambience Presets
    And I see the "Forest" scene in Ambience Presets
    And I see the "Dungeon" scene in Ambience Presets

  Scenario: Opening a scene shows its contents
    Given I have created a scene named "Tavern"
    When I open the "Tavern" scene
    Then I see the "Atmospheres" tab
    And I see the "One-Shots & SFX" tab
