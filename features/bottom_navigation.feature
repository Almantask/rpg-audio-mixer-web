@iter0
Feature: Bottom navigation

  As a GM
  I want to use the bottom navigation bar to switch between the main sections of the app
  So that I can move quickly between Home, Campaigns, Scenes, and Library.

  Scenario: The bottom navigation bar has four tabs
    When I open the app
    Then I see four tabs: HOME, CAMPAIGNS, SCENES, and LIBRARY

  Scenario: Tapping the HOME tab shows the Home screen
    Given I am on the Library screen
    When I tap the HOME tab
    Then I see the Home screen

  Scenario: Tapping the CAMPAIGNS tab shows the Campaigns list
    Given I am on the Home screen
    When I tap the CAMPAIGNS tab
    Then I see the Campaigns list screen

  Scenario: Tapping the SCENES tab shows the SCENES tab screen
    Given I am on the Home screen
    When I tap the SCENES tab
    Then I see the SCENES tab screen

  Scenario: Tapping the LIBRARY tab shows the Audio Library
    Given I am on the Home screen
    When I tap the LIBRARY tab
    Then I see the Audio Library screen

  Scenario: The active tab is visually highlighted
    Given I am on the SCENES tab
    Then the SCENES tab icon appears highlighted in gold
    And the other three tabs appear inactive


