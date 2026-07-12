import { useCallback, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getE2EState, setE2EState } from '@/lib/storage/e2eState'
import { listActiveScenes } from '@/lib/storage/sceneRepository'
import type { Scene } from '@/lib/storage/types'

export function useScenes() {
  const [retryCount, setRetryCount] = useState(0)

  const result = useLiveQuery(async () => {
    void retryCount
    if (getE2EState().scenesLoading) return 'loading' as const
    if (getE2EState().scenesLoadFail) return 'error' as const
    return listActiveScenes()
  }, [retryCount])

  const retry = useCallback(() => {
    setE2EState({ scenesLoadFail: false })
    setRetryCount((count) => count + 1)
  }, [])

  return {
    scenes: Array.isArray(result) ? result : [],
    isLoading: result === 'loading' || result === undefined,
    isError: result === 'error',
    retry,
  }
}

export function useSceneSearch(scenes: Scene[], query: string): Scene[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return scenes
  return scenes.filter((scene) => scene.name.toLowerCase().includes(normalized))
}
