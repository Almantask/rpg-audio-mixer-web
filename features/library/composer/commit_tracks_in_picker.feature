@iter4 @core
Feature: Commit tracks in Category Composer picker

  As a GM
  I want to add checked tracks to an intensity level
  So that the composition picks from the right pool at play time.

  Scenario: Track picker Add Selected is disabled when no tracks are checked
    Given the Track Picker modal is open for "Level I" in "Weather"
    And the soundscape library has "Thunderous Downpour"
    And no picker track cards are checked
    Then the "Add Selected (0)" button is disabled

  Scenario: Add Selected adds checked tracks to the current intensity level
    Given the Track Picker modal is open for "Level I" in "Weather"
    And the soundscape library has "Thunderous Downpour" and "Distant Rolling Thunder"
    And I have checked "Thunderous Downpour" and "Distant Rolling Thunder"
    When I tap "Add Selected (2)"
    Then I see a toast "2 tracks added"
    And "Thunderous Downpour" and "Distant Rolling Thunder" appear in "Level I"

  Scenario: Selection clears after a successful Add Selected
    Given the Track Picker modal is open for "Level I" in "Weather"
    And the soundscape library has "Thunderous Downpour"
    And I have checked "Thunderous Downpour"
    When I tap "Add Selected (1)"
    Then no picker track cards are checked
    And the "Add Selected (0)" button is disabled
    And the Track Picker modal stays open

  Scenario: Multiple Add Selected commits can run in one picker visit
    Given the Track Picker modal is open for "Level I" in "Weather"
    And the soundscape library has "Thunderous Downpour" and "Distant Rolling Thunder"
    When I check "Thunderous Downpour" in the track picker
    And I tap "Add Selected (1)"
    And I check "Distant Rolling Thunder" in the track picker
    And I tap "Add Selected (1)"
    Then both tracks appear in "Level I"
    And the Track Picker modal stays open

  Scenario: Tracks already on the level are excluded from the picker grid
    Given "Thunderous Downpour" is attached to "Level I" in "Weather"
    And the soundscape library has "Thunderous Downpour" and "Distant Rolling Thunder"
    When I open the Track Picker for "Level I"
    Then I do not see "Thunderous Downpour" in the picker grid
    But I see "Distant Rolling Thunder" in the picker grid

  Scenario: The same track may appear on multiple intensity levels
    Given "Thunderous Downpour" is attached to "Level I" in "Weather"
    And the Track Picker modal is open for "Level II" in "Weather"
    When I check "Thunderous Downpour" in the track picker
    And I tap "Add Selected (1)"
    Then "Thunderous Downpour" appears on both "Level I" and "Level II"

  Scenario: Adding a track auto-saves without tapping Save Composition
    Given I am in the Soundscape Category Composer for "Weather"
    And the Track Picker modal is open for "Level I" in "Weather"
    And the soundscape library has "Thunderous Downpour"
    When I check "Thunderous Downpour" in the track picker
    And I tap "Add Selected (1)"
    Then I see "Thunderous Downpour" in "Level I"
    And the composition is persisted without tapping "Save Composition"
