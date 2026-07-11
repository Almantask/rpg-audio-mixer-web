@iter3
Feature: Create soundscape category

  As a GM
  I want to create new soundscape categories from the Library
  So that I can compose intensity levels for new ambience.

  Scenario: Creating a new category via Add Soundscape lands in the Category Composer
    Given I am on the Soundscapes tab in the Library
    When I create a soundscape category named "Arcane" via Add Soundscape
    Then I see the Soundscape Category Composer for "Arcane"
