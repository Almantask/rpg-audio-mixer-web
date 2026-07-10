@iter1
Feature: CI hardware compatibility

  As a Developer or CI Pipeline
  I want the app to use the "Real Audio Stack" even in CI environments
  So that automated tests run on the same engine as production.

  Scenario: Real Audio Stack is used in CI with virtual hardware
    Given I am running on a CI environment with a PulseAudio dummy sink
    When I launch the app
    Then the "Real Audio Stack" is initialized (ExoPlayer and SoundPool engines)
    And I play a soundscape
    Then I verify that AudioManager reports "isMusicActive" as true
    And the app remains fully functional (UI remains responsive, playback states update correctly)

  Scenario: Notification permission handling on Android 13+
    Given I am on Android 13 or higher
    When I launch the app for the first time
    Then I see a permission request for "POST_NOTIFICATIONS"
    When I grant the permission
    And I play a soundscape
    Then I see the media controller in the notification shade
    When I deny the permission
    And I play a soundscape
    Then I do NOT see the media controller in the notification shade
    And the app continues to play audio in the background
