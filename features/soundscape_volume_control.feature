@iter6
Feature: Soundscape volume control

  As a GM
  I want to control the Master Atmosphere and per-category MIX volumes
  So that I can fine-tune the audio balance for each soundscape in real time.

  Scenario: Master Atmosphere slider controls overall output for all categories
    Given a scene has categories "Weather" at MIX 100% and "Interior" at MIX 50%
    And Master Atmosphere is at 80%
    Then the output volume uses Cubic (x^3) mapping for natural progression
    And "Weather" plays at the mapped volume for 80% Master × 100% MIX
    And "Interior" plays at the mapped volume for 80% Master × 50% MIX

  Scenario: Adjusting the MIX slider changes one category's relative volume
    Given "Weather" is playing with Master at 100% and MIX at 100%
    When I set the "Weather" MIX slider to 50%
    Then "Weather" plays at the mapped volume for 100% Master × 50% MIX using Cubic mapping

  Scenario: Adjusting Master Atmosphere scales all categories proportionally
    Given "Weather" has MIX at 80% and "Interior" has MIX at 40%
    When I set Master Atmosphere to 50%
    Then "Weather" plays at 40% output
    And "Interior" plays at 20% output

  Scenario: Changing MIX for one category does not affect other categories
    Given "Weather" has MIX at 100% and "Interior" has MIX at 100%
    When I set the "Weather" MIX slider to 30%
    Then "Weather" plays at 30% of Master output
    And "Interior" still plays at 100% of Master output

  Scenario: Soundboard Master slider controls all FX output
    Given the soundboard Master volume is at 100%
    And "Thunder Crack" is playing from the soundboard
    When I set the soundboard Master to 50%
    Then "Thunder Crack" plays at 50% output

  Scenario: Soundboard Master volume does not affect soundscape categories
    Given the soundboard Master is at 50%
    And "Forest Loop" is playing as a soundscape at MIX 100%, Master 100%
    Then "Forest Loop" plays at 100% output regardless of the soundboard Master
