@iter12
Feature: Search soundscape tracks in Library

  As a GM
  I want to search soundscape tracks by name on the Tracks tab
  So that I can quickly find the source tracks I need.

  Scenario: Filter Tracks tab by name case-insensitively in the main search bar
    Given I am on the Tracks tab in the Library
    And there are soundscape tracks available:
      | Thunderous Downpour | Distant Rolling Thunder | Forest Ambience |
    When I search for "thunder" in the main search bar
    Then I see only track cards matching "thunder":
      | Thunderous Downpour | Distant Rolling Thunder |
    And I do not see "Forest Ambience" in the Tracks tab grid

  Scenario: Filtered empty state on Tracks tab when no tracks match
    Given I am on the Tracks tab in the Library
    And there are soundscape tracks available:
      | Thunderous Downpour | Forest Ambience |
    When I search for "nonexistent_track_xyz" in the main search bar
    Then I see "No tracks match your filters"
    And I see a clear-filters action

  Scenario: Clearing Tracks tab filters restores the full grid
    Given I am on the Tracks tab in the Library
    And there are soundscape tracks available:
      | Thunderous Downpour | Forest Ambience |
    And I have filtered the Tracks tab to no matches
    When I use the clear-filters action
    Then I see "Thunderous Downpour" and "Forest Ambience" in the Tracks tab grid
