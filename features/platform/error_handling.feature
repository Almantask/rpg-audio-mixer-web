@iter11
Feature: Error handling

  As a GM
  I want runtime errors displayed in a consistent, non-destructive overlay
  So that I understand what went wrong without losing my current playback or navigation state.

  Scenario: A playback failure shows a scrollable error overlay
    Given a scene references an audio file that cannot be found in app storage
    When I attempt to play that track
    Then I see a scrollable error overlay with a semi-transparent backdrop
    And the overlay shows a descriptive error message
    And I see a dismiss button labelled "Close"

  Scenario: Dismissing an error overlay does not stop other playing audio
    Given "Weather" is playing successfully
    And a soundboard effect fails to load
    When the error overlay appears
    And I dismiss the error overlay
    Then "Weather" continues playing
    And I remain on the Active Scene screen

  Scenario: A save failure shows an error overlay without losing unsaved edits
    Given I have unsaved changes in the Category Composer
    When saving fails due to a storage error
    Then I see a scrollable error overlay describing the save failure
    And my unsaved composer changes remain visible after I dismiss the overlay

  Scenario: A partial Home data failure shows an overlay without hiding available content
    Given the active campaign hero loaded successfully
    And the Top Soundscape stat failed to load
    When the Home screen finishes loading
    Then I see the active campaign hero
    And I see a scrollable error overlay describing the stat failure

  Scenario: An error overlay does not navigate away from the current screen
    Given I am on the Active Scene screen for "Tavern"
    And a soundboard effect fails to load
    When the error overlay appears
    Then I remain on the Active Scene screen for "Tavern"

  Scenario: A second error replaces the current error overlay
    Given a soundboard effect fails to load
    And the error overlay is visible
    When a soundscape category fails to load
    Then I see a scrollable error overlay describing the soundscape failure
    And I do not see the previous soundboard error message
