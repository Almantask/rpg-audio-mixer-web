@iter10
Feature: System audio handling

  As a GM
  I want the app to handle OS-level audio focus, background playback, and lock screen controls gracefully
  So that my campaign audio does not clash with system events and can be controlled quickly.

  Scenario: Audio focus loss pauses all sounds immediately
    Given the app is playing a soundscape and a soundboard effect
    When the device receives a system audio interruption (e.g., an incoming phone call or alarm)
    Then all playing audio in the app pauses immediately
    And the app visually reflects the paused state on the active playing cards
    
  Scenario: Audio pauses during a phone call and resumes automatically if under 3 minutes
    Given the app is playing audio loops on the Active Scene screen
    When an incoming phone call interrupts the app for 2 minutes
    Then all playing audio in the app pauses immediately
    When the phone call ends and focus is regained
    Then the previously playing loops and soundscapes resume automatically
    
  Scenario: Audio remains paused after a long phone call (over 3 minutes)
    Given the app is playing audio loops on the Active Scene screen
    When an incoming phone call interrupts the app for 4 minutes
    Then all playing audio in the app pauses immediately
    When the phone call ends and focus is regained
    Then the app remains paused
    And requires a manual play to resume the soundscape
    
  Scenario: App plays in background when minimized
    Given the app is playing audio loops on the Active Scene screen
    When I minimize the app to view my notes in another app
    Then the audio continues to play seamlessly in the background

  Scenario: Media controller appears on lock screen and notification shade
    Given the app is playing a soundscape loop
    When I lock the device
    Then the lock screen displays a media player for Arcanum Audio
    And it shows the currently playing scene and master track information

  Scenario: Media controller and Bluetooth remotes have play/pause and next track functionality
    Given the media controller or a Bluetooth remote is active
    When I tap pause
    Then the app audio pauses
    When I tap "Next" on the lock screen or a Bluetooth remote
    Then the app triggers the d20 randomization logic for the active scene
    And a random track plays from the currently prominent category pool
