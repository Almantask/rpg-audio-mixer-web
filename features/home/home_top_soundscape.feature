@iter7 @iter11 @core
Feature: Home Top Soundscape stat

  As a GM
  I want to see my most played soundscape category on Home
  So that I can preview it without opening the Library.

  # Scope: empty-state copy for missing play history — see home_preview_behavior.feature.

  Scenario: Top Soundscape shows this GM's all-time most played soundscape category
    Given "Ominous Chant" is my most played soundscape category with 42 plays
    When I open the Home screen
    Then I see the "Top Soundscape" section
    And I see "Ominous Chant" in the Top Soundscape card
    And I see "42 PLAYS" on the Top Soundscape card
    And I see "SOUNDSCAPE" and "LOOPABLE" badges on the Top Soundscape card

  Scenario: Tapping play on Top Soundscape previews that category inline
    Given "Ominous Chant" is shown in the Top Soundscape card
    When I tap the preview button on the Top Soundscape card
    Then the Top Soundscape category begins playing as an inline preview
    And I see a progress bar on the Top Soundscape card

  Scenario: Top Soundscape preview can be paused
    Given "Ominous Chant" is previewing inline on the Top Soundscape card
    When I tap the preview button on the Top Soundscape card
    Then the Top Soundscape preview is paused

  Scenario: Top Soundscape preview can be resumed after pausing
    Given "Ominous Chant" is previewing inline on the Top Soundscape card
    And the Top Soundscape preview is paused
    When I tap the preview button on the Top Soundscape card
    Then the Top Soundscape category resumes playing as an inline preview

  Scenario: Top Soundscape preview plays the category default track
    Given "Ominous Chant" is my most played soundscape category
    And "Ominous Chant" has a designated default loopable track
    When I open the Home screen
    And I tap the preview button on the Top Soundscape card
    Then the Top Soundscape category default track plays as an inline preview

  Scenario: Top Soundscape preview plays the first loopable track when no default is set
    Given "Ominous Chant" is my most played soundscape category
    And "Ominous Chant" has loopable tracks but no designated default
    When I open the Home screen
    And I tap the preview button on the Top Soundscape card
    Then the first loopable track in "Ominous Chant" plays as an inline preview

  Scenario: Home preview does not increment play counts
    Given "Ominous Chant" is shown in the Top Soundscape card with 42 plays
    When I tap the preview button on the Top Soundscape card
    Then I still see "42 PLAYS" on the Top Soundscape card

  Scenario: Top Soundscape empty state links to the Library
    Given I have at least one campaign
    And no soundscape categories have been played yet
    When I open the Home screen
    And I tap the Library link on the Top Soundscape card
    Then I see the Library screen
