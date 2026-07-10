@iter10
Feature: Scene cloning

  As a GM
  I want to clone an existing scene
  So that I can use it as a starting point for a similar scene with all its configuration.

  Background:
    Given I have a scene "Forest Night"
    And "Forest Night" has "Owl Hooting" soundscape category at MIX 80%
    And "Forest Night" has "Thunder" sound effect at MIX 50%
    And "Forest Night" has "Nature" tag

  Scenario: Cloning a scene duplicates all configuration
    When I clone the "Forest Night" scene as "Forest Storm"
    Then I see the "Forest Storm" scene in my scenes list
    And the "Forest Storm" scene should have "Owl Hooting" at MIX 80%
    And the "Forest Storm" scene should have "Thunder" sound effect
    And the "Forest Storm" scene should have "Nature" tag

  Scenario: Cloned scene is independent of the original
    Given I have cloned the "Forest Night" scene as "Forest Storm"
    When I add "Wind" to the "Forest Storm" soundscape categories
    Then the original "Forest Night" scene should not contain "Wind"

  Scenario: Modifying a clone does not affect the source
    Given I have cloned the "Forest Night" scene as "Forest Storm"
    When I change "Owl Hooting" MIX to 10% on "Forest Storm"
    Then the "Forest Night" scene should still have "Owl Hooting" at MIX 80%
