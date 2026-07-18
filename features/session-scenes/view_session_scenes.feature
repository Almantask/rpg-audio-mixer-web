@iter3
Feature: View session scenes

  As a GM
  I want to see scenes linked to a session
  So that I can pick the right audio for tonight's play.

  Scenario: Session Scenes page shows combined session title and subtitle
    Given I have session "Session 14 – The Howling Crags"
    When I open "Session 14 – The Howling Crags"
    Then I see the page title "Session 14 – The Howling Crags"
    And I see the subtitle "Session Scenes"

  Scenario: Tapping the campaign breadcrumb returns to Campaign Sessions
    Given I am viewing Session Scenes for "Session 1" in campaign "Curse of Strahd"
    When I tap "CURSE OF STRAHD" in the breadcrumb
    Then I see the sessions list for "Curse of Strahd"

  Scenario: Tapping the session breadcrumb stays on Session Scenes
    Given I am viewing Session Scenes for "Session 1" in campaign "Curse of Strahd"
    When I tap "SESSION 1" in the breadcrumb
    Then I am still viewing Session Scenes for "Session 1"
    And I see the subtitle "Session Scenes"

  Scenario: Browser back from Session Scenes returns to Campaign Sessions
    Given I opened "Session 1" from the sessions list for "Curse of Strahd"
    When I use the browser back control
    Then I see the sessions list for "Curse of Strahd"

  Scenario: Session Scenes URL survives a browser refresh
    Given I am viewing Session Scenes for "Session 1" in campaign "Curse of Strahd"
    When I refresh the page
    Then I am still viewing Session Scenes for "Session 1"

  Scenario: A session starts with no scenes linked
    Given I have a session "Session 1 – The Dark Arrival" with no scenes
    When I open that session
    Then I see the empty session scenes state
    And I see a "New Scene" button
    And I see an "Import Scene" button

  Scenario: New Scene and Import Scene appear at the bottom of a populated session scene list
    Given "Tavern" is linked to "Session 1"
    And I am viewing Session Scenes for "Session 1"
    Then I see "New Scene" below the "Tavern" scene row
    And I see "Import Scene" below the "Tavern" scene row
    And "New Scene" appears to the left of "Import Scene"

  Scenario: Session scene cards show soundscape and effect counts
    Given "Tavern" is linked to "Session 1"
    And "Tavern" has 4 soundscape categories and 12 effects
    When I open "Session 1"
    Then the "Tavern" scene card shows "4 SC · 12 FX"

  Scenario: The most recently played scene is pinned first with a Last Active indicator
    Given "Tavern" and "Forest" are linked to "Session 1"
    And I most recently played "Forest" in "Session 1"
    When I open "Session 1"
    Then "Forest" appears above "Tavern" in the session scene list
    And the "Forest" session scene card shows a Last Active indicator
    And the "Tavern" session scene card does not show a Last Active indicator

  Scenario: Non-active linked scenes follow last-played recency order
    Given "Tavern", "Forest", and "Dungeon" are linked to "Session 1"
    And I most recently played "Forest" in "Session 1"
    And I previously played "Dungeon" before "Tavern" in "Session 1"
    When I open "Session 1"
    Then the session scene list appears in order:
      | Forest  |
      | Dungeon |
      | Tavern  |

  Scenario: Session scene list cards have no play control
    Given "Tavern" is linked to "Session 1"
    And I am viewing Session Scenes for "Session 1"
    Then the "Tavern" scene card has no play button
