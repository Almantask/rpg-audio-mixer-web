@iter5
Feature: Preview FX track in library

  As a GM
  I want to preview a sound effect in the FX library before adding it to a scene
  So that I can identify the right track without leaving the library.

  Scenario: Tapping the play button on a track row opens the mini player
    Given "Thunder Crack" is in the FX library
    When I tap the play button on the "Thunder Crack" row
    Then the mini player appears at the bottom of the screen
    And "Thunder Crack" begins playing

  Scenario: The mini player shows the currently previewing track name
    Given the mini player is showing after tapping "Wolf Howl"
    Then the mini player displays "Wolf Howl" as the track name

  Scenario: Tapping pause in the mini player stops playback
    Given the mini player is showing and "Thunder Crack" is playing
    When I tap the pause button in the mini player
    Then "Thunder Crack" stops playing
    And the mini player remains visible

  Scenario: The mini player is only visible on the Library screen
    Given the mini player is visible while previewing "Thunder Crack"
    When I navigate to the Scenes tab
    Then the mini player is no longer visible
    And "Thunder Crack" has stopped playing

  Scenario: Previewing a second track replaces the first in the mini player
    Given the mini player is showing "Thunder Crack"
    When I tap the play button on "Wolf Howl"
    Then "Thunder Crack" stops
    And "Wolf Howl" begins playing
    And the mini player updates to show "Wolf Howl"

  Scenario: Switching between Soundscapes and Sound Effects sub-tabs hides the mini player
    Given the mini player is visible while previewing an FX track
    When I tap the Soundscapes tab
    Then the mini player disappears
    And audio playback stops
