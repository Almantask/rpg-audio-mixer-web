@iter8
Feature: Search and filter soundscape categories

  As a GM
  I want to search and filter soundscape categories in the Library
  So that I can quickly find the compositions I need for my game.

  Scenario: Search soundscape categories by name in the main search bar
    Given I am on the Soundscapes tab in the Library
    And I have categories "Weather", "Interior", "Monsters"
    When I search for "Weath" in the main search bar
    Then I see only "Weather" in the grid

  Scenario: Filter soundscape categories by category type in the sidebar
    Given I am on the Soundscapes tab in the Library
    And I have categories
      | category  | category_type |
      | Weather   | Environmental |
      | Interior  | Environmental |
      | Monsters  | Creature      |
    When I filter soundscapes by category type "Creature" in the sidebar
    Then I see only "Monsters" in the grid

  Scenario: Sort soundscape categories using the sidebar sort control
    Given I am on the Soundscapes tab in the Library
    And I have categories added in this order
      | category  |
      | Weather   |
      | Interior  |
      | Monsters  |
    When I set the sort order to "Recently Added" in the sidebar
    Then soundscape categories appear in this order
      | Monsters | Interior | Weather |

  Scenario: Filtered empty state on Soundscapes tab offers a clear-filters action
    Given I am on the Soundscapes tab in the Library
    When I search for "nonexistent_category_xyz" in the main search bar
    Then I see "No compositions match your filters"
    And I see a clear-filters action
