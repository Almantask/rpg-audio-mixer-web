@iter2
Feature: Edit session

  As a GM
  I want to update session details
  So that names, dates, and cover art stay accurate.

  Scenario: Editing a session updates its details and re-sorts the list
    Given I have session "Session 1" in "Curse of Strahd" with:
      | name             | date  | description              |
      | The Dark Arrival | today | The party enters Barovia |
    When I edit session "Session 1" with:
      | name              | date      | description                  |
      | The Dark Departure | yesterday | The party leaves the village |
    And I upload new cover art for the session
    Then I see "Session 1" named "The Dark Departure" in the sessions list
    And the session card shows the updated cover art
    And the session card shows "The party leaves the village" as the description snippet
    And "Session 1" appears above older sessions in the list

  Scenario: A failed session save shows an error without changing the list
    Given I have session "Session 1" in "Curse of Strahd"
    And saving a session edit will fail
    When I am on the Campaign Sessions screen for "Curse of Strahd"
    And I tap Edit on the "Session 1" card
    And I change the session name to "Broken Save"
    And I confirm the edit
    Then I see an error message
    And "Session 1" still appears unchanged in the sessions list
