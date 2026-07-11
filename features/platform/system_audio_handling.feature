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

  @audio-boundary
  Scenario: Audio pauses during a short interruption and resumes automatically if under 3 minutes
    Given the app is playing audio loops on the Active Scene screen
    When an audio interruption lasts for 2 minutes
    Then all playing audio in the app pauses immediately
    When audio focus is regained
    Then the previously playing loops and soundscapes resume automatically

  @audio-boundary
  Scenario: Audio resumes automatically when interruption ends just under 3 minutes
    Given the app is playing audio loops on the Active Scene screen
    When an audio interruption lasts for 3 minutes
    Then all playing audio in the app pauses immediately
    When audio focus is regained
    Then the previously playing loops and soundscapes resume automatically

  @audio-boundary
  Scenario: Audio remains paused after interruption exceeds 3 minutes
    Given the app is playing audio loops on the Active Scene screen
    When an audio interruption lasts for 3 minutes and 1 second
    Then all playing audio in the app pauses immediately
    When audio focus is regained
    Then the app remains paused
    And requires a manual play to resume the soundscape

  @audio-boundary
  Scenario: Audio remains paused after a long interruption
    Given the app is playing audio loops on the Active Scene screen
    When an audio interruption lasts for 4 minutes
    Then all playing audio in the app pauses immediately
    When audio focus is regained
    Then the app remains paused
    And requires a manual play to resume the soundscape

  Scenario: App continues playing when the tab is in the background
    Given the app is playing audio loops on the Active Scene screen
    When I switch to another browser tab
    Then the soundscape loops continue playing without interruption

  Scenario: Media Session controls appear when playback is active
    Given the app is playing a soundscape loop
    When I view the browser media controls (OS media overlay or browser media hub)
    Then the media controls display a player for Arcanum Audio
    And they show the currently playing scene and master track information

  Scenario: Media Session pause stops app audio
    Given the Media Session controls are active
    When I tap pause on the media controls
    Then the app audio pauses

  Scenario: Media Session next plays a random track from the active category
    Given the Media Session controls are active
    And the app is playing a soundscape from the "Weather" category at intensity level II
    When I tap "Next" on the media controls or a keyboard media key
    Then the app plays a random track from the active category at its current intensity level
