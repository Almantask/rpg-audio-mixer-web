Feature: Reorder soundscape categories

  As a GM
  I want to reorder soundscape categories on the Active Scene screen
  So that the most relevant categories are always at the top within easy reach.

  Scenario: Long-pressing a category card activates drag mode
    Given there are at least two soundscape categories in the active scene
    When I long-press on the "Weather" category card
    Then the card enters drag mode and can be repositioned

  Scenario: Dragging a category card to a new position reorders the list
    Given the order is "Weather", "Interior", "Monsters"
    When I drag "Monsters" above "Weather"
    Then the order becomes "Monsters", "Weather", "Interior"

  Scenario: Reordering persists after closing and reopening the scene
    Given the order is "Weather", "Interior", "Monsters"
    When I drag "Interior" to the top
    And I close and reopen the scene
    Then "Interior" is still the first category

  Scenario: Reordering one category does not affect other categories' playback state
    Given "Weather" is currently playing
    When I drag "Interior" above "Weather"
    Then "Weather" continues playing during and after the reorder
