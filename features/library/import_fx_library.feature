@iter3
Feature: Import FX to library

  As a GM
  I want to import and acquire FX tracks
  So that I can build my sound effects collection.

  Scenario: Import an audio file as an FX track via the import modal
    Given an audio file "wolf_howl.mp3" is available on my computer
    When I import "wolf_howl.mp3" via Import FX
    Then "wolf_howl.mp3" appears in the FX library card grid
    And a local copy of the file is stored in app storage

  Scenario: Import multiple audio files at once via the import modal
    Given audio files "wolf_howl.mp3" and "thunder_crack.mp3" are available on my computer
    When I import "wolf_howl.mp3" and "thunder_crack.mp3" via Import FX
    Then "wolf_howl.mp3" and "thunder_crack.mp3" appear in the FX library card grid

  Scenario: Free Tracks opens a coming soon modal on the Library page
    Given I am on the Sound Effects tab in the Library
    When I tap "Free Tracks"
    Then I see the free tracks coming soon modal
    And I remain on the Library screen

  Scenario: Buy More opens the store modal on the Library page
    Given I am on the Sound Effects tab in the Library
    When I tap "Buy More"
    Then I see the storefront
    And I remain on the Library screen

  Scenario: Only audio files appear in the FX import file picker
    When I open the FX import file picker
    Then I see the Import FX modal
    And non-audio files such as images, PDFs, and spreadsheets are not shown

  Scenario: An invalid audio file shows an error on import
    Given a file "fake.mp3" with invalid audio content is on my computer
    When I attempt to import "fake.mp3"
    Then I see an error explaining the file could not be read as audio
    And I can dismiss the error and continue using the Library

  Scenario: Deleting the original source file on disk does not break playback
    Given I imported "wolf_howl.mp3" and it appears as "Wolf Howl" in the library
    When the original "wolf_howl.mp3" file is deleted from my computer
    Then "Wolf Howl" still plays correctly from the app's local copy
