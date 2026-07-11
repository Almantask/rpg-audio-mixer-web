@iter7 @core @iter11
Feature: Play scene

  As a GM
  I want to open and play scenes
  So that I can provide the right audio atmosphere for a specific moment in my game.

  Scenario: Tapping a scene card opens the scene without starting playback
    Given I have a scene "Tavern" with soundscape categories
    When I tap the "Tavern" scene card
    Then I see the Active Scene screen for "Tavern"
    And no audio is playing

  Scenario: Tapping the play button on a scene card opens the scene and starts playback
    Given I have a scene "Tavern" with soundscape categories
    When I tap the play button on the "Tavern" scene card
    Then I see the Active Scene screen for "Tavern"
    And the scene's soundscapes begin playing with a fade-in

  Scenario: Switching from one scene to another crossfades the audio
    Given "Tavern" is the current playing scene
    When I navigate back to Scenes
    And I tap the play button on the "Forest" scene card
    Then the "Tavern" audio fades out while the "Forest" audio fades in simultaneously
    And there should be no dip in perceived volume during the crossfade

  Scenario: Opening a scene without the play button does not stop the currently playing scene
    Given "Tavern" is the current playing scene
    When I navigate back to Scenes
    And I tap the "Forest" scene card (not the play button)
    Then I see the Active Scene screen for "Forest"
    And "Forest" audio is not playing
    And "Tavern" audio continues playing in the background

  Scenario: Sliders snap instantly to their saved positions when a scene loads
    Given "Tavern" has a saved Master Volume value of 70%
    When I open the "Tavern" scene
    Then the Master Volume slider is immediately at 70% with no animation

  Scenario: Soundscape volume ducks when soundboard effect is triggered
    Given "Tavern" is playing with soundscapes at "100%" volume
    When I trigger the "Lightning" sound effect from the soundboard
    Then the soundscape volume should duck to "40%"
    And when the "Lightning" sound effect finishes
    Then the soundscape volume should smoothly restore to "100%"
