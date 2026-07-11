@iter4
Feature: Filter soundscape picker

  As a GM
  I want to search and filter soundscape categories in the picker
  So that I can find the right compositions quickly.

  Scenario: Searching in the picker filters soundscape categories by name
    Given the Add Soundscape picker modal is open
    And my library has the categories "Weather" and "Tavern"
    When I type "Weather" in the picker search bar
    Then I see the "Weather" category in the picker grid
    And I do not see the "Tavern" category in the picker grid

  Scenario: Category Type filter narrows the picker grid
    Given the Add Soundscape picker modal is open
    And my library has categories of different types
    When I set the Category Type filter to "Ambience" in the picker
    Then I see only matching categories in the picker grid

  Scenario: No compositions match the active search filter
    Given the Add Soundscape picker modal is open
    And my library has the category "Weather"
    When I type "nonexistent" in the picker search bar
    Then I see "No compositions match your filters"
    And I see a clear-filters action
