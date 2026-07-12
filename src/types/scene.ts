export interface Scene {
  id: string
  name: string
  description?: string
  coverArtUrl?: string
  tags: string[]
  createdAt: string
  lastUsedAt: string
  deletedAt?: string
}

export interface SessionSceneLink {
  id: string
  sessionId: string
  sceneId: string
  linkedAt: string
  lastPlayedAt?: string
}

export interface SceneSoundboardEntry {
  id: string
  sceneId: string
  fxTrackId: string
  order: number
}

export interface SceneSoundscapeSlot {
  id: string
  sceneId: string
  categoryId: string
  order: number
}

export interface SceneSoundboardSettings {
  sceneId: string
  masterVolume: number
}
