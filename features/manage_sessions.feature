@iter2 @iter11
Feature: Manage sessions

  As a GM
  I want to create and organise sessions within a campaign
  So that I can manage each individual play night and its associated scenes.

  Scenario: Add a new session to a campaign
    Given I have a campaign "The Shattered Throne"
    When I open "The Shattered Throne"
    And I tap "Add New Session"
    And I enter the session name "Session 1 – The Dark Arrival"
    And I confirm creation
    Then I see "Session 1 – The Dark Arrival" in the sessions list

  Scenario: Sessions list is empty when a campaign has no sessions
    Given I have a campaign "Empty Campaign" with no sessions
    When I open "Empty Campaign"
    Then I see a centred empty-state illustration with a prompt
    And I see an "Add New Session" button

  Scenario: Multiple sessions appear in the sessions list
    Given I have a campaign "Curse of Strahd" with sessions
      | Session 1 – The Dark Arrival |
      | Session 2 – Castle Ravenloft |
      | Session 3 – The Final Battle |
    When I open "Curse of Strahd"
    Then I see all three sessions in the list

  Scenario: Sessions are sorted by date, most recent first
    Given I have sessions "Session 1" dated last month and "Session 2" dated today
    When I view the sessions list
    Then "Session 2" appears above "Session 1"

  Scenario: Session cover art can be set from an image upload
    Given I am creating a session "Session 2 – Castle Ravenloft"
    When I tap the cover art area
    And I select an image from the browser upload dialog
    Then the selected image is shown as the session's cover art

  Scenario: Tapping a session opens its scene list
    Given I have a campaign with a session "Session 1 – The Dark Arrival"
    When I tap "Session 1 – The Dark Arrival"
    Then I see the scene list for "Session 1 – The Dark Arrival"

  Scenario: Swipe to move a session to the Trash
    Given I have a session "Session 1"
    When I swipe right on the "Session 1" card
    Then "Session 1" is moved to the Trash
    And it is no longer in the sessions list
