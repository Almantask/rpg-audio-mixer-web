@iter3
Feature: Commit FX selection to soundboard

  As a GM
  I want to add checked effects to the soundboard in one commit
  So that I can build the scene's effect grid deliberately.

  Scenario: FX picker Add Selected is disabled when no tracks are checked
    Given the Sound Effects picker modal is open
    And no FX cards are checked in the picker
    Then the "Add Selected (0)" button is disabled

  Scenario: Checking tracks updates the Add Selected count
    Given the Sound Effects picker modal is open
    And the FX library has "Thunder Crack" and "Wolf Howl"
    When I check "Thunder Crack" in the picker
    And I check "Wolf Howl" in the picker
    Then the "Add Selected (2)" button is enabled

  Scenario: Checking a card selects it without starting preview
    Given the Sound Effects picker modal is open
    And the FX library has "Thunder Crack"
    When I check "Thunder Crack" in the picker
    Then "Thunder Crack" is selected in the picker
    And "Thunder Crack" is not previewing in the picker

  Scenario: Add Selected commits checked effects to the soundboard
    Given the Sound Effects picker modal is open
    And "Wolf Howl" and "Sword Clash" are not yet in the current scene's soundboard
    When I check "Wolf Howl" in the picker
    And I check "Sword Clash" in the picker
    And I tap "Add Selected (2)"
    Then "Wolf Howl" and "Sword Clash" appear as tiles in the soundboard grid
    And "Wolf Howl" appears before "Sword Clash" in the soundboard grid
    And I see a toast "2 effects added"
    And no FX cards are checked in the picker
    And the "Add Selected (0)" button is disabled
    And the Sound Effects picker modal remains open

  Scenario: Adding effects from the picker does not start soundboard playback
    Given the Sound Effects picker modal is open
    And I have checked "Thunder Crack" in the picker
    When I tap "Add Selected (1)"
    Then the "Thunder Crack" soundboard tile is idle

  Scenario: Effects already on the soundboard are excluded from the picker grid
    Given "Battle Horn" is already in the current scene's soundboard
    And the FX library has "Battle Horn" and "Thunder Crack"
    When I open the Sound Effects picker modal
    Then I do not see "Battle Horn" in the picker grid
    But I see "Thunder Crack" in the picker grid

  Scenario: Multiple commits can add effects in one visit to the picker
    Given the Sound Effects picker modal is open
    When I check "Thunder Crack" in the picker
    And I tap "Add Selected (1)"
    And I check "Wolf Howl" in the picker
    And I check "Sword Clash" in the picker
    And I tap "Add Selected (2)"
    Then all three effects appear as tiles in the active scene's soundboard

  Scenario: New tiles append after existing tiles in selection order
    Given "Battle Horn" is already in the current scene's soundboard
    And the Sound Effects picker modal is open
    When I check "Thunder Crack" in the picker
    And I check "Wolf Howl" in the picker
    And I tap "Add Selected (2)"
    Then "Battle Horn" appears before "Thunder Crack" in the soundboard grid
    And "Thunder Crack" appears before "Wolf Howl" in the soundboard grid

  Scenario: Hotkeys are assigned sequentially to newly added tiles only
    Given the current scene's soundboard has 3 effect tiles with hotkeys Num 1 through Num 3
    And the Sound Effects picker modal is open
    When I check "Thunder Crack" in the picker
    And I tap "Add Selected (1)"
    Then the "Thunder Crack" tile shows hotkey label "Num 4"
    And the first 3 effect tiles still show hotkeys Num 1 through Num 3
