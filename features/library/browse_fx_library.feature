@iter5
Feature: Browse FX library

  As a GM
  I want to browse my FX collection in the Library
  So that I can find and play sound effects.

  Scenario: FX tab shows browse subtitle
    Given I am on the Sound Effects tab in the Library
    Then I see the subtitle "Browse, import, and manage your sound effects."

  Scenario: Multiple FX tracks appear in the card grid
    Given I have imported "Wolf Howl", "Thunder Crack", "Door Creak"
    When I open the Sound Effects tab in the Library
    Then I see all three tracks as cards in the grid

  Scenario: FX cards show title, duration, and base intensity
    Given "Thunder Crack" is in the FX library with duration 0:04 and base intensity II
    When I open the Sound Effects tab in the Library
    Then the "Thunder Crack" card shows the title "Thunder Crack"
    And the card shows duration "0:04" and base intensity "II"

  Scenario: FX cards show tag badge chips
    Given "Wolf Howl" is in the FX library with tags "Combat" and "Creature"
    When I open the Sound Effects tab in the Library
    Then the "Wolf Howl" card shows "Combat" and "Creature" tag chips

  Scenario: FX library shows skeleton cards while loading
    Given the FX library data has not yet resolved
    When I open the Sound Effects tab in the Library
    Then I see skeleton placeholder cards in the grid

  Scenario: FX library is empty before any sounds are imported
    Given I have not imported any FX tracks
    When I open the Sound Effects tab in the Library
    Then I see a centred empty-state illustration
    And I see copy directing me to import or download FX tracks
    And I see an "Import FX" button
    And I see a "Buy More" button
    And I see a "Free Tracks" button

  Scenario: FX browse cards have no checkboxes
    Given "Wolf Howl" is in the FX library
    When I open the Sound Effects tab in the Library
    Then the "Wolf Howl" card has no checkbox
