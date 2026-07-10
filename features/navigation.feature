@iter0 @iter11
Feature: Navigation

  As a GM
  I want to use the sidebar to switch between the main sections of the app
  So that I can move quickly between Current Session, Sound Library, Global Mixer, Ambience Presets, and Vault.

  Scenario: The app shell shows Arcanum Audio and primary navigation
    When I open the app
    Then I see "Arcanum Audio" in the top bar
    And I see the sidebar with items:
      | Current Session  |
      | Sound Library    |
      | Global Mixer     |
      | Ambience Presets |
      | Vault            |
      | Arcane Settings  |

  Scenario: Tapping Current Session shows the home dashboard
    Given I am on the Sound Library screen
    When I tap "Current Session" in the sidebar
    Then I see the Current Session dashboard with the active campaign hero

  Scenario: Tapping Sound Library shows the sound library
    Given I am on the Current Session dashboard
    When I tap "Sound Library" in the sidebar
    Then I see the Sound Library screen

  Scenario: Tapping Global Mixer opens the Category Composer
    Given I am on the Current Session dashboard
    When I tap "Global Mixer" in the sidebar
    Then I see the Category Composer screen

  Scenario: Tapping Ambience Presets shows the global scenes list
    Given I am on the Current Session dashboard
    When I tap "Ambience Presets" in the sidebar
    Then I see the Atmospheric Scenes screen

  Scenario: Tapping Vault shows the Vault of Echoes
    Given I am on the Current Session dashboard
    When I tap "Vault" in the sidebar
    Then I see the "Vault of Echoes" screen

  Scenario: The active sidebar item is visually highlighted
    Given I am on the Ambience Presets screen
    Then the "Ambience Presets" sidebar item appears highlighted in gold
    And the other sidebar items appear inactive

  Scenario: The gear icon navigates to Arcane Settings from any screen
    Given I am on the Ambience Presets screen
    When I tap the gear icon in the top bar
    Then I see the "Behind the Screen" heading on the Arcane Settings screen

  Scenario: Enter Domain navigates to the active campaign's sessions
    Given "Curse of Strahd" is the active campaign on the Current Session dashboard
    When I tap "Enter Domain"
    Then I see the sessions list for "Curse of Strahd"

  Scenario: Campaigns are reached from Current Session not a top-level tab
    When I open the app
    Then I do not see a bottom navigation bar with HOME, CAMPAIGNS, SCENES, and LIBRARY tabs

  Scenario: The hamburger menu toggles the sidebar on narrow viewports
    Given the viewport is narrow enough to collapse the sidebar
    When I tap the hamburger menu in the top bar
    Then the sidebar becomes visible
    When I tap the hamburger menu again
    Then the sidebar is hidden

  Scenario: The back control returns to the previous screen
    Given I navigated from Ambience Presets to the Active Scene for "Tavern"
    When I tap the back control
    Then I am back on the Ambience Presets screen
