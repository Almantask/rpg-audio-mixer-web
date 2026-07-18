@iter2
Feature: Create session

  As a GM
  I want to add sessions to a campaign
  So that I can track each play night.

  Scenario: Add a new session to a campaign
    Given I have a campaign "The Shattered Throne" with no sessions
    When I add a new session named "The Dark Arrival" to "The Shattered Throne"
    Then I see session "Session 1" named "The Dark Arrival" in the sessions list

  Scenario: New session creation dialog shows defaults
    Given I have a campaign "The Shattered Throne" with no sessions
    When I open the new session dialog from "The Shattered Throne"
    Then I see "Session 1" as the read-only session number in the creation dialog
    And the session date defaults to today

  Scenario: A future session date is allowed when creating a session
    Given I am creating a session in "The Shattered Throne"
    When I set the session date to a future date
    And I enter the session name "Pre-planned Finale"
    And I confirm creation
    Then I see the new session in the sessions list
    And the new session card shows the chosen future date

  Scenario: Session cover art can be set from an image upload
    Given I am creating a session named "Castle Ravenloft" in "Curse of Strahd"
    When I tap the cover art area
    And I upload cover art for the session
    Then the selected image is shown as the session's cover art

  Scenario: An optional description can be added to a session
    Given I am creating a session named "The Dark Arrival" in "The Shattered Throne"
    When I enter an optional description "The party arrives at Barovia"
    And I confirm creation
    Then the "The Dark Arrival" session card shows the description snippet

  Scenario: Cancelling session creation leaves the list unchanged
    Given I have a campaign "The Shattered Throne" with no sessions
    When I open the new session dialog from "The Shattered Throne"
    And I enter the session name "Abandoned Night"
    And I cancel session creation
    Then I see the empty sessions list for "The Shattered Throne"
    And I do not see a session named "Abandoned Night"

  Scenario: Session creation requires a name
    Given I am creating a session in "The Shattered Throne"
    When I leave the session name empty
    And I attempt to confirm creation
    Then I see a validation error for the session name
    And the session is not added to the list

  Scenario: A failed session create shows an error without changing the list
    Given I have a campaign "Curse of Strahd" with no sessions
    And creating a session will fail
    When I add a new session named "Broken Night" to "Curse of Strahd"
    Then I see an error message
    And I do not see "Broken Night" in the sessions list
