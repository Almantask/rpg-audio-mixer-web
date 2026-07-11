@iter6 @iter11
Feature: Reorder soundboard effects

  As a GM
  I want to reorder effect tiles in the soundboard
  So that I can organise effects for quick access during play.

  # Scope: drag-handle reorder, persistence, and hotkey label updates.

  Background:
    Given I am on the Active Scene — Soundboard tab
    And the soundboard has effect tiles available for playback

  Scenario: Dragging an effect tile by its handle reorders the grid
    Given the soundboard has tiles in the order "Thunder Crack", "Wolf Howl", "Door Creak"
    When I drag "Door Creak" by its drag handle to the first position
    Then the order becomes "Door Creak", "Thunder Crack", "Wolf Howl"

  Scenario: Reordering auto-saves on drop and persists after closing and reopening the scene
    Given "Wolf Howl" is the first tile in the soundboard
    When I drag "Thunder Crack" by its drag handle to the first position
    And I leave and reopen the scene
    Then "Thunder Crack" is still the first tile

  Scenario: Reordering does not interrupt a currently playing effect
    Given the soundboard has tiles in the order "Thunder Crack", "Wolf Howl", "Dragon Roar"
    And "Dragon Roar" is currently playing from the soundboard
    When I drag "Wolf Howl" by its drag handle to the position after "Dragon Roar"
    Then "Dragon Roar" continues playing uninterrupted
    And the soundboard order is "Thunder Crack", "Dragon Roar", "Wolf Howl"

  Scenario: Reordering updates hotkey labels to match the new grid order
    Given the soundboard has tiles in the order "Thunder Crack", "Wolf Howl", "Door Creak"
    And those tiles show hotkey labels "Num 1", "Num 2", and "Num 3"
    When I drag "Door Creak" by its drag handle to the first position
    Then "Door Creak" shows hotkey label "Num 1"
    And "Thunder Crack" shows hotkey label "Num 2"
    And "Wolf Howl" shows hotkey label "Num 3"
