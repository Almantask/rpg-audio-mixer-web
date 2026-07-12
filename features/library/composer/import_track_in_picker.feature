@iter4 @core
Feature: Import track in Category Composer picker

  As a GM
  I want to import audio from the Track Picker
  So that I can add new files without leaving the composer flow.

  Scenario: Import adds a new track to the picker selection set
    Given the Track Picker modal is open for "Level I" in "Weather"
    When I import the audio file "light_rain.mp3"
    Then I see "light_rain.mp3" in the picker grid
    And "light_rain.mp3" is checked in the picker
