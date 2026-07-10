@iter7 @iter11 @core
Feature: Current Session dashboard

  As a GM
  I want to see my active campaign, recent scenes, and top atmospheres on the Current Session dashboard
  So that I can jump back into my game quickly without deep navigation.

  Scenario: Current Session shows the most recently played campaign
    Given I have played "Curse of Strahd" most recently
    When I open the Current Session dashboard
    Then I see "Curse of Strahd" as the active campaign

  Scenario: Enter Domain navigates to the active campaign's sessions
    Given "Curse of Strahd" is the active campaign
    When I tap "Enter Domain"
    Then I see the sessions list for "Curse of Strahd"

  Scenario: Resume Journey shows recently opened scenes
    Given the active campaign has recently opened scenes "The Foyer" and "Sunken Temple"
    When I open the Current Session dashboard
    Then I see "The Foyer" in the Resume Journey section
    And I see "Sunken Temple" in the Resume Journey section

  Scenario: Tapping a Resume Journey card opens the scene with playback
    Given "The Foyer" is shown in the Resume Journey section
    When I tap the play button on "The Foyer" in Resume Journey
    Then I see the Active Scene screen for "The Foyer"
    And playback begins with a 2-3s fade-in using Cubic mapping

  Scenario: Top Atmospheres shows the globally most played loopable tracks
    Given "Ominous Fog", "Dripping Cave", and "Tavern Hearth" are the top three most played loopable tracks globally
    When I open the Current Session dashboard
    Then I see "Ominous Fog" in the Top Atmospheres list
    And I see "Dripping Cave" in the Top Atmospheres list
    And I see "Tavern Hearth" in the Top Atmospheres list

  Scenario: Tapping play on a Top Atmospheres row previews that track inline
    Given "Ominous Fog" is shown in the Top Atmospheres list
    When I tap the play button on the "Ominous Fog" row
    Then "Ominous Fog" begins playing as an inline preview

  Scenario: Current Session shows an empty state when no campaigns exist
    Given I have no campaigns
    When I open the Current Session dashboard
    Then the active campaign area shows a prompt to create or open a campaign
    And the Resume Journey section is not shown

  Scenario: Resume Journey shows a placeholder when no scenes have been played yet
    Given I have a campaign but have not opened any scenes
    When I open the Current Session dashboard
    Then the Resume Journey section shows a placeholder prompting me to open a scene

  Scenario: Top Atmospheres shows a placeholder when no tracks have been played yet
    Given no loopable tracks have been played yet
    When I open the Current Session dashboard
    Then the Top Atmospheres section shows "No atmospheres played yet"
