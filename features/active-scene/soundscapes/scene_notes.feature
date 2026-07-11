@iter11
Feature: Scene notes on Active Scene

  As a GM
  I want to take markdown notes on the Active Scene screen
  So that I can capture session details while running a scene.

  Background:
    Given I have a scene "Dragon's Lair" with soundscape categories "Weather" and "Interior"
    And I am on the Active Scene screen for "Dragon's Lair"

  Scenario: Scene Notes renders markdown formatting
    When I expand the Scene Notes area
    And I enter markdown text "## Trap\nWatch the **pit** near the altar"
    Then the Scene Notes area shows a heading and bold text

  Scenario: Scene Notes auto-save immediately
    When I expand the Scene Notes area
    And I enter markdown text "Watch for traps"
    Then the scene notes are auto-saved immediately
