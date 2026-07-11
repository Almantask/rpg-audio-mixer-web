@iter6
Feature: Soundscape volume control

  As a GM
  I want to control the Master Volume and per-category Volume sliders
  So that I can fine-tune the audio balance for each soundscape in real time.

  Scenario: Master Volume slider controls overall output for all categories
    Given a scene has categories "Weather" at Volume 100% and "Interior" at Volume 50%
    And Master Volume is at 80%
    Then the output volume uses Cubic (x^3) mapping for natural progression
    And "Weather" plays at the mapped volume for 80% Master × 100% Volume
    And "Interior" plays at the mapped volume for 80% Master × 50% Volume

  Scenario: Adjusting the Volume slider changes one category's relative volume
    Given "Weather" is playing with Master at 100% and Volume at 100%
    When I set the "Weather" Volume slider to 50%
    Then "Weather" plays at the mapped volume for 100% Master × 50% Volume using Cubic mapping

  Scenario: Adjusting Master Volume scales all categories proportionally
    Given "Weather" has Volume at 80% and "Interior" has Volume at 40%
    When I set Master Volume to 50%
    Then "Weather" plays at 40% output
    And "Interior" plays at 20% output

  Scenario: Changing Volume for one category does not affect other categories
    Given "Weather" has Volume at 100% and "Interior" has Volume at 100%
    When I set the "Weather" Volume slider to 30%
    Then "Weather" plays at 30% of Master output
    And "Interior" still plays at 100% of Master output

  Scenario: Soundboard Master slider controls all FX output
    Given the soundboard Master volume is at 100%
    And "Thunder Crack" is playing from the soundboard
    When I set the soundboard Master to 50%
    Then "Thunder Crack" plays at 50% output

  Scenario: Soundboard Master volume does not affect soundscape categories
    Given the soundboard Master is at 50%
    And "Forest Loop" is playing as a soundscape at Volume 100%, Master 100%
    Then "Forest Loop" plays at 100% output regardless of the soundboard Master
