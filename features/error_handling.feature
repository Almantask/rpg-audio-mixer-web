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
    And I see a dismiss button labelled "Close" or "OK"

  Scenario: Dismissing an error overlay does not stop other playing audio
    Given "Weather" is playing successfully
    And a soundboard effect fails to load
    When the error overlay appears
    And I tap "Close" on the error overlay
    Then "Weather" continues playing
    And I remain on the Active Scene screen

  Scenario: A save failure shows an error overlay without losing unsaved edits
    Given I have unsaved changes in the Category Composer
    When saving fails due to a storage error
    Then I see a scrollable error overlay describing the save failure
    And my unsaved composer changes remain visible after I dismiss the overlay
