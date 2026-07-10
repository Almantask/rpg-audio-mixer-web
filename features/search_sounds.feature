@iter8
Feature: Search sounds

  As a GM
  I want to search and filter sounds and ambiences
  So that I can quickly find the audio I need for my game.

  Scenario: Filter sounds by category
    Given there are sounds available in multiple categories
      | sound        | category |
      | sword_clash  | combat   |
      | fire_crackle | nature   |
      | arrow_shot   | combat   |
    When I filter sounds by category "combat"
    Then I see only sounds in category "combat"
      | sword_clash | arrow_shot |

  Scenario: Filter sounds by name
    Given there are sounds available
      | sword_clash | fire_crackle | sword_slash |
    When I search sounds by name "sword"
    Then I see only sounds matching "sword"
      | sword_clash | sword_slash |

  Scenario: Filter by type - soundboard
    Given there are sounds and ambiences available
      | name         | type       |
      | sword_clash  | soundboard |
      | dark_forest  | ambience   |
      | fire_crackle | soundboard |
    When I filter by type "soundboard"
    Then I see only soundboard sounds
      | sword_clash | fire_crackle |

  Scenario: Filter by type - ambience
    Given there are sounds and ambiences available
      | name         | type       |
      | sword_clash  | soundboard |
      | dark_forest  | ambience   |
      | tavern_night | ambience   |
    When I filter by type "ambience"
    Then I see only ambiences
      | dark_forest | tavern_night |

  Scenario: Filter ambiences by intensity level
    Given there are ambiences with different intensity levels
      | ambience     | intensity |
      | dark_forest  | I         |
      | battle_roar  | III       |
      | tavern_night | II        |
    When I filter ambiences by intensity "I"
    Then I see only ambiences with intensity "I"
      | dark_forest |

  Scenario: Filter sounds by scene
    Given there are sounds associated with different scenes
      | sound        | scene   |
      | sword_clash  | dungeon |
      | fire_crackle | forest  |
      | arrow_shot   | dungeon |
    When I filter sounds by scene "dungeon"
    Then I see only sounds in scene "dungeon"
      | sword_clash | arrow_shot |
