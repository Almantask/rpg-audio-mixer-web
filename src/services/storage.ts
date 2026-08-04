import type {
  Campaign,
  Session,
  Scene,
  SoundscapeCategory,
  SoundscapeTrack,
  FXTrack,
  TrashItem,
} from '../types'

const STORAGE_KEYS = {
  CAMPAIGNS: 'arcanum_campaigns',
  SESSIONS: 'arcanum_sessions',
  SCENES: 'arcanum_scenes',
  SOUNDSCAPE_CATEGORIES: 'arcanum_soundscape_categories',
  SOUNDSCAPE_TRACKS: 'arcanum_soundscape_tracks',
  FX_TRACKS: 'arcanum_fx_tracks',
  TRASH: 'arcanum_trash',
  LAST_ACTIVE_CAMPAIGN_ID: 'arcanum_last_active_campaign_id',
  LAST_ACTIVE_SESSION_ID: 'arcanum_last_active_session_id',
}

const DEFAULT_FX_TRACKS: FXTrack[] = [
  {
    id: 'fx-arrow-twang',
    title: 'Arrow Twang',
    audioUrl: '/assets/audio/soundboard/arrow.ogg',
    durationSeconds: 2,
    defaultIntensity: 'I',
    tags: ['COMBAT', 'PROJECTILE'],
    defaultVolume: 0.8,
    isUserOwned: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fx-dog-bark',
    title: 'Dog Bark',
    audioUrl: '/assets/audio/soundboard/dog_bark.ogg',
    durationSeconds: 2,
    defaultIntensity: 'I',
    tags: ['CREATURE', 'BEAST'],
    defaultVolume: 0.8,
    isUserOwned: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fx-dragon-roar',
    title: 'Dragon Roar',
    audioUrl: '/assets/audio/soundboard/dragon-studio-dragon-roar-364478.ogg',
    durationSeconds: 5,
    defaultIntensity: 'III',
    tags: ['CREATURE', 'DRAGON', 'IMPACT'],
    defaultVolume: 0.9,
    isUserOwned: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fx-sword-clash',
    title: 'Sword Clash',
    audioUrl: '/assets/audio/soundboard/musicholder-sword-sound-260274.ogg',
    durationSeconds: 3,
    defaultIntensity: 'II',
    tags: ['COMBAT', 'MELEE'],
    defaultVolume: 0.85,
    isUserOwned: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fx-owl-hoot',
    title: 'Owl Hoot',
    audioUrl: '/assets/audio/soundboard/owl_hooting.ogg',
    durationSeconds: 3,
    defaultIntensity: 'I',
    tags: ['NATURE', 'NIGHT'],
    defaultVolume: 0.7,
    isUserOwned: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fx-whip',
    title: 'Whip Crack',
    audioUrl: '/assets/audio/soundboard/whip.ogg',
    durationSeconds: 2,
    defaultIntensity: 'II',
    tags: ['COMBAT', 'IMPACT'],
    defaultVolume: 0.8,
    isUserOwned: false,
    createdAt: new Date().toISOString(),
  },
]

