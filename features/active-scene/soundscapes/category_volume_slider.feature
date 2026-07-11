@iter11
Feature: Category volume slider on Active Scene

  As a GM
  I want each soundscape category card to show a single Volume slider
  So that I can adjust per-category output during play.

  Background:
    Given I have a scene "Dragon's Lair" with soundscape categories "Weather" and "Interior"
    And I am on the Active Scene screen for "Dragon's Lair"

  Scenario: Each category card shows a single Volume slider and the current track title
    Given the "Weather" category is playing "Thunderstorm"
    When I view the Active Scene — Soundscapes tab
    Then the "Weather" card shows the track title "Thunderstorm"
    And the "Weather" card shows one row labeled "VOLUME"
    And the "Weather" card does not show per-layer volume sliders
