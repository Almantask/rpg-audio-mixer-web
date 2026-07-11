@iter8 @iter11
Feature: View Trash screen

  As a GM
  I want to browse deleted items organized by type
  So that I can find what I need to restore or purge.

  Scenario: Trash is reachable from the sidebar
    Given I am on the Home screen
    When I tap "Trash" in the sidebar
    Then I see the Trash screen with title "Trash"
    And the "Trash" sidebar item appears highlighted in gold

  Scenario: The Trash screen shows the page header and entity tabs
    When I navigate to the Trash screen
    Then I see the subtitle "Recently deleted items are kept for 7 days before permanent removal."
    And I see tabs "Campaigns", "Sessions", "Scenes", "Soundscapes", and "FX"
    And I see "Restore All" and "Empty Trash" actions

  Scenario: The active tab shows only items of that entity type
    Given I have deleted "Winter's Breath" (Soundscape), "Cursed Catacombs" (Scene), and "Dragon Roar" (FX)
    When I navigate to the Trash screen
    And I open the "Scenes" tab on the Trash screen
    Then I see "Cursed Catacombs" in the grid
    And I do not see "Winter's Breath" or "Dragon Roar"

  Scenario: Trash item cards show deletion and expiry metadata
    Given "Dragon Roar" (FX) is in Trash and was deleted 2 days ago with 5 days remaining
    When I open the "FX" tab on the Trash screen
    Then the "Dragon Roar" card shows "Deleted 2 days ago"
    And the card shows "5 days left"

  Scenario: Items are sorted by days remaining ascending within a tab
    Given the "FX" tab contains "Dragon Roar" with 1 day left and "Wolf Howl" with 5 days left
    When I open the "FX" tab on the Trash screen
    Then "Dragon Roar" appears before "Wolf Howl"

  Scenario: Items nearing expiry show urgent countdown styling
    Given "Dragon Roar" was moved to Trash 6 days ago
    When I open the "FX" tab on the Trash screen
    Then the "Dragon Roar" card shows "1 day left" with urgent styling and a warning indicator

  Scenario Outline: An empty tab shows tab-specific empty state
    Given the "<tab>" tab has no deleted items
    When I navigate to the Trash screen
    And I open the "<tab>" tab on the Trash screen
    Then I see the headline "<headline>"
    And I see "<instruction>"
    And I do not see "Restore All", "Empty Trash", or selection controls

    Examples:
      | tab         | headline               | instruction                                            |
      | Campaigns   | No deleted campaigns   | Deleted campaigns will appear here for 7 days.           |
      | Sessions    | No deleted sessions    | Deleted sessions will appear here for 7 days.            |
      | Scenes      | No deleted scenes      | Deleted scenes will appear here for 7 days.              |
      | Soundscapes | No deleted soundscapes | Deleted soundscapes will appear here for 7 days.         |
      | FX          | No deleted FX          | Deleted FX tracks will appear here for 7 days.           |

  Scenario: Trash shows loading skeletons while items load
    Given the Trash item list has not finished loading
    When I navigate to the Trash screen
    Then I see skeleton card placeholders until the active tab's items load

  Scenario: Trash shows an error with retry when the list fails to load
    Given the Trash list fails to load
    When I navigate to the Trash screen
    Then I see an error message with a retry action

  Scenario: The Trash footer warns about permanent deletion after 7 days
    When I navigate to the Trash screen
    Then I see "Items in Trash are permanently deleted after 7 days. This cannot be undone."
