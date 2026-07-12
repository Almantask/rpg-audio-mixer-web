@iter6
Feature: Soundscape category playing state

  As a GM
  I want to see clearly which soundscape categories are currently playing
  So that I know what background ambience is active at a glance.

  # Playing state: coloured glow border, animating progress bar, and pause icon on the play control.
  # Idle state: no glow border, empty progress bar, and play icon on the play control.

  Background:
    Given I have a scene with soundscape categories on the Active Scene — Soundscapes tab

  Scenario: A playing category card shows the playing state
    When I start playback on the "Weather" category
    Then the "Weather" active-scene category card shows the playing state
    And the "Weather" active-scene category card shows an animating playback progress bar
    And the "Weather" active-scene category card shows a pause icon on the play control

  Scenario: An idle or paused category card does not show the playing state
    Given the "Weather" category is not playing
    Then the "Weather" active-scene category card does not show the playing state
    And the "Weather" active-scene category card shows a play icon on the play control
    And the "Weather" active-scene category card playback progress bar is empty

  Scenario: Pausing a category removes its playing state
    Given the "Weather" category is currently playing
    When I tap pause on "Weather"
    Then the "Weather" active-scene category card no longer shows the playing state
    And the "Weather" active-scene category card playback progress bar is not advancing

  Scenario: Multiple categories can simultaneously show the playing state
    Given "Weather" and "Interior" are both playing
    Then both the "Weather" and "Interior" active-scene category cards show the playing state

  Scenario: Pausing one category leaves the other in playing state
    Given "Weather" and "Interior" are both playing
    When I pause "Interior"
    Then only "Weather" shows the playing state
    And "Interior" does not show the playing state
