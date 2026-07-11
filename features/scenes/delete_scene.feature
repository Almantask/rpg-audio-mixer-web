@iter3
Feature: Delete scene

  As a GM
  I want to delete scenes I no longer need
  So that I can keep Scenes organized.

  Scenario Outline: Soft-deleting a scene moves it to Trash
    Given a scene named "Old Scene" exists
    When I <action> on the "Old Scene" card
    Then "Old Scene" is moved to Trash on the Scenes tab
    And I do not see "Old Scene" in Scenes

    Examples:
      | action             |
      | tap the trash icon |
      | swipe right        |

  Scenario: Deleting an unlinked scene requires no confirmation
    Given a scene named "Old Scene" with no session links exists
    When I delete the "Old Scene" scene
    Then no delete confirmation dialog is shown
    And "Old Scene" is moved to Trash on the Scenes tab

  Scenario: Deleting a scene linked to sessions shows a warning and moves it to Trash when confirmed
    Given a scene named "Linked Scene" linked to 2 sessions exists
    When I delete the "Linked Scene" scene
    Then I see a warning that the scene is linked to 2 sessions and will be unlinked and moved to Trash
    When I confirm the delete
    Then "Linked Scene" is moved to Trash on the Scenes tab
    And I do not see "Linked Scene" in Scenes

  Scenario: Canceling a linked-scene delete keeps the scene
    Given a scene named "Linked Scene" linked to 1 session exists
    When I delete the "Linked Scene" scene
    And I cancel the delete confirmation
    Then I still see "Linked Scene" in Scenes

  Scenario Outline: Deleting one scene leaves the others in Scenes
    Given the following scenes exist:
      | Scene A |
      | Scene B |
      | Scene C |
    When I delete the "<target>" scene
    Then "<target>" is moved to Trash on the Scenes tab
    And I still see "<remaining>" in Scenes

    Examples:
      | target  | remaining |
      | Scene A | Scene B   |
      | Scene B | Scene A   |

  Scenario: Deleting an unlinked scene offers undo
    Given a scene named "Old Scene" with no session links exists
    When I delete the "Old Scene" scene
    Then I see an undo option for the deletion
    And "Old Scene" is moved to Trash on the Scenes tab
