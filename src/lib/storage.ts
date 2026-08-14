import type {
  Campaign,
  Session,
  Scene,
  SoundboardEffect,
  FxTrack,
  TrashItem,
  TrashEntityType,
} from './types'

const STORAGE_KEYS = {
  CAMPAIGNS: 'arcanum_campaigns',
  SESSIONS: 'arcanum_sessions',
  SCENES: 'arcanum_scenes',
  FX_TRACKS: 'arcanum_fx_tracks',
  TRASH: 'arcanum_trash',
}

const DEFAULT_FX_TRACKS: FxTrack[] = [
  {
    id: 'fx_sword_clash',
    name: 'Sword Clash',
    duration: '0:03',
    durationSeconds: 3,
    intensity: 'II',
    tags: ['Combat', 'Impact'],
    url: '/assets/audio/soundboard/sword.ogg',
    defaultVolume: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fx_dragon_roar',
    name: 'Dragon Roar',
    duration: '0:04',
    durationSeconds: 4,
    intensity: 'III',
    tags: ['Creature', 'Boss'],
    url: '/assets/audio/soundboard/dragon_roar2.ogg',
    defaultVolume: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fx_arrow_whistle',
    name: 'Arrow Whistle',
    duration: '0:02',
    durationSeconds: 2,
    intensity: 'I',
    tags: ['Combat', 'Ranged'],
    url: '/assets/audio/soundboard/arrow.ogg',
    defaultVolume: 0.9,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fx_magic_surge',
    name: 'Magic Surge',
    duration: '0:05',
    durationSeconds: 5,
    intensity: 'II',
    tags: ['Magic', 'Spell'],
    url: '/assets/audio/soundboard/sword.ogg',
    defaultVolume: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fx_thunder_crack',
    name: 'Thunder Crack',
    duration: '0:04',
    durationSeconds: 4,
    intensity: 'III',
    tags: ['Weather', 'Nature'],
    url: '/assets/audio/soundboard/dragon_roar2.ogg',
    defaultVolume: 1,
    createdAt: new Date().toISOString(),
  },
]

type Listener = () => void
const changeListeners = new Set<Listener>()

function notifyChange() {
  for (const listener of changeListeners) {
    listener()
  }
}

