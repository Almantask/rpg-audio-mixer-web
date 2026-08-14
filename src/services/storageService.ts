import type { Campaign, Session } from '../types/campaign'
import type { Scene } from '../types/scene'
import type { FXTrack, SoundscapeCategory } from '../types/library'

const STORAGE_KEYS = {
  CAMPAIGNS: 'arcanum_campaigns',
  SESSIONS: 'arcanum_sessions',
  SCENES: 'arcanum_scenes',
  FX: 'arcanum_fx',
  SOUNDSCAPES: 'arcanum_soundscapes',
  ACTIVE_SESSION: 'arcanum_active_session',
  ACTIVE_CAMPAIGN: 'arcanum_active_campaign',
  LAST_PLAYED_SCENE: 'arcanum_last_played_scene',
}

const DEFAULT_FX: FXTrack[] = [
  { id: 'fx-thunder', name: 'Thunder', audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 4, intensity: 'II', tags: ['IMPACT'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'fx-sword', name: 'Sword', audioUrl: '/assets/audio/soundboard/sword.ogg', durationSeconds: 2, intensity: 'I', tags: ['COMBAT'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'fx-rune', name: 'Rune Act', audioUrl: '/assets/audio/soundboard/rune.ogg', durationSeconds: 3, intensity: 'III', tags: ['UI', 'MAGIC'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'fx-goblin', name: 'Goblin', audioUrl: '/assets/audio/soundboard/goblin.ogg', durationSeconds: 1, intensity: 'I', tags: ['CREATURE'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'fx-fireball', name: 'Fireball', audioUrl: '/assets/audio/soundboard/fireball.ogg', durationSeconds: 3, intensity: 'II', tags: ['MAGIC', 'FIRE'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'fx-steel', name: 'Steel', audioUrl: '/assets/audio/soundboard/steel.ogg', durationSeconds: 2, intensity: 'I', tags: ['COMBAT'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'fx-thunder-strike', name: 'Thunder Strike', audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 4, intensity: 'II', tags: ['IMPACT'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'fx-dragon-roar', name: 'Dragon Roar', audioUrl: '/assets/audio/soundboard/dragon.ogg', durationSeconds: 5, intensity: 'III', tags: ['CREATURE'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'fx-acid-splash', name: 'Acid Splash', audioUrl: '/assets/audio/soundboard/acid.ogg', durationSeconds: 2, intensity: 'I', tags: ['MAGIC'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'fx-cave-in', name: 'Cave In', audioUrl: '/assets/audio/soundboard/cavein.ogg', durationSeconds: 4, intensity: 'III', tags: ['IMPACT'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error('Storage setItem failed:', err)
  }
}

export function getCampaigns(): Campaign[] {
  return getItem<Campaign[]>(STORAGE_KEYS.CAMPAIGNS, [])
}

export function saveCampaigns(campaigns: Campaign[]): void {
  setItem(STORAGE_KEYS.CAMPAIGNS, campaigns)
}

export function getSessions(): Session[] {
  return getItem<Session[]>(STORAGE_KEYS.SESSIONS, [])
}

export function saveSessions(sessions: Session[]): void {
  setItem(STORAGE_KEYS.SESSIONS, sessions)
}

export function getScenes(): Scene[] {
  return getItem<Scene[]>(STORAGE_KEYS.SCENES, [])
}

export function saveScenes(scenes: Scene[]): void {
  setItem(STORAGE_KEYS.SCENES, scenes)
}

export function getFXTracks(): FXTrack[] {
  return getItem<FXTrack[]>(STORAGE_KEYS.FX, DEFAULT_FX)
}

export function saveFXTracks(fx: FXTrack[]): void {
  setItem(STORAGE_KEYS.FX, fx)
}

export function getSoundscapeCategories(): SoundscapeCategory[] {
  return getItem<SoundscapeCategory[]>(STORAGE_KEYS.SOUNDSCAPES, [])
}

export function saveSoundscapeCategories(categories: SoundscapeCategory[]): void {
  setItem(STORAGE_KEYS.SOUNDSCAPES, categories)
}

export function getActiveSessionId(): string | null {
  return getItem<string | null>(STORAGE_KEYS.ACTIVE_SESSION, null)
}

export function setActiveSessionId(id: string | null): void {
  setItem(STORAGE_KEYS.ACTIVE_SESSION, id)
}

export function getActiveCampaignId(): string | null {
  return getItem<string | null>(STORAGE_KEYS.ACTIVE_CAMPAIGN, null)
}

export function setActiveCampaignId(id: string | null): void {
  setItem(STORAGE_KEYS.ACTIVE_CAMPAIGN, id)
}

export function getLastPlayedSceneId(): string | null {
  return getItem<string | null>(STORAGE_KEYS.LAST_PLAYED_SCENE, null)
}

export function setLastPlayedSceneId(id: string | null): void {
  setItem(STORAGE_KEYS.LAST_PLAYED_SCENE, id)
}

export function seedE2EState(overrideState?: {
  campaigns?: Campaign[]
  sessions?: Session[]
  scenes?: Scene[]
  fx?: FXTrack[]
  soundscapes?: SoundscapeCategory[]
  activeSessionId?: string | null
  activeCampaignId?: string | null
}): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('arcanum_fail_session_create')
    sessionStorage.removeItem('arcanum_fail_session_edit')
  }
  if (overrideState?.campaigns !== undefined) saveCampaigns(overrideState.campaigns)
  if (overrideState?.sessions !== undefined) saveSessions(overrideState.sessions)
  if (overrideState?.scenes !== undefined) saveScenes(overrideState.scenes)
  if (overrideState?.fx !== undefined) saveFXTracks(overrideState.fx)
  if (overrideState?.soundscapes !== undefined) saveSoundscapeCategories(overrideState.soundscapes)
  if (overrideState?.activeSessionId !== undefined) setActiveSessionId(overrideState.activeSessionId)
  if (overrideState?.activeCampaignId !== undefined) setActiveCampaignId(overrideState.activeCampaignId)
  setLastPlayedSceneId(null)
}

if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).__ARCANUM_SEED__ = seedE2EState
}
