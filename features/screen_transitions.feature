@iter9
Feature: Screen transitions

  As a GM
  I want smooth, consistent animated transitions between screens
  So that the app feels cohesive and polished during play.

  @iter9
  Scenario: Hierarchical navigation uses Container Transform
    Given I am on the Campaigns screen
    When I tap on a campaign card to open its Sessions list
    Then the campaign card expands smoothly to fill the screen background
    And the top and bottom navigation bars remain fixed

  @iter9
  Scenario: Lateral navigation uses Shared X-Axis slide
    Given I am on the Home tab
    When I tap the Campaigns tab in the bottom bar
    Then the Home screen fades and slides out horizontally
    And the Campaigns screen fades and slides in horizontally from the right

  @iter9
  Scenario: Drill-down navigation uses Shared Z-Axis
    Given I am on any main screen
    When I tap the settings gear to open the Credits
    Then the outgoing screen fades out and scales up slightly
    And the Credits screen fades in and scales up from slightly smaller

  @iter9
  Scenario: Transitions are fast and do not block interaction
    When a screen transition occurs
    Then the incoming screen becomes interactive within a short time

  @iter9
  Scenario: The mini player uses Shared Y-Axis animation on entrance
    Given no mini player is visible
    When I tap preview on an FX track
    Then the mini player slides up smoothly from the bottom navigation bar

  @iter9
  Scenario: The mini player uses Shared Y-Axis animation on exit
    Given the mini player is visible
    When I tap the close button or navigate away
    Then the mini player slides down smoothly to disappear


