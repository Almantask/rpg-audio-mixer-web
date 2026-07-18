@iter8
Feature: Search and filter FX library

  As a GM
  I want to search FX tracks in the Library
  So that I can quickly find the sound effects I need for my game.

  # Search matches track name and tag text.

  Scenario: Filter FX tracks by name in the main search bar
    Given I am on the Sound Effects tab in the Library
    And there are FX tracks available:
      | Sword Clash | Fire Crackle | Sword Slash |
    When I search for "sword" in the main search bar
    Then I see only FX tracks matching "sword":
      | Sword Clash | Sword Slash |
    And I do not see "Fire Crackle" in the FX library card grid

  Scenario: Filter FX tracks by tag in the main search bar
    Given I am on the Sound Effects tab in the Library
    And there are FX tracks available:
      | name         | tags           |
      | Sword Clash  | Combat, Impact |
      | Fire Crackle | Nature         |
      | Arrow Shot   | Combat         |
    When I search for "impact" in the main search bar
    Then I see only FX tracks matching "impact":
      | Sword Clash |

  Scenario: Filtered empty state on FX tab offers a clear-filters action
    Given I am on the Sound Effects tab in the Library
    And there are FX tracks available:
      | Thunder Crack | Wolf Howl |
    When I search for "nonexistent_sound_xyz" in the main search bar
    Then I see "No effects match your filters"
    And I see a clear-filters action
    When I use the clear-filters action
    Then I see "Thunder Crack" and "Wolf Howl" in the FX library card grid
