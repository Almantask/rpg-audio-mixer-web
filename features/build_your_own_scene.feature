@iter3 @core @iter11
Feature: Build your own scene

  As a GM
  I want to build my own scene of sounds
  So that I can create a custom audio atmosphere for my game.

  Scenario: New scene has Atmospheres and One-Shots tabs
    When I create a new scene
    Then I see an "Atmospheres" tab
    And I see a "One-Shots & SFX" tab

  Scenario: One-Shots tab starts empty
    Given I have created a new scene
    When I open the "One-Shots & SFX" tab
    Then the soundboard has no effects

  Scenario: One-Shots tab shows an add button when empty
    Given I have created a new scene
    When I open the "One-Shots & SFX" tab
    Then I see an "Add Sound" button

  Scenario: Add button always appears at the end of the soundboard
    Given I have created a new scene
    And I have opened the "One-Shots & SFX" tab
    When I add 3 effects to the soundboard
    Then the add button is the last item in the soundboard grid

  Scenario: Atmospheres tab starts empty
    Given I have created a new scene
    When I open the "Atmospheres" tab
    Then the scene has no soundscape categories

  Scenario: Atmospheres tab shows an add button when empty
    Given I have created a new scene
    When I open the "Atmospheres" tab
    Then I see an "Add New Soundscape" button

  Scenario: Add button always appears at the end of the atmospheres list
    Given I have created a new scene
    And I have opened the "Atmospheres" tab
    When I add 3 soundscape categories to the scene
    Then the add button appears after the last category card

  Scenario: A soundscape category can be removed from the scene
    Given I have created a new scene
    And I have opened the "Atmospheres" tab
    And I have added the "Weather" soundscape category
    When I swipe right on the "Weather" category card
    Then the Atmospheres tab has no categories

  Scenario: An effect can be removed from the soundboard
    Given I have created a new scene
    And I have opened the "One-Shots & SFX" tab
    And I have added the "Thunder Crack" effect
    When I hold the "Thunder Crack" button and drag it to the flames overlay at the bottom screen
    Then the soundboard has no effects

  Scenario: Can create more than one scene
    Given I have created a new scene
    When I create another new scene
    Then I have 2 scenes
