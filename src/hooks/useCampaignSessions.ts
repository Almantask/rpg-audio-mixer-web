import { useCallback, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/storage/db'
import { getE2EState, setE2EState } from '@/lib/storage/e2eState'
import { getLastActiveSessionId } from '@/lib/storage/sessionRepository'
import type { Session } from '@/lib/storage/types'

async function fetchSessions(campaignId: string): Promise<Session[]> {
  const sessions = await db.sessions
    .where('campaignId')
    .equals(campaignId)
    .filter((session) => !session.deletedAt)
    .toArray()
  return sessions.sort((left, right) => right.date.localeCompare(left.date))
}

export function useCampaignSessions(campaignId: string | undefined) {
  const [retryCount, setRetryCount] = useState(0)

  const result = useLiveQuery(async () => {
    void retryCount
    if (!campaignId) return []
    if (getE2EState().sessionsLoading) return 'loading' as const
    if (getE2EState().sessionsLoadFail) return 'error' as const
    return fetchSessions(campaignId)
  }, [campaignId, retryCount])

  const sessions = Array.isArray(result) ? result : []
  const lastActiveSessionId = getLastActiveSessionId(sessions)

  const retry = useCallback(() => {
    setE2EState({ sessionsLoadFail: false })
    setRetryCount((count) => count + 1)
  }, [])

  return {
    sessions,
    lastActiveSessionId,
    isLoading: result === 'loading' || (result === undefined && Boolean(campaignId)),
    isError: result === 'error',
    retry,
  }
}
