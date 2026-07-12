@iter5
Feature: Close soundscape picker

  As a GM
  I want to return to the Soundscapes tab from the picker
  So that I can continue running the scene after adding categories.

  Scenario: Tapping back stops preview and returns to the Soundscapes tab
    Given the Add Soundscape picker modal is open
    And I have added "Weather" and "Interior" via Add Selected
    And "Weather" is previewing in the picker
    When I tap the back link "Back to Active Scene"
    Then preview playback stops
    And I see the Active Scene — Soundscapes tab
    And "Weather" and "Interior" are present as category cards
