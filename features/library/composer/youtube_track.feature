@iter5 @youtube-track
Feature: Import track from Youtube

  As a GM
  I want to assign a YouTube track to an intensity level in Category Composer
  So that I can use online-hosted videos in my soundscapes.

  Background:
    Given I am in the Soundscape Category Composer for "Meteorological"

  Scenario: Import YouTube video URL
    When I tap "Add track" on "Level I"
    And I enter YouTube URL "https://www.youtube.com/watch?v=12345"
    And I tap "Import YouTube"
    Then I see "YouTube Video 12345" in the track picker list
    When I check "YouTube Video 12345"
    And I tap "Add Selected (1)"
    Then I see track "YouTube Video 12345" in "Level I"
    And I see a "YouTube" badge next to "YouTube Video 12345"

  Scenario: Toggle Make Offline-Ready on YouTube track
    Given "YouTube Video 12345" is a YouTube track attached to "Level I" in "Meteorological"
    And "YouTube Video 12345" is not offline-ready
    When I tap the "Make Offline-Ready" toggle for "YouTube Video 12345"
    Then the status for "YouTube Video 12345" changes to "Offline Ready"

  Scenario: Disable intensity level if it contains online-only YouTube track (user is offline)
    Given "YouTube Video 12345" is a YouTube track attached to "Level I" in "Meteorological"
    And "YouTube Video 12345" is not offline-ready
    When I go to the Active Scene screen
    And the user is offline
    Then "Level I" button for "Meteorological" is disabled
    And "Level I" button shows a tooltip "Offline playback required. Make YouTube tracks offline-ready in Category Composer."

  Scenario: Enable intensity level if contains online-only YouTube track but user is online
    Given "YouTube Video 12345" is a YouTube track attached to "Level I" in "Meteorological"
    And "YouTube Video 12345" is not offline-ready
    When I go to the Active Scene screen
    And the user is online
    Then "Level I" button for "Meteorological" is enabled
    And "Level I" button shows a tooltip "1 track"

  Scenario: Play track imported from YouTube
    Given "YouTube Video 12345" is a YouTube track attached to "Level I" in "Meteorological"
    And the user is online
    When I go to the Active Scene screen
    And I tap "Play Meteorological"
    Then I see "YouTube Video 12345" playing
