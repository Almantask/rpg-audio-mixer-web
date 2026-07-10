@iter6 @iter11
Feature: Loop soundscape categories

  As a GM
  I want to play a track from a category pool in a loop
  So that I can have background ambience without having to select a specific track.

  Scenario: Playing a soundscape category starts looping a random track from that category
    Given a scene has the category "Weather" with tracks "Light Rain" and "Drizzle"
    When I tap play on the "Weather" category
    Then a track from "Weather" starts looping

  Scenario: Play resumes a paused track instead of picking a new random track
    Given the "Weather" category was playing "Light Rain" and is now paused
    When I tap play on the "Weather" category
    Then "Light Rain" resumes looping
    And no new random track is selected

  Scenario: Play picks a random track when no track is loaded in the category
    Given the "Weather" category has tracks but none is currently loaded or paused
    When I tap play on the "Weather" category
    Then a random track from the current intensity pool starts looping

  Scenario: The playing category card shows a playing state
    Given a scene has the category "Interior"
    When I tap play on the "Interior" category
    Then the "Interior" card shows the coloured glow playing state

  Scenario: Pausing a looping category stops the loop
    Given the "Weather" category is currently looping
    When I tap pause on the "Weather" category
    Then the loop stops
    And the "Weather" card no longer shows the playing state

  Scenario: Two categories can loop simultaneously
    Given a scene has categories "Weather" and "Interior"
    When I tap play on "Weather"
    And I tap play on "Interior"
    Then "Weather" and "Interior" are both looping at the same time

  Scenario: Playing a track respects the selected intensity level
    Given the "Weather" category has the intensity set to II
    And "Weather" has tracks "Storm" at level II and "Drizzle" at level I
    When I tap play on "Weather"
    Then a track from intensity level II plays (not from level I)
