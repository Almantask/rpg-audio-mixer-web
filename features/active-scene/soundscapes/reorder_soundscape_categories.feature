@iter6
Feature: Reorder soundscape categories

  As a GM
  I want to reorder soundscape categories on the Active Scene screen
  So that the most relevant categories are always at the top within easy reach.

  Scenario: Each category card shows a visible drag handle
    Given there are at least two soundscape categories in the active scene
    Then each category card shows a visible drag handle
    And there is no separate reorder edit mode

  Scenario: Dragging a category card by its handle reorders the list
    Given the order is "Weather", "Interior", "Monsters"
    When I drag "Monsters" by its drag handle above "Weather"
    Then the order becomes "Monsters", "Weather", "Interior"

  Scenario: Reordering auto-saves on drop and persists after closing and reopening the scene
    Given the order is "Weather", "Interior", "Monsters"
    When I drag "Interior" by its drag handle to the top
    Then "Interior" is the first category
    And the new order is saved without any save action
    When I close and reopen the scene
    Then "Interior" is still the first category

  Scenario: Reordering one category does not affect other categories' playback state
    Given "Weather" is currently playing
    When I drag "Interior" by its drag handle above "Weather"
    Then "Weather" continues playing during and after the reorder

  Scenario: Reordering is disabled while Session Lock is on
    Given the session is locked
    And the order is "Weather", "Interior"
    When I attempt to drag "Interior" by its drag handle
    Then the category order remains "Weather", "Interior"

  Scenario: A single category cannot be reordered
    Given the active scene has only the "Weather" category
    Then reordering is not available
