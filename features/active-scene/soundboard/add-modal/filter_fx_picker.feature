@iter3
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
