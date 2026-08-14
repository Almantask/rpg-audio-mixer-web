export interface Campaign {
  id: string
  name: string
  description?: string
  coverUrl?: string
  createdAt: string
  updatedAt: string
  lastPlayedAt?: string
  deletedAt?: string | null
}

export interface Session {
  id: string
  campaignId: string
  sessionNumber: number
  name: string
  date: string
  description?: string
  coverUrl?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  sceneIds?: string[]
}
