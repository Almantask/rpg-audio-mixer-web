@iter3
Feature: Edit FX in library

  As a GM
  I want to edit and delete FX tracks inline
  So that I can keep my library metadata accurate.

  Scenario: Edit an FX track from its FX card
    Given "Wolf Howl" is in the FX library
    When I edit "Wolf Howl" from its FX card
    Then I see inline edit on the "Wolf Howl" FX card with fields for Name and Tags

  Scenario: Edit the name of an FX track inline
    Given I am editing "wolf_howl.mp3" inline on its FX card
    When I rename "wolf_howl.mp3" to "Wolf Howl" and save inline edit
    Then the track appears as "Wolf Howl" in the FX library card grid

  Scenario: Add tags to an FX track inline
    Given I am editing "Wolf Howl" inline on its FX card
    When I add the tag "Combat" to "Wolf Howl" from the predefined list and save
    Then "Wolf Howl" shows the "Combat" tag chip on its FX card

  Scenario: Delete an FX track via inline edit
    Given I am editing "Wolf Howl" inline on its FX card
    When I delete "Wolf Howl" from inline edit
    Then "Wolf Howl" is moved to the Trash FX tab
    And it is no longer visible in the FX library
    And the local copy of the audio file is retained for 7 days

  Scenario: Deleting an FX track removes it from scenes that used it
    Given "Wolf Howl" is assigned to the "Forest Ambush" scene's soundboard
    When I delete "Wolf Howl" from the FX library
    Then "Wolf Howl" no longer appears in the "Forest Ambush" soundboard
