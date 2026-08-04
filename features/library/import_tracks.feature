@iter12
Feature: Import soundscape tracks from Library Tracks tab

  As a GM
  I want to import local files and YouTube sources from the Tracks tab
  So that I can grow my soundscape track catalogue where those tracks live.

  Scenario: Tracks tab exposes an Import control for local and YouTube sources
    Given I am on the Tracks tab in the Library
    Then I see an Import control for local files and YouTube

  Scenario: Import a local audio file from the Tracks tab
    Given an audio file "thunderous_downpour.mp3" is available on my computer
    And I am on the Tracks tab in the Library
    When I import "thunderous_downpour.mp3" via Import on the Tracks tab
    Then "Thunderous Downpour" appears in the Tracks tab grid

  Scenario: Import a YouTube video from the Tracks tab
    Given I am on the Tracks tab in the Library
    When I import YouTube URL "https://www.youtube.com/watch?v=12345" via Import on the Tracks tab
    Then "YouTube Video 12345" appears in the Tracks tab grid

  Scenario: Import a YouTube playlist from the Tracks tab as one catalogue entry
    Given I am on the Tracks tab in the Library
    When I import YouTube playlist URL "https://www.youtube.com/playlist?list=PL6789" via Import on the Tracks tab
    Then "YouTube Playlist (PL6789)" appears as one track card in the Tracks tab grid

  Scenario: An invalid local audio file shows an error on import
    Given a file "fake.mp3" with invalid audio content is on my computer
    And I am on the Tracks tab in the Library
    When I attempt to import "fake.mp3" via Import on the Tracks tab
    Then I see an error explaining the file could not be read as audio
    And I can dismiss the error and continue using the Library

  Scenario: An invalid YouTube URL shows an error on import
    Given I am on the Tracks tab in the Library
    When I attempt to import YouTube URL "not-a-valid-youtube-url" via Import on the Tracks tab
    Then I see an error explaining the YouTube URL could not be imported
    And I can dismiss the error and continue using the Library
