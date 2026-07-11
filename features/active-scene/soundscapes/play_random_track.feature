@iter7
Feature: Play random track (d20)

  As a GM
  I want to tap the d20 button on a soundscape category
  So that a random track from that category's current intensity pool plays without me having to choose one.

  Background:
    Given I am on the Active Scene — Soundscapes tab

  Scenario Outline: Random track respects the selected intensity pool
    Given the "Weather" category has tracks at Intensity Level <level>: <tracks>
    And Intensity Level <level> is selected on "Weather"
    When I tap the d20 button on "Weather"
    Then one of <tracks> begins playing

    Examples:
      | level | tracks                          |
      | I     | "Light Rain", "Drizzle"         |
      | III   | "Thunderstorm", "Hurricane"     |

  Scenario: Tapping d20 replaces the currently playing track in that category
    Given "Light Rain" is playing in the "Weather" category
    When I tap the d20 button on "Weather"
    Then "Light Rain" stops
    And a new random track from "Weather" begins playing

  Scenario: d20 is disabled when the selected intensity pool is empty
    Given "Dungeon" has no tracks at Intensity Level II
    And Intensity Level II is selected on "Dungeon"
    Then the d20 button on "Dungeon" should be disabled

  Scenario: Media Session Next randomizes the focused category only
    Given "Weather" and "Combat" categories are both playing in the active scene
    And the "Weather" category is the media session focus
    When I invoke Media Session "Next Track"
    Then a new random track begins playing for "Weather" at its current intensity level
    And the track playing in "Combat" is unchanged
