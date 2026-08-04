@iter12
Feature: Browse soundscape tracks in Library

  As a GM
  I want to browse soundscape source tracks in a Library Tracks tab
  So that I can see my catalogue without opening Category Composer.

  Scenario: Library shows three equal tabs including Tracks
    Given I am on the Library screen
    Then I see tabs "Soundscapes", "Sound Effects", and "Tracks"
    And the "Tracks" tab is equal in prominence to "Soundscapes" and "Sound Effects"

  Scenario: Opening the Tracks tab deep link lands on Tracks
    Given I open the Library with the Tracks tab deep link
    Then I am on the Tracks tab in the Library

  Scenario: Tracks tab shows all active soundscape tracks including bundled
    Given the soundscape library has bundled track "Forest Ambience"
    And I have imported local track "Thunderous Downpour"
    And I have imported YouTube video "YouTube Video 12345"
    When I open the Tracks tab in the Library
    Then I see track cards for "Forest Ambience", "Thunderous Downpour", and "YouTube Video 12345"

  Scenario: Tracks tab does not show FX tracks or soundscape categories
    Given "Wolf Howl" is in the FX library
    And I have created category "Weather"
    And I have imported local track "Thunderous Downpour"
    When I open the Tracks tab in the Library
    Then I see the "Thunderous Downpour" track card
    And I do not see "Wolf Howl" on the Tracks tab
    And I do not see "Weather" on the Tracks tab

  Scenario: Wide Library layout shows three track cards per row
    Given I have imported tracks "Alpha Rain", "Beta Wind", "Gamma Storm", and "Delta Fire"
    And the Library is in its wide desktop layout
    When I open the Tracks tab in the Library
    Then the Tracks tab grid shows three track cards per row

  Scenario: Local track cards show name, duration, and format when available
    Given local track "Thunderous Downpour" is in the soundscape library with duration 1:20 and format "MP3"
    When I open the Tracks tab in the Library
    Then the "Thunderous Downpour" track card shows the title "Thunderous Downpour"
    And the "Thunderous Downpour" track card shows a local source cue
    And the "Thunderous Downpour" track card shows duration "1:20"
    And the "Thunderous Downpour" track card shows format "MP3"

  Scenario: YouTube video track cards show name and YouTube cue
    Given YouTube video "YouTube Video 12345" is in the soundscape library with duration 3:05
    When I open the Tracks tab in the Library
    Then the "YouTube Video 12345" track card shows the title "YouTube Video 12345"
    And the "YouTube Video 12345" track card shows a YouTube source cue
    And the "YouTube Video 12345" track card shows duration "3:05"

  Scenario: YouTube playlist is one catalogue card with playlist cue and video count
    Given YouTube playlist "YouTube Playlist (PL6789)" is in the soundscape library with 12 videos
    When I open the Tracks tab in the Library
    Then I see one "YouTube Playlist (PL6789)" track card
    And the "YouTube Playlist (PL6789)" track card shows a playlist cue
    And the "YouTube Playlist (PL6789)" track card shows video count 12

  Scenario: Tracks tab shows skeleton cards while loading
    Given the soundscape tracks library data has not yet resolved
    When I open the Tracks tab in the Library
    Then I see skeleton placeholder cards in the grid

  Scenario: Tracks tab is empty before any soundscape tracks exist
    Given the soundscape library has no tracks
    When I open the Tracks tab in the Library
    Then I see a centred empty-state explaining that soundscape tracks will appear here
    And I see an Import control as the next step

  Scenario: Track cards expose a trash control
    Given "Thunderous Downpour" is in the soundscape library
    When I open the Tracks tab in the Library
    Then the "Thunderous Downpour" track card exposes a trash control

  Scenario: Tracks browse cards have no scene-picker checkboxes
    Given "Thunderous Downpour" is in the soundscape library
    When I open the Tracks tab in the Library
    Then the "Thunderous Downpour" track card has no checkbox
