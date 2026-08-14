import type { Campaign, Session, Scene, FXTrack, TrashItem } from '../types'

const STORAGE_KEY = 'ARCANUM_AUDIO_DB_V1'

interface DBState {
  campaigns: Campaign[]
  sessions: Session[]
  scenes: Scene[]
  fxTracks: FXTrack[]
  trash: TrashItem[]
  lastActiveSessionIdByCampaign: Record<string, string>
  lastActiveSceneIdBySession: Record<string, string>
  sceneSessionLinks: Record<string, string[]> // sceneId -> sessionIds[]
}

const DEFAULT_FX: FXTrack[] = [
  { id: 'fx-1', title: 'Wolf Howl', duration: '0:04', durationSeconds: 4, tags: ['Combat', 'Creature'], fileUrl: '/assets/audio/fx/wolf_howl.mp3' },
  { id: 'fx-2', title: 'Thunder Crack', duration: '0:04', durationSeconds: 4, tags: ['Impact', 'Weather'], fileUrl: '/assets/audio/fx/thunder_crack.mp3' },
  { id: 'fx-3', title: 'Door Creak', duration: '0:03', durationSeconds: 3, tags: ['Atmosphere'], fileUrl: '/assets/audio/fx/door_creak.mp3' },
  { id: 'fx-4', title: 'Sword Clash', duration: '0:02', durationSeconds: 2, tags: ['Combat', 'Impact'], fileUrl: '/assets/audio/fx/sword_clash.mp3' },
  { id: 'fx-5', title: 'Battle Horn', duration: '0:05', durationSeconds: 5, tags: ['Combat'], fileUrl: '/assets/audio/fx/battle_horn.mp3' },
]

const DEFAULT_SCENES: Scene[] = [
  { id: 'scene-1', name: 'Tavern', description: 'A lively inn with music and chatter', coverUrl: 'tavern.jpg', tags: ['Social'], soundscapeCategories: ['Tavern Music'], effectIds: ['fx-3'], createdAt: new Date(Date.now() - 30000).toISOString() },
  { id: 'scene-2', name: 'Forest', description: 'Deep dark woods', tags: ['Exploration'], soundscapeCategories: ['Forest Ambience'], effectIds: ['fx-1'], createdAt: new Date(Date.now() - 20000).toISOString() },
  { id: 'scene-3', name: 'Dungeon', description: 'Cold stone dungeons', tags: ['Combat'], soundscapeCategories: ['Dungeon Echoes'], effectIds: ['fx-2', 'fx-4'], createdAt: new Date(Date.now() - 10000).toISOString() },
  { id: 'scene-4', name: "Dragon's Lair", description: 'A fiery cavern filled with gold and ash', tags: ['Boss'], soundscapeCategories: ['Fire', 'Roar', 'Lava', 'Dread'], effectIds: Array(12).fill('fx-4'), createdAt: new Date(Date.now() - 5000).toISOString() },
  { id: 'scene-5', name: 'The Rusty Tankard', description: 'Rowdy tavern', tags: ['Tavern'], soundscapeCategories: [], effectIds: [], createdAt: new Date(Date.now() - 4000).toISOString() },
]

const DEFAULT_CAMPAIGNS: Campaign[] = [
  { id: 'camp-1', name: 'The Shattered Throne', description: 'Whispers from a shattered keep', createdAt: new Date(Date.now() - 100000).toISOString() },
  { id: 'camp-2', name: 'Curse of Strahd', description: 'Gothic horror in Barovia', createdAt: new Date(Date.now() - 80000).toISOString() },
  { id: 'camp-3', name: 'The Wild Beyond', description: 'A fey wild journey', createdAt: new Date(Date.now() - 60000).toISOString() },
]

