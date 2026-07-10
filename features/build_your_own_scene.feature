@iter3 @core
Feature: Build your own scene

  As a GM
  I want to build my own scene of sounds
  So that I can create a custom audio atmosphere for my game.

  Scenario: New scene has soundscapes and soundboard tabs
    When I create a new scene
    Then I see a "Soundscapes" tab
    And I see a "Soundboard" tab

  Scenario: Soundboard tab starts empty
    Given I have created a new scene
    When I open the "Soundboard" tab
    Then the soundboard has no effects

  Scenario: Soundboard tab shows an add button when empty
    Given I have created a new scene
    When I open the "Soundboard" tab
    Then I see an "Add New Effect" button

  Scenario: Add button always appears at the end of the soundboard
    Given I have created a new scene
    And I have opened the "Soundboard" tab
    When I add 3 effects to the soundboard
    Then the add button is the last item in the soundboard grid

  Scenario: Soundscapes tab starts empty
    Given I have created a new scene
    When I open the "Soundscapes" tab
    Then the scene has no soundscape categories

  Scenario: Soundscapes tab shows an add button when empty
    Given I have created a new scene
    When I open the "Soundscapes" tab
    Then I see an "Add New Soundscape" button

  Scenario: Add button always appears at the end of the soundscapes list
    Given I have created a new scene
    And I have opened the "Soundscapes" tab
    When I add 3 soundscape categories to the scene
    Then the add button appears after the last category card

  Scenario: A soundscape category can be removed from the scene
    Given I have created a new scene
    And I have opened the "Soundscapes" tab
    And I have added the "Weather" soundscape category
    When I swipe right on the "Weather" category card
    Then the Soundscapes tab has no categories

  Scenario: An effect can be removed from the soundboard
    Given I have created a new scene
    And I have opened the "Soundboard" tab
    And I have added the "Thunder Crack" effect
    When I hold the "Thunder Crack" button and drag it to the flames overlay at the bottom screen
    Then the soundboard has no effects

  Scenario: Can create more than one scene
    Given I have created a new scene
    When I create another new scene
    Then I have 2 scenes

