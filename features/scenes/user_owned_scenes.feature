@iter3 @iter11
Feature: User-owned scenes are fully editable

  As a GM
  I want to be able to modify any scene I have created
  So that I can always refine my audio setup as my campaign evolves.

  # Note: The concept of purchased/locked scenes is out of scope.
  # All scenes are created by the user and are fully editable.

  Scenario: Scene list cards expose Edit, Duplicate, and Trash actions
    Given a scene named "Epic Battle" exists
    When I view Scenes
    Then the "Epic Battle" scene card shows Edit, Duplicate, and Trash actions
    And the "Epic Battle" scene card has no play button

  Scenario: All scenes in Scenes appear the same with no ownership badge
    Given the following scenes exist:
      | Forest Path      |
      | Dungeon Entrance |
      | Tavern           |
    When I view Scenes
    Then all scene cards have the same visual appearance
    And no scene card shows an ownership badge
