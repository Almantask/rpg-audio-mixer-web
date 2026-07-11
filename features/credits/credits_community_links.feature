@iter0 @iter8 @iter11
Feature: Credits community links

  As a GM
  I want community portal links on the Credits screen
  So that I can find help and project resources.

  Scenario: The Credits screen shows community portal links
    When I open the Credits screen
    Then I see a link to the Discord community
    And I see a link to support email
    And I see a link to the GitHub repository
    And I see a link to patch notes

  Scenario Outline: Community portal links open in a new browser tab
    When I tap the "<link>" link on the Credits screen
    Then the link opens in a new browser tab

    Examples:
      | link              |
      | Discord           |
      | Support Email     |
      | GitHub Repository |
      | Patch Notes       |
