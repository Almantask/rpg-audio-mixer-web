@iter6
Feature: Retrigger soundboard effect

  As a GM
  I want tapping a playing effect to restart it as a new instance
  So that I can layer multiple rapid-fire stabs of the same sound during combat.

  Scenario: Tapping a playing effect button does not stop the current instance and responds instantly
    Given I have tapped "Thunder Crack" and it is currently playing
    When I tap "Thunder Crack" again
    Then the second "Thunder Crack" instance starts from the beginning with near-instant (low latency) response
    And the first "Thunder Crack" instance continues playing simultaneously

  Scenario: Multiple re-triggers of the same effect respect the global FX concurrency limit
    Given the global FX concurrency limit is 5
    When I tap "Sword Clash" six times in quick succession
    Then the first instance of "Sword Clash" stops immediately
    And only 5 simultaneous instances of "Sword Clash" are playing

  Scenario: Re-triggering one effect does not affect other playing effects
    Given "Thunder Crack" and "Wolf Howl" are both playing
    When I tap "Thunder Crack" again
    Then a new "Thunder Crack" instance starts
    And "Wolf Howl" continues uninterrupted

  Scenario: Tapping pause on an active effect stops all its running instances
    Given I have three instances of "Thunder Crack" playing simultaneously
    When I tap the pause icon on the "Thunder Crack" button
    Then all three "Thunder Crack" instances stop immediately
    And the button returns to the idle state
