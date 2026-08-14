import type { Campaign } from '../types/campaign'
import { getCampaigns, saveCampaigns, getSessions, saveSessions, setActiveCampaignId } from './storageService'

export function getActiveCampaigns(): Campaign[] {
  const campaigns = getCampaigns().filter((c) => !c.deletedAt)
  return campaigns.sort((a, b) => {
    const timeA = a.lastPlayedAt || a.updatedAt || a.createdAt
    const timeB = b.lastPlayedAt || b.updatedAt || b.createdAt
    return new Date(timeB).getTime() - new Date(timeA).getTime()
  })
}

export function getCampaignById(id: string): Campaign | undefined {
  return getCampaigns().find((c) => c.id === id)
}

export function createCampaign(data: { name: string; description?: string; coverUrl?: string }): Campaign {
  const campaigns = getCampaigns()
  const now = new Date().toISOString()
  const newCampaign: Campaign = {
    id: `camp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: data.name.trim(),
    description: data.description?.trim() || undefined,
    coverUrl: data.coverUrl || undefined,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }
  campaigns.unshift(newCampaign)
  saveCampaigns(campaigns)
  return newCampaign
}

export function updateCampaign(id: string, updates: Partial<Campaign>): Campaign | undefined {
  const campaigns = getCampaigns()
  const idx = campaigns.findIndex((c) => c.id === id)
  if (idx === -1) return undefined
  campaigns[idx] = {
    ...campaigns[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  saveCampaigns(campaigns)
  return campaigns[idx]
}

export function touchCampaignPlayed(id: string): void {
  const campaigns = getCampaigns()
  const idx = campaigns.findIndex((c) => c.id === id)
  if (idx !== -1) {
    campaigns[idx].lastPlayedAt = new Date().toISOString()
    saveCampaigns(campaigns)
  }
  setActiveCampaignId(id)
}

export function softDeleteCampaign(id: string): void {
  const campaigns = getCampaigns()
  const idx = campaigns.findIndex((c) => c.id === id)
  if (idx !== -1) {
    campaigns[idx].deletedAt = new Date().toISOString()
    saveCampaigns(campaigns)
  }
}

export function getTrashCampaigns(): Campaign[] {
  return getCampaigns().filter((c) => c.deletedAt)
}

export function restoreCampaign(id: string): Campaign | undefined {
  const campaigns = getCampaigns()
  const target = campaigns.find((c) => c.id === id)
  if (!target) return undefined

  let newName = target.name
  const activeNames = campaigns.filter((c) => !c.deletedAt && c.id !== id).map((c) => c.name)
  if (activeNames.includes(newName)) {
    newName = `${newName} (restored)`
  }

  target.name = newName
  target.deletedAt = null
  target.updatedAt = new Date().toISOString()
  saveCampaigns(campaigns)

  // Auto-restore orphaned sessions linked to this campaign
  const sessions = getSessions()
  sessions.forEach((s) => {
    if (s.campaignId === id && s.deletedAt) {
      s.deletedAt = null
      s.updatedAt = new Date().toISOString()
    }
  })
  saveSessions(sessions)

  return target
}

export function purgeCampaign(id: string): void {
  const campaigns = getCampaigns().filter((c) => c.id !== id)
  saveCampaigns(campaigns)
}

export function purgeAllTrashCampaigns(): void {
  const campaigns = getCampaigns().filter((c) => !c.deletedAt)
  saveCampaigns(campaigns)
}