const DEFAULT_SESSIONS: Session[] = [
  { id: 'sess-1', campaignId: 'camp-2', number: 'Session 1', name: 'The Dark Arrival', date: '2026-01-01', description: 'The party enters Barovia', sceneIds: ['scene-1', 'scene-2'], createdAt: new Date(Date.now() - 50000).toISOString() },
  { id: 'sess-2', campaignId: 'camp-2', number: 'Session 2', name: 'Castle Ravenloft', date: '2026-01-08', description: 'Exploring the vampire castle', sceneIds: ['scene-3'], createdAt: new Date(Date.now() - 40000).toISOString() },
  { id: 'sess-3', campaignId: 'camp-2', number: 'Session 3', name: 'The Final Battle', date: '2026-01-15', description: 'Confrontation with Strahd', sceneIds: [], createdAt: new Date(Date.now() - 30000).toISOString() },
  { id: 'sess-14', campaignId: 'camp-2', number: 'Session 14', name: 'The Howling Crags', date: '2026-03-12', description: 'The party climbs the windy ridge', sceneIds: ['scene-4'], createdAt: new Date(Date.now() - 10000).toISOString() },
]

const initialState: DBState = {
  campaigns: DEFAULT_CAMPAIGNS,
  sessions: DEFAULT_SESSIONS,
  scenes: DEFAULT_SCENES,
  fxTracks: DEFAULT_FX,
  trash: [],
  lastActiveSessionIdByCampaign: { 'camp-2': 'sess-1' },
  lastActiveSceneIdBySession: { 'sess-1': 'scene-1' },
  sceneSessionLinks: {
    'scene-1': ['sess-1'],
    'scene-2': ['sess-1'],
    'scene-3': ['sess-2'],
    'scene-4': ['sess-14'],
  },
}

function loadState(): DBState {
  if (typeof window === 'undefined') return initialState
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw)
    const campaigns = Array.isArray(parsed.campaigns) && parsed.campaigns.length > 0 ? parsed.campaigns : DEFAULT_CAMPAIGNS
    if (!campaigns.some((c: any) => c.id === 'camp-2')) {
      campaigns.push(DEFAULT_CAMPAIGNS.find(c => c.id === 'camp-2') || DEFAULT_CAMPAIGNS[0])
    }

    const sessions = Array.isArray(parsed.sessions) && parsed.sessions.length > 0 ? parsed.sessions : DEFAULT_SESSIONS
    if (!sessions.some((s: any) => s.id === 'sess-1')) {
      sessions.push(DEFAULT_SESSIONS.find(s => s.id === 'sess-1') || DEFAULT_SESSIONS[0])
    }

    return {
      campaigns,
      sessions,
      scenes: Array.isArray(parsed.scenes) ? parsed.scenes : DEFAULT_SCENES,
      fxTracks: Array.isArray(parsed.fxTracks) ? parsed.fxTracks : DEFAULT_FX,
      trash: Array.isArray(parsed.trash) ? parsed.trash : [],
      lastActiveSessionIdByCampaign: parsed.lastActiveSessionIdByCampaign || { 'camp-2': 'sess-1' },
      lastActiveSceneIdBySession: parsed.lastActiveSceneIdBySession || { 'sess-1': 'scene-1' },
      sceneSessionLinks: parsed.sceneSessionLinks || {
        'scene-1': ['sess-1'],
        'scene-2': ['sess-1'],
        'scene-3': ['sess-2'],
        'scene-4': ['sess-14'],
      },
    }
  } catch {
    return initialState
  }
}

function saveState(state: DBState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    window.dispatchEvent(new Event('arcanum_db_updated'))
  }
}

class ArcanumDB {
  private state: DBState = loadState()

  getState(): DBState {
    return this.state
  }

  reset(customState?: Partial<DBState>): void {
    this.state = {
      campaigns: customState?.campaigns ?? [],
      sessions: customState?.sessions ?? [],
      scenes: customState?.scenes ?? [],
      fxTracks: customState?.fxTracks ?? [],
      trash: customState?.trash ?? [],
      lastActiveSessionIdByCampaign: customState?.lastActiveSessionIdByCampaign ?? {},
      lastActiveSceneIdBySession: customState?.lastActiveSceneIdBySession ?? {},
      sceneSessionLinks: customState?.sceneSessionLinks ?? {},
    }
    saveState(this.state)
  }

