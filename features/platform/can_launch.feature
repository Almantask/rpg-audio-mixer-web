@iter0 @can_launch @smoke
Feature: Can launch app

  As a GM
  I want the app to load reliably
  So that I can start a session without setup failures

  Scenario: App launches successfully
    When I open the app
    Then the app opens without any errors
