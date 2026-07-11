@iter5 @iter11
Feature: Preview FX track in library

  As a GM
  I want to preview a sound effect in the FX library before adding it to a scene
  So that I can identify the right track without leaving the library.

  Scenario: Tapping an FX card body opens the mini player
    Given "Thunder Crack" is in the FX library
    When I tap the "Thunder Crack" card body
    Then the mini player appears at the bottom of the main content area
    And "Thunder Crack" begins playing
    And the "Thunder Crack" card shows a playing preview state

  Scenario: Tapping an FX card thumbnail opens the mini player
    Given "Thunder Crack" is in the FX library
    When I tap the "Thunder Crack" card thumbnail
    Then the mini player appears at the bottom of the main content area
    And "Thunder Crack" begins playing

  Scenario: The mini player shows the previewing track name
    Given "Wolf Howl" is in the FX library
    When I preview "Wolf Howl" from its card
    Then the mini player displays "Wolf Howl" as the track name

  Scenario: Tapping pause in the mini player stops playback
    Given the mini player is showing and "Thunder Crack" is playing
    When I tap the pause button in the mini player
    Then "Thunder Crack" stops playing
    And the mini player remains visible

  Scenario: Tapping play in the mini player resumes preview
    Given the mini player is showing and "Thunder Crack" is paused
    When I tap the play button in the mini player
    Then "Thunder Crack" begins playing again
    And the "Thunder Crack" card shows a playing preview state

  Scenario: Tapping a playing FX card again stops preview
    Given the "Thunder Crack" card is previewing with a playing preview state
    When I tap the "Thunder Crack" card body again
    Then "Thunder Crack" stops playing
    And the "Thunder Crack" card no longer shows a playing preview state

  Scenario: The mini player is only visible on the Library screen
    Given the mini player is visible while previewing "Thunder Crack"
    When I navigate to Scenes
    Then the mini player is no longer visible
    And "Thunder Crack" has stopped playing

  Scenario: Previewing a second track replaces the first in the mini player
    Given the mini player is showing "Thunder Crack"
    When I preview "Wolf Howl" from its card while "Thunder Crack" is playing
    Then "Thunder Crack" stops
    And "Wolf Howl" begins playing
    And the mini player updates to show "Wolf Howl"

  Scenario: Switching from Sound Effects to Soundscapes tab hides the mini player
    Given the mini player is visible while previewing an FX track
    When I switch to the Soundscapes tab in the Library
    Then the mini player disappears
    And audio playback stops
