Feature: View Credits

  As a GM
  I want to tap the gear icon to reach the Credits screen
  So that I can find support links, the app version, and contributor information.

  @iter0
  Scenario: The gear icon is visible on every screen
    Given I am on the Home screen
    Then I see the gear icon in the top bar

  @iter0
  Scenario: Tapping the gear icon from any screen navigates to Credits
    Given I am on the Campaigns screen
    When I tap the gear icon
    Then I see the "Behind the Screen" heading on the Credits screen

  @iter8
  Scenario: The Credits screen contains a link to the Vault of Echoes
    When I open the Credits screen
    Then I see the "VAULT OF ECHOES" button

  @iter8
  Scenario: Tapping VAULT OF ECHOES opens the Trash screen
    Given I am on the Credits screen
    When I tap "VAULT OF ECHOES"
    Then I am navigated to the "Vault of Echoes" (Trash) screen

  @iter0
  Scenario: The Credits screen shows the app version
    When I open the Credits screen
    Then I see the app version number

  @iter0
  Scenario: The Credits screen shows a documentation link
    When I open the Credits screen
    Then I see the documentation link

  @iter0
  Scenario: Tapping the back arrow from Credits returns to the previous screen
    Given I navigated to Credits from the Scenes screen
    When I tap the back arrow
    Then I am back on the Scenes screen