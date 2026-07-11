@iter3 @iter11
Feature: Delete soundscape category

  As a GM
  I want to delete soundscape categories from the Library
  So that I can recover them from Trash if needed.

  Scenario Outline: Deleting a category moves it to Trash
    Given "<category>" is in the soundscape categories grid
    When I <action>
    Then "<category>" is moved to the Trash Soundscapes tab
    And "<category>" is no longer in the soundscape categories grid

    Examples:
      | category | action                              |
      | Weather  | delete "Weather" from the grid      |
      | Weather  | swipe right on the "Weather" card   |

  Scenario: Deleting a category retains it in Trash for 7 days
    Given "Weather" is in the soundscape categories grid
    When I delete "Weather" from the grid
    Then "Weather" is moved to the Trash Soundscapes tab
    And "Weather" remains recoverable for 7 days
