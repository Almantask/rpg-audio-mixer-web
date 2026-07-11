@iter6 @iter11
Feature: Play soundscape category

  As a GM
  I want to play, pause, and auto-chain tracks from a category pool
  So that I can have background ambience without manually picking each track.

  Scenario Outline: Category play resumes or starts without re-rolling
    Given the "Weather" category <initial state>
    When I tap play on the "Weather" category
    Then <expected outcome>

    Examples:
      | initial state                                | expected outcome             |
      | has a loaded track "Light Rain"              | "Light Rain" begins playing  |
      | was playing "Light Rain" and is now paused   | "Light Rain" resumes playing |

  Scenario: Play is disabled when no track is loaded in the category
    Given the "Weather" category has tracks but none is currently loaded or paused
    When I view the "Weather" category controls
    Then the play button on "Weather" should be disabled
    And the d20 button on "Weather" should be enabled

  Scenario: A finished track auto-chains a new random track at the same intensity
    Given the "Weather" category is playing "Light Rain" at Intensity Level I
    And "Weather" has multiple tracks at Intensity Level I
    When the "Light Rain" track finishes playing
    Then a new random track from Intensity Level I in "Weather" begins playing automatically

  Scenario: Pausing a category stops playback and allows another category to play
    Given the "Weather" category is currently playing
    When I tap pause on the "Weather" category
    Then playback stops in the "Weather" category
    And another idle category can begin playing

  Scenario: Two categories can play simultaneously
    Given a scene has categories "Weather" and "Interior"
    When I tap play on "Weather"
    And I tap play on "Interior"
    Then "Weather" and "Interior" are both playing at the same time
