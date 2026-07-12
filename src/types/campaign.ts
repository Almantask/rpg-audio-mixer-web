import type { FxTrack, SoundscapeCategory } from './library'
import type {
  Scene,
  SceneSoundboardEntry,
  SceneSoundboardSettings,
  SceneSoundscapeSlot,
  SessionSceneLink,
} from './scene'

export interface Campaign {
  id: string
  name: string
  description?: string
  coverArtUrl?: string
  createdAt: string
  lastPlayedAt: string
  deletedAt?: string
}

export interface Session {
  id: string
  campaignId: string
  name: string
  number: number
  date: string
  description?: string
  coverArtUrl?: string
  sceneCount: number
  lastOpenedAt?: string
  deletedAt?: string
}

export interface AppData {
  campaigns: Campaign[]
  sessions: Session[]
  /** campaignId → sessionId of most recently opened session */
  lastActiveSessionByCampaign: Record<string, string>
  scenes: Scene[]
  sessionSceneLinks: SessionSceneLink[]
  sceneSoundboardEntries: SceneSoundboardEntry[]
  sceneSoundscapeSlots: SceneSoundscapeSlot[]
  sceneSoundboardSettings: SceneSoundboardSettings[]
  fxTracks: FxTrack[]
  soundscapeCategories: SoundscapeCategory[]
  /** sessionId → sceneId of most recently played scene */
  lastActiveSceneBySession: Record<string, string>
}

export type TrashTab = 'campaigns' | 'sessions' | 'scenes' | 'fx'

export interface E2EControls {
  campaignListState: 'ready' | 'loading' | 'error'
  sessionsListState: Record<string, 'ready' | 'loading' | 'error'>
  sceneListState: 'ready' | 'loading' | 'error'
  fxLibraryState: 'ready' | 'loading' | 'error'
  sessionScenesListState: Record<string, 'ready' | 'loading' | 'error'>
  createSessionFails: boolean
  saveSessionFails: boolean
  invalidAudioImport?: boolean
}

export const EMPTY_APP_DATA: AppData = {
  campaigns: [],
  sessions: [],
  lastActiveSessionByCampaign: {},
  scenes: [],
  sessionSceneLinks: [],
  sceneSoundboardEntries: [],
  sceneSoundscapeSlots: [],
  sceneSoundboardSettings: [],
  fxTracks: [],
  soundscapeCategories: [],
  lastActiveSceneBySession: {},
}

export const DEFAULT_E2E_CONTROLS: E2EControls = {
  campaignListState: 'ready',
  sessionsListState: {},
  sceneListState: 'ready',
  fxLibraryState: 'ready',
  sessionScenesListState: {},
  createSessionFails: false,
  saveSessionFails: false,
}
