@iter5
Feature: Preview soundscape in picker

  As a GM
  I want to preview a soundscape category before adding it to the scene
  So that I can confirm the right composition is selected.

  Scenario: Tapping a soundscape picker card body previews a sample track
    Given the Add Soundscape picker modal is open
    And my library has the category "Weather" with at least one track
    When I tap the soundscape picker card body for "Weather"
    Then a sample track from "Weather" begins previewing
    And the "Weather" soundscape picker card shows it is previewing

  Scenario: Tapping a playing soundscape picker card body stops the preview
    Given the Add Soundscape picker modal is open
    And "Weather" is previewing in the picker
    When I tap the soundscape picker card body for "Weather" again
    Then "Weather" stops previewing
    And the "Weather" soundscape picker card no longer shows it is previewing

  Scenario: Only one category preview plays at a time in the picker
    Given the Add Soundscape picker modal is open
    And my library has the categories "Weather" and "Interior"
    And "Weather" is previewing in the picker
    When I tap the soundscape picker card body for "Interior"
    Then "Weather" stops previewing
    And a sample track from "Interior" begins previewing
    And the "Interior" soundscape picker card shows it is previewing
