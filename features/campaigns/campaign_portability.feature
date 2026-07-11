@iter11 @core
Feature: Campaign portability

  As a GM
  I want to export and import campaigns as portable archive files
  So that I can move my full story arc and audio assets to another device.

  Scenario: Export a campaign to an .arcanum archive
    Given I have a campaign "Curse of Strahd" with sessions, scenes, and imported audio
    When I open the campaign actions for "Curse of Strahd"
    And I export "Curse of Strahd" to an ".arcanum" file
    Then the exported ".arcanum" file contains the full campaign with its sessions, scenes, and audio assets

  Scenario: Import an .arcanum archive restores the full campaign
    Given an ".arcanum" file exported from another device
    When I import the archive
    Then the campaign appears in my campaigns list with its original name
    And its sessions, linked scenes, and audio assets are restored

  Scenario: Imported audio plays from restored local copies
    Given I have imported a campaign from an ".arcanum" archive with audio assets
    When I play a restored soundscape from the imported campaign
    Then the audio plays without error

  Scenario: Importing a campaign does not overwrite an existing campaign with the same name
    Given I already have a campaign named "Curse of Strahd"
    And an ".arcanum" file exported from another device also named "Curse of Strahd"
    When I import the archive
    Then I am prompted to rename the imported campaign or cancel
    And my existing "Curse of Strahd" campaign is unchanged if I cancel

  Scenario: Importing a duplicate-named campaign succeeds after rename
    Given I already have a campaign named "Curse of Strahd"
    And an ".arcanum" file exported from another device also named "Curse of Strahd"
    When I import the archive
    And I rename the imported campaign to "Curse of Strahd (imported)"
    Then I see "Curse of Strahd (imported)" in my campaigns list
    And my existing "Curse of Strahd" campaign is unchanged

  Scenario: Importing an invalid archive shows an error
    Given I select a file that is not a valid ".arcanum" archive
    When I import the archive
    Then I see an error explaining the file could not be imported
    And no campaign is added to my list