const DEFAULT_SOUNDSCAPE_TRACKS: SoundscapeTrack[] = [
  {
    id: 'track-bonfire-1',
    title: 'Bonfire Crackle 1',
    audioUrl: '/assets/audio/soundscapes/Bonfire/I/Bonfire_#1.mp3',
    durationSeconds: 180,
    format: 'MP3',
    channels: 'Stereo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track-bonfire-2',
    title: 'Bonfire Crackle 2',
    audioUrl: '/assets/audio/soundscapes/Bonfire/I/Bonfire_#2.mp3',
    durationSeconds: 180,
    format: 'MP3',
    channels: 'Stereo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track-boss-1',
    title: 'Storm Ritual Procession',
    audioUrl: '/assets/audio/soundscapes/Boss/I/Storm Ritual Procession.ogg',
    durationSeconds: 240,
    format: 'OGG',
    channels: 'Wide Stereo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track-boss-2',
    title: 'Dark Authority',
    audioUrl: '/assets/audio/soundscapes/Boss/II/Dark Authority.ogg',
    durationSeconds: 210,
    format: 'OGG',
    channels: 'Wide Stereo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track-boss-3',
    title: 'Faultline Cathedral',
    audioUrl: '/assets/audio/soundscapes/Boss/III/Faultline Cathedral.ogg',
    durationSeconds: 300,
    format: 'OGG',
    channels: 'Stereo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track-combat-1',
    title: 'Forged In The Drumfire',
    audioUrl: '/assets/audio/soundscapes/Combat/II/Forged In The Drumfire.ogg',
    durationSeconds: 200,
    format: 'OGG',
    channels: 'Stereo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track-combat-2',
    title: 'Steel Cathedral',
    audioUrl: '/assets/audio/soundscapes/Combat/III/Steel Cathedral.ogg',
    durationSeconds: 220,
    format: 'OGG',
    channels: 'Stereo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track-forest-1',
    title: 'Moonroots of the Feywood',
    audioUrl: '/assets/audio/soundscapes/Forest/I/Moonroots of the Feywood.ogg',
    durationSeconds: 190,
    format: 'OGG',
    channels: 'Stereo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track-forest-2',
    title: 'Forest Harp Melody',
    audioUrl: '/assets/audio/soundscapes/Forest/II/ForestHarp.ogg',
    durationSeconds: 170,
    format: 'OGG',
    channels: 'Stereo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track-mystery-1',
    title: 'Echoes of the Old Gate',
    audioUrl: '/assets/audio/soundscapes/Mystery/I/Echoes of the Old Gate.ogg',
    durationSeconds: 210,
    format: 'OGG',
    channels: 'Stereo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track-mystery-2',
    title: 'Glitter Runes Over A Minor Sky',
    audioUrl: '/assets/audio/soundscapes/Mystery/II/Glitter Runes Over A Minor Sky.ogg',
    durationSeconds: 250,
    format: 'OGG',
    channels: 'Stereo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track-rain-1',
    title: 'Relaxing Light Rain',
    audioUrl: '/assets/audio/soundscapes/Rain/I/Relaxing_light_rain_#1.mp3',
    durationSeconds: 180,
    format: 'MP3',
    channels: 'Stereo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track-rain-2',
    title: 'Medium Rain',
    audioUrl: '/assets/audio/soundscapes/Rain/II/Medium_rain_#1.mp3',
    durationSeconds: 180,
    format: 'MP3',
    channels: 'Stereo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track-rain-3',
    title: 'Heavy Rain Storm',
    audioUrl: '/assets/audio/soundscapes/Rain/III/Heavy_rain_1.mp3',
    durationSeconds: 180,
    format: 'MP3',
    channels: 'Stereo',
    createdAt: new Date().toISOString(),
  },
]

