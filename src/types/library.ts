export type FxIntensity = 'I' | 'II' | 'III'

export type FxType =
  | 'IMPACT'
  | 'COMBAT'
  | 'CREATURE'
  | 'UI'
  | 'MAGIC'
  | 'AMBIENT'
  | 'OTHER'

export interface FxTrack {
  id: string
  name: string
  durationSeconds: number
  baseIntensity: FxIntensity
  type: FxType
  tags: string[]
  audioUrl: string
  thumbnailUrl?: string
  defaultVolume: number
  createdAt: string
  deletedAt?: string
}

export interface SoundscapeCategory {
  id: string
  name: string
  trackCount: number
  deletedAt?: string
}
