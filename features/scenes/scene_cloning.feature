@iter10
Feature: Scene cloning

  As a GM
  I want to duplicate an existing scene
  So that I can use it as a starting point for a similar scene with all its configuration.

  Background:
    Given a scene named "Forest Night" exists
    And "Forest Night" has the description "A moonlit woodland path"
    And "Forest Night" has cover image "forest-night.jpg"
    And "Forest Night" has "Owl Hooting" soundscape category at Volume 80%
    And "Forest Night" has "Thunder" sound effect at Volume 50%
    And "Forest Night" has "Nature" tag

  Scenario: Duplicating a scene creates a copy with one tap
    When I tap the duplicate icon on the "Forest Night" scene card
    Then I see the "Copy of Forest Night" scene in Scenes
    And no duplicate-name dialog is shown

  Scenario: Duplicating a scene copies all configuration
    Given I have duplicated the "Forest Night" scene
    Then the "Copy of Forest Night" scene has "Owl Hooting" at Volume 80%
    And the "Copy of Forest Night" scene has "Thunder" sound effect
    And the "Copy of Forest Night" scene has "Nature" tag
    And the "Copy of Forest Night" scene has the description "A moonlit woodland path"
    And the "Copy of Forest Night" scene has cover image "forest-night.jpg"

  Scenario: Duplicated scene is independent of the original
    Given I have duplicated the "Forest Night" scene
    When I add "Wind" to the "Copy of Forest Night" soundscape categories
    Then the original "Forest Night" scene does not contain "Wind"

  Scenario: Modifying a duplicate does not affect the source
    Given I have duplicated the "Forest Night" scene
    When I change "Owl Hooting" Volume to 10% on "Copy of Forest Night"
    Then the "Forest Night" scene still has "Owl Hooting" at Volume 80%

  # F-17 / F-SS-01 / F-SS-05 — Session Scenes entry point: clone parity + auto-link
  Scenario: Duplicating from Session Scenes creates a Copy of scene with one tap
    Given "Forest Night" is linked to "Session 1"
    And I am viewing Session Scenes for "Session 1"
    When I tap the duplicate icon on the "Forest Night" session scene card
    Then I see "Copy of Forest Night" in "Session 1"
    And no duplicate-name dialog is shown

  Scenario: Duplicating from Session Scenes auto-links the copy and keeps it global
    Given "Forest Night" is linked to "Session 1"
    And I am viewing Session Scenes for "Session 1"
    When I tap the duplicate icon on the "Forest Night" session scene card
    Then I see "Copy of Forest Night" in "Session 1"
    And I see the "Copy of Forest Night" scene in Scenes

  Scenario: Duplicating from Session Scenes copies full configuration
    Given "Forest Night" is linked to "Session 1"
    And I am viewing Session Scenes for "Session 1"
    When I tap the duplicate icon on the "Forest Night" session scene card
    Then the "Copy of Forest Night" scene has "Owl Hooting" at Volume 80%
    And the "Copy of Forest Night" scene has "Thunder" sound effect
    And the "Copy of Forest Night" scene has "Nature" tag
    And the "Copy of Forest Night" scene has the description "A moonlit woodland path"
    And the "Copy of Forest Night" scene has cover image "forest-night.jpg"

  Scenario: A Session Scenes duplicate is independent of the original
    Given "Forest Night" is linked to "Session 1"
    And I am viewing Session Scenes for "Session 1"
    When I tap the duplicate icon on the "Forest Night" session scene card
    And I add "Wind" to the "Copy of Forest Night" soundscape categories
    Then the original "Forest Night" scene does not contain "Wind"
