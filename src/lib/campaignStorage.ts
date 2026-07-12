import type { AppData, Campaign, E2EControls, Session } from '@/types/campaign'
import { DEFAULT_E2E_CONTROLS, EMPTY_APP_DATA } from '@/types/campaign'

const STORAGE_KEY = 'arcanum-audio-data'
const E2E_STORAGE_KEY = 'arcanum-e2e-controls'

export function loadAppData(): AppData {
  if (typeof localStorage === 'undefined') {
    return { ...EMPTY_APP_DATA }
  }

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return { ...EMPTY_APP_DATA }
  }

  try {
    const parsed = JSON.parse(raw) as AppData
    return {
      campaigns: parsed.campaigns ?? [],
      sessions: parsed.sessions ?? [],
      lastActiveSessionByCampaign: parsed.lastActiveSessionByCampaign ?? {},
      scenes: parsed.scenes ?? [],
      sessionSceneLinks: parsed.sessionSceneLinks ?? [],
      sceneSoundboardEntries: parsed.sceneSoundboardEntries ?? [],
      sceneSoundscapeSlots: parsed.sceneSoundscapeSlots ?? [],
      sceneSoundboardSettings: parsed.sceneSoundboardSettings ?? [],
      fxTracks: parsed.fxTracks ?? [],
      soundscapeCategories: parsed.soundscapeCategories ?? [],
      lastActiveSceneBySession: parsed.lastActiveSceneBySession ?? {},
    }
  } catch {
    return { ...EMPTY_APP_DATA }
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function resetAppData(): void {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(E2E_STORAGE_KEY)
}

export function loadE2EControls(): E2EControls {
  if (typeof sessionStorage === 'undefined') {
    return { ...DEFAULT_E2E_CONTROLS }
  }
  const raw = sessionStorage.getItem(E2E_STORAGE_KEY)
  if (!raw) {
    return { ...DEFAULT_E2E_CONTROLS }
  }
  try {
    return { ...DEFAULT_E2E_CONTROLS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_E2E_CONTROLS }
  }
}

export function saveE2EControls(controls: E2EControls): void {
  sessionStorage.setItem(E2E_STORAGE_KEY, JSON.stringify(controls))
}

export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

export function getActiveCampaigns(campaigns: Campaign[]): Campaign[] {
  return campaigns
    .filter((c) => !c.deletedAt)
    .sort((a, b) => new Date(b.lastPlayedAt).getTime() - new Date(a.lastPlayedAt).getTime())
}

export function getSessionCount(campaignId: string, sessions: Session[]): number {
  return sessions.filter((s) => s.campaignId === campaignId && !s.deletedAt).length
}

export function getActiveSessions(campaignId: string, sessions: Session[], campaigns: Campaign[]): Session[] {
  const campaign = campaigns.find((c) => c.id === campaignId)
  if (!campaign || campaign.deletedAt) {
    return []
  }

  return sessions
    .filter((s) => s.campaignId === campaignId && !s.deletedAt)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getNextSessionNumber(campaignId: string, sessions: Session[]): number {
  const campaignSessions = sessions.filter((s) => s.campaignId === campaignId)
  if (campaignSessions.length === 0) {
    return 1
  }
  return Math.max(...campaignSessions.map((s) => s.number)) + 1
}

export function getTrashedCampaigns(campaigns: Campaign[]): Campaign[] {
  return campaigns.filter((c) => c.deletedAt)
}

export function getTrashedSessions(sessions: Session[]): Session[] {
  return sessions.filter((s) => s.deletedAt)
}

export function formatSessionCount(count: number): string {
  if (count === 1) {
    return '1 session'
  }
  return `${count} sessions`
}
