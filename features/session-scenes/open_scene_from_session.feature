@iter3
Feature: Open scene from session

  As a GM
  I want to open a linked scene from the session list
  So that I can configure or run audio for that location.

  Scenario: Tapping a scene card in a session opens it without starting playback
    Given "Tavern" is linked to "Session 1"
    And I am viewing Session Scenes for "Session 1"
    When I tap the "Tavern" scene card in "Session 1"
    Then I see the Active Scene screen for "Tavern"
    And no audio is playing
