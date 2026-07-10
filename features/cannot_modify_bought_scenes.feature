@iter3 @iter11
Feature: All scenes are user-owned and fully editable

  As a GM
  I want to be able to modify any scene I have created
  So that I can always refine my audio setup as my campaign evolves.

  # Note: The concept of purchased/locked scenes is out of scope.
  # All scenes are created by the user and are fully editable.

  Scenario: Add button is always shown in a scene's soundboard
    Given I have a scene named "Epic Battle"
    When I open the One-Shots & SFX tab of "Epic Battle"
    Then I see the "Add Sound" button

  Scenario: Add button is always shown in a scene's atmospheres tab
    Given I have a scene named "Epic Battle"
    When I open the Atmospheres tab of "Epic Battle"
    Then I see the "Add New Soundscape" button

  Scenario: Removing a soundscape category from a scene is always permitted
    Given "Epic Battle" has the soundscape category "Combat Drums"
    When I remove "Combat Drums" from "Epic Battle"
    Then "Combat Drums" is no longer in the "Epic Battle" scene

  Scenario: Removing an effect from the soundboard is always permitted
    Given "Epic Battle" has the soundboard effect "Battle Horn"
    When I remove "Battle Horn" from the soundboard
    Then "Battle Horn" is no longer in the "Epic Battle" scene

  Scenario: All scenes in Ambience Presets appear the same (no purchased distinction)
    Given I have scenes "Forest Path", "Dungeon Entrance", and "Tavern"
    When I view the Ambience Presets list
    Then all scenes have the same visual appearance without any ownership badge
