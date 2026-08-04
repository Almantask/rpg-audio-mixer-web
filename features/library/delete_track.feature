@iter12
Feature: Delete soundscape track from Library

  As a GM
  I want to soft-delete soundscape tracks from the Library Tracks tab
  So that I can discard unwanted sources and recover them from Trash if needed.

  Scenario Outline: Soft-deleting an unused track moves it to Trash Tracks without confirmation
    Given "<track>" is an unused track in the Tracks tab grid
    When I <action>
    Then I am not asked to confirm the delete
    And "<track>" is moved to the Trash Tracks tab
    And "<track>" is no longer in the Tracks tab grid

    Examples:
      | track                | action                                          |
      | Thunderous Downpour  | trash "Thunderous Downpour" from its track card |
      | Forest Ambience      | trash "Forest Ambience" from its track card     |

  Scenario: Soft-deleting a YouTube playlist removes the whole playlist entry
    Given YouTube playlist "YouTube Playlist (PL6789)" is unused in the Tracks tab grid
    When I trash "YouTube Playlist (PL6789)" from its track card
    Then "YouTube Playlist (PL6789)" is moved to the Trash Tracks tab
    And "YouTube Playlist (PL6789)" is no longer in the Tracks tab grid

  Scenario: Trashing a track used in categories requires confirmation with impact
    Given "Thunderous Downpour" is attached to "Level I" in "Weather"
    And "Thunderous Downpour" is attached to "Level II" in "Interior"
    And I am on the Tracks tab in the Library
    When I trash "Thunderous Downpour" from its track card
    Then I see a confirmation that shows the usage impact for "Weather" and "Interior"

  Scenario: Confirming in-use trash detaches the track then soft-deletes it
    Given "Thunderous Downpour" is attached to "Level I" in "Weather"
    And I am on the Tracks tab in the Library
    When I trash "Thunderous Downpour" from its track card
    And I confirm the in-use delete
    Then "Thunderous Downpour" is detached from every intensity level that referenced it
    And "Thunderous Downpour" is moved to the Trash Tracks tab
    And "Thunderous Downpour" is no longer in the Tracks tab grid
    And category "Weather" still exists

  Scenario: Canceling in-use trash leaves the track and attachments intact
    Given "Thunderous Downpour" is attached to "Level I" in "Weather"
    And "Thunderous Downpour" is attached to "Level II" in "Interior"
    And I am on the Tracks tab in the Library
    When I trash "Thunderous Downpour" from its track card
    And I cancel the in-use delete confirmation
    Then "Thunderous Downpour" remains in the Tracks tab grid
    And "Thunderous Downpour" remains attached to "Level I" in "Weather"
    And "Thunderous Downpour" remains attached to "Level II" in "Interior"

  Scenario: Trashing a playlist that occupies an intensity level warns about playlist-as-level impact
    Given YouTube playlist "YouTube Playlist (PL6789)" occupies "Level I" in "Weather"
    And I am on the Tracks tab in the Library
    When I trash "YouTube Playlist (PL6789)" from its track card
    Then I see a confirmation that warns the playlist occupies an intensity level
    And "YouTube Playlist (PL6789)" remains in the Tracks tab grid
    And "YouTube Playlist (PL6789)" remains attached to "Level I" in "Weather"

  Scenario: Confirming in-use playlist trash detaches then soft-deletes it
    Given YouTube playlist "YouTube Playlist (PL6789)" occupies "Level I" in "Weather"
    And I am on the Tracks tab in the Library
    When I trash "YouTube Playlist (PL6789)" from its track card
    And I confirm the in-use delete
    Then "YouTube Playlist (PL6789)" is detached from "Level I" in "Weather"
    And "YouTube Playlist (PL6789)" is moved to the Trash Tracks tab
    And "YouTube Playlist (PL6789)" is no longer in the Tracks tab grid

  Scenario: Soft-deleted tracks are excluded from the Track Picker
    Given "Thunderous Downpour" is in the Trash Tracks tab
    And I am in the Soundscape Category Composer for "Weather"
    When I open the Track Picker for "Level I"
    Then I do not see "Thunderous Downpour" in the picker grid
