@iter3
Feature: Preview FX in picker

  As a GM
  I want to preview effects before adding them to the soundboard
  So that I can confirm the right clip is selected.

  Scenario: Tapping card body previews the track
    Given the Sound Effects picker modal is open
    And the FX library has "Thunder Crack"
    When I tap the card body for "Thunder Crack"
    Then "Thunder Crack" begins previewing in the picker
    And the "Thunder Crack" card shows a playing state in the picker

  Scenario: Tapping a playing card stops preview
    Given the Sound Effects picker modal is open
    And "Thunder Crack" is previewing in the picker
    When I tap the card body for "Thunder Crack"
    Then "Thunder Crack" stops previewing
    And the "Thunder Crack" card no longer shows a playing state in the picker

  Scenario: Only one preview plays at a time in the picker
    Given the Sound Effects picker modal is open
    And "Thunder Crack" is previewing in the picker
    When I tap the card body for "Wolf Howl"
    Then "Thunder Crack" stops previewing
    And "Wolf Howl" begins previewing in the picker

  Scenario: I can select tracks while another track is previewing
    Given the Sound Effects picker modal is open
    And "Thunder Crack" is previewing in the picker
    When I check "Wolf Howl" in the picker
    Then the "Add Selected (1)" button is enabled
    And "Thunder Crack" is still previewing in the picker

  Scenario: Base Intensity filter does not change preview volume
    Given the Sound Effects picker modal is open
    And "Thunder Crack" is visible in the picker grid
    When I tap the card body for "Thunder Crack"
    Then "Thunder Crack" previews at its saved default volume
