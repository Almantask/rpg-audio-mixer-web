@iter3
Feature: View created scenes

  As a GM
  I want to see all my created scenes in Scenes
  So that I can quickly find and open the scene I need.

  Scenario: The Scenes screen shows the page header and search bar
    When I view Scenes
    Then I see the page title "Scenes"
    And I see the search field with placeholder "Search scenes by name or tag…"

  Scenario: Scenes reflects a scene created elsewhere
    Given a scene named "Tavern" exists
    When I view Scenes
    Then I see the "Tavern" scene in Scenes

  Scenario: All created scenes appear in Scenes
    Given the following scenes exist:
      | Tavern  |
      | Forest  |
      | Dungeon |
    When I view Scenes
    Then I see the "Tavern" scene in Scenes
    And I see the "Forest" scene in Scenes
    And I see the "Dungeon" scene in Scenes

  Scenario: Scene cards show soundscape and effect counts
    Given a scene named "Dragon's Lair" with 4 soundscape categories and 12 effects exists
    When I view Scenes
    Then the "Dragon's Lair" scene card shows "4 SC · 12 FX"

  Scenario: Scene list cards have no play control
    Given a scene named "Tavern" exists
    When I view Scenes
    Then the "Tavern" scene card has no play button

  Scenario: Opening a scene from Scenes navigates without starting playback
    Given a scene named "Tavern" exists
    When I open the "Tavern" scene from Scenes
    Then I see the Active Scene screen for "Tavern"
    And no audio playback has started

  Scenario: The New Scene control appears at the bottom of the list
    Given a scene named "Tavern" exists
    When I view Scenes
    Then I see the "New Scene" row below all scene cards

  Scenario: Empty Scenes shows the New Scene call to action
    Given I have no scenes
    When I view Scenes
    Then I see the empty-state illustration
    And I see the "New Scene" call to action

  Scenario: Search filters scenes by location name
    Given the following scenes exist:
      | Dragon's Lair     |
      | The Rusty Tankard |
    When I search Scenes for "Dragon"
    Then I see the "Dragon's Lair" scene in Scenes
    And I do not see "The Rusty Tankard" in Scenes

  Scenario: Search filters scenes by tag
    Given a scene named "Dragon's Lair" exists
    And the "Dragon's Lair" scene has the tag "Combat"
    And a scene named "The Rusty Tankard" exists
    And the "The Rusty Tankard" scene has the tag "Tavern"
    When I search Scenes for "Combat"
    Then I see the "Dragon's Lair" scene in Scenes
    And I do not see "The Rusty Tankard" in Scenes

  Scenario: Search with no matches shows an inline message
    Given a scene named "Tavern" exists
    When I search Scenes for "Nonexistent"
    Then I see "No scenes match"
    And I still see the "New Scene" row
