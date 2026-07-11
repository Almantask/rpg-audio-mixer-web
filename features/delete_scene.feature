@iter3 @iter11
Feature: Delete scene

  As a GM
  I want to delete scenes I no longer need
  So that I can keep Scenes organized.

  Scenario: Swiping a scene moves it to the Vault
    Given I have created a scene named "Old Scene"
    When I swipe right on the "Old Scene" card
    Then "Old Scene" is moved to the Vault of Echoes
    And I do not see "Old Scene" in Scenes

  Scenario: Deleted scene is removed from the list but others remain
    Given I have created scenes named
      | Scene A |
      | Scene B |
    When I swipe right on the "Scene A" card
    Then "Scene A" is moved to the Vault of Echoes
    And I still see "Scene B" in Scenes

  Scenario: Deleting a scene does not affect other scenes
    Given I have created scenes named
      | Scene A |
      | Scene B |
      | Scene C |
    When I swipe right on the "Scene B" card
    Then I have 2 scenes
