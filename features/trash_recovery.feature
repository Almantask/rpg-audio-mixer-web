@iter8 @iter11
Feature: Trash recovery and soft-deletion

  As a GM
  I want a safety net for deleted items
  So that I can recover accidentally deleted campaigns, sessions, scenes, FX, or categories before they are gone forever.

  Scenario: Swiping or deleting any primary item moves it to the Vault of Echoes
    Given I have a standard item (Campaign, Session, Scene, Soundscape Category, or FX track)
    When I delete or swipe to remove the item
    Then the item is moved to the "Vault of Echoes" (Trash)
    And it becomes temporarily unavailable in the main app lists
    And no instant permanent deletion dialog is shown unless it's a destructive cascade

  Scenario: The Vault is reachable from Arcane Settings
    Given I am on the Arcane Settings screen
    When I tap "Restore Recent Deletes"
    Then I see the "Vault of Echoes" screen

  Scenario: The Trash screen lists all temporarily deleted items
    Given I have deleted "Winter's Breath" (Soundscape), "Cursed Catacombs" (Scene), and "Dragon Roar" (FX)
    When I navigate to the "Vault of Echoes" screen
    Then I see a list containing "Winter's Breath", "Cursed Catacombs", and "Dragon Roar"
    And each item card displays how many days ago it was deleted
    And each card shows the item's original type (e.g. Atmosphere, Scene, Spell)
    And each card displays how many days remain before permanent deletion

  Scenario: Items nearing expiry show urgent countdown styling
    Given "Dragon Roar" was moved to the Trash 6 days ago
    When I open the "Vault of Echoes" screen
    Then the "Dragon Roar" card shows "1 day left" in urgent red styling

  Scenario: Restoring an item returns it to its original location
    Given "Cursed Catacombs" (Scene) is in the Trash
    When I tap the "Restore" button on the "Cursed Catacombs" card
    Then "Cursed Catacombs" is removed from the Trash
    And it reappears exactly as it was in Scenes

  Scenario: Restoring a campaign also restores its sessions
    Given I have a campaign "Curse of Strahd" in the Trash
    And its sessions are orphaned (hidden)
    When I tap "Restore" on "Curse of Strahd"
    Then the "Curse of Strahd" campaign reappears in my campaigns list
    And its sessions are no longer hidden

  Scenario: Manually purging an item from the Trash permanently destroys it
    Given "Dragon Roar" is in the Trash
    When I tap the "Purge" button on its card in the Trash
    And I confirm the destructive action in the confirmation dialog
    Then "Dragon Roar" is permanently deleted from the app
    And it can no longer be restored

  Scenario: Items are automatically destroyed 7 days after deletion
    Given "Winter's Breath" was moved to the Trash 7 days ago
    When the app runs its background cleanup or is launched
    Then "Winter's Breath" is permanently deleted
    And it no longer appears in the Trash list

  Scenario: Emptying the Vault permanently destroys all Trash items
    Given the Trash contains multiple items
    When I tap "Empty Vault"
    And I confirm the destructive action
    Then all items in the Trash are permanently deleted
    And the Trash screen shows the "The Vault is Quiet" empty state
