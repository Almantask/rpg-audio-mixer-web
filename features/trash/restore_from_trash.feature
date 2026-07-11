@iter8
Feature: Restore from Trash

  As a GM
  I want to restore deleted items from Trash
  So that I can recover accidentally deleted content.

  Scenario Outline: Restoring an item returns it to its original location
    Given "<name>" (<type>) is in Trash
    When I tap "Restore" on the "<name>" card
    Then "<name>" is removed from Trash
    And <restore_destination>

    Examples:
      | name             | type       | restore_destination                                                 |
      | Cursed Catacombs | Scene      | it reappears in the Scenes list with all prior session links intact |
      | Winter's Breath  | Soundscape | it reappears in the Audio Library soundscapes list                  |
      | Dragon Roar      | FX         | it reappears in the Audio Library FX list                           |
      | Session 12       | Session    | it reappears in its parent campaign's sessions list                 |

  Scenario: Restoring a campaign also restores its orphaned sessions
    Given I have a campaign "Curse of Strahd" in Trash
    And its sessions are orphaned (hidden from active UI)
    When I tap "Restore" on "Curse of Strahd"
    Then "Curse of Strahd" reappears in my campaigns list
    And its sessions are no longer hidden

  Scenario: Restoring an item with a name collision auto-renames it
    Given "Dragon Roar" (FX) is in Trash
    And a live FX track named "Dragon Roar" already exists
    When I tap "Restore" on the "Dragon Roar" card
    Then the restored item appears as "Dragon Roar (restored)" in the Audio Library FX list

  Scenario: Restore Selected restores checked items on the active tab
    Given the "FX" tab contains "Dragon Roar" and "Wolf Howl"
    And I have selected "Dragon Roar" and "Wolf Howl"
    When I tap "Restore Selected"
    Then "Dragon Roar" and "Wolf Howl" are removed from Trash
    And they reappear in the Audio Library FX list

  Scenario: Restore All always confirms and restores every item on the active tab
    Given the "FX" tab contains "Dragon Roar" and "Wolf Howl"
    When I tap "Restore All" and confirm the restore action
    Then "Dragon Roar" and "Wolf Howl" are removed from Trash
    And they reappear in the Audio Library FX list

  Scenario: Bulk restore partial failure keeps failed items selected
    Given the "FX" tab contains "Dragon Roar", "Wolf Howl", and "Broken Clip"
    And "Broken Clip" cannot be restored because its audio blob is missing
    And I have selected all items on the "FX" tab
    When I tap "Restore Selected"
    Then I see a summary toast "Restored 2 of 3"
    And "Broken Clip" remains in Trash and stays selected with error detail
    And "Dragon Roar" and "Wolf Howl" reappear in the Audio Library FX list

  Scenario: A soft-deleted FX track retains its audio when restored within 7 days
    Given "Dragon Roar" (FX) is in Trash
    When I tap "Restore" on the "Dragon Roar" card
    Then the restored FX track plays successfully in the Audio Library FX list
