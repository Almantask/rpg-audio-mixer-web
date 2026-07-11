@iter0 @iter8 @iter11
Feature: View Credits screen

  As a GM
  I want to browse app info and legal resources on the Credits screen
  So that I can review licensing and app details.

  Scenario: The Credits screen shows the page header
    When I open the Credits screen
    Then I see the "Credits" heading
    And I see the subtitle "App info, support links, and community."
    And I see the "Support" section heading
    And I see the "Community" section heading
    And I see the "Legal" section heading

  Scenario: The Credits screen shows legal links
    When I open the Credits screen
    Then I see a link to the Terms of Service
    And I see a link to the Privacy Policy
    And I see a link to Attributions

  Scenario Outline: In-app legal links navigate in the same tab
    When I tap "<link>" on the Credits screen
    Then I see the "<page>" page

    Examples:
      | link             | page             |
      | Terms of Service | Terms of Service |
      | Privacy Policy   | Privacy Policy   |
      | Attributions     | Attributions     |

  Scenario: The Credits screen footer shows copyright and version
    When I open the Credits screen
    Then I see the copyright year and app version in the footer
