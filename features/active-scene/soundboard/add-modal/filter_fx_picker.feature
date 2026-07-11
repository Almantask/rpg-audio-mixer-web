@iter5 @iter11
Feature: Filter FX picker

  As a GM
  I want to search and filter effects in the picker
  So that I can find the right clips quickly.

  Scenario: Search filters the picker grid by name
    Given the Sound Effects picker modal is open
    And the FX library has "Thunder Crack" and "Wolf Howl"
    When I type "Thunder" in the picker search bar
    Then I see "Thunder Crack" in the picker grid
    And I do not see "Wolf Howl" in the picker grid

  Scenario: Search in the picker matches track tags
    Given the Sound Effects picker modal is open
    And the FX library has "Wolf Howl" tagged CREATURE and "Thunder Crack" tagged IMPACT
    When I type "CREATURE" in the picker search bar
    Then I see "Wolf Howl" in the picker grid
    And I do not see "Thunder Crack" in the picker grid

  Scenario: FX Types filter narrows the picker grid
    Given the Sound Effects picker modal is open
    And the FX library has type IMPACT track "Thunder Crack" and type CREATURE track "Wolf Howl"
    When I set the FX Types filter to IMPACT in the picker
    Then I see "Thunder Crack" in the picker grid
    And I do not see "Wolf Howl" in the picker grid

  Scenario: Base Intensity filter narrows the picker grid
    Given the Sound Effects picker modal is open
    And the FX library has "Soft Tap" at base intensity I and "Thunder Crack" at base intensity III
    When I set the base intensity filter to "III" in the picker
    Then I see "Thunder Crack" in the picker grid
    And I do not see "Soft Tap" in the picker grid

  Scenario: Sort Order reorders tracks in the picker grid
    Given the Sound Effects picker modal is open
    And the FX library has "Alpha FX" added before "Zulu FX"
    When I set the Sort Order to "Name A–Z" in the picker
    Then "Alpha FX" appears before "Zulu FX" in the picker grid

  Scenario: FX picker no-match filters shows a clear-filters action
    Given the Sound Effects picker modal is open
    And the FX library has "Thunder Crack"
    When I type "nonexistent" in the picker search bar
    Then I see "No effects match your filters"
    And I see a clear-filters action

  Scenario: Clear-filters restores the picker grid after a no-match search
    Given the Sound Effects picker modal is open
    And the FX library has "Thunder Crack"
    When I type "nonexistent" in the picker search bar
    And I use the clear-filters action in the picker
    Then I see "Thunder Crack" in the picker grid
