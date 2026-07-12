import { useCallback, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  getLastActiveSceneId,
  listSessionScenes,
} from '@/lib/storage/sessionSceneLinkRepository'

export function useSessionScenes(sessionId: string | undefined) {
  const [retryCount, setRetryCount] = useState(0)

  const result = useLiveQuery(async () => {
    void retryCount
    if (!sessionId) return []
    return listSessionScenes(sessionId)
  }, [sessionId, retryCount])

  const items = Array.isArray(result) ? result : []
  const lastActiveSceneId = getLastActiveSceneId(items)

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1)
  }, [])

  return {
    items,
    lastActiveSceneId,
    isLoading: result === undefined && Boolean(sessionId),
    retry,
  }
}
