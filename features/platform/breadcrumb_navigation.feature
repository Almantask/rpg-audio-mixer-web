@iter0 @iter11
Feature: Breadcrumb and back navigation

  As a GM
  I want breadcrumbs and back controls to reflect my place in the app
  So that I can return to the previous screen predictably.

  Scenario: Session Scenes shows an uppercase breadcrumb trail
    Given I am viewing the Session Scenes list for session 2 of "Curse of Strahd"
    Then I see the breadcrumb "CAMPAIGN > CURSE OF STRAHD > SESSION 2"

  Scenario: Active Scene in session context shows an uppercase breadcrumb trail
    Given I am on the Active Scene for "Tavern" in session 2 of "Curse of Strahd"
    Then I see the breadcrumb "CAMPAIGN > CURSE OF STRAHD > SESSION 2"

  Scenario: Campaign Sessions has no explicit back link to Active Campaigns
    Given I am on the Sessions list for "Curse of Strahd"
    Then I do not see a "← Active Campaigns" back link

  Scenario: Category Composer shows a back link to Library
    Given I am editing a soundscape category in the Category Composer
    Then I see a "← Library" back link

  Scenario: Category Composer back link returns to Library
    Given I am editing a soundscape category in the Category Composer
    When I tap "← Library"
    Then I see the Library screen

  Scenario: The back control returns to the previous screen
    Given I navigated from Scenes to the Active Scene for "Tavern"
    When I tap the back control
    Then I am back on the Scenes screen
