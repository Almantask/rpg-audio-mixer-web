@iter11
Feature: Mixer persistence on Active Scene

  As a GM
  I want mixer slider changes to persist automatically
  So that my scene audio settings are restored when I return without manual saving.

  Background:
    Given I have a scene "Dragon's Lair" with soundscape categories "Weather" and "Interior"
    And I am on the Active Scene screen for "Dragon's Lair"

  Scenario: Mixer changes auto-save without a Save State button
    Given I set Master Volume to 60%
    And I set the "Weather" Volume slider to 40%
    When I leave and reopen the "Dragon's Lair" scene
    Then the Master Volume slider is immediately at 60% with no animation
    And the "Weather" Volume slider is immediately at 40% with no animation
    And there is no "Save State" button on the Active Scene screen
