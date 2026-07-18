@iter3
Feature: Create scene from Session Scenes

  As a GM
  I want to create a new scene from Session Scenes
  So that it is ready for tonight's play without a separate import step.

  # F-22 / F-SS-04 — New Scene control placement and create-dialog parity
  # F-23 / F-SS-05 — auto-link into the current session

  Scenario: New Scene appears to the left of Import Scene on a populated list
    Given "Tavern" is linked to "Session 1"
    And I am viewing Session Scenes for "Session 1"
    Then I see a "New Scene" button
    And I see an "Import Scene" button
    And "New Scene" appears to the left of "Import Scene"

  Scenario: New Scene appears to the left of Import Scene in the empty state
    Given I have a session "Session 1" with no scenes
    When I open that session
    Then I see the empty session scenes state
    And I see a "New Scene" button
    And I see an "Import Scene" button
    And "New Scene" appears to the left of "Import Scene"

  Scenario: New Scene opens the same create dialog as the global Scenes list
    Given I have a session "Session 1" with no scenes
    And I am viewing Session Scenes for "Session 1"
    When I open the New Scene dialog from Session Scenes
    Then I see the New Scene create dialog
    And I see a required "Scene name" field
    And I see an optional "Scene description" field
    And I see an optional "Background image" field
    And I do not see a tags field

  Scenario: Creating a scene from Session Scenes auto-links it into the session
    Given I have a session "Session 1" with no scenes
    And I am viewing Session Scenes for "Session 1"
    When I create a new scene named "Tavern" from Session Scenes via the New Scene dialog
    Then I remain on Session Scenes for "Session 1"
    And I see "Tavern" in "Session 1"
    And I see the "Tavern" scene in Scenes
