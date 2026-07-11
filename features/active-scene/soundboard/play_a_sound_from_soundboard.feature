@iter6 @core @iter11
Feature: Soundboard playback

  As a GM
  I want each effect tile to play its sound
  So that I can quickly trigger different effects during play.

  # Scope: one-shot audio playback from idle tiles — playing chrome lives in soundboard_playing_state.feature.

  Background:
    Given I am on the Active Scene — Soundboard tab
    And the soundboard has effect tiles available for playback

  Scenario: Tapping an idle effect tile plays that sound with low latency
    Given "Whip" is on the soundboard and idle
    When I tap the "Whip" effect tile
    Then the "Whip" sound begins playing before the tile leaves the idle state

  Scenario: Tapping an effect tile plays that effect's sound
    Given "Dog Bark" is on the soundboard and idle
    When I tap the "Dog Bark" effect tile
    Then the "Dog Bark" sound plays

  Scenario: Tapping two effect tiles plays both sounds simultaneously
    Given "Whip" is on the soundboard and idle
    And "Owl Hooting" is on the soundboard and idle
    When I tap the "Whip" effect tile
    And I tap the "Owl Hooting" effect tile
    Then "Whip" and "Owl Hooting" play simultaneously
