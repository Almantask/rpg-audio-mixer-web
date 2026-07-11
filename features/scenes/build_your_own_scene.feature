@iter3 @core
Feature: Build your own scene

  As a GM
  I want to build my own scene of sounds
  So that I can create a custom audio atmosphere for my game.

  Scenario: Creating a scene keeps the GM on the Scenes list
    When I create a new scene named "Tavern" via the New Scene dialog
    Then I remain on the Scenes screen
    And I see the "Tavern" scene in Scenes

  Scenario: Opening a new scene lands on the Soundscapes tab
    Given a scene named "Tavern" exists
    When I open the "Tavern" scene
    Then the "Soundscapes" tab is active
    And I see the "Soundboard" tab

  Scenario: Soundboard tab starts empty
    Given a scene exists
    When I open the "Soundboard" tab
    Then the soundboard has no effects

  Scenario: Soundboard tab shows an add button when empty
    Given a scene exists
    When I open the "Soundboard" tab
    Then I see an "Add Sound" button

  Scenario: Add button always appears at the end of the soundboard
    Given a scene exists
    And I have opened the "Soundboard" tab
    When I add 3 effects to the soundboard
    Then the add button is the last item in the soundboard grid

  Scenario: Soundscapes tab starts empty
    Given a scene exists
    When I open the "Soundscapes" tab
    Then the scene has no soundscape categories

  Scenario: Soundscapes tab shows an add button when empty
    Given a scene exists
    When I open the "Soundscapes" tab
    Then I see an "Add Soundscape" button

  Scenario: Add button always appears at the end of the soundscapes list
    Given a scene exists
    And I have opened the "Soundscapes" tab
    When I add 3 soundscape categories to the scene
    Then the add button appears after the last category card

  Scenario: A soundscape category can be removed from the scene
    Given a scene exists
    And I have opened the "Soundscapes" tab
    And I have added the "Weather" soundscape category
    When I remove the "Weather" category from the scene
    Then the Soundscapes tab has no categories

  Scenario: An effect can be removed from the soundboard
    Given a scene exists
    And I have opened the "Soundboard" tab
    And I have added the "Thunder Crack" effect
    When I remove the "Thunder Crack" effect from the soundboard
    Then the soundboard has no effects

  Scenario: Creating a second scene adds it to Scenes
    Given a scene exists
    When I create another new scene via the New Scene dialog
    Then I remain on the Scenes screen
    And I have 2 scenes
