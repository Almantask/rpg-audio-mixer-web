@iter7
Feature: Add soundscape to scene

  As a GM
  I want to add soundscape categories to an active scene
  So that I can build the right atmospheric mix for a location.

  # Design: The selection view is a full screen showing all library categories.
  # Each row has a + button — tapping it instantly adds the category, no confirm step.
  # Categories already in the scene show an indicator icon in place of the + button.

  Scenario: Tapping Add New Soundscape opens the category selection screen
    Given I am on the Active Scene — Soundscapes tab
    When I tap "Add New Soundscape"
    Then I see the Soundscape category selection screen with a back arrow

  Scenario: Each category row shows a + button
    Given the Soundscape selection screen is open
    And my library has the category "Weather"
    Then the "Weather" row displays a + button

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
    Then all three categories appear in the active scene's Soundscapes tab

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
    When I tap the back arrow
    Then I see the Active Scene — Soundscapes tab
    And both "Weather" and "Interior" are present as category cards

  Scenario: The IMPORT NEW button opens the device file picker with Scoped Storage permission granted on Android 13+
    Given I am on Android 13 or higher
    And the app has been granted "READ_MEDIA_AUDIO" permission
    And the Soundscape selection screen is open
    When I tap "Import New" in the footer card
    Then the device's native audio file picker opens

  Scenario: Tapping IMPORT NEW fails when Scoped Storage permission is denied on Android 13+
    Given I am on Android 13 or higher
    And the app has been denied "READ_MEDIA_AUDIO" permission
    And the Soundscape selection screen is open
    When I tap "Import New" in the footer card
    Then I see a permission request dialog for audio access
    And if I deny the permission, I see a message explaining why the permission is needed for imports

  Scenario: The IMPORT NEW button opens the device file picker on legacy Android versions
    Given I am on Android 12 or lower
    And the app has been granted "READ_EXTERNAL_STORAGE" permission
    And the Soundscape selection screen is open
    When I tap "Import New" in the footer card
    Then the device's native audio file picker opens

  Scenario: Importing a new file via Import New creates a new soundscape layer
    Given the device file picker is open from the selection screen
    And the app has been granted necessary storage permissions
    When I select "thunder_deep.mp3"
    Then a new soundscape layer "thunder_deep.mp3" is created
    And I am taken to the Soundscape Category Composer to configure it
