import type { Campaign, Session, Scene, SessionScene, FxTrack, SoundscapeCategory } from '../types'

const STORAGE_KEYS = {
  CAMPAIGNS: 'arcanum_campaigns',
  SESSIONS: 'arcanum_sessions',
  SCENES: 'arcanum_scenes',
  SESSION_SCENES: 'arcanum_session_scenes',
  FX_LIBRARY: 'arcanum_fx_library',
  SOUNDSCAPES: 'arcanum_soundscapes',
  ACTIVE_CONTEXT: 'arcanum_active_context',
}

const DEFAULT_CAMPAIGNS: Campaign[] = [
  { id: 'camp-1', name: 'Curse of Strahd', description: 'Gothic horror campaign', createdAt: new Date().toISOString() },
  { id: 'camp-2', name: 'Lost Mine of Phandelver', description: 'Starter adventure', createdAt: new Date().toISOString() },
]

const DEFAULT_SESSIONS: Session[] = [
  { id: 'sess-1', campaignId: 'camp-1', name: 'Session 1', description: 'Arrival in Barovia', createdAt: new Date().toISOString() },
  { id: 'sess-2', campaignId: 'camp-1', name: 'Session 2', description: 'Death House', createdAt: new Date().toISOString() },
]

const DEFAULT_SCENES: Scene[] = [
  { id: 'scene-1', name: 'Tavern', description: 'Cozy tavern with fireplace', tags: ['social', 'indoor'], soundscapeCategoryIds: ['sc-1'], soundboardFxIds: ['fx-1', 'fx-2'], isUserOwned: true, createdAt: new Date().toISOString() },
  { id: 'scene-2', name: 'Dungeon', description: 'Dark creepy dungeon', tags: ['combat', 'dark'], soundscapeCategoryIds: ['sc-2'], soundboardFxIds: ['fx-3'], isUserOwned: true, createdAt: new Date().toISOString() },
]

const DEFAULT_SESSION_SCENES: SessionScene[] = [
  { sessionId: 'sess-1', sceneId: 'scene-1', linkedAt: new Date().toISOString(), lastActiveAt: new Date().toISOString() },
  { sessionId: 'sess-1', sceneId: 'scene-2', linkedAt: new Date().toISOString() },
]

const DEFAULT_FX: FxTrack[] = [
  { id: 'fx-1', name: 'Sword Clash', category: 'Combat', tags: ['weapon', 'metal'], audioUrl: '/assets/audio/sword_clash.ogg', durationSeconds: 2 },
  { id: 'fx-2', name: 'Thunder', category: 'Weather', tags: ['magic', 'nature'], audioUrl: '/assets/audio/thunder.ogg', durationSeconds: 3 },
  { id: 'fx-3', name: 'Door Creak', category: 'Ambience', tags: ['spooky'], audioUrl: '/assets/audio/door_creak.ogg', durationSeconds: 2 },
]

const DEFAULT_SOUNDSCAPES: SoundscapeCategory[] = [
  {
    id: 'sc-1',
    name: 'Tavern Ambience',
    description: 'Bustling fantasy inn with laughter and lute music',
    tags: ['tavern', 'social'],
    tracks: {
      level1: [{ id: 'tr-1', name: 'Crowd Murmur', audioUrl: '/assets/audio/crowd.ogg', durationSeconds: 60 }],
      level2: [{ id: 'tr-2', name: 'Fireplace Crackle', audioUrl: '/assets/audio/fire.ogg', durationSeconds: 60 }],
      level3: [{ id: 'tr-3', name: 'Lute Song', audioUrl: '/assets/audio/lute.ogg', durationSeconds: 60 }],
    },
  },
  {
    id: 'sc-2',
    name: 'Dungeon Drips',
    description: 'Eerie underground cavern with water drops',
    tags: ['dungeon', 'scary'],
    tracks: {
      level1: [{ id: 'tr-4', name: 'Water Drips', audioUrl: '/assets/audio/drips.ogg', durationSeconds: 60 }],
      level2: [{ id: 'tr-5', name: 'Wind Howl', audioUrl: '/assets/audio/wind.ogg', durationSeconds: 60 }],
      level3: [],
    },
  },
]

export function getItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export const storage = {
  getCampaigns: (): Campaign[] => getItem(STORAGE_KEYS.CAMPAIGNS, DEFAULT_CAMPAIGNS),
  saveCampaigns: (c: Campaign[]) => setItem(STORAGE_KEYS.CAMPAIGNS, c),

  getSessions: (): Session[] => getItem(STORAGE_KEYS.SESSIONS, DEFAULT_SESSIONS),
  saveSessions: (s: Session[]) => setItem(STORAGE_KEYS.SESSIONS, s),

  getScenes: (): Scene[] => getItem(STORAGE_KEYS.SCENES, DEFAULT_SCENES),
  saveScenes: (s: Scene[]) => setItem(STORAGE_KEYS.SCENES, s),

  getSessionScenes: (): SessionScene[] => getItem(STORAGE_KEYS.SESSION_SCENES, DEFAULT_SESSION_SCENES),
  saveSessionScenes: (ss: SessionScene[]) => setItem(STORAGE_KEYS.SESSION_SCENES, ss),

  getFxLibrary: (): FxTrack[] => getItem(STORAGE_KEYS.FX_LIBRARY, DEFAULT_FX),
  saveFxLibrary: (fx: FxTrack[]) => setItem(STORAGE_KEYS.FX_LIBRARY, fx),

  getSoundscapes: (): SoundscapeCategory[] => getItem(STORAGE_KEYS.SOUNDSCAPES, DEFAULT_SOUNDSCAPES),
  saveSoundscapes: (sc: SoundscapeCategory[]) => setItem(STORAGE_KEYS.SOUNDSCAPES, sc),

  getActiveContext: () => getItem(STORAGE_KEYS.ACTIVE_CONTEXT, { campaignId: null, sessionId: null, sceneId: null }),
  saveActiveContext: (ctx: { campaignId: string | null; sessionId: string | null; sceneId: string | null }) =>
    setItem(STORAGE_KEYS.ACTIVE_CONTEXT, ctx),
}
