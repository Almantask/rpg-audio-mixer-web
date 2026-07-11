@iter8
Feature: Search and filter FX library

  As a GM
  I want to search and filter FX tracks in the Library
  So that I can quickly find the sound effects I need for my game.

  # FX Types (sidebar) filter by track type; Tags (chips + main search bar) filter by tag text.

  Scenario: Filter FX tracks by type using the sidebar filter panel
    Given I am on the Sound Effects tab in the Library
    And there are FX tracks available
      | name         | fx_type |
      | Sword Clash  | COMBAT  |
      | Fire Crackle | NATURE  |
      | Arrow Shot   | COMBAT  |
    When I filter FX by type "COMBAT" in the sidebar
    Then I see only FX tracks of type "COMBAT"
      | Sword Clash | Arrow Shot |
    And I do not see "Fire Crackle" in the FX library card grid

  Scenario: Filter FX tracks by name in the main search bar
    Given I am on the Sound Effects tab in the Library
    And there are FX tracks available
      | Sword Clash | Fire Crackle | Sword Slash |
    When I search for "sword" in the main search bar
    Then I see only FX tracks matching "sword"
      | Sword Clash | Sword Slash |
    And I do not see "Fire Crackle" in the FX library card grid

  Scenario: Filter FX tracks by tag in the main search bar
    Given I am on the Sound Effects tab in the Library
    And there are FX tracks available
      | name         | tags           |
      | Sword Clash  | Combat, Impact |
      | Fire Crackle | Nature         |
      | Arrow Shot   | Combat         |
    When I search for "impact" in the main search bar
    Then I see only FX tracks matching "impact"
      | Sword Clash |

  Scenario: Filter FX tracks by base intensity using the sidebar slider
    Given I am on the Sound Effects tab in the Library
    And there are FX tracks with different base intensities
      | name          | intensity |
      | Door Creak    | I         |
      | Thunder Crack | II        |
      | Dragon Roar   | III       |
    When I set the base intensity filter to "II" in the sidebar
    Then I see only FX tracks with base intensity up to "II"
      | Door Creak | Thunder Crack |
    And I do not see "Dragon Roar" in the FX library card grid

  Scenario: Sort FX tracks using the sidebar sort control
    Given I am on the Sound Effects tab in the Library
    And FX tracks were added in this order
      | name          |
      | Door Creak    |
      | Thunder Crack |
      | Dragon Roar   |
    When I set the sort order to "Recently Added" in the sidebar
    Then the FX grid shows tracks in this order
      | Dragon Roar | Thunder Crack | Door Creak |

  Scenario: Filtered empty state on FX tab offers a clear-filters action
    Given I am on the Sound Effects tab in the Library
    And there are FX tracks available
      | Thunder Crack | Wolf Howl |
    When I search for "nonexistent_sound_xyz" in the main search bar
    Then I see "No effects match your filters"
    And I see a clear-filters action
    When I use the clear-filters action
    Then I see "Thunder Crack" and "Wolf Howl" in the FX library card grid
