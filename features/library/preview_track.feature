@iter12
Feature: Preview soundscape track in Library

  As a GM
  I want to preview a soundscape track inline from its Tracks tab card
  So that I can identify the right source without leaving the Library.

  Scenario: Previewing a track plays inline on its card without a mini player
    Given "Thunderous Downpour" is in the soundscape library
    And I am on the Tracks tab in the Library
    When I preview "Thunderous Downpour" from its track card
    Then the "Thunderous Downpour" track card shows a playing preview state
    And no mini player appears

  Scenario: Only one Tracks tab preview plays at a time
    Given "Thunderous Downpour" and "Distant Rolling Thunder" are in the soundscape library
    And I am on the Tracks tab in the Library
    And "Thunderous Downpour" is previewing on its track card
    When I preview "Distant Rolling Thunder" from its track card
    Then "Thunderous Downpour" stops previewing
    And the "Distant Rolling Thunder" track card shows a playing preview state

  Scenario: Leaving Library stops Tracks tab preview
    Given "Thunderous Downpour" is in the soundscape library
    And I am on the Tracks tab in the Library
    And the "Thunderous Downpour" track card is previewing with a playing preview state
    When I navigate to Scenes
    Then "Thunderous Downpour" has stopped playing
    And no mini player appears

  Scenario: Switching away from the Tracks tab stops preview
    Given "Thunderous Downpour" is in the soundscape library
    And I am on the Tracks tab in the Library
    And the "Thunderous Downpour" track card is previewing with a playing preview state
    When I switch to the Soundscapes tab in the Library
    Then "Thunderous Downpour" has stopped playing
    And no mini player appears
