@iter6
Feature: Soundboard playing state

  As a GM
  I want soundboard effect tiles to show a clear playing state
  So that I can see which effects are currently active at a glance.

  # Scope: tile chrome (glow, pause/play affordance) — re-trigger overlap audio lives in retrigger_soundboard_effect.feature.

  Background:
    Given I am on the Active Scene — Soundboard tab
    And the soundboard has effect tiles available for playback

  Scenario: Tapping an idle effect tile shows a glow and pause icon
    Given "Thunder Crack" is on the soundboard and idle with a subtle play affordance
    When I tap the "Thunder Crack" tile body
    Then the "Thunder Crack" tile shows the playing state (glow or pulse)
    And the tile shows a pause icon instead of the idle play affordance

  Scenario: Tapping pause on a playing tile stops all instances and reverts to idle
    Given "Thunder Crack" is playing with a visible glow
    When I tap the pause icon on the "Thunder Crack" tile
    Then all "Thunder Crack" instances stop
    And the "Thunder Crack" tile no longer glows
    And the tile shows the idle play affordance

  Scenario: Stop All returns all soundboard tiles to the idle state
    Given "Thunder Crack" and "Wolf Howl" are both playing with visible glow
    When I tap "Stop All"
    Then neither tile shows the playing glow
    And both tiles show the idle play affordance
