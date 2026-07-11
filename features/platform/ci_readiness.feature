@iter1 @iter11
Feature: CI hardware compatibility

  As a Developer or CI Pipeline
  I want the app to use the real Web Audio stack even in CI environments
  So that automated tests run on the same engine as production.

  Scenario: Real Audio Stack is used in CI with virtual audio output
    Given I am running on a CI environment with a virtual audio output device
    When I launch the app
    Then the real audio stack is initialized for playback
    And I play a soundscape
    Then audio processing is verified through the production audio pipeline
    And the app remains fully functional (UI remains responsive, playback states update correctly)

  Scenario: Media Session API is registered when playback starts
    Given I am on the Active Scene screen with a soundscape playing
    Then the browser Media Session API reports playback state as playing
    And the session metadata includes the active scene name
