@iter0 @iter8 @iter11
Feature: Credits support links

  As a GM
  I want support actions on the Credits screen
  So that I can tip the developers or leave a review.

  Scenario: The Credits screen shows support cards
    When I open the Credits screen
    Then I see the "Support Development" card
    And I see a "Buy the Devs a Coffee" button
    And I see the "Leave a Review" card
    And I see a "Leave a Review" button

  Scenario: Buy the Devs a Coffee opens the donation URL in a new tab
    When I tap "Buy the Devs a Coffee" on the Credits screen
    Then the tip or donation URL opens in a new browser tab

  Scenario: Leave a Review opens the review URL in a new tab
    When I tap "Leave a Review" on the Credits screen
    Then the review URL opens in a new browser tab
