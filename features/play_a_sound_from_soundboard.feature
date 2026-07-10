@iter6
@core
Feature: Soundboard playback

  As a GM
  I want each sound button to play its own sound
  So that I can quickly trigger different effects.

  Scenario: Tapping a sound button plays that sound instantly
    When I tap the "whip" sound button
    Then the "whip" sound plays with near-instant (low latency) response

  Scenario: Tapping a different sound button plays a different sound
    When I tap the "dog_bark" sound button
    Then the "dog_bark" sound plays

  Scenario: Tapping two sound buttons plays both sounds simultaneously
    Given I have tapped the "whip" sound button
    When I tap the "owl_hooting" sound button
    Then "whip" and "owl_hooting" play simultaneously