@iter3 @iter11 @core
Feature: Compose soundscape

  As a GM
  I want to compose soundscapes within a category
  So that I can build rich, multi-track atmospheric pools playable during my game.

  Scenario: Invoking a new soundscape opens the browser file picker
    Given I am in the Soundscape Category Composer for "Weather"
    When I tap "Invoke New Soundscape"
    Then the browser file picker opens for audio files only

  Scenario: Selecting an audio file from the picker creates a new soundscape
    Given the browser file picker is open
    When I select "thunderstorm.mp3"
    Then a new soundscape card named "thunderstorm.mp3" appears in the composer
    And it defaults to intensity level I
    And a local copy of the file is stored in app storage

  Scenario: Non-audio files are not available in the file picker
    When I open the file picker from the composer
    Then only audio files are visible (non-audio files are filtered out)

  Scenario: A soundscape's intensity level can be changed
    Given a soundscape "thunderstorm.mp3" exists with intensity level I
    When I tap "Intensity Level III" on the "thunderstorm.mp3" soundscape card
    Then the "thunderstorm.mp3" soundscape card shows "Intensity Level III" as active
    And "Intensity Level III" should be highlighted in gold on the "thunderstorm.mp3" card

  Scenario: A soundscape's MIX slider can be adjusted
    Given a soundscape "thunderstorm.mp3" exists in the composer
    When I set its MIX slider to 60%
    Then the soundscape shows a MIX value of 60%

  Scenario: A soundscape can be removed from the category
    Given a soundscape "light_rain.mp3" exists in the "Weather" composer
    When I tap the remove control on the "light_rain.mp3" soundscape card
    Then "light_rain.mp3" is no longer shown in the composer
    And the local copy of "light_rain.mp3" is purged from app storage

  Scenario: Saving the composition updates the category globally
    Given I have added a layer "thunderstorm.mp3" at intensity III in "Weather"
    When I tap "Save Composition"
    Then the "Weather" category is updated globally
    And any scene using "Weather" reflects the new layer

  Scenario: The composer can hold more than one soundscape
    Given the "Weather" composer already has the soundscape "Light Rain"
    When I add "Thunderstorm" and "Drizzle" as new soundscapes
    Then all three soundscapes are visible in the composer

  Scenario: Navigating back with unsaved changes prompts the user to confirm
    Given I have made changes in the composer without saving
    When I tap the back button
    Then I see a confirmation dialog asking whether to discard changes

  Scenario: Global Mixer shows elemental level cards for session-wide balance
    Given I am on the Global Mixer screen
    Then I see elemental level cards for Foundation, Atmosphere, and Incantations
    And each card has an intensity slider with Cubic mapping

  Scenario: Current Layers can be reordered in the Global Mixer
    Given the Global Mixer has layers "Thunderous Downpour" and "Howling Gorges"
    When I drag "Howling Gorges" above "Thunderous Downpour"
    Then "Howling Gorges" appears before "Thunderous Downpour" in the layer stack
