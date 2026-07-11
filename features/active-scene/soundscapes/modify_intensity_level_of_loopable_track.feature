@iter6
Feature: Intensity level of soundscape category

  As a GM
  I want to change the intensity level of a soundscape category
  So that the right tracks play for the mood of the scene.

  Scenario: Changing intensity on an idle category does not start playback
    Given the "Weather" category is not playing
    And "Weather" has tracks at Intensity Level II
    When I select Intensity Level II on the "Weather" category
    Then no track from "Weather" begins playing
    And Intensity Level II is selected on the "Weather" category
    And the intensity change is auto-saved immediately

  Scenario: Play after an intensity change picks from the new pool
    Given the "Weather" category is not playing
    And "Weather" has tracks "Drizzle" at Intensity Level I and "Storm" at Intensity Level II
    When I select Intensity Level II and start playback on the "Weather" category
    Then a track from Intensity Level II plays (not from Intensity Level I)

  Scenario: Changing intensity on a playing category transitions smoothly
    Given the "Weather" category is playing at Intensity Level I
    When I select Intensity Level II on the "Weather" category
    Then a track from Intensity Level II replaces the Intensity Level I track with a smooth transition

  Scenario: Empty intensity levels are non-interactive and do not change the active level
    Given the "Dungeon" category is currently at Intensity Level I
    And the "Dungeon" category has no tracks at Intensity Level III
    When I attempt to select Intensity Level III on the "Dungeon" card
    Then the active intensity level should remain Intensity Level I
    And Intensity Level III is unavailable on the "Dungeon" card

  Scenario: Changing intensity on a paused category applies when playback resumes
    Given the "Weather" category was playing at Intensity Level I and is now paused
    When I select Intensity Level II and start playback on the "Weather" category
    Then a track from Intensity Level II plays (not from Intensity Level I)
