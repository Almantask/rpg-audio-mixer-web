@iter6 @iter11
Feature: Soundboard playing state

  As a GM
  I want soundboard effect tiles to show a clear playing state
  So that I can see which effects are currently active at a glance.

  Scenario: Tapping an idle effect tile shows a glow and pause icon
    Given "Thunder Crack" is on the soundboard and idle
    When I tap the "Thunder Crack" tile
    Then the "Thunder Crack" tile glows or pulses
    And the tile shows a pause icon instead of play

  Scenario: Tapping pause on a playing tile stops the effect and reverts to idle
    Given "Thunder Crack" is playing with a visible glow
    When I tap the pause icon on the "Thunder Crack" tile
    Then the "Thunder Crack" tile no longer glows
    And the tile shows the idle play state

  Scenario: Re-triggering a playing tile keeps the glow while overlapping instances play
    Given "Thunder Crack" is playing with a visible glow
    When I tap the "Thunder Crack" tile again
    Then the tile remains in the playing glow state
    And a second instance of "Thunder Crack" plays simultaneously
