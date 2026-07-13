@iter9
Feature: Screen transitions

  As a GM
  I want smooth, consistent animated transitions between screens
  So that the app feels cohesive and polished during play.

  # Hierarchical Resume expand animation is owned by home_active_campaign.feature (Resume hero scenarios).

  Scenario: Lateral sidebar navigation animates content in and out
    Given I am on the Home screen
    When I tap "Scenes" in the sidebar
    Then I see the Scenes screen
    And the Home screen content is no longer visible
    And I can interact with the Scenes screen immediately after the transition completes

  Scenario: Modal and sheet presentation animates scale and fade
    Given I am on the Active Scene screen for "Tavern"
    When I open the Add Soundscape picker modal
    Then I see the Add Soundscape picker modal
    And the transition completes without blocking interaction

  Scenario: The mini player slides up on entrance
    Given no mini player is visible
    When I tap preview on an FX track
    Then the mini player appears at the bottom of the main content area
    And the transition completes without blocking interaction

  Scenario: Closing the mini player animates it away
    Given the mini player is visible while previewing an FX track
    When I tap the close button
    Then the mini player is no longer visible
    And the transition completes without blocking interaction

  Scenario: Navigating away dismisses the mini player with animation
    Given the mini player is visible while previewing an FX track
    When I navigate away from the current screen
    Then the mini player is no longer visible
    And the transition completes without blocking interaction
