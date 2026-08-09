import type {
  Campaign,
  Session,
  Scene,
  SessionSceneLink,
  FXTrack,
  SoundscapeCategory,
  SoundboardTile,
} from '../types'

const STORAGE_KEY = 'ARCANUM_AUDIO_DATA_V1'

export interface AppData {
  campaigns: Campaign[]
  sessions: Session[]
  scenes: Scene[]
  sessionSceneLinks: SessionSceneLink[]
  fxTracks: FXTrack[]
  soundscapeCategories: SoundscapeCategory[]
  soundboardTiles: SoundboardTile[]
  lastActiveSessionIdByCampaign: Record<string, string>
  lastPlayedSceneIdBySession: Record<string, string>
}

const initialData: AppData = {
  campaigns: [],
  sessions: [],
  scenes: [],
  sessionSceneLinks: [],
  fxTracks: [],
  soundscapeCategories: [],
  soundboardTiles: [],
  lastActiveSessionIdByCampaign: {},
  lastPlayedSceneIdBySession: {},
}

function loadData(): AppData {
  if (typeof window === 'undefined') return initialData
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        campaigns: parsed.campaigns || [],
        sessions: parsed.sessions || [],
        scenes: parsed.scenes || [],
        sessionSceneLinks: parsed.sessionSceneLinks || [],
        fxTracks: parsed.fxTracks || [],
        soundscapeCategories: parsed.soundscapeCategories || [],
        soundboardTiles: parsed.soundboardTiles || [],
        lastActiveSessionIdByCampaign: parsed.lastActiveSessionIdByCampaign || {},
        lastPlayedSceneIdBySession: parsed.lastPlayedSceneIdBySession || {},
      }
    }
  } catch {
    // fallback
  }
  return initialData
}

let currentData: AppData = loadData()

function saveData() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData))
    window.dispatchEvent(new CustomEvent('arcanum_store_updated'))
  } catch {
    // ignore
  }
}

export function getData(): AppData {
  return currentData
}

export function setData(newData: Partial<AppData>): AppData {
  currentData = {
    ...currentData,
    ...newData,
  }
  saveData()
  return currentData
}

export function resetData(): AppData {
  currentData = {
    campaigns: [],
    sessions: [],
    scenes: [],
    sessionSceneLinks: [],
    fxTracks: [],
    soundscapeCategories: [],
    soundboardTiles: [],
    lastActiveSessionIdByCampaign: {},
    lastPlayedSceneIdBySession: {},
  }
  saveData()
  return currentData
}

// Global window helpers for E2E seeding
if (typeof window !== 'undefined') {
  window.__ARCANUM_STORE__ = currentData as unknown as Record<string, unknown>
  window.__ARCANUM_RESET_DATA__ = () => {
    resetData()
  }
  window.__ARCANUM_SEED_DATA__ = (seeded: unknown) => {
    if (seeded && typeof seeded === 'object') {
      currentData = {
        ...initialData,
        ...(seeded as Partial<AppData>),
      }
      saveData()
    }
  }
}
