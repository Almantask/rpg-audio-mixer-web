@iter9 @iter11
Feature: Screen transitions

  As a GM
  I want smooth, consistent animated transitions between screens
  So that the app feels cohesive and polished during play.

  # Hierarchical Resume expand animation is owned by home_screen.feature (Resume hero scenarios).

  @iter9
  Scenario: Lateral sidebar navigation animates content in and out
    Given I am on the Home screen
    When I tap "Scenes" in the sidebar
    Then the Home content fades and slides out horizontally
    And the Scenes screen fades and slides in horizontally

  @iter9
  Scenario: Modal and sheet presentation animates scale and fade
    Given I am on the Active Scene screen for "Tavern"
    When I tap "Add Soundscape"
    Then the outgoing screen fades out and scales up slightly
    And the Add Soundscape modal fades in and scales up from slightly smaller

  @iter9
  Scenario: Lateral navigation to Scenes does not block interaction
    Given I am on the Home screen
    When I tap "Scenes" in the sidebar
    Then I can interact with the Scenes screen content immediately after the transition completes

  @iter9
  Scenario: The mini player slides up on entrance
    Given no mini player is visible
    When I tap preview on an FX track
    Then the mini player slides up smoothly from the bottom of the main content area

  @iter9
  Scenario: Closing the mini player animates it away
    Given the mini player is visible
    When I tap the close button
    Then the mini player slides down smoothly to disappear

  @iter9
  Scenario: Navigating away dismisses the mini player with animation
    Given the mini player is visible
    When I navigate away from the current screen
    Then the mini player slides down smoothly to disappear
