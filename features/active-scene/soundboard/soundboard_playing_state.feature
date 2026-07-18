@iter6
Feature: Soundboard playing state

  As a GM
  I want soundboard effect tiles to show a clear playing state
  So that I can see which effects are currently active at a glance.

  # Scope: tile chrome (glow, play affordance) — re-trigger overlap audio lives in retrigger_soundboard_effect.feature.
  # Per-tile stop was removed; Stop All clears playing FX.

  Background:
    Given I am on the Active Scene — Soundboard tab
    And the soundboard has effect tiles available for playback

  Scenario: Tapping an idle effect tile shows a glow and playing indicator
    Given "Thunder Crack" is on the soundboard and idle with a subtle play affordance
    When I tap the "Thunder Crack" tile body
    Then the "Thunder Crack" tile shows the playing state (glow or pulse)
    And the tile no longer shows the idle play affordance

  Scenario: Stop All returns all soundboard tiles to the idle state
    Given "Thunder Crack" and "Wolf Howl" are both playing with visible glow
    When I tap "Stop All"
    Then neither tile shows the playing glow
    And both tiles show the idle play affordance
