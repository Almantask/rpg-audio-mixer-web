@iter7
Feature: Play random track (d20)

  As a GM
  I want to tap the d20 button on a soundscape category
  So that a random track from that category's current intensity pool plays without me having to choose one.

  Scenario: Tapping d20 starts a track from the current intensity pool
    Given a category "Weather" has tracks at intensity level I: "Light Rain", "Drizzle"
    And the intensity is set to I
    When I tap the d20 button on "Weather"
    Then one of "Light Rain" or "Drizzle" begins playing

  Scenario: Tapping d20 respects the currently selected intensity level
    Given a category "Weather" has tracks at intensity level III: "Thunderstorm", "Hurricane"
    And the intensity is set to III
    When I tap the d20 button on "Weather"
    Then one of "Thunderstorm" or "Hurricane" begins playing
    And no track from intensity level I or II is selected

  Scenario: Tapping d20 replaces the currently playing track in that category
    Given "Light Rain" is playing in the "Weather" category
    When I tap the d20 button on "Weather"
    Then "Light Rain" stops
    And a new random track from "Weather" begins playing

  Scenario: Tapping d20 shows a playing state on the category card
    Given the "Weather" category is not playing
    When I tap the d20 button on "Weather"
    Then the "Weather" card shows the playing state (glow border)

  Scenario: Tapping d20 on a category with no tracks at the selected intensity shows an empty pool warning
    Given "Dungeon" has no tracks at intensity level II
    And the intensity on "Dungeon" is set to II
    When I tap the d20 button on "Dungeon"
    Then a warning message is shown indicating no tracks are available at that intensity

  Scenario: Tapping Next on external controls randomizes all playing categories
    Given "Weather" and "Combat" categories are both playing in the active scene
    When I tap the "Next" button on a Bluetooth remote
    Then a new random track begins playing for both "Weather" and "Combat"
    And the intensity levels are preserved
