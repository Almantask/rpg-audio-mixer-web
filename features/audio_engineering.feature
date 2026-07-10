@iter11
Feature: Audio engineering

  As a GM
  I want high-quality audio processing under the hood
  So that mixed playback sounds natural, varied, and never clips.

  Scenario: FX triggers apply organic randomization to pitch and volume
    Given "Sword Clash" is on the soundboard
    When I trigger "Sword Clash" ten times in succession
    Then each trigger plays with slightly varied pitch within ±10%
    And each trigger plays with slightly varied volume within ±5%

  Scenario: The global limiter prevents clipping when many tracks peak simultaneously
    Given a scene has three soundscape categories playing at full volume
    And I trigger three soundboard effects simultaneously
    Then the final mixed output does not clip digitally
    And the global limiter reduces peaks without audible distortion on normal playback levels

  Scenario: Scene and intensity crossfades use equal-power curves
    Given "Tavern" is the current playing scene at full volume
    When I switch to the "Forest" scene with playback
    Then the crossfade uses equal-power sin/cos curves
    And there is no dip in perceived loudness during the transition

  Scenario: Intensity transitions on a playing category use equal-power crossfade
    Given the "Weather" category is playing at intensity level I
    When I tap "Intensity Level II" on the "Weather" category
    Then the 2-second crossfade uses equal-power sin/cos curves
    And there is no dip in perceived loudness during the transition
