@iter4 @core
Feature: Open track picker in Category Composer

  As a GM
  I want to open the Track Picker for an intensity level
  So that I can browse tracks to attach to the composition.

  Scenario: Add track opens Track Picker modal scoped to that level
    Given I am in the Soundscape Category Composer for "Weather"
    When I tap "Add track" on "Level II"
    Then I see the Track Picker modal titled "Add track"
    And I see the subtitle "Add tracks to Level II."
    And I see a back link "← Category Composer"
    And I see an "Import" action
    And I see a picker search bar

  Scenario: Each picker track card shows a selection checkbox and file metadata
    Given the Track Picker modal is open for "Level I" in "Weather"
    And the soundscape library has "Thunderous Downpour"
    Then the "Thunderous Downpour" picker track card displays a selection checkbox
    And the "Thunderous Downpour" picker track card shows format, channel, and duration metadata
    And the "Thunderous Downpour" picker track card does not display a + button

  Scenario: Empty soundscape library shows Import guidance in the Track Picker
    Given the soundscape library has no tracks
    And the Track Picker modal is open for "Level I" in "Weather"
    Then I see guidance to import tracks via Import
    And the "Add Selected (0)" button is disabled

  Scenario: The Track Picker shows picker track skeleton cards while library data is loading
    Given the soundscape library is still loading
    When I open the Track Picker for "Level I" in "Weather"
    Then I see picker track skeleton cards in the picker grid
