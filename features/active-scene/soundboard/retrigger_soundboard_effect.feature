@iter6
Feature: Retrigger soundboard effect

  As a GM
  I want tapping a playing effect tile body to restart it as a new instance
  So that I can layer multiple rapid-fire stabs of the same sound during combat.

  # Scope: overlap re-trigger audio — tile chrome and pause live in soundboard_playing_state.feature.
  # Per-effect concurrency cap: see play_mixed_track_loops_and_sounds.feature.

  Background:
    Given I am on the Active Scene — Soundboard tab
    And the soundboard has effect tiles available for playback

  Scenario: Tapping a playing effect tile body does not stop the current instance and responds instantly
    Given I have tapped "Thunder Crack" and it is currently playing
    When I tap the "Thunder Crack" tile body again
    Then the second "Thunder Crack" instance starts from the beginning before the tile leaves the playing state
    And the first "Thunder Crack" instance continues playing simultaneously

  Scenario: Re-triggering one effect does not affect other playing effects
    Given "Thunder Crack" and "Wolf Howl" are both playing
    When I tap the "Thunder Crack" tile body again
    Then a new "Thunder Crack" instance starts
    And "Wolf Howl" continues uninterrupted
