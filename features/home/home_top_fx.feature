@iter7 @iter11 @core
Feature: Home Top FX stat

  As a GM
  I want to see my most played soundboard effect on Home
  So that I can preview it without opening the Library.

  Scenario: Top FX shows this GM's all-time most played soundboard effect
    Given "Dragon Roar" is my most played soundboard effect with 128 plays
    When I open the Home screen
    Then I see the "Top FX" section
    And I see "Dragon Roar" in the Top FX card
    And I see "128 PLAYS" on the Top FX card
    And I see "FX" and "SUDDEN" badges on the Top FX card

  Scenario: Tapping play on Top FX previews that effect inline
    Given "Dragon Roar" is shown in the Top FX card
    When I tap the preview button on the Top FX card
    Then "Dragon Roar" plays as an inline one-shot preview
    And I see a progress bar on the Top FX card

  Scenario: Tapping preview on Top FX toggles play and pause
    Given "Dragon Roar" is previewing inline on the Top FX card
    When I tap the preview button on the Top FX card
    Then the Top FX preview is paused
    When I tap the preview button on the Top FX card again
    Then "Dragon Roar" resumes playing as an inline one-shot preview

  Scenario: Top FX empty state links to the Library
    Given I have at least one campaign
    And no soundboard effects have been played yet
    When I open the Home screen
    And I tap the Library link on the Top FX card
    Then I see the Library screen
    And I do not see the Scenes screen
