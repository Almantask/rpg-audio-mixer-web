@iter3
Feature: Demo scene descriptions

  As a GM exploring the demo campaign
  I want The Ancient Gate and Bonfire talk to show distinct guidance
  So that I understand how each demo scene is meant to be mixed.

  Scenario: Demo session scenes show distinct guidance descriptions
    Given a scene named "The Ancient Gate" exists
    And the "The Ancient Gate" scene has the description "Don't play all ambiences at once — try different ones separately."
    And a scene named "Bonfire talk" exists
    And the "Bonfire talk" scene has the description "A mix of ambiences intended to be played all at once to create a relaxing mood."
    And "The Ancient Gate" is linked to "Session 1"
    And "Bonfire talk" is linked to "Session 1"
    When I open "Session 1"
    Then the "The Ancient Gate" session scene card shows the description "Don't play all ambiences at once — try different ones separately."
    And the "Bonfire talk" session scene card shows the description "A mix of ambiences intended to be played all at once to create a relaxing mood."
