@iter6
Feature: Reorder soundboard effects

  As a GM
  I want to reorder effect buttons in the soundboard
  So that I can organise effects for quick access during play.

  Scenario: Long-pressing an effect button activates drag mode
    Given there are at least two effect buttons in the soundboard
    When I long-press on the "Thunder Crack" button
    Then the button enters drag mode and can be repositioned

  Scenario: Dragging an effect button to a new position reorders the grid
    Given the soundboard has buttons in the order "Thunder Crack", "Wolf Howl", "Door Creak"
    When I drag "Door Creak" to the first position
    Then the order becomes "Door Creak", "Thunder Crack", "Wolf Howl"

  Scenario: Reordering persists after closing and reopening the scene
    Given "Wolf Howl" is the first button in the soundboard
    When I drag "Thunder Crack" to the first position
    And I close and reopen the scene
    Then "Thunder Crack" is still the first button

  Scenario: Reordering does not interrupt a currently playing effect
    Given "Dragon Roar" is currently playing from the soundboard
    When I reorder other effect buttons around it
    Then "Dragon Roar" continues playing uninterrupted
