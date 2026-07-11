@iter8
Feature: View Attributions

  As a GM
  I want to review sound library and open-source attributions
  So that I can understand licensing and credits for bundled content.

  Scenario: The Attributions page shows sound library and open-source sections
    When I open the Attributions page
    Then I see the sound library attributions section
    And I see the open-source licenses section

  Scenario: The Attributions page shows loading skeletons while content loads
    Given the Attributions content is still loading
    When I open the Attributions page
    Then I see skeleton placeholders for the attribution sections

  Scenario: The Attributions page shows an error when content fails to load
    Given the Attributions content failed to load
    When I open the Attributions page
    Then I see an inline error message
    And I see a retry control

  Scenario: Retrying loads Attributions content after a failure
    Given the Attributions content failed to load
    When I open the Attributions page
    And I tap retry
    Then I see the sound library attributions section
    And I see the open-source licenses section
