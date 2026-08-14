export interface FXTrack {
  id: string
  name: string
  audioUrl: string
  durationSeconds: number
  intensity: 'I' | 'II' | 'III'
  tags: string[]
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface SoundscapeCategory {
  id: string
  name: string
  description?: string
  coverUrl?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}
