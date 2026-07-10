@iter5
@core
Feature: Home screen

  As a GM
  I want to see my active campaign, last scene, and top tracks on the Home screen
  So that I can jump back into my game quickly without navigating.

  Scenario: Home screen shows the most recently played campaign
    Given I have played "Curse of Strahd" most recently
    When I open the Home screen
    Then I see "Curse of Strahd" as the active campaign

  Scenario: ENTER DOMAIN navigates to the active campaign's sessions
    Given "Curse of Strahd" is the active campaign
    When I tap "ENTER DOMAIN"
    Then I see the sessions list for "Curse of Strahd"

  Scenario: Resume Journey shows the last opened scene
    Given the last opened scene in the active campaign was "The Foyer"
    When I open the Home screen
    Then I see "The Foyer" in the Resume Journey card

  Scenario: ENTER opens the scene from the Resume Journey card
    Given "The Foyer" is shown in the Resume Journey card
    When I tap "ENTER" in the Resume Journey card
    Then I see the Active Scene screen for "The Foyer"
    And playback begins with a 2-3s fade-in using Cubic mapping

  Scenario: Top Atmosphere shows the all-time most played loopable track
    Given "Tavern Warmth" is the most played loopable track globally
    When I open the Home screen
    Then I see "Tavern Warmth" in the Top Atmosphere card

  Scenario: Legendary Action shows the all-time most played FX track
    Given "Thunder Crack" is the most played FX globally
    When I open the Home screen
    Then I see "Thunder Crack" in the Legendary Action card

  Scenario: Home screen shows an empty state when no campaigns exist
    Given I have no campaigns
    When I open the Home screen
    Then the active campaign area shows a prompt to create a campaign
    And the Resume Journey card is not shown
