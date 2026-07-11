@iter5 @iter11
Feature: Close FX picker

  As a GM
  I want to return to the soundboard from the FX picker
  So that I can continue running the scene after adding effects.

  Scenario: Tapping back stops preview and returns to the Soundboard tab
    Given the Sound Effects picker modal is open
    And I have added "Thunder Crack" and "Wolf Howl" via Add Selected
    And "Thunder Crack" is previewing in the picker
    When I tap the back link "Back to Active Scene"
    Then "Thunder Crack" stops previewing
    And I see the Active Scene — Soundboard tab
    And both "Thunder Crack" and "Wolf Howl" appear as tiles in the soundboard grid