  // Campaigns
  getCampaigns(): Campaign[] {
    return this.state.campaigns
  }

  getCampaignById(id: string): Campaign | undefined {
    return this.state.campaigns.find((c) => c.id === id || c.name.toLowerCase() === id.toLowerCase())
  }

  createCampaign(name: string, description?: string, coverUrl?: string): Campaign {
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name,
      description,
      coverUrl,
      createdAt: new Date().toISOString(),
    }
    this.state.campaigns.push(newCamp)
    saveState(this.state)
    return newCamp
  }

  deleteCampaign(id: string): void {
    const index = this.state.campaigns.findIndex((c) => c.id === id)
    if (index !== -1) {
      const [deleted] = this.state.campaigns.splice(index, 1)
      const linkedSessions = this.state.sessions.filter((s) => s.campaignId === deleted.id)
      const sessionIds = linkedSessions.map((s) => s.id)
      
      this.state.trash.push({
        id: `trash-${Date.now()}`,
        type: 'campaign',
        originalData: deleted,
        deletedAt: new Date().toISOString(),
        sessionIds,
      })
      saveState(this.state)
    }
  }

  restoreCampaign(id: string): void {
    const index = this.state.trash.findIndex((t) => t.type === 'campaign' && t.originalData.id === id)
    if (index !== -1) {
      const [item] = this.state.trash.splice(index, 1)
      this.state.campaigns.push(item.originalData as Campaign)
      saveState(this.state)
    }
  }

  touchCampaignPlayed(id: string): void {
    const camp = this.getCampaignById(id)
    if (camp) {
      camp.lastPlayedDate = new Date().toISOString()
      saveState(this.state)
    }
  }

  // Sessions
  getSessionsByCampaign(campaignId: string): Session[] {
    return this.state.sessions.filter((s) => s.campaignId === campaignId)
  }

  getSessionById(id: string): Session | undefined {
    return this.state.sessions.find((s) => s.id === id)
  }

  createSession(campaignId: string, name: string, date?: string, description?: string, coverUrl?: string): Session {
    const campaignSessions = this.getSessionsByCampaign(campaignId)
    const sessionNum = `Session ${campaignSessions.length + 1}`
    const newSession: Session = {
      id: `sess-${Date.now()}`,
      campaignId,
      number: sessionNum,
      name,
      date: date || new Date().toISOString().split('T')[0],
      description,
      coverUrl,
      sceneIds: [],
      createdAt: new Date().toISOString(),
    }
    this.state.sessions.push(newSession)
    saveState(this.state)
    return newSession
  }

  updateSession(id: string, updates: Partial<Session>): Session | undefined {
    const session = this.getSessionById(id)
    if (session) {
      Object.assign(session, updates)
      saveState(this.state)
    }
    return session
  }

  deleteSession(id: string): void {
    const index = this.state.sessions.findIndex((s) => s.id === id)
    if (index !== -1) {
      const [deleted] = this.state.sessions.splice(index, 1)
      this.state.trash.push({
        id: `trash-${Date.now()}`,
        type: 'session',
        originalData: deleted,
        deletedAt: new Date().toISOString(),
      })
      saveState(this.state)
    }
  }

  setLastActiveSession(campaignId: string, sessionId: string): void {
    this.state.lastActiveSessionIdByCampaign[campaignId] = sessionId
    const session = this.getSessionById(sessionId)
    if (session) {
      session.lastPlayedAt = new Date().toISOString()
    }
    saveState(this.state)
  }

  // Scenes
  getScenes(): Scene[] {
    return this.state.scenes
  }

  getSceneById(id: string): Scene | undefined {
    return this.state.scenes.find((s) => s.id === id || s.name.toLowerCase() === id.toLowerCase())
  }

  createScene(name: string, description?: string, coverUrl?: string): Scene {
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      name,
      description,
      coverUrl,
      tags: [],
      soundscapeCategories: [],
      effectIds: [],
      createdAt: new Date().toISOString(),
    }
    this.state.scenes.push(newScene)
    saveState(this.state)
    return newScene
  }

  updateScene(id: string, updates: Partial<Scene>): Scene | undefined {
    const scene = this.getSceneById(id)
    if (scene) {
      Object.assign(scene, updates)
      saveState(this.state)
    }
    return scene
  }

  deleteScene(id: string): void {
    const index = this.state.scenes.findIndex((s) => s.id === id)
    if (index !== -1) {
      const [deleted] = this.state.scenes.splice(index, 1)
      // Unlink from all sessions
      this.state.sessions.forEach((sess) => {
        sess.sceneIds = sess.sceneIds.filter((sid) => sid !== deleted.id)
      })
      this.state.trash.push({
        id: `trash-${Date.now()}`,
        type: 'scene',
        originalData: deleted,
        deletedAt: new Date().toISOString(),
      })
      saveState(this.state)
    }
  }

  restoreScene(id: string): void {
    const index = this.state.trash.findIndex((t) => t.type === 'scene' && t.originalData.id === id)
    if (index !== -1) {
      const [item] = this.state.trash.splice(index, 1)
      this.state.scenes.push(item.originalData as Scene)
      saveState(this.state)
    }
  }

  linkSceneToSession(sessionId: string, sceneId: string): void {
    const session = this.getSessionById(sessionId)
    if (session && !session.sceneIds.includes(sceneId)) {
      session.sceneIds.push(sceneId)
      saveState(this.state)
    }
  }

  unlinkSceneFromSession(sessionId: string, sceneId: string): void {
    const session = this.getSessionById(sessionId)
    if (session) {
      session.sceneIds = session.sceneIds.filter((sid) => sid !== sceneId)
      saveState(this.state)
    }
  }

  setLastActiveScene(sessionId: string, sceneId: string): void {
    this.state.lastActiveSceneIdBySession[sessionId] = sceneId
    const scene = this.getSceneById(sceneId)
    if (scene) {
      scene.lastPlayedAt = new Date().toISOString()
    }
    saveState(this.state)
  }

  // FX Library
  getFXTracks(): FXTrack[] {
    return this.state.fxTracks
  }

  getFXTrackById(id: string): FXTrack | undefined {
    return this.state.fxTracks.find((f) => f.id === id || f.title.toLowerCase() === id.toLowerCase())
  }

  importFXTrack(title: string, duration = '0:04', tags: string[] = [], fileUrl = '/assets/audio/fx/sample.mp3'): FXTrack {
    const newFX: FXTrack = {
      id: `fx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      duration,
      durationSeconds: 4,
      tags,
      fileUrl,
      isUserUploaded: true,
    }
    this.state.fxTracks.push(newFX)
    saveState(this.state)
    return newFX
  }

  updateFXTrack(id: string, updates: Partial<FXTrack>): FXTrack | undefined {
    const fx = this.getFXTrackById(id)
    if (fx) {
      Object.assign(fx, updates)
      saveState(this.state)
    }
    return fx
  }

  deleteFXTrack(id: string): void {
    const index = this.state.fxTracks.findIndex((f) => f.id === id)
    if (index !== -1) {
      const [deleted] = this.state.fxTracks.splice(index, 1)
      // Remove from all scenes soundboard effectIds
      this.state.scenes.forEach((sc) => {
        sc.effectIds = sc.effectIds.filter((eid) => eid !== deleted.id)
      })
      this.state.trash.push({
        id: `trash-${Date.now()}`,
        type: 'fx',
        originalData: deleted,
        deletedAt: new Date().toISOString(),
      })
      saveState(this.state)
    }
  }

  // Trash
  getTrash(): TrashItem[] {
    return this.state.trash
  }
}

export const db = new ArcanumDB()
