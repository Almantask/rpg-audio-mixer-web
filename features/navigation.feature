@iter0 @iter11
Feature: Navigation

  As a GM
  I want to use the sidebar to switch between the main sections of the app
  So that I can move quickly between Home, Campaign, Scenes, and Library.

  Scenario: The app shell shows Arcanum Audio and primary navigation
    When I open the app
    Then I see "Arcanum Audio" in the top bar
    And I see the sidebar with items:
      | Home     |
      | Campaign |
      | Scenes   |
      | Library  |

  Scenario: Tapping Home shows the home dashboard
    Given I am on the Library screen
    When I tap "Home" in the sidebar
    Then I see the Home screen with the active campaign hero

  Scenario: Tapping Campaign shows the campaigns list
    Given I am on the Home screen
    When I tap "Campaign" in the sidebar
    Then I see the Active Campaigns screen

  Scenario: Tapping Scenes shows the global scenes list
    Given I am on the Home screen
    When I tap "Scenes" in the sidebar
    Then I see the Scenes screen

  Scenario: Tapping Library shows the audio library
    Given I am on the Home screen
    When I tap "Library" in the sidebar
    Then I see the Library screen

  Scenario: The active sidebar item is visually highlighted
    Given I am on the Scenes screen
    Then the "Scenes" sidebar item appears highlighted in gold
    And the other sidebar items appear inactive

  Scenario: The gear icon navigates to Arcane Settings from any screen
    Given I am on the Scenes screen
    When I tap the gear icon in the top bar
    Then I see the "Behind the Screen" heading on the Arcane Settings screen

  Scenario: Enter Domain on Home navigates to the active campaign's sessions
    Given "Curse of Strahd" is the active campaign on the Home screen
    When I tap "Enter Domain"
    Then I see the sessions list for "Curse of Strahd"

  Scenario: The sidebar has exactly four primary items
    When I open the app
    Then the sidebar contains only "Home", "Campaign", "Scenes", and "Library"

  Scenario: The hamburger menu toggles the sidebar on narrow viewports
    Given the viewport is narrow enough to collapse the sidebar
    When I tap the hamburger menu in the top bar
    Then the sidebar becomes visible
    When I tap the hamburger menu again
    Then the sidebar is hidden

  Scenario: The back control returns to the previous screen
    Given I navigated from Scenes to the Active Scene for "Tavern"
    When I tap the back control
    Then I am back on the Scenes screen
