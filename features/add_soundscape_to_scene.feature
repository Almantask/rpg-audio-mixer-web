@iter4 @iter11
Feature: Add soundscape to scene

  As a GM
  I want to add soundscape categories to an active scene
  So that I can build the right atmospheric mix for a location.

  # Design: The selection view shows library categories with instant + add.
  # Categories with zero tracks at all intensity levels are excluded from the list.
  # Categories already in the scene show an indicator icon in place of the + button.

  Scenario: Tapping Add Soundscape opens the category selection modal
    Given I am on the Active Scene — Soundscapes tab
    When I tap "Add Soundscape"
    Then I see the Add Soundscape modal with a back link

  Scenario: Each category row shows a + button
    Given the Add Soundscape modal is open
    And my library has the category "Weather" with at least one track
    Then the "Weather" row displays a + button

  Scenario: Categories with zero tracks are excluded from the selection list
    Given my library has the category "Empty Category" with no tracks at any intensity level
    And my library has the category "Weather" with at least one track
    When I open the Add Soundscape modal
    Then I do not see "Empty Category" in the list
    But I see "Weather" in the list

  Scenario: Tapping + on a category immediately adds it to the scene
    Given the Add Soundscape modal is open
    And "Interior" is not yet in the current scene
    When I tap the + button on the "Interior" row
    Then "Interior" is instantly added to the active scene
    And I see the already-added indicator on the "Interior" row

  Scenario: No confirm step is required to add a category
    Given I have tapped + on "Monsters" in the Add Soundscape modal
    Then "Monsters" is added to the scene immediately without any confirmation dialog

  Scenario: Multiple categories can be added in one visit to the modal
    Given the Add Soundscape modal is open
    When I tap + on "Weather"
    And I tap + on "Interior"
    And I tap + on "Monsters"
    Then all three categories appear in the active scene's Soundscapes tab

  Scenario: A category already in the scene shows an already-added indicator instead of +
    Given "Combat" is already in the current scene
    When I open the Add Soundscape modal
    Then the "Combat" row shows the already-added indicator instead of a + button

  Scenario: An already-added category cannot be added again from the modal
    Given "Combat" is already in the current scene
    And the Add Soundscape modal is open
    When I tap the already-added indicator on the "Combat" row
    Then "Combat" is not duplicated in the scene

  Scenario: Tapping back returns to the Active Scene with all added categories present
    Given I have added "Weather" and "Interior" from the Add Soundscape modal
    When I tap the back link
    Then I see the Active Scene — Soundscapes tab
    And both "Weather" and "Interior" are present as category cards

  Scenario: The Import button opens the browser file picker
    Given the Add Soundscape modal is open
    When I tap "Import" in the footer card
    Then the browser file picker opens for audio files only

  Scenario: Importing a file via Import creates a soundscape category
    Given the browser file picker is open from the Add Soundscape modal
    When I select "thunder_deep.mp3"
    Then a soundscape category "thunder_deep.mp3" is created
    And I am taken to the Soundscape Category Composer to configure it
