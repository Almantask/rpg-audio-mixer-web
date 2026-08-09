export interface Campaign {
  id: string
  name: string
  description?: string
  coverArt?: string
  lastPlayedAt?: string
  deletedAt?: string
}

export interface Session {
  id: string
  campaignId: string
  sessionNumber: number
  name: string
  date: string
  coverArt?: string
  description?: string
  lastOpenedAt?: string
  deletedAt?: string
}

export interface Scene {
  id: string
  name: string
  description?: string
  coverImage?: string
  tags?: string[]
  soundscapesCount?: number
  effectsCount?: number
  deletedAt?: string
  lastPlayedAt?: string
}

export interface SessionSceneLink {
  sessionId: string
  sceneId: string
  lastPlayedAt?: string
}

export interface FxTrack {
  id: string
  name: string
  duration: string // e.g. "0:04"
  intensity: 'I' | 'II' | 'III'
  tags: string[]
  audioUrl?: string
  deletedAt?: string
}

export interface SceneSoundboardItem {
  sceneId: string
  fxTrackId: string
  order: number
}

const STORAGE_KEY = 'arcanum_audio_db_v1'

interface DbSchema {
  campaigns: Campaign[]
  sessions: Session[]
  scenes: Scene[]
  sessionScenes: SessionSceneLink[]
  fxTracks: FxTrack[]
  soundboardItems: SceneSoundboardItem[]
}

const initialSeed: DbSchema = {
  campaigns: [
    {
      id: 'c1',
      name: 'Shadows of the Underdark',
      description: 'Session 14: The Whispering Gallery awaits your party\'s next move.',
      lastPlayedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'c2',
      name: 'Curse of Strahd',
      description: 'A gothic horror adventure in Barovia',
      lastPlayedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'c3',
      name: 'The Shattered Throne',
      description: 'Political intrigue in the high court',
      lastPlayedAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ],
  sessions: [
    {
      id: 's1',
      campaignId: 'c1',
      sessionNumber: 14,
      name: 'The Whispering Gallery',
      date: 'Mar 12',
      description: 'The party enters the gallery',
      lastOpenedAt: new Date().toISOString(),
    },
    {
      id: 's2',
      campaignId: 'c2',
      sessionNumber: 1,
      name: 'The Dark Arrival',
      date: 'Mar 10',
      description: 'Arriving in Barovia',
      lastOpenedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  scenes: [
    {
      id: 'sc1',
      name: 'Dragon\'s Lair',
      description: 'A dark cavern glowing with molten lava and hoard gold.',
      tags: ['Combat', 'Dungeon'],
      soundscapesCount: 4,
      effectsCount: 12,
    },
    {
      id: 'sc2',
      name: 'The Rusty Tankard',
      description: 'A cozy tavern with crackling fire and warm ale.',
      tags: ['Tavern', 'Social'],
      soundscapesCount: 3,
      effectsCount: 24,
    },
    {
      id: 'sc3',
      name: 'Whispering Woods',
      description: 'Eerie forest path shrouded in mist.',
      tags: ['Forest', 'Exploration'],
      soundscapesCount: 5,
      effectsCount: 8,
    },
  ],
  sessionScenes: [
    { sessionId: 's1', sceneId: 'sc1', lastPlayedAt: new Date().toISOString() },
    { sessionId: 's1', sceneId: 'sc2', lastPlayedAt: new Date(Date.now() - 3600000).toISOString() },
    { sessionId: 's2', sceneId: 'sc2', lastPlayedAt: new Date().toISOString() },
  ],
  fxTracks: [
    { id: 'fx1', name: 'Wolf Howl', duration: '0:05', intensity: 'I', tags: ['Creature', 'Forest'] },
    { id: 'fx2', name: 'Thunder Crack', duration: '0:04', intensity: 'II', tags: ['Impact', 'Weather'] },
    { id: 'fx3', name: 'Door Creak', duration: '0:03', intensity: 'I', tags: ['Object', 'Dungeon'] },
    { id: 'fx4', name: 'Sword Clash', duration: '0:02', intensity: 'I', tags: ['Combat', 'Impact'] },
    { id: 'fx5', name: 'Dragon Roar', duration: '0:06', intensity: 'III', tags: ['Creature', 'Combat'] },
  ],
  soundboardItems: [],
}

export function getDb(): DbSchema {
  if (typeof window === 'undefined') return initialSeed
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    saveDb(initialSeed)
    return initialSeed
  }
  try {
    return JSON.parse(raw) as DbSchema
  } catch {
    saveDb(initialSeed)
    return initialSeed
  }
}

export function saveDb(db: DbSchema): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  }
}

export function resetDbToSeed(): DbSchema {
  saveDb(initialSeed)
  return initialSeed
}
