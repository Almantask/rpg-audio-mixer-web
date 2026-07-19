@iter5 @youtube-playlist
Feature: Import playlist from youtube

  As a GM
  I want to assign a YouTube playlist to an intensity level in Category Composer
  So that scene playback randomly picks from the playlist when that intensity is active.

  Background:
    Given I am in the Soundscape Category Composer for "Meteorological"

  Scenario: Import YouTube playlist URL with Keep Linked choice
    When I tap "Add track" on "Level I"
    And I enter YouTube URL "https://www.youtube.com/playlist?list=PL6789"
    And I tap "Import YouTube"
    Then I see the "Attach YouTube Playlist" dialog
    When I tap "Keep linked to YouTube (Live-linked)"
    Then I see "YouTube Playlist (PL6789)" in the track picker list
    When I check "YouTube Playlist (PL6789)"
    And I tap "Add Selected (1)"
    Then I see track "YouTube Playlist (PL6789)" in "Level I"
    And I see a "YouTube" badge next to "YouTube Playlist (PL6789)"
    And I see a "Playlist" badge next to "YouTube Playlist (PL6789)"

  Scenario: Enable intensity level if playlist is offline-ready and user is offline
    Given "YouTube Playlist (PL6789)" is a YouTube track attached to "Level I" in "Meteorological"
    And "YouTube Playlist (PL6789)" is offline-ready
    When I go to the Active Scene screen
    And the user is offline
    Then "Level I" button for "Meteorological" is enabled
    And "Level I" button shows a tooltip "1 track"

  Scenario: Play playlist imported from YouTube
    Given "YouTube Playlist (PL6789)" is a YouTube track attached to "Level I" in "Meteorological"
    And the user is online
    When I go to the Active Scene screen
    And I tap "Play Meteorological"
    Then I see "Playlist Video A (PL678)", "Playlist Video B (PL678)", or "Playlist Video C (PL678)" playing
