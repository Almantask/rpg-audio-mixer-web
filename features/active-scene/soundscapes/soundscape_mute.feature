@iter11
Feature: Mute soundscape output on Active Scene

  As a GM
  I want to mute soundscape output without affecting the soundboard
  So that I can silence ambience while keeping one-shot effects audible.

  Background:
    Given I have a scene "Dragon's Lair" with soundscape categories "Weather" and "Interior"
    And I am on the Active Scene screen for "Dragon's Lair"

  Scenario: Mute silences soundscape output only without changing slider positions
    Given "Weather" is playing with Master Volume at 85%
    And "Thunder Crack" is playing from the Soundboard tab
    When I tap the mute button on the Master Volume bar
    Then all soundscape audio is silenced
    And "Thunder Crack" continues playing from the soundboard
    And the Master Volume slider still reads 85%

  Scenario: Unmuting restores soundscape output at the saved slider level
    Given soundscape output is muted with Master Volume at 85%
    When I tap the mute button again
    Then soundscape audio resumes at the mapped volume for 85%
