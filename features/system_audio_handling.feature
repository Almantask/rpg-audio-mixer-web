@iter10 @iter11
Feature: System audio handling

  As a GM
  I want the app to handle browser audio focus, background playback, and media controls gracefully
  So that my campaign audio does not clash with system events and can be controlled quickly.

  Scenario: Audio focus loss pauses all sounds immediately
    Given the app is playing a soundscape and a soundboard effect
    When the browser receives an audio interruption (e.g., another tab takes exclusive audio focus)
    Then all playing audio in the app pauses immediately
    And the app visually reflects the paused state on the active playing cards

  Scenario: Audio pauses during a short interruption and resumes automatically if under 3 minutes
    Given the app is playing audio loops on the Active Scene screen
    When an audio interruption lasts for 2 minutes
    Then all playing audio in the app pauses immediately
    When audio focus is regained
    Then the previously playing loops and soundscapes resume automatically

  Scenario: Audio remains paused after a long interruption (over 3 minutes)
    Given the app is playing audio loops on the Active Scene screen
    When an audio interruption lasts for 4 minutes
    Then all playing audio in the app pauses immediately
    When audio focus is regained
    Then the app remains paused
    And requires a manual play to resume the soundscape

  Scenario: App continues playing when the tab is in the background
    Given the app is playing audio loops on the Active Scene screen
    When I switch to another browser tab
    Then the audio continues to play seamlessly in the background

  Scenario: Media Session controls appear when playback is active
    Given the app is playing a soundscape loop
    When I view the browser media controls (OS media overlay or browser media hub)
    Then the media controls display a player for Arcanum Audio
    And they show the currently playing scene and master track information

  Scenario: Media Session controls have play/pause and next track functionality
    Given the Media Session controls are active
    When I tap pause
    Then the app audio pauses
    When I tap "Next" on the media controls or a keyboard media key
    Then the app triggers the d20 randomization logic for the active scene
    And a random track plays from the currently prominent category pool
