@iter0 @iter8 @iter11
Feature: Credits support links

  As a GM
  I want support actions on the Credits screen
  So that I can tip the developers or leave a review.

  Scenario: Buy the Devs a Coffee opens the donation URL in a new tab
    When I tap "Buy the Devs a Coffee" on the Credits screen
    Then the tip or donation URL opens in a new browser tab

  Scenario: Leave a Review opens the review URL in a new tab
    When I tap "Leave a Review" on the Credits screen
    Then the review URL opens in a new browser tab