export const storage = {
  subscribe(listener: Listener): () => void {
    changeListeners.add(listener)
    return () => {
      changeListeners.delete(listener)
    }
  },

  // --- CAMPAIGNS ---
  getCampaigns(): Campaign[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  saveCampaigns(campaigns: Campaign[]): void {
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns))
    notifyChange()
  },

  createCampaign(data: { name: string; description?: string; coverArt?: string }): Campaign {
    const campaigns = this.getCampaigns()
    const now = new Date().toISOString()
    const newCampaign: Campaign = {
      id: `camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name,
      description: data.description,
      coverArt: data.coverArt,
      createdAt: now,
      lastPlayedAt: now,
    }
    this.saveCampaigns([newCampaign, ...campaigns])
    return newCampaign
  },

  updateCampaign(id: string, updates: Partial<Omit<Campaign, 'id' | 'createdAt'>>): Campaign | undefined {
    const campaigns = this.getCampaigns()
    const idx = campaigns.findIndex((c) => c.id === id)
    if (idx === -1) return undefined
    campaigns[idx] = { ...campaigns[idx], ...updates }
    this.saveCampaigns(campaigns)
    return campaigns[idx]
  },

  touchCampaignPlayed(id: string): void {
    this.updateCampaign(id, { lastPlayedAt: new Date().toISOString() })
  },

  deleteCampaign(id: string): void {
    const campaigns = this.getCampaigns()
    const target = campaigns.find((c) => c.id === id)
    if (!target) return

    // Move to trash
    this.addTrashItem({
      originalId: target.id,
      entityType: 'campaign',
      title: target.name,
      data: target,
    })

    // Remove from active campaigns
    this.saveCampaigns(campaigns.filter((c) => c.id !== id))
  },

  // --- SESSIONS ---
  getSessions(campaignId?: string): Session[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS)
      const list: Session[] = data ? JSON.parse(data) : []
      if (campaignId) {
        return list.filter((s) => s.campaignId === campaignId)
      }
      return list
    } catch {
      return []
    }
  },

  saveSessions(sessions: Session[]): void {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
    notifyChange()
  },

  getNextSessionNumber(campaignId: string): number {
    const sessions = this.getSessions(campaignId)
    if (sessions.length === 0) return 1
    const maxNum = Math.max(...sessions.map((s) => s.sessionNumber || 0))
    return maxNum + 1
  },

  createSession(data: {
    campaignId: string
    name: string
    date: string
    description?: string
    coverArt?: string
  }): Session {
    const allSessions = this.getSessions()
    const sessionNumber = this.getNextSessionNumber(data.campaignId)
    const now = new Date().toISOString()
    const newSession: Session = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      campaignId: data.campaignId,
      sessionNumber,
      name: data.name,
      date: data.date,
      description: data.description,
      coverArt: data.coverArt,
      createdAt: now,
      lastOpenedAt: now,
    }
    this.saveSessions([newSession, ...allSessions])
    this.touchCampaignPlayed(data.campaignId)
    return newSession
  },

  updateSession(id: string, updates: Partial<Omit<Session, 'id' | 'campaignId' | 'sessionNumber' | 'createdAt'>>): Session | undefined {
    const sessions = this.getSessions()
    const idx = sessions.findIndex((s) => s.id === id)
    if (idx === -1) return undefined
    sessions[idx] = { ...sessions[idx], ...updates }
    this.saveSessions(sessions)
    return sessions[idx]
  },

  setLastActiveSession(id: string): void {
    this.updateSession(id, { lastOpenedAt: new Date().toISOString() })
  },

  deleteSession(id: string): void {
    const sessions = this.getSessions()
    const target = sessions.find((s) => s.id === id)
    if (!target) return

    this.addTrashItem({
      originalId: target.id,
      entityType: 'session',
      title: target.name,
      data: target,
    })

    this.saveSessions(sessions.filter((s) => s.id !== id))
  },

  // --- SCENES ---
  getScenes(): Scene[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCENES)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  getSceneById(id: string): Scene | undefined {
    return this.getScenes().find((s) => s.id === id)
  },

  getScenesForSession(sessionId: string): Scene[] {
    return this.getScenes().filter((sc) => sc.sessionIds?.includes(sessionId))
  },

  saveScenes(scenes: Scene[]): void {
    localStorage.setItem(STORAGE_KEYS.SCENES, JSON.stringify(scenes))
    notifyChange()
  },

  createScene(data: {
    name: string
    description?: string
    coverImage?: string
    tags?: string[]
    sessionId?: string
  }): Scene {
    const scenes = this.getScenes()
    const now = new Date().toISOString()
    const newScene: Scene = {
      id: `sc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name,
      description: data.description,
      coverImage: data.coverImage,
      tags: data.tags || [],
      sessionIds: data.sessionId ? [data.sessionId] : [],
      soundboardEffects: [],
      soundscapeCategoryIds: ['cat_ambient'],
      soundboardMasterVolume: 0.85,
      createdAt: now,
      lastPlayedAt: now,
    }
    this.saveScenes([newScene, ...scenes])
    return newScene
  },

  updateScene(id: string, updates: Partial<Omit<Scene, 'id' | 'createdAt'>>): Scene | undefined {
    const scenes = this.getScenes()
    const idx = scenes.findIndex((s) => s.id === id)
    if (idx === -1) return undefined
    scenes[idx] = { ...scenes[idx], ...updates }
    this.saveScenes(scenes)
    return scenes[idx]
  },

  linkSceneToSession(sceneId: string, sessionId: string): void {
    const scene = this.getSceneById(sceneId)
    if (!scene) return
    const currentSessions = scene.sessionIds || []
    if (!currentSessions.includes(sessionId)) {
      this.updateScene(sceneId, { sessionIds: [...currentSessions, sessionId] })
    }
  },

  unlinkSceneFromSession(sceneId: string, sessionId: string): void {
    const scene = this.getSceneById(sceneId)
    if (!scene) return
    const currentSessions = scene.sessionIds || []
    this.updateScene(sceneId, { sessionIds: currentSessions.filter((id) => id !== sessionId) })
  },

  duplicateScene(sceneId: string, targetSessionId?: string): Scene | undefined {
    const scene = this.getSceneById(sceneId)
    if (!scene) return undefined

    const scenes = this.getScenes()
    const now = new Date().toISOString()
    const duplicated: Scene = {
      ...scene,
      id: `sc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `Copy of ${scene.name}`,
      sessionIds: targetSessionId ? [targetSessionId] : (scene.sessionIds ? [...scene.sessionIds] : []),
      soundboardEffects: scene.soundboardEffects ? [...scene.soundboardEffects] : [],
      soundscapeCategoryIds: scene.soundscapeCategoryIds ? [...scene.soundscapeCategoryIds] : [],
      createdAt: now,
      lastPlayedAt: now,
    }
    this.saveScenes([duplicated, ...scenes])
    return duplicated
  },

  deleteScene(id: string): void {
    const scenes = this.getScenes()
    const target = scenes.find((s) => s.id === id)
    if (!target) return

    this.addTrashItem({
      originalId: target.id,
      entityType: 'scene',
      title: target.name,
      data: target,
    })

    this.saveScenes(scenes.filter((s) => s.id !== id))
  },

  addFxToSoundboard(sceneId: string, fxTrackId: string): void {
    const scene = this.getSceneById(sceneId)
    if (!scene) return

    const fxList = this.getFxTracks()
    const fx = fxList.find((f) => f.id === fxTrackId)
    if (!fx) return

    const currentEffects = scene.soundboardEffects || []
    const index = currentEffects.length
    const hotkeyLabel = index < 9 ? `Num ${index + 1}` : undefined

    const newEffect: SoundboardEffect = {
      id: `sfx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fxTrackId: fx.id,
      name: fx.name,
      hotkeyLabel,
      color: '#D4AF37',
      order: index,
    }

    this.updateScene(sceneId, {
      soundboardEffects: [...currentEffects, newEffect],
    })
  },

  removeFxFromSoundboard(sceneId: string, effectId: string): void {
    const scene = this.getSceneById(sceneId)
    if (!scene) return

    const updated = (scene.soundboardEffects || [])
      .filter((e) => e.id !== effectId)
      .map((e, idx) => ({
        ...e,
        order: idx,
        hotkeyLabel: idx < 9 ? `Num ${idx + 1}` : undefined,
      }))

    this.updateScene(sceneId, { soundboardEffects: updated })
  },

  // --- FX TRACKS (LIBRARY) ---
  getFxTracks(): FxTrack[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FX_TRACKS)
      if (data) return JSON.parse(data)
      // Populate defaults
      localStorage.setItem(STORAGE_KEYS.FX_TRACKS, JSON.stringify(DEFAULT_FX_TRACKS))
      return DEFAULT_FX_TRACKS
    } catch {
      return DEFAULT_FX_TRACKS
    }
  },

  saveFxTracks(tracks: FxTrack[]): void {
    localStorage.setItem(STORAGE_KEYS.FX_TRACKS, JSON.stringify(tracks))
    notifyChange()
  },

  createFxTrack(data: Omit<FxTrack, 'id' | 'createdAt'>): FxTrack {
    const tracks = this.getFxTracks()
    const newTrack: FxTrack = {
      ...data,
      id: `fx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    }
    this.saveFxTracks([...tracks, newTrack])
    return newTrack
  },

  updateFxTrack(id: string, updates: Partial<Omit<FxTrack, 'id' | 'createdAt'>>): FxTrack | undefined {
    const tracks = this.getFxTracks()
    const idx = tracks.findIndex((t) => t.id === id)
    if (idx === -1) return undefined
    tracks[idx] = { ...tracks[idx], ...updates }
    this.saveFxTracks(tracks)

    // Sync names into soundboards
    if (updates.name) {
      const scenes = this.getScenes()
      for (const sc of scenes) {
        if (sc.soundboardEffects?.some((e) => e.fxTrackId === id)) {
          const updatedEffects = sc.soundboardEffects.map((e) =>
            e.fxTrackId === id ? { ...e, name: updates.name! } : e
          )
          this.updateScene(sc.id, { soundboardEffects: updatedEffects })
        }
      }
    }

    return tracks[idx]
  },

  deleteFxTrack(id: string): void {
    const tracks = this.getFxTracks()
    const target = tracks.find((t) => t.id === id)
    if (!target) return

    this.addTrashItem({
      originalId: target.id,
      entityType: 'fx',
      title: target.name,
      data: target,
    })

    this.saveFxTracks(tracks.filter((t) => t.id !== id))

    // Remove from scenes
    const scenes = this.getScenes()
    for (const sc of scenes) {
      if (sc.soundboardEffects?.some((e) => e.fxTrackId === id)) {
        const updatedEffects = sc.soundboardEffects.filter((e) => e.fxTrackId !== id)
        this.updateScene(sc.id, { soundboardEffects: updatedEffects })
      }
    }
  },

  // --- TRASH & RETENTION ---
  getTrashItems(type?: TrashEntityType): TrashItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRASH)
      const list: TrashItem[] = data ? JSON.parse(data) : []
      if (type) {
        return list.filter((item) => item.entityType === type)
      }
      return list
    } catch {
      return []
    }
  },

  saveTrashItems(items: TrashItem[]): void {
    localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify(items))
    notifyChange()
  },

  addTrashItem(item: Omit<TrashItem, 'id' | 'deletedAt' | 'expiresAt'>): TrashItem {
    const items = this.getTrashItems()
    const now = new Date()
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const newItem: TrashItem = {
      ...item,
      id: `trash_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      deletedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    }
    this.saveTrashItems([newItem, ...items])
    return newItem
  },

  restoreTrashItem(trashId: string): void {
    const items = this.getTrashItems()
    const item = items.find((i) => i.id === trashId)
    if (!item) return

    // Restore to appropriate repository with collision renaming if needed
    if (item.entityType === 'campaign') {
      const campaigns = this.getCampaigns()
      const existingName = campaigns.some((c) => c.name === item.title)
      const restored = item.data as Campaign
      if (existingName) {
        restored.name = `${restored.name} (restored)`
      }
      this.saveCampaigns([restored, ...campaigns])
    } else if (item.entityType === 'session') {
      const sessions = this.getSessions()
      this.saveSessions([item.data as Session, ...sessions])
    } else if (item.entityType === 'scene') {
      const scenes = this.getScenes()
      const existingName = scenes.some((s) => s.name === item.title)
      const restored = item.data as Scene
      if (existingName) {
        restored.name = `${restored.name} (restored)`
      }
      this.saveScenes([restored, ...scenes])
    } else if (item.entityType === 'fx') {
      const tracks = this.getFxTracks()
      this.saveFxTracks([item.data as FxTrack, ...tracks])
    }

    this.saveTrashItems(items.filter((i) => i.id !== trashId))
  },

  restoreAllTrash(type: TrashEntityType): void {
    const items = this.getTrashItems(type)
    for (const item of items) {
      this.restoreTrashItem(item.id)
    }
  },

  purgeTrashItem(trashId: string): void {
    const items = this.getTrashItems()
    this.saveTrashItems(items.filter((i) => i.id !== trashId))
  },

  emptyTrash(type: TrashEntityType): void {
    const items = this.getTrashItems()
    this.saveTrashItems(items.filter((i) => i.entityType !== type))
  },

  reset(): void {
    localStorage.removeItem(STORAGE_KEYS.CAMPAIGNS)
    localStorage.removeItem(STORAGE_KEYS.SESSIONS)
    localStorage.removeItem(STORAGE_KEYS.SCENES)
    localStorage.removeItem(STORAGE_KEYS.FX_TRACKS)
    localStorage.removeItem(STORAGE_KEYS.TRASH)
    notifyChange()
  },

  seedE2EData(): void {
    this.reset()
    // Setup predefined test fixture data
    const c1 = this.createCampaign({
      name: 'The Shattered Throne',
      description: 'An ancient kingdom lies in ruin.',
    })

    const s1 = this.createSession({
      campaignId: c1.id,
      name: 'The Dark Arrival',
      date: '2026-03-12',
      description: 'The party enters the shadow lands.',
    })

    const sc1 = this.createScene({
      name: 'The Rusty Tankard',
      description: 'A boisterous tavern filled with travelers.',
      tags: ['Tavern', 'Social'],
      sessionId: s1.id,
    })

    const fxList = this.getFxTracks()
    this.addFxToSoundboard(sc1.id, fxList[0].id)
    this.addFxToSoundboard(sc1.id, fxList[1].id)
  },
}
