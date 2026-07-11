@iter7 @iter11 @core
Feature: Home inline preview behavior

  As a GM
  I want Home stat previews to behave predictably
  So that they do not interfere with active play.

  Scenario: Only one Home preview plays at a time
    Given "Ominous Chant" is previewing inline on the Top Soundscape card
    When I tap the preview button on the Top FX card
    Then the Top Soundscape preview stops
    And "Dragon Roar" plays as an inline one-shot preview

  Scenario: Home previews are blocked during Active Scene playback
    Given an Active Scene session is playing "Tavern"
    When I open the Home screen
    Then the preview buttons on the Top Soundscape and Top FX cards are disabled
    And the Active Scene session continues playing "Tavern"

  Scenario: Leaving Home stops any active Home preview
    Given "Ominous Chant" is previewing inline on the Top Soundscape card
    When I tap "Library" in the sidebar
    Then the Top Soundscape preview is no longer playing

  Scenario: Home preview does not show a bottom mini player
    Given "Dragon Roar" is shown in the Top FX card
    When I tap the preview button on the Top FX card
    Then I do not see a bottom mini player on the Home screen

  Scenario: Home stat sections reflect missing play history
    Given I have at least one campaign
    And no soundscape categories have been played yet
    And no soundboard effects have been played yet
    When I open the Home screen
    Then the Top Soundscape section shows "No soundscapes played yet"
    And the Top FX section shows "No sound effects played yet"
