@iter4
Feature: Commit soundscape selection to scene

  As a GM
  I want to add checked soundscape categories to the scene in one commit
  So that I can build the scene's category list deliberately.

  Scenario: Composition cards support multi-select before commit
    Given the Add Soundscape picker modal is open
    And my library has the category "Weather" with at least one track
    Then I can select "Weather" for addition to the scene from the picker grid
    And "Weather" cannot be added instantly from its card

  Scenario: Composition cards show track and layer counts
    Given the Add Soundscape picker modal is open
    And my library has the category "Weather" with 12 tracks across 3 layers
    Then the "Weather" card shows "12 tracks"
    And the "Weather" card shows "3 layers"

  Scenario: Categories with zero tracks are excluded from the picker grid
    Given my library has the category "Empty Category" with no tracks at any intensity level
    And my library has the category "Weather" with at least one track
    When I open the Add Soundscape picker modal
    Then I do not see "Empty Category" in the picker grid
    But I see "Weather" in the picker grid

  Scenario: Add Selected is disabled until at least one category is checked
    Given the Add Soundscape picker modal is open
    And no categories are checked in the picker
    Then I see "Add Selected (0)"
    And the "Add Selected (0)" button is disabled

  Scenario: Checking categories updates the Add Selected count
    Given the Add Soundscape picker modal is open
    And my library has the categories "Weather" and "Interior"
    When I check "Weather" in the picker
    And I check "Interior" in the picker
    Then I see "Add Selected (2)"
    And the "Add Selected (2)" button is enabled

  Scenario: Add Selected commits all checked categories in checkbox order
    Given the Add Soundscape picker modal is open
    And "Weather" is not yet in the current scene
    And "Interior" is not yet in the current scene
    When I check "Weather" in the picker
    And I check "Interior" in the picker
    And I tap "Add Selected (2)"
    Then "Weather" and "Interior" appear in the active scene's Soundscapes tab
    And "Weather" appears before "Interior" in the category list
    And I see a toast "2 categories added"

  Scenario: Add Selected clears the selection and keeps the picker open
    Given the Add Soundscape picker modal is open
    And I have checked "Monsters" in the picker
    When I tap "Add Selected (1)"
    Then "Monsters" is added to the active scene
    And no categories are checked in the picker
    And the Add Soundscape picker modal is still open

  Scenario: Multiple commits can add categories in one visit to the picker
    Given the Add Soundscape picker modal is open
    And "Weather", "Interior", and "Monsters" are not yet in the current scene
    When I check "Weather" in the picker
    And I tap "Add Selected (1)"
    And I check "Interior" in the picker
    And I check "Monsters" in the picker
    And I tap "Add Selected (2)"
    Then "Weather", "Interior", and "Monsters" appear in the active scene's Soundscapes tab
    And the Add Soundscape picker modal is still open

  Scenario: Categories already on the scene are omitted from the picker grid
    Given "Combat" is already in the current scene
    And my library has the categories "Combat" and "Weather"
    When I open the Add Soundscape picker modal
    Then I do not see "Combat" in the picker grid
    But I see "Weather" in the picker grid

  Scenario: New categories append after existing categories in selection order
    Given "Combat" is already in the current scene
    And the Add Soundscape picker modal is open
    When I check "Weather" in the picker
    And I check "Interior" in the picker
    And I tap "Add Selected (2)"
    Then "Combat" appears before "Weather" in the category list
    And "Weather" appears before "Interior" in the category list

  Scenario: Added categories use default mixer values
    Given the Add Soundscape picker modal is open
    And "Weather" is not yet in the current scene
    When I check "Weather" in the picker
    And I tap "Add Selected (1)"
    Then "Weather" is idle and not auto-playing
    And "Weather" has volume 100%
    And "Weather" has intensity II
