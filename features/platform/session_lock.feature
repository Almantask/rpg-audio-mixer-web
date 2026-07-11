@iter10 @iter11
Feature: Session Lock

  As a GM
  I want to lock the active scene controls
  So that I don't accidentally change the scene or delete tracks during a live gameplay session

  Background:
    Given I have a scene "Dungeon Depth"
    And I am on the Active Scene screen for "Dungeon Depth"

  Scenario: Session Lock disables soundscape editing
    When I tap the "Lock" icon
    Then the session is locked
    And dragging category cards by their handle to reorder is disabled
    And the delete button on a soundscape category tile is disabled
    And the "Add Soundscape" button is disabled

  Scenario: Session Lock disables soundboard editing
    Given the session is locked
    Then dragging soundboard effects to reorder is disabled
    And the delete button on a soundboard effect tile is disabled
    And the "Add Sound" button is disabled

  Scenario: Session Lock blocks scene navigation
    Given the session is locked
    When I attempt to navigate to a different scene
    Then navigation to a different scene is blocked

  Scenario: Session Lock still allows playback controls
    Given the session is locked
    Then I can tap the play/pause and d20 buttons
    And I can tap "Stop All"
    And I can still trigger soundboard effects

  Scenario: Session Lock still allows volume adjustments
    Given the session is locked
    Then I can drag the Master Volume slider
    And I can drag the Volume sliders
    And I can drag the Soundboard Master slider
    And I can switch between the "Soundscapes" and "Soundboard" tabs

  Scenario: Unlocking the session restores editing
    Given the session is locked
    When I tap the "Lock" icon to unlock
    Then the session is unlocked
    And dragging category cards by their handle to reorder is enabled
    And the delete button on a soundscape category tile is enabled
    And the "Add Soundscape" button is visible and enabled
    And the "Add Sound" button is visible and enabled
    And navigating to a different scene is allowed

  Scenario: Session Lock state persists after reloading the Active Scene
    Given the session is locked
    When I reload the Active Scene screen
    Then the session is locked

  Scenario: Session Lock does not apply on the Session Scenes list
    Given I am on the Session Scenes list for "Curse of Strahd"
    Then I do not see a Session Lock control
    And I can open a different scene from the list
