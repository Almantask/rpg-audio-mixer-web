@iter3 @iter11 @core
Feature: Filter track picker in Category Composer

  As a GM
  I want to search tracks in the Track Picker
  So that I can find the right clip quickly.

  Scenario: Search filters the Track Picker grid
    Given the Track Picker modal is open for "Level I" in "Weather"
    And the soundscape library has "Thunderous Downpour" and "Gentle Breeze"
    When I type "Thunder" in the picker search bar
    Then I see "Thunderous Downpour" in the picker grid
    And I do not see "Gentle Breeze" in the picker grid

  Scenario: No matching filters shows a clear-filters action
    Given the Track Picker modal is open for "Level I" in "Weather"
    When I type "nonexistent" in the picker search bar
    Then I see "No tracks match your filters"
    And I see a clear-filters action
