@iter3 @iter11 @core
Feature: Compose soundscape category

  As a GM
  I want to assign tracks to fixed intensity levels within a soundscape category
  So that the Scene screen can pick randomly from the right pool when each intensity is active.

  Rule: The Category Composer presents fixed intensity levels

    Scenario: Three fixed intensity levels are always shown
      Given I am in the Soundscape Category Composer for "Meteorological"
      Then I see exactly three intensity level rows labelled "Level I", "Level II", and "Level III"
      And I do not see an "Add intensity level" control

    Scenario: Page header shows navigation and save affordances
      Given I am in the Soundscape Category Composer for "Meteorological"
      Then I see the category name "Meteorological"
      And I see the title "Category Composer"
      And I see the subtitle "Assign tracks to intensity levels for this category."
      And I see a "Save Composition" button

  Scenario: New category opens with Level I expanded
    Given I am in the Soundscape Category Composer for a new category "Arcane"
    Then "Level I" is expanded
    And "Level II" and "Level III" are collapsed
    And I see "Add track" in "Level I"

  Scenario: Empty expanded level shows only Add track
    Given I am in the Soundscape Category Composer for "Weather"
    And "Level II" is expanded with no tracks
    Then I see only "Add track" in "Level II"
    And I do not see placeholder track rows

  Scenario: Collapsing an intensity level hides its track list
    Given "Level I" in "Weather" has 2 tracks and is expanded
    When I tap the collapse control on "Level I"
    Then the track list for "Level I" is hidden
    And the collapsed "Level I" row shows "2 tracks"

  Scenario: Expanding a collapsed intensity level shows its track list
    Given "Level I" in "Weather" has 2 tracks and is collapsed
    When I tap the expand control on "Level I"
    Then the track list for "Level I" is visible

  Scenario: Track rows show format, channel, and duration metadata
    Given "Thunderous Downpour" is attached to "Level I" in "Weather"
    And "Level I" is expanded
    Then I see "Thunderous Downpour" with subtitle "MP3 · Stereo · 3:42"

  Scenario: Removing a track detaches it from the level only
    Given "Light Rain" is attached to "Level I" in "Weather"
    When I tap the remove control on "Light Rain" in "Level I"
    Then "Light Rain" is no longer shown in "Level I"
    And "Light Rain" remains available in the library

  Scenario: Save Composition shows success toast and stays on Composer
    Given I have made composition changes in "Weather"
    When I tap "Save Composition"
    Then I see a toast "Composition saved"
    And I remain on the Soundscape Category Composer for "Weather"

  Scenario: Navigating back to Library does not prompt to discard changes
    Given I have added a track to "Level I" in "Weather"
    When I tap "← Library"
    Then I return to the Library Soundscapes tab
    And I do not see a discard-changes confirmation dialog
    When I reopen the Soundscape Category Composer for "Weather"
    Then the added track is still attached to "Level I"
