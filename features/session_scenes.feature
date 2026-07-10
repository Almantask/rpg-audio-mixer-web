@iter3 @iter11
Feature: Session scenes

  As a GM
  I want to link existing scenes to a session
  So that I can quickly access the right audio for each night of play.

  Scenario: A session starts with no scenes linked
    Given I have a session "Session 1 – The Dark Arrival" with no scenes
    When I open that session
    Then I see a centred empty-state illustration with a prompt
    And I see an "Import Scene" button

  Scenario: Import an existing scene into a session
    Given I have a scene "Tavern" in Ambience Presets
    And I have a session "Session 1" with no scenes
    When I open "Session 1"
    And I tap "Import Scene"
    And I select "Tavern" from the scene picker
    And I confirm
    Then I see "Tavern" in the session "Session 1"

  Scenario: Can import multiple scenes at once
    Given I have scenes "Tavern", "Forest", "Dungeon" in Ambience Presets
    And I have a session "Session 1" with no scenes
    When I open "Session 1"
    And I tap "Import Scene"
    And I select "Tavern", "Forest", and "Dungeon" from the picker
    And I confirm
    Then all three scenes appear in "Session 1"

  Scenario: Removing a scene from a session does not delete the scene globally
    Given "Tavern" is linked to "Session 1"
    When I swipe right on the "Tavern" card to unlink it
    Then "Tavern" is no longer shown in "Session 1"
    But "Tavern" still appears in Ambience Presets

  Scenario: Editing a linked scene updates it in the session too
    Given "Tavern" is linked to "Session 1"
    And "Tavern" has the soundscape category "Ambiance"
    When I edit "Tavern" and add the soundscape category "Music"
    Then "Tavern" shows both "Ambiance" and "Music" when viewed from "Session 1"

  Scenario: The most recently played scene in a session shows a Last Active indicator
    Given "Tavern" and "Forest" are linked to "Session 1"
    And I most recently played "Forest" in "Session 1"
    When I open "Session 1"
    Then the "Forest" card shows a pulsing Last Active indicator
    And the "Tavern" card does not show the Last Active indicator

  Scenario: Tapping a scene card in a session opens it without starting playback
    Given "Tavern" is linked to "Session 1"
    When I tap the "Tavern" scene card in "Session 1"
    Then I see the Active Scene screen for "Tavern"
    And no audio is playing

  Scenario: Tapping the play button on a scene card starts playback
    Given "Tavern" is linked to "Session 1"
    When I tap the play button on the "Tavern" scene card in "Session 1"
    Then I see the Active Scene screen for "Tavern"
    And playback begins with a fade-in
