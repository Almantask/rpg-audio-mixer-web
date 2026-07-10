@iter0 @iter8 @iter11
Feature: View Arcane Settings

  As a GM
  I want to reach Arcane Settings from the gear icon or sidebar
  So that I can find support links, recovery tools, community portals, and app information.

  @iter0
  Scenario: The gear icon is visible on every screen
    Given I am on the Current Session dashboard
    Then I see the gear icon in the top bar

  @iter0
  Scenario: Tapping the gear icon from any screen navigates to Arcane Settings
    Given I am on the Active Campaigns screen
    When I tap the gear icon
    Then I see the "Behind the Screen" heading on the Arcane Settings screen

  @iter0
  Scenario: Arcane Settings is reachable from the sidebar
    When I tap "Arcane Settings" in the sidebar
    Then I see the "Behind the Screen" heading

  @iter8
  Scenario: The Necromancy Protocol card links to the Vault of Echoes
    When I open the Arcane Settings screen
    Then I see the "Necromancy Protocol" card
    When I tap "Restore Recent Deletes"
    Then I am navigated to the "Vault of Echoes" screen

  @iter8
  Scenario: The Vault is also reachable directly from the sidebar
    When I tap "Vault" in the sidebar
    Then I am navigated to the "Vault of Echoes" screen

  @iter0
  Scenario: The Arcane Settings screen shows the app version
    When I open the Arcane Settings screen
    Then I see the app version number

  @iter0
  Scenario: The Arcane Settings screen shows community portal links
    When I open the Arcane Settings screen
    Then I see a link to the Discord community
    And I see a link to support email
    And I see a link to the GitHub repository
    And I see a link to patch notes

  @iter0
  Scenario: The Arcane Settings screen shows legal links
    When I open the Arcane Settings screen
    Then I see a link to the Terms of Service
    And I see a link to the Privacy Policy
    And I see a link to Attributions

  @iter0
  Scenario: Tapping the back control from Arcane Settings returns to the previous screen
    Given I navigated to Arcane Settings from Ambience Presets
    When I tap the back control
    Then I am back on the Ambience Presets screen
