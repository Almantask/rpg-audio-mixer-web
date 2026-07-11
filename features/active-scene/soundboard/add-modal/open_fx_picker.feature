@iter5 @iter11
Feature: Open FX picker on Active Scene

  As a GM
  I want to open the Sound Effects picker from the soundboard
  So that I can browse effects available to add to the scene.

  # Design: audio-library-fx-modal-design.md — Import/Buy/Free live on Library page only.

  Scenario: Tapping Add Sound opens the Sound Effects picker modal
    Given I am on the Active Scene — Soundboard tab
    When I tap "Add Sound"
    Then I see the Sound Effects picker modal
    And I see a back link "Back to Active Scene"
    And I see the title "Sound Effects"
    And I see the subtitle "Select effects for this scene's soundboard."
    And I see the picker search bar with placeholder "Search effects…"
    And I see FX Types, Base Intensity, and Sort Order filters for the picker
    And I can select effects for addition to the soundboard from the picker grid

  Scenario: The FX picker does not offer Import, Buy More, or Free Tracks
    Given the Sound Effects picker modal is open
    Then I do not see an Import action in the picker
    And I do not see a "Buy More" button in the picker
    And I do not see a "Free Tracks" button in the picker

  Scenario: Empty library directs the GM to the Library page
    Given the FX library has no tracks
    When I open the Sound Effects picker modal
    Then I see guidance to import or purchase tracks via Library — Sound Effects
    And the "Add Selected" button is not available

  Scenario: Picker shows no addable tracks when every library FX is already on the soundboard
    Given every FX track in my library is already in the current scene's soundboard
    When I open the Sound Effects picker modal
    Then I do not see any FX cards in the picker grid
    And the "Add Selected" button is not available

  Scenario: Picker shows a loading state while the library resolves
    Given the FX library is still loading
    When I open the Sound Effects picker modal
    Then the picker grid shows a loading state
