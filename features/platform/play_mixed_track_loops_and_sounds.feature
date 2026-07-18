@iter6 @core
Feature: Play mixed track loops and sounds

  As a GM
  I want to mix looping soundscape categories with soundboard effects
  So that I can create background ambience and trigger one-shot sounds simultaneously

  Scenario: Looping soundscape categories and soundboard effects can play at the same time
    Given the "Weather" category is looping
    When I tap "Thunder Crack" on the soundboard
    Then "Thunder Crack" plays simultaneously with the "Weather" loop

  Scenario: Playing a soundboard effect does not interrupt any looping categories
    Given "Weather" and "Interior" categories are both looping
    When I tap "Door Creak" on the soundboard
    Then "Weather" and "Interior" continue looping uninterrupted

  Scenario: Stopping a looping category does not affect soundboard effects
    Given "Weather" is looping and "Sword Clash" is playing from the soundboard
    When I pause the "Weather" category
    Then "Sword Clash" continues to play
    And only "Weather" has stopped

  # Scope: Soundboard Master volume — see soundboard_volume_control.feature.

  Scenario: Master Volume slider does not affect soundboard volume
    Given "Forest Loop" is playing at Master 80% and "Wolf Howl" is on the soundboard
    When I reduce the Master Volume to 30%
    Then "Forest Loop" plays at the reduced level
    But "Wolf Howl" is unaffected by the Master Volume slider

  Scenario: Soundscapes stay at full volume when a soundboard effect is triggered
    Given "Weather" is looping at full volume
    When I tap "Thunder Crack" on the soundboard
    Then "Weather" continues looping at full volume
    And "Thunder Crack" plays simultaneously with the "Weather" loop

  Scenario: Starting an 11th soundscape stops the oldest loop
    Given there are 10 soundscape categories currently looping
    When I attempt to play an 11th soundscape category
    Then the oldest playing soundscape category loop automatically stops
    And the new 11th soundscape begins playing

  Scenario: Pausing a category frees a concurrency slot
    Given 10 soundscape categories are looping
    When I pause one playing category
    And I start an 11th soundscape category
    Then the new category begins playing
    And no other playing category is stopped

  Scenario: Starting a 6th soundboard effect stops the oldest instance
    Given there are 5 soundboard effects currently playing simultaneously
    When I trigger a 6th soundboard effect
    Then the oldest playing soundboard effect instantly stops
    And the new 6th soundboard effect begins playing

  Scenario: Retriggering a soundboard effect at its per-effect limit stops the oldest instance
    Given 5 instances of "Sword Clash" are currently playing
    When I trigger "Sword Clash" again
    Then the oldest "Sword Clash" instance instantly stops
    And the new "Sword Clash" instance begins playing
