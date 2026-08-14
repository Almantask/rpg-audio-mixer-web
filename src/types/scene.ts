export interface SceneSoundboardEffect {
  id: string
  effectId: string
  name: string
  icon?: string
  tags?: string[]
  durationSeconds?: number
  intensity?: 'I' | 'II' | 'III'
  hotkey?: number
  order: number
}

export interface Scene {
  id: string
  name: string
  description?: string
  backgroundUrl?: string
  tags?: string[]
  sessionIds?: string[]
  soundboardEffects?: SceneSoundboardEffect[]
  soundscapeCategories?: string[]
  soundboardMasterVolume?: number
  soundscapeMasterVolume?: number
  isLocked?: boolean
  createdAt: string
  updatedAt: string
  lastPlayedAt?: string
  deletedAt?: string | null
}
