@iter8
Feature: Select items in Trash

  As a GM
  I want to multi-select Trash items
  So that I can restore or purge several at once.

  Scenario: Multi-select shows a selection bar for bulk actions
    Given the "FX" tab contains "Dragon Roar" and "Wolf Howl"
    When I select "Dragon Roar" and "Wolf Howl" on the "FX" tab
    Then I see a selection bar showing "2 selected"
    And I see "Restore Selected" and "Purge Selected" actions

  Scenario: Select all toggles every item on the active tab
    Given the "Scenes" tab contains 3 deleted scenes
    When I tap "Select all (3)" on the "Scenes" tab
    Then all 3 trashed scene cards are selected
    And the selection bar shows "3 selected"
