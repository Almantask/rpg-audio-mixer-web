@iter7 @iter11 @core
Feature: Home screen

  As a GM
  I want the Home screen to show my current campaign, top atmosphere category, and legendary soundboard action
  So that I can jump back into my game at a glance without deep navigation.

  Scenario: Home shows the most recently played campaign
    Given I have played "Shadows of the Underdark" most recently
    When I open the Home screen
    Then I see "Shadows of the Underdark" in the Active Campaigns hero
    And I see an "Enter Domain" button

  Scenario: Enter Domain navigates to the active campaign's sessions
    Given "Shadows of the Underdark" is the active campaign
    When I tap "Enter Domain"
    Then I see the sessions list for "Shadows of the Underdark"

  Scenario: Top Atmosphere shows the globally most played soundscape category
    Given "Ominous Chant" is the most played soundscape category globally with 42 plays
    When I open the Home screen
    Then I see "Ominous Chant" in the Top Atmosphere card
    And I see "42 PLAYS" on the Top Atmosphere card
    And I see ambience type badges on the Top Atmosphere card

  Scenario: Tapping play on Top Atmosphere previews that category inline
    Given "Ominous Chant" is shown in the Top Atmosphere card
    When I tap the play button on the Top Atmosphere card
    Then the Top Atmosphere category begins playing as an inline preview

  Scenario: Legendary Action shows the globally most played soundboard effect
    Given "Dragon Roar" is the most played soundboard effect globally with 128 casts
    When I open the Home screen
    Then I see "Dragon Roar" in the Legendary Action card
    And I see "128 CASTS" on the Legendary Action card
    And I see FX type badges on the Legendary Action card

  Scenario: Tapping play on Legendary Action previews that effect inline
    Given "Dragon Roar" is shown in the Legendary Action card
    When I tap the play button on the Legendary Action card
    Then "Dragon Roar" plays as an inline one-shot preview

  Scenario: Home shows an empty state when no campaigns exist
    Given I have no campaigns
    When I open the Home screen
    Then the Active Campaigns hero shows a prompt to create or open a campaign
    And the Top Atmosphere section is not shown
    And the Legendary Action section is not shown

  Scenario: Top Atmosphere shows a placeholder when no categories have been played yet
    Given no soundscape categories have been played yet
    When I open the Home screen
    Then the Top Atmosphere section shows "No atmospheres played yet"

  Scenario: Legendary Action shows a placeholder when no effects have been cast yet
    Given no soundboard effects have been triggered yet
    When I open the Home screen
    Then the Legendary Action section shows "No effects cast yet"
