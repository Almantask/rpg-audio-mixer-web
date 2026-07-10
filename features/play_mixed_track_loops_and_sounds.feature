@iter6
@core
Feature: Mix loops and soundboard effects

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

  Scenario: Master Atmosphere slider does not affect soundboard volume
    Given "Forest Loop" is playing at Master 80% and "Wolf Howl" is on the soundboard
    When I reduce the Master Atmosphere to 30%
    Then "Forest Loop" plays at the reduced level
    But "Wolf Howl" is unaffected by the Master Atmosphere slider

  Scenario: Setting a concurrency limit on soundscapes
    Given there are 10 soundscape categories currently looping
    When I attempt to play an 11th soundscape category
    Then the oldest playing soundscape category loop automatically stops
    And the new 11th soundscape begins playing

  Scenario: Setting a concurrency limit on soundboard effects
    Given there are 5 soundboard effects currently playing simultaneously
    When I trigger a 6th soundboard effect
    Then the oldest playing soundboard effect instantly stops
    And the new 6th soundboard effect begins playing


