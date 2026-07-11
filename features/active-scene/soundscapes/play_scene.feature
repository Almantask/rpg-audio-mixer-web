@iter7 @core @iter11
Feature: Play scene

  As a GM
  I want to open and play scenes
  So that I can provide the right audio atmosphere for a specific moment in my game.

  Scenario: Tapping a scene card opens the scene without starting playback
    Given I have a scene "Tavern" with soundscape categories
    When I tap the "Tavern" scene card
    Then I see the Active Scene screen for "Tavern"
    And no soundscape audio is playing

  Scenario: Play Scene on the Active Scene screen starts idle categories from their intensity pools
    Given I have opened the "Tavern" scene on the Active Scene — Soundscapes tab
    And the "Weather" and "Interior" categories are configured but idle
    When I tap "Play Scene"
    Then a random track from each category's current intensity pool begins playing
    And both category cards show the playing state

  Scenario: Play Scene resumes paused categories without re-rolling
    Given I have opened the "Tavern" scene on the Active Scene — Soundscapes tab
    And the "Weather" category was playing "Light Rain" and is now paused
    And the "Interior" category is idle
    When I tap "Play Scene"
    Then "Light Rain" resumes in the "Weather" category
    And a random track from the "Interior" category's current intensity pool begins playing

  Scenario: Play Scene leaves already playing categories unchanged
    Given I have opened the "Tavern" scene on the Active Scene — Soundscapes tab
    And the "Weather" category is playing "Thunderstorm"
    And the "Interior" category is idle
    When I tap "Play Scene"
    Then "Thunderstorm" continues playing in the "Weather" category
    And a random track from the "Interior" category's current intensity pool begins playing

  Scenario: Play Scene does nothing when all categories are already playing
    Given I have opened the "Tavern" scene on the Active Scene — Soundscapes tab
    And the "Weather" category is playing "Thunderstorm"
    And the "Interior" category is playing "Crackling Fire"
    When I tap "Play Scene"
    Then "Thunderstorm" continues playing in the "Weather" category
    And "Crackling Fire" continues playing in the "Interior" category

  Scenario: Play Scene does not start categories with empty intensity pools
    Given I have opened the "Tavern" scene on the Active Scene — Soundscapes tab
    And the "Weather" and "Interior" categories are configured but idle
    And the "Dungeon" category is idle with no tracks at its current Intensity Level
    When I tap "Play Scene"
    Then a random track from each available category's current intensity pool begins playing
    And no track begins playing in the "Dungeon" category

  Scenario: Switching to another scene crossfades audio between scenes
    Given "Tavern" is the current playing scene
    When I switch from the "Tavern" scene to the "Forest" scene
    Then the "Tavern" audio fades out while the "Forest" audio fades in simultaneously
