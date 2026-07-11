@iter10 @iter11
Feature: Session Lock

  As a GM
  I want to lock the active scene controls
  So that I don't accidentally change the scene or delete tracks during a live gameplay session

  Background:
    Given I have a scene "Dungeon Depth"
    And I am on the Active Scene screen for "Dungeon Depth"

  Scenario: Locking the session disables destructive gestures and scene switching
    When I tap the "Lock" icon
    Then the "Lock" icon should appear in a "Locked" state
    And dragging category cards by their handle to reorder should be disabled
    And swiping right on a category card to remove it should be disabled
    And dragging soundboard effects to reorder should be disabled
    And dragging soundboard effects to the flames to delete should be disabled
    And the "Add Soundscape" button should be disabled or hidden
    And navigating to a different scene should be blocked
    But I can still drag the Master Volume slider
    And I can still drag the Volume sliders
    And I can still tap the play/pause and d20 buttons

  Scenario: Unlocking the session restores destructive gestures and scene switching
    Given the session is locked
    When I tap the "Lock" icon to unlock
    Then the "Lock" icon should appear in an "Unlocked" state
    And dragging category cards by their handle to reorder should be enabled
    And swiping right on a category card to remove it should be enabled
    And the "Add Soundscape" button should be visible and enabled
    And navigating to a different scene should be allowed
