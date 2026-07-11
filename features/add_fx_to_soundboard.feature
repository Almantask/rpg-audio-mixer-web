@iter5 @iter11
Feature: Add FX to soundboard

  As a GM
  I want to add sound effects to the active scene's soundboard
  So that I can trigger one-shot effects relevant to the current scene.

  # Design: The selection view shows all FX library tracks with instant + add.
  # Effects already in the scene's soundboard show an indicator icon instead of +.

  Scenario: Tapping Add Sound opens the FX selection modal
    Given I am on the Active Scene — One-Shots & SFX tab
    When I tap "Add Sound"
    Then I see the FX selection screen with a back link

  Scenario: Each FX row shows a + button
    Given the FX selection screen is open
    And the FX library has "Thunder Crack"
    Then the "Thunder Crack" row displays a + button

  Scenario: Tapping + on an FX track immediately adds it to the soundboard
    Given the FX selection screen is open
    And "Wolf Howl" is not yet in the current scene's soundboard
    When I tap the + button on the "Wolf Howl" row
    Then "Wolf Howl" is instantly added to the soundboard
    And I see the already-added indicator on the "Wolf Howl" row

  Scenario: No confirm step is required to add an effect
    Given I have tapped + on "Door Creak" in the FX selection screen
    Then "Door Creak" is added to the soundboard immediately without any confirmation dialog

  Scenario: Multiple effects can be added in one visit to the selection screen
    Given the FX selection screen is open
    When I tap + on "Thunder Crack"
    And I tap + on "Wolf Howl"
    And I tap + on "Sword Clash"
    Then all three effects appear as buttons in the active scene's soundboard

  Scenario: An effect already in the soundboard shows an already-added indicator instead of +
    Given "Battle Horn" is already in the current scene's soundboard
    When I open the FX selection screen
    Then the "Battle Horn" row shows the already-added indicator instead of a + button

  Scenario: An already-added effect cannot be added again from the selection screen
    Given "Battle Horn" is already in the soundboard
    And the FX selection screen is open
    When I tap the already-added indicator on the "Battle Horn" row
    Then "Battle Horn" is not duplicated in the soundboard

  Scenario: Tapping back returns to the Active Scene with all added effects present
    Given I have added "Thunder Crack" and "Wolf Howl" from the FX selection screen
    When I tap the back link
    Then I see the Active Scene — One-Shots & SFX tab
    And both "Thunder Crack" and "Wolf Howl" appear as buttons in the soundboard grid

  Scenario: The Import button opens the browser file picker
    Given the FX selection screen is open
    When I tap "Import" in the footer card
    Then the browser file picker opens for audio files only

  Scenario: A file imported via Import appears in the FX library and selection list
    Given the browser file picker is open from the FX selection screen
    When I select "cannon_fire.mp3"
    Then "cannon_fire.mp3" appears in the FX selection list
    And it can be added to the scene with a + tap
