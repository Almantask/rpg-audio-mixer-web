@iter4 @core
Feature: Preview track in Category Composer picker

  As a GM
  I want to preview tracks before adding them to a level
  So that I can confirm the right clip is selected.

  Scenario: Tapping a picker track card body previews the track in the picker
    Given the Track Picker modal is open for "Level I" in "Weather"
    And the soundscape library has "Thunderous Downpour"
    When I tap the picker track card body for "Thunderous Downpour"
    Then "Thunderous Downpour" begins previewing in the picker

  Scenario: Only one track previews at a time in the Track Picker
    Given the Track Picker modal is open for "Level I" in "Weather"
    And the soundscape library has "Thunderous Downpour" and "Distant Rolling Thunder"
    And "Thunderous Downpour" is previewing in the picker
    When I tap the picker track card body for "Distant Rolling Thunder"
    Then "Thunderous Downpour" stops previewing
    And "Distant Rolling Thunder" begins previewing in the picker
