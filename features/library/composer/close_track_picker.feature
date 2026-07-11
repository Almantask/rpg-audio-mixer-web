@iter3 @core
Feature: Close track picker in Category Composer

  As a GM
  I want to return to the composer from the Track Picker
  So that I can continue editing intensity levels.

  Scenario: Tapping back stops preview and returns to the composer
    Given I opened the Track Picker from "Add track" on "Level II" in "Weather"
    And "Thunderous Downpour" is previewing in the picker
    When I tap "← Category Composer"
    Then "Thunderous Downpour" stops previewing
    And I see the Soundscape Category Composer for "Weather"
    And "Level II" is still expanded