const DEFAULT_CATEGORIES: SoundscapeCategory[] = [
  {
    id: 'cat-weather',
    name: 'Weather',
    description: 'Ambient rain and storm sounds',
    levels: {
      I: ['track-rain-1'],
      II: ['track-rain-2'],
      III: ['track-rain-3'],
    },
    isUserOwned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-bonfire',
    name: 'Campfire & Rest',
    description: 'Cozy night by the fire',
    levels: {
      I: ['track-bonfire-1', 'track-bonfire-2'],
      II: [],
      III: [],
    },
    isUserOwned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-forest',
    name: 'Feywood Forest',
    description: 'Enchanted woods and rustling leaves',
    levels: {
      I: ['track-forest-1'],
      II: ['track-forest-2'],
      III: [],
    },
    isUserOwned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-boss',
    name: 'Boss Encounter',
    description: 'Tense climax ritual music',
    levels: {
      I: ['track-boss-1'],
      II: ['track-boss-2'],
      III: ['track-boss-3'],
    },
    isUserOwned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-combat',
    name: 'Combat',
    description: 'Fast paced battle music',
    levels: {
      I: [],
      II: ['track-combat-1'],
      III: ['track-combat-2'],
    },
    isUserOwned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-mystery',
    name: 'Arcane Mystery',
    description: 'Mysterious dungeon exploration',
    levels: {
      I: ['track-mystery-1'],
      II: ['track-mystery-2'],
      III: [],
    },
    isUserOwned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const DEFAULT_SCENES: Scene[] = [
  {
    id: 'scene-dragons-lair',
    name: "Dragon's Lair",
    description: 'A deep volcanic cavern filled with gold and ash.',
    tags: ['COMBAT', 'BOSS', 'DUNGEON'],
    soundscapeCategories: [
      { categoryId: 'cat-boss', volume: 0.9, intensity: 'III' },
      { categoryId: 'cat-weather', volume: 0.5, intensity: 'I' },
    ],
    soundboardTiles: [
      { id: 'tile-1', fxTrackId: 'fx-dragon-roar', hotkey: 1, position: 1 },
      { id: 'tile-2', fxTrackId: 'fx-sword-clash', hotkey: 2, position: 2 },
      { id: 'tile-3', fxTrackId: 'fx-whip', hotkey: 3, position: 3 },
    ],
    notes: 'The dragon emerges from the magma pool when PCs step on the central altar.',
    isUserOwned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'scene-rusty-tankard',
    name: 'The Rusty Tankard',
    description: 'A bustling tavern with crackling hearth and warm ale.',
    tags: ['TAVERN', 'SOCIAL'],
    soundscapeCategories: [
      { categoryId: 'cat-bonfire', volume: 0.8, intensity: 'I' },
    ],
    soundboardTiles: [
      { id: 'tile-4', fxTrackId: 'fx-dog-bark', hotkey: 1, position: 1 },
    ],
    notes: 'Barkeep Grimley has information about the missing guard captain.',
    isUserOwned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'scene-whispering-woods',
    name: 'Whispering Woods',
    description: 'Ancient fey forest shrouded in luminescent mist.',
    tags: ['FOREST', 'EXPLORATION'],
    soundscapeCategories: [
      { categoryId: 'cat-forest', volume: 0.7, intensity: 'I' },
      { categoryId: 'cat-weather', volume: 0.4, intensity: 'I' },
    ],
    soundboardTiles: [
      { id: 'tile-5', fxTrackId: 'fx-owl-hoot', hotkey: 1, position: 1 },
      { id: 'tile-6', fxTrackId: 'fx-arrow-twang', hotkey: 2, position: 2 },
    ],
    notes: 'Will-o-wisps lead the party toward the forgotten shrine.',
    isUserOwned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-underdark',
    name: 'Shadows of the Underdark',
    description: 'A long-running descent into subterranean horror.',
    lastPlayedAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'camp-echoes',
    name: 'Echoes of the Void',
    description: 'Whispers from a shattered astral keep.',
    lastPlayedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const DEFAULT_SESSIONS: Session[] = [
  {
    id: 'sess-14',
    campaignId: 'camp-underdark',
    name: 'The Howling Crags',
    sessionNumber: 14,
    date: new Date().toISOString().split('T')[0],
    description: 'The party faces the dragon atop the jagged peak.',
    sceneIds: ['scene-dragons-lair', 'scene-whispering-woods'],
    lastPlayedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sess-13',
    campaignId: 'camp-underdark',
    name: 'Sunken Temple',
    sessionNumber: 13,
    date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
    description: 'Exploration of ancient drowned ruins.',
    sceneIds: ['scene-rusty-tankard'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function loadStoredData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return defaultValue
    return JSON.parse(raw) as T
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage:`, e)
    return defaultValue
  }
}

export function saveStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage:`, e)
  }
}

export const StorageService = {
  getCampaigns: (): Campaign[] => loadStoredData(STORAGE_KEYS.CAMPAIGNS, DEFAULT_CAMPAIGNS),
  saveCampaigns: (data: Campaign[]) => saveStoredData(STORAGE_KEYS.CAMPAIGNS, data),

  getSessions: (): Session[] => loadStoredData(STORAGE_KEYS.SESSIONS, DEFAULT_SESSIONS),
  saveSessions: (data: Session[]) => saveStoredData(STORAGE_KEYS.SESSIONS, data),

  getScenes: (): Scene[] => loadStoredData(STORAGE_KEYS.SCENES, DEFAULT_SCENES),
  saveScenes: (data: Scene[]) => saveStoredData(STORAGE_KEYS.SCENES, data),

  getSoundscapeCategories: (): SoundscapeCategory[] =>
    loadStoredData(STORAGE_KEYS.SOUNDSCAPE_CATEGORIES, DEFAULT_CATEGORIES),
  saveSoundscapeCategories: (data: SoundscapeCategory[]) =>
    saveStoredData(STORAGE_KEYS.SOUNDSCAPE_CATEGORIES, data),

  getSoundscapeTracks: (): SoundscapeTrack[] =>
    loadStoredData(STORAGE_KEYS.SOUNDSCAPE_TRACKS, DEFAULT_SOUNDSCAPE_TRACKS),
  saveSoundscapeTracks: (data: SoundscapeTrack[]) =>
    saveStoredData(STORAGE_KEYS.SOUNDSCAPE_TRACKS, data),

  getFXTracks: (): FXTrack[] => loadStoredData(STORAGE_KEYS.FX_TRACKS, DEFAULT_FX_TRACKS),
  saveFXTracks: (data: FXTrack[]) => saveStoredData(STORAGE_KEYS.FX_TRACKS, data),

  getTrash: (): TrashItem[] => loadStoredData(STORAGE_KEYS.TRASH, []),
  saveTrash: (data: TrashItem[]) => saveStoredData(STORAGE_KEYS.TRASH, data),
}
