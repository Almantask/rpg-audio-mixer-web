@iter6
Feature: Soundscape category playing state

  As a GM
  I want to see clearly which soundscape categories are currently playing
  So that I know what background ambience is active at a glance.

  # Playing state is indicated by a coloured glow / highlight border on the category card.

  Scenario: A playing category card shows the playing state (glow border)
    When I start playback on the "Weather" category
    Then the "Weather" card shows the playing state (coloured glow border)

  Scenario: A stopped category card does not show the playing state
    Given the "Weather" category is not playing
    Then the "Weather" card does not show the glow border

  Scenario: Pausing a category removes its playing state
    Given the "Weather" category is currently playing
    When I tap pause on "Weather"
    Then the "Weather" card no longer shows the playing state

  Scenario: Multiple categories can simultaneously show the playing state
    Given "Weather" and "Interior" are both playing
    Then both the "Weather" and "Interior" cards show the playing state

  Scenario: Only the active category is highlighted when one is switched off
    Given "Weather" and "Interior" are both playing
    When I pause "Interior"
    Then only "Weather" shows the playing state
    And "Interior" does not show the playing state


