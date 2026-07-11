@iter3 @iter11
Feature: Preview soundscape category in library

  As a GM
  I want to preview a sample from a category card
  So that I can hear the composition before opening the composer.

  Scenario: Preview a sample track from a category card
    Given "Weather" is in the soundscape categories grid
    When I preview "Weather" from its card
    Then the "Weather" card shows a playing preview state on the thumbnail
    And no mini player appears

  Scenario: Stopping preview from a playing category card
    Given the "Weather" category is previewing a sample track
    When I stop the preview on the "Weather" card
    Then the "Weather" card no longer shows a playing preview state
