@iter11
Feature: Campaign portability

  As a GM
  I want to export and import campaigns as portable archive files
  So that I can move my full story arc and audio assets to another device.

  Scenario: Export a campaign to an .arcanum archive
    Given I have a campaign "Curse of Strahd" with sessions, scenes, and imported audio
    When I export "Curse of Strahd" to an ".arcanum" file
    Then the exported file is a ZIP archive containing the campaign database entry
    And the archive includes all associated local audio files

  Scenario: Import an .arcanum archive restores the full campaign
    Given an ".arcanum" file exported from another device
    When I import the archive
    Then the campaign appears in my campaigns list with its original name
    And its sessions, linked scenes, and audio assets are restored
    And imported audio plays correctly from the restored local copies

  Scenario: Importing a campaign does not overwrite an existing campaign with the same name
    Given I already have a campaign named "Curse of Strahd"
    And I import an ".arcanum" file for "Curse of Strahd"
    Then I am prompted to rename the imported campaign or cancel
    And my existing "Curse of Strahd" campaign is unchanged if I cancel
