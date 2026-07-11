@iter0 @iter11
Feature: Sidebar navigation

  As a GM
  I want to use the sidebar to switch between the main sections of the app
  So that I can move quickly between Home, Campaign, Scenes, Library, Credits, and Trash.

  Scenario: The app shell shows Arcanum Audio and primary navigation
    When I open the app
    Then I see "Arcanum Audio" in the top bar
    And I do not see a settings or gear icon in the top bar
    And I see the sidebar with items:
      | Home     |
      | Campaign |
      | Scenes   |
      | Library  |
      | Credits  |
      | Trash    |
    And "Credits" and "Trash" appear in the primary sidebar list without a secondary grouping or divider

  Scenario: The profile footer shows a static avatar placeholder only
    When I open the app
    Then I see a static avatar placeholder in the sidebar footer
    And tapping the avatar placeholder does not navigate anywhere

  Scenario Outline: Sidebar navigates to the correct screen
    Given I am on the <starting_screen>
    When I tap "<item>" in the sidebar
    Then I see the <screen>

    Examples:
      | starting_screen | item     | screen                                      |
      | Library screen  | Home     | Home screen with the active campaign hero   |
      | Home screen     | Campaign | Active Campaigns screen                     |
      | Home screen     | Scenes   | Scenes screen                               |
      | Home screen     | Library  | Library screen                              |
      | Home screen     | Trash    | "Trash" screen title                        |

  Scenario: Tapping Credits shows the Credits screen
    Given I am on the Home screen
    When I tap "Credits" in the sidebar
    Then I see the "Credits" screen title
    And I do not see "Behind the Screen" or Arcane Settings copy

  Scenario: The active sidebar item is visually highlighted
    Given I am on the Scenes screen
    Then the "Scenes" sidebar item appears highlighted in gold
    And the other sidebar items appear inactive

  Scenario: Credits sidebar item highlights on the Credits screen
    Given I am on the Credits screen
    Then the "Credits" sidebar item appears highlighted in gold

  Scenario: Trash sidebar item highlights on the Trash screen
    Given I am on the Trash screen
    Then the "Trash" sidebar item appears highlighted in gold

  Scenario: Campaign session drill-down keeps Home highlighted in the sidebar
    Given I am viewing the Session Scenes list for "Curse of Strahd"
    Then the "Home" sidebar item appears highlighted in gold
    And the "Campaign" sidebar item does not appear highlighted

  Scenario: Active Scene opened from the global Scenes list keeps Scenes highlighted
    Given I am on the Scenes screen
    When I open the Active Scene for "Tavern"
    Then the "Scenes" sidebar item appears highlighted in gold

  Scenario: The hamburger menu reveals the sidebar on narrow viewports
    Given the viewport is narrow enough to collapse the sidebar
    When I tap the hamburger menu in the top bar
    Then the sidebar becomes visible

  Scenario: The hamburger menu hides the sidebar on narrow viewports
    Given the viewport is narrow enough to collapse the sidebar
    And the sidebar is visible
    When I tap the hamburger menu in the top bar
    Then the sidebar is hidden
