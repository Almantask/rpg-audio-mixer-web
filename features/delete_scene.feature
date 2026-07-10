@iter3
Feature: Delete scene

  As a GM
  I want to delete scenes I no longer need
  So that I can keep my scene list organized.

  Scenario: Swiping a scene moves it to the Trash
    Given I have created a scene named "Old Scene"
    When I swipe right on the "Old Scene" card
    Then "Old Scene" is moved to the Trash
    And I do not see "Old Scene" in my scenes list

  Scenario: Deleted scene is removed from the list but others remain
    Given I have created scenes named
      | Scene A |
      | Scene B |
    When I swipe right on the "Scene A" card
    Then "Scene A" is moved to the Trash
    And I still see "Scene B" in my scenes list

  Scenario: Deleting a scene does not affect other scenes
    Given I have created scenes named
      | Scene A |
      | Scene B |
      | Scene C |
    When I swipe right on the "Scene B" card
    Then I have 2 scenes
