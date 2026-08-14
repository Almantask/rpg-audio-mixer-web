import type { Session } from '../types/campaign'
import { getSessions, saveSessions, setActiveSessionId } from './storageService'

export function getActiveSessionsForCampaign(campaignId: string): Session[] {
  const sessions = getSessions().filter((s) => s.campaignId === campaignId && !s.deletedAt)
  return sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getSessionById(id: string): Session | undefined {
  return getSessions().find((s) => s.id === id)
}

export function getNextSessionNumber(campaignId: string): number {
  const allSessions = getSessions().filter((s) => s.campaignId === campaignId)
  if (allSessions.length === 0) return 1
  const max = Math.max(...allSessions.map((s) => s.sessionNumber || 0))
  return max + 1
}

export function createSession(data: {
  campaignId: string
  name: string
  date?: string
  description?: string
  coverUrl?: string
}): Session {
  const sessions = getSessions()
  const now = new Date().toISOString()
  const todayDate = new Date().toISOString().split('T')[0]
  const sessionNumber = getNextSessionNumber(data.campaignId)

  const newSession: Session = {
    id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    campaignId: data.campaignId,
    sessionNumber,
    name: data.name.trim(),
    date: data.date || todayDate,
    description: data.description?.trim() || undefined,
    coverUrl: data.coverUrl || undefined,
    sceneIds: [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }

  sessions.unshift(newSession)
  saveSessions(sessions)
  return newSession
}

export function updateSession(id: string, updates: Partial<Session>): Session | undefined {
  const sessions = getSessions()
  const idx = sessions.findIndex((s) => s.id === id)
  if (idx === -1) return undefined

  sessions[idx] = {
    ...sessions[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  saveSessions(sessions)
  return sessions[idx]
}

export function markSessionActive(id: string): void {
  setActiveSessionId(id)
}

export function softDeleteSession(id: string): void {
  const sessions = getSessions()
  const idx = sessions.findIndex((s) => s.id === id)
  if (idx !== -1) {
    sessions[idx].deletedAt = new Date().toISOString()
    saveSessions(sessions)
  }
}

export function getTrashSessions(): Session[] {
  return getSessions().filter((s) => s.deletedAt)
}

export function restoreSession(id: string): Session | undefined {
  const sessions = getSessions()
  const target = sessions.find((s) => s.id === id)
  if (!target) return undefined

  let newName = target.name
  const activeNames = sessions.filter((s) => !s.deletedAt && s.id !== id && s.campaignId === target.campaignId).map((s) => s.name)
  if (activeNames.includes(newName)) {
    newName = `${newName} (restored)`
  }

  target.name = newName
  target.deletedAt = null
  target.updatedAt = new Date().toISOString()
  saveSessions(sessions)
  return target
}

export function purgeSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id)
  saveSessions(sessions)
}

export function purgeAllTrashSessions(): void {
  const sessions = getSessions().filter((s) => !s.deletedAt)
  saveSessions(sessions)
}
