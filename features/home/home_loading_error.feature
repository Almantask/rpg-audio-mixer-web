@iter7 @iter11 @core
Feature: Home loading and error states

  As a GM
  I want clear feedback when Home data is loading or unavailable
  So that I know whether cached content is stale or missing.

  Scenario: Home loading shows skeleton placeholders
    Given Home screen data is still loading
    When I open the Home screen
    Then I see skeleton placeholders for the Active Campaigns hero
    And I see skeleton placeholders for the Top Soundscape card
    And I see skeleton placeholders for the Top FX card

  Scenario: Home shows an error overlay when all data fails to load
    Given Home screen data fails to load with no cached content
    When I open the Home screen
    Then I see a scrollable error overlay with a semi-transparent backdrop
    And I do not see campaign or stat card content on the Home screen

  Scenario: Home shows an error overlay while partial cached data remains visible
    Given Home screen data fails to load
    And cached hero and stat card data is available
    When I open the Home screen
    Then I see a scrollable error overlay with a semi-transparent backdrop
    And I still see the cached Active Campaigns hero
    And I still see cached Top Soundscape and Top FX cards when available

  Scenario: Home offline shows cached data with a stale indicator
    Given I am offline
    And cached Home screen data is available
    When I open the Home screen
    Then I see the cached Active Campaigns hero
    And I see cached Top Soundscape and Top FX cards when available
    And I see a stale or offline indicator on the Home screen
