@iter8
Feature: Purge from Trash

  As a GM
  I want to permanently delete items from Trash
  So that I can free storage before automatic expiry.

  Scenario: Manually purging an item from Trash permanently destroys it
    Given "Dragon Roar" is in Trash
    When I tap "Purge" on the "Dragon Roar" card and confirm the destructive action
    Then "Dragon Roar" is permanently deleted
    And it can no longer be restored

  Scenario: Purge Selected permanently deletes checked items after confirmation
    Given the "FX" tab contains "Dragon Roar" and "Wolf Howl"
    And I have selected "Dragon Roar" and "Wolf Howl"
    When I tap "Purge Selected" and confirm the destructive action
    Then "Dragon Roar" and "Wolf Howl" are permanently deleted

  Scenario: Empty Trash permanently purges all items on the active tab after confirmation
    Given the "FX" tab contains "Dragon Roar" and "Wolf Howl"
    When I tap "Empty Trash" and confirm the destructive action
    Then "Dragon Roar" and "Wolf Howl" are permanently deleted
    And the "FX" tab shows the "No deleted FX" empty state

  Scenario: Bulk actions affect only the active tab
    Given the "FX" tab contains "Dragon Roar"
    And the "Scenes" tab contains "Cursed Catacombs"
    When I open the "FX" tab on the Trash screen
    And I tap "Empty Trash" and confirm the destructive action
    Then I do not see "Dragon Roar" on the "FX" tab
    And "Cursed Catacombs" remains on the "Scenes" tab

  Scenario: Bulk purge partial failure keeps failed items selected
    Given the "FX" tab contains "Dragon Roar", "Wolf Howl", and "Locked Clip"
    And "Locked Clip" cannot be purged because its storage record is locked
    And I have selected all items on the "FX" tab
    When I tap "Purge Selected" and confirm the destructive action
    Then I see a summary toast "Purged 2 of 3"
    And "Locked Clip" remains in Trash and stays selected with error detail
