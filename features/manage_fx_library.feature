@iter5
Feature: Manage FX library

  As a GM
  I want to import, view, and edit sound effects in the FX library
  So that I can build and maintain a personal collection of one-shot audio clips.

  Scenario: Import an audio file as an FX track with Scoped Storage permission granted
    Given I am on Android 13 or higher
    And the app has been granted "READ_MEDIA_AUDIO" permission
    And an audio file "wolf_howl.mp3" is available in the device's Media Store
    When I tap "Import FX"
    And I select "wolf_howl.mp3" from the file picker
    Then "wolf_howl.mp3" appears in the FX library

  Scenario: Import an audio file fails when Scoped Storage permission is denied
    Given I am on Android 13 or higher
    And the app has been denied "READ_MEDIA_AUDIO" permission
    When I tap "Import FX"
    Then I see a permission request dialog for audio access
    And if I deny the permission, I see a message explaining why the permission is needed for imports

  Scenario: Import an audio file as an FX track on legacy Android versions
    Given I am on Android 12 or lower
    And the app has been granted "READ_EXTERNAL_STORAGE" permission
    And an audio file "wolf_howl.mp3" is available on my device
    When I tap "Import FX"
    And I select "wolf_howl.mp3" from the file picker
    Then "wolf_howl.mp3" appears in the FX library

  Scenario: Download free demo FX tracks
    Given I am on the FX Library screen
    When I tap "Get Demo FX"
    Then I see a loading spinner
    And 100 free FX tracks are downloaded and added to my library
    And the "Get Demo FX" button disappears

  Scenario: Only audio files appear in the FX import file picker
    When I open the FX import file picker
    Then non-audio files such as images, PDFs, and spreadsheets are not shown

  Scenario: An invalid audio file shows an error on import
    Given a file "fake.mp3" with invalid audio content is on my device
    When I attempt to import "fake.mp3"
    Then I see an error message that the file could not be read as audio

  Scenario: Multiple FX tracks appear in the library list
    Given I have imported "Wolf Howl", "Thunder Crack", "Door Creak"
    When I open the Sound Effects tab
    Then I see all three tracks in the list

  Scenario: FX library is empty before any sounds are imported
    Given I have not imported any FX tracks
    When I open the Sound Effects tab
    Then I see a Large Material 3 icon with a prompt
    And I see an "Import FX" button

  Scenario: Tapping the edit icon on an FX track opens the edit screen
    Given "Wolf Howl" is in the FX library
    When I tap the edit (pencil) icon on "Wolf Howl"
    Then I see the edit screen for "Wolf Howl" with fields for Name and Tags

  Scenario: The FX edit screen uses a direct pencil icon
    Given "Wolf Howl" is in the FX library
    When I view the "Wolf Howl" row
    Then I see a pencil icon instead of a three-dot menu

  Scenario: Edit the name of an FX track
    Given I am on the edit screen for "wolf_howl.mp3"
    When I change the name to "Wolf Howl"
    And I save
    Then the track appears as "Wolf Howl" in the FX library

  Scenario: Add tags to an FX track
    Given I am on the edit screen for "Wolf Howl"
    When I add the tag "Combat" from the predefined list
    And I save
    Then "Wolf Howl" shows the "Combat" tag chip in the library

  Scenario: Delete an FX track
    Given I am on the edit screen for "Wolf Howl"
    When I tap "Delete"
    Then "Wolf Howl" is moved to the Trash
    And it is no longer visible in the FX library

  Scenario: Soft-deleting an FX track temporarily removes it from scenes that used it
    Given "Wolf Howl" is assigned to the "Forest Ambush" scene's soundboard
    When I tap "Delete" on "Wolf Howl" in the FX library
    Then "Wolf Howl" no longer appears in the "Forest Ambush" soundboard
