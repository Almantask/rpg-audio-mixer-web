@iter4 @iter11
Feature: Open soundscape picker on Active Scene

  As a GM
  I want to open the Add Soundscape picker from the Soundscapes tab
  So that I can browse categories available to add to the scene.

  # Design: audio-library-soundscapes-modal-design.md — Session Lock guard: see session_lock.feature.

  Scenario: Tapping Add Soundscape opens the category picker modal
    Given I am on the Active Scene — Soundscapes tab
    When I tap "Add Soundscape"
    Then I see the Add Soundscape picker modal
    And I see a back link "Back to Active Scene"
    And I see the title "Add Soundscape"
    And I see the subtitle "Select soundscapes for this scene."
    And I see a "Buy Composition" button
    And I see a "Free Compositions" button

  Scenario: The category picker does not offer Import
    Given the Add Soundscape picker modal is open
    Then I do not see an Import action in the picker

  Scenario: The Add Soundscape creation card is hidden in the picker
    Given the Add Soundscape picker modal is open
    Then I do not see an "Add Soundscape" creation card in the picker grid

  Scenario: Empty soundscape library offers acquisition actions without Add Selected
    Given my library has no soundscape categories
    When I open the Add Soundscape picker modal
    Then I see a centred empty-state illustration
    And I see "Buy Composition" and "Free Compositions" actions
    And I do not see an enabled "Add Selected" button

  Scenario: The soundscape picker shows a loading state while library data is loading
    Given the soundscape library is still loading
    When I open the Add Soundscape picker modal
    Then the picker grid shows a loading state
