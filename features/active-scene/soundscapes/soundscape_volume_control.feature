@iter6
Feature: Soundscape volume control

  As a GM
  I want to control the Master Volume and per-category Volume sliders
  So that I can fine-tune the audio balance for each soundscape in real time.

  Background:
    Given I have opened a scene on the Active Scene — Soundscapes tab

  Scenario: Master Volume slider controls overall output for all categories
    Given a scene has categories "Weather" at Volume 100% and "Interior" at Volume 50%
    And Master Volume is at 80%
    When I start playback on all categories
    Then "Weather" plays at the mapped volume for 80% Master × 100% Volume
    And "Interior" plays at the mapped volume for 80% Master × 50% Volume

  Scenario: Adjusting the Volume slider changes one category's relative volume
    Given "Weather" is playing with Master at 100% and Volume at 100%
    When I set the "Weather" Volume slider to 50%
    Then "Weather" plays at the mapped volume for 100% Master × 50% Volume

  Scenario: Adjusting Master Volume scales all categories proportionally
    Given "Weather" has Volume at 80% and "Interior" has Volume at 40%
    When I set Master Volume to 50%
    Then "Weather" plays at the mapped volume for 50% Master × 80% Volume
    And "Interior" plays at the mapped volume for 50% Master × 40% Volume

  Scenario: Changing Volume for one category does not affect other categories
    Given "Weather" has Volume at 100% and "Interior" has Volume at 100%
    When I set the "Weather" Volume slider to 30%
    Then "Weather" plays at the mapped volume for 100% Master × 30% Volume
    And "Interior" plays at the mapped volume for 100% Master × 100% Volume

  # Scope: soundscape Master Volume and mute — see soundscape_volume_control.feature and soundscape_mute.feature.
  # Scope: Soundboard Master volume — see soundboard_volume_control.feature.

  Scenario: Master Volume and mute remain adjustable when Session Lock is on
    Given the session is locked on the Active Scene — Soundscapes tab
    When I set Master Volume to 70% and tap the mute button on the Master Volume bar
    Then the Master Volume slider reads 70%
    And soundscape output is muted
