import { db } from './db'
import { getE2EState } from './e2eState'
import type { CreateSessionInput, Session, UpdateSessionInput } from './types'

function createId(): string {
  return crypto.randomUUID()
}

export async function listActiveSessions(campaignId: string): Promise<Session[]> {
  const { sessionsLoadFail } = getE2EState()
  if (sessionsLoadFail) {
    throw new Error('Failed to load sessions')
  }

  const sessions = await db.sessions
    .where('campaignId')
    .equals(campaignId)
    .filter((session) => !session.deletedAt)
    .toArray()

  return sessions.sort((left, right) => right.date.localeCompare(left.date))
}

export async function getSession(id: string): Promise<Session | undefined> {
  const session = await db.sessions.get(id)
  if (!session || session.deletedAt) return undefined
  return session
}

export async function getNextSessionNumber(campaignId: string): Promise<number> {
  const sessions = await db.sessions.where('campaignId').equals(campaignId).toArray()
  if (sessions.length === 0) return 1
  return Math.max(...sessions.map((session) => session.number)) + 1
}

export async function createSession(input: CreateSessionInput): Promise<Session> {
  const { sessionCreateFail } = getE2EState()
  if (sessionCreateFail) {
    throw new Error('Failed to create session')
  }

  const now = Date.now()
  const number = await getNextSessionNumber(input.campaignId)
  const session: Session = {
    id: createId(),
    campaignId: input.campaignId,
    name: input.name.trim(),
    number,
    date: input.date,
    description: input.description?.trim() || undefined,
    coverArtUrl: input.coverArtUrl,
    sceneCount: 0,
    createdAt: now,
  }
  await db.sessions.add(session)
  return session
}

export async function updateSession(id: string, input: UpdateSessionInput): Promise<Session> {
  const { sessionSaveFail } = getE2EState()
  if (sessionSaveFail) {
    throw new Error('Failed to save session')
  }

  const existing = await db.sessions.get(id)
  if (!existing || existing.deletedAt) {
    throw new Error('Session not found')
  }

  const updated: Session = {
    ...existing,
    name: input.name?.trim() ?? existing.name,
    date: input.date ?? existing.date,
    description:
      input.description !== undefined ? input.description.trim() || undefined : existing.description,
    coverArtUrl: input.coverArtUrl !== undefined ? input.coverArtUrl : existing.coverArtUrl,
  }
  await db.sessions.put(updated)
  return updated
}

export async function softDeleteSession(id: string): Promise<void> {
  await db.sessions.update(id, { deletedAt: Date.now() })
}

export async function restoreSession(id: string): Promise<void> {
  await db.sessions.update(id, { deletedAt: undefined })
}

export async function touchSessionOpened(id: string): Promise<void> {
  await db.sessions.update(id, { lastOpenedAt: Date.now() })
}

export async function listDeletedSessions(): Promise<Session[]> {
  return db.sessions.filter((session) => Boolean(session.deletedAt)).toArray()
}

export function getLastActiveSessionId(sessions: Session[]): string | undefined {
  if (sessions.length === 0) return undefined
  const opened = sessions.filter((session) => session.lastOpenedAt)
  if (opened.length === 0) return undefined
  return opened.sort((left, right) => (right.lastOpenedAt ?? 0) - (left.lastOpenedAt ?? 0))[0]?.id
}
