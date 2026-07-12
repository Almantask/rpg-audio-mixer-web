@iter4
Feature: Browse soundscape categories

  As a GM
  I want to browse soundscape categories in the Library
  So that I can open the composer or preview samples.

  Scenario: Soundscapes tab shows browse subtitle and action buttons
    Given I am on the Soundscapes tab in the Library
    Then I see the subtitle "Browse and manage your soundscape categories."
    And I see a "Buy Composition" button
    And I see a "Free Compositions" button

  Scenario: Soundscape categories grid shows all created categories
    Given I have created categories "Weather", "Interior", "Monsters"
    When I open the Soundscapes tab in the Library
    Then I see "Weather", "Interior", and "Monsters" in the grid

  Scenario: Download free demo soundscape compositions
    Given I am on the Soundscapes tab in the Library
    When I tap "Free Compositions"
    Then I see download progress UI
    And new soundscape categories appear in the grid when the demo pack download completes

  Scenario: Each category card shows the track count per intensity level
    Given "Weather" has 3 tracks at level I, 5 at level II, and 2 at level III
    When I open the Soundscapes tab in the Library
    Then the "Weather" soundscape category card shows "I: 3 · II: 5 · III: 2"

  Scenario: Opening a category from the library grid opens the Category Composer
    Given "Interior" is in the soundscape categories grid
    When I tap the "Interior" soundscape category card body
    Then I see the Soundscape Category Composer for "Interior"

  Scenario: Soundscape categories show skeleton cards while loading
    Given soundscape library data has not yet resolved
    When I open the Soundscapes tab in the Library
    Then I see skeleton placeholder cards in the grid

  Scenario: Soundscape categories grid is empty before any categories are created
    Given I have not created any soundscape categories
    When I open the Soundscapes tab in the Library
    Then I see a centred empty-state illustration with a prompt
    And I see a "+ Add Soundscape" tile at the end of the grid

  Scenario: Categories with zero tracks are shown in browse mode
    Given "Empty Category" exists with 0 tracks at all intensity levels
    When I open the Soundscapes tab in the Library
    Then I see "Empty Category" in the grid
