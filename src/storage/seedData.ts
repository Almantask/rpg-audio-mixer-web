import type {
  Campaign,
  Session,
  Scene,
  SessionSceneLink,
  FxTrack,
  SoundscapeTrack,
  SoundscapeCategory,
  ActiveSceneSoundboardItem,
  ActiveSceneSoundscapeItem,
} from '../types'

export const initialCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Curse of Strahd',
    system: 'D&D 5e',
    description: 'Gothic horror campaign in Barovia',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'camp-2',
    name: 'Call of Cthulhu: Masks',
    system: 'Call of Cthulhu 7e',
    description: 'Global pulp investigation campaign',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const initialSessions: Session[] = [
  {
    id: 'sess-1',
    campaignId: 'camp-1',
    title: 'Session 1: Arrival in Barovia',
    notes: 'Party enters through the mist and reaches Death House.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sess-2',
    campaignId: 'camp-1',
    title: 'Session 2: Castle Ravenloft',
    notes: 'Dinner with Count Strahd von Zarovich.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sess-3',
    campaignId: 'camp-2',
    title: 'Session 1: The Peru Expedition',
    notes: 'Investigating anomalies in the Andean Highlands.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const initialScenes: Scene[] = [
  {
    id: 'scene-1',
    name: 'Tavern Brawl',
    description: 'Rowdy tavern atmosphere with clashing swords and shouting patrons',
    tags: ['combat', 'tavern', 'town'],
    isUserOwned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'scene-2',
    name: 'Dungeon Crawl',
    description: 'Eerie subterranean dampness, dripping water, and distant growls',
    tags: ['dungeon', 'exploration', 'creepy'],
    isUserOwned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'scene-3',
    name: 'High Seas Storm',
    description: 'Crashing ocean waves, howling wind, and creaking ship timbers',
    tags: ['ocean', 'storm', 'travel'],
    isUserOwned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const initialSessionSceneLinks: SessionSceneLink[] = [
  {
    id: 'link-1',
    sessionId: 'sess-1',
    sceneId: 'scene-1',
    linkedAt: new Date().toISOString(),
    lastPlayedAt: new Date().toISOString(),
  },
  {
    id: 'link-2',
    sessionId: 'sess-1',
    sceneId: 'scene-2',
    linkedAt: new Date().toISOString(),
  },
  {
    id: 'link-3',
    sessionId: 'sess-3',
    sceneId: 'scene-3',
    linkedAt: new Date().toISOString(),
  },
]

export const initialFxTracks: FxTrack[] = [
  {
    id: 'fx-1',
    name: 'Sword Clash',
    category: 'Combat',
    tags: ['sword', 'steel', 'combat'],
    durationSeconds: 2,
    audioUrl: '/assets/audio/fx/sword_clash.ogg',
    isUserOwned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fx-2',
    name: 'Fireball Explosion',
    category: 'Magic',
    tags: ['fire', 'magic', 'explosion'],
    durationSeconds: 4,
    audioUrl: '/assets/audio/fx/fireball.ogg',
    isUserOwned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fx-3',
    name: 'Dragon Roar',
    category: 'Monsters',
    tags: ['dragon', 'roar', 'beast'],
    durationSeconds: 3,
    audioUrl: '/assets/audio/fx/dragon_roar.ogg',
    isUserOwned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fx-4',
    name: 'Thunder Clap',
    category: 'Weather',
    tags: ['thunder', 'storm', 'weather'],
    durationSeconds: 3,
    audioUrl: '/assets/audio/fx/thunder.ogg',
    isUserOwned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const initialSoundscapeTracks: SoundscapeTrack[] = [
  {
    id: 'tr-1',
    name: 'Gentle Rain',
    tags: ['rain', 'weather'],
    audioUrl: '/assets/audio/soundscapes/gentle_rain.ogg',
    durationSeconds: 120,
  },
  {
    id: 'tr-2',
    name: 'Thunderous Downpour',
    tags: ['rain', 'storm', 'heavy'],
    audioUrl: '/assets/audio/soundscapes/thunderous_downpour.ogg',
    durationSeconds: 120,
  },
  {
    id: 'tr-3',
    name: 'Tavern Chatter',
    tags: ['tavern', 'social', 'crowd'],
    audioUrl: '/assets/audio/soundscapes/tavern_chatter.ogg',
    durationSeconds: 120,
  },
  {
    id: 'tr-4',
    name: 'Dungeon Ambience',
    tags: ['dungeon', 'subterranean'],
    audioUrl: '/assets/audio/soundscapes/dungeon_ambience.ogg',
    durationSeconds: 120,
  },
  {
    id: 'tr-5',
    name: 'Crypt Whispers',
    tags: ['undead', 'ghost', 'eerie'],
    audioUrl: '/assets/audio/soundscapes/crypt_whispers.ogg',
    durationSeconds: 120,
  },
]

export const initialSoundscapeCategories: SoundscapeCategory[] = [
  {
    id: 'cat-1',
    name: 'Weather & Storms',
    description: 'From light rain showers to roaring tempests',
    tags: ['weather', 'nature', 'rain'],
    level1TrackIds: ['tr-1'],
    level2TrackIds: ['tr-2'],
    level3TrackIds: ['tr-2'],
    isUserOwned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    name: 'Busy Tavern',
    description: 'Patron chatter, lute music, and hearth warmth',
    tags: ['tavern', 'social', 'town'],
    level1TrackIds: ['tr-3'],
    level2TrackIds: ['tr-3'],
    level3TrackIds: ['tr-3'],
    isUserOwned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-3',
    name: 'Ancient Catacombs',
    description: 'Damp dripping stones, ominous echoes, haunting whispers',
    tags: ['dungeon', 'scary', 'exploration'],
    level1TrackIds: ['tr-4'],
    level2TrackIds: ['tr-4', 'tr-5'],
    level3TrackIds: ['tr-5'],
    isUserOwned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const initialActiveSceneSoundboardItems: ActiveSceneSoundboardItem[] = [
  {
    id: 'sb-1',
    sceneId: 'scene-1',
    fxTrackId: 'fx-1',
    order: 0,
  },
  {
    id: 'sb-2',
    sceneId: 'scene-1',
    fxTrackId: 'fx-2',
    order: 1,
  },
  {
    id: 'sb-3',
    sceneId: 'scene-2',
    fxTrackId: 'fx-3',
    order: 0,
  },
]

export const initialActiveSceneSoundscapeItems: ActiveSceneSoundscapeItem[] = [
  {
    id: 'sc-1',
    sceneId: 'scene-1',
    categoryId: 'cat-2',
    volume: 75,
    intensityLevel: 2,
    isMuted: false,
    isSolo: false,
    order: 0,
  },
  {
    id: 'sc-2',
    sceneId: 'scene-2',
    categoryId: 'cat-3',
    volume: 60,
    intensityLevel: 1,
    isMuted: false,
    isSolo: false,
    order: 0,
  },
]
