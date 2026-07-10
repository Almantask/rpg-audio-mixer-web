@iter4 @iter11
Feature: Add soundscape to scene

  As a GM
  I want to add soundscape categories to an active scene
  So that I can build the right atmospheric mix for a location.

  # Design: The selection view shows library categories with instant + add.
  # Categories with zero tracks at all intensity levels are excluded from the list.
  # Categories already in the scene show an indicator icon in place of the + button.

  Scenario: Tapping Add New Soundscape opens the category selection screen
    Given I am on the Active Scene — Atmospheres tab
    When I tap "Add New Soundscape"
    Then I see the Soundscape category selection screen with a back link

  Scenario: Each category row shows a + button
    Given the Soundscape selection screen is open
    And my library has the category "Weather" with at least one track
    Then the "Weather" row displays a + button

  Scenario: Categories with zero tracks are excluded from the selection list
    Given my library has the category "Empty Category" with no tracks at any intensity level
    And my library has the category "Weather" with at least one track
    When I open the Soundscape selection screen
    Then I do not see "Empty Category" in the list
    But I see "Weather" in the list

  Scenario: Tapping + on a category immediately adds it to the scene
    Given the Soundscape selection screen is open
    And "Interior" is not yet in the current scene
    When I tap the + button on the "Interior" row
    Then "Interior" is instantly added to the active scene
    And I see the already-added indicator on the "Interior" row

  Scenario: No confirm step is required to add a category
    Given I have tapped + on "Monsters" in the selection screen
    Then "Monsters" is added to the scene immediately without any confirmation dialog

  Scenario: Multiple categories can be added in one visit to the selection screen
    Given the Soundscape selection screen is open
    When I tap + on "Weather"
    And I tap + on "Interior"
    And I tap + on "Monsters"
    Then all three categories appear in the active scene's Atmospheres tab

  Scenario: A category already in the scene shows an already-added indicator instead of +
    Given "Combat" is already in the current scene
    When I open the Soundscape selection screen
    Then the "Combat" row shows the already-added indicator instead of a + button

  Scenario: An already-added category cannot be added again from the selection screen
    Given "Combat" is already in the current scene
    And the Soundscape selection screen is open
    When I tap the already-added indicator on the "Combat" row
    Then "Combat" is not duplicated in the scene

  Scenario: Tapping back returns to the Active Scene with all added categories present
    Given I have added "Weather" and "Interior" from the selection screen
    When I tap the back link
    Then I see the Active Scene — Atmospheres tab
    And both "Weather" and "Interior" are present as category cards

  Scenario: The Import New button opens the browser file picker
    Given the Soundscape selection screen is open
    When I tap "Import New" in the footer card
    Then the browser file picker opens for audio files only

  Scenario: Importing a new file via Import New creates a new soundscape layer
    Given the browser file picker is open from the selection screen
    When I select "thunder_deep.mp3"
    Then a new soundscape layer "thunder_deep.mp3" is created
    And I am taken to the Soundscape Category Composer to configure it
