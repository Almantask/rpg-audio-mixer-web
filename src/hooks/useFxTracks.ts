import { useCallback, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getE2EState, setE2EState } from '@/lib/storage/e2eState'
import { listActiveFxTracks } from '@/lib/storage/fxTrackRepository'
import type { FxTrack } from '@/lib/storage/types'

export function useFxTracks() {
  const [retryCount, setRetryCount] = useState(0)

  const result = useLiveQuery(async () => {
    void retryCount
    if (getE2EState().fxLoading) return 'loading' as const
    if (getE2EState().fxLoadFail) return 'error' as const
    return listActiveFxTracks()
  }, [retryCount])

  const retry = useCallback(() => {
    setE2EState({ fxLoadFail: false })
    setRetryCount((count) => count + 1)
  }, [])

  return {
    tracks: Array.isArray(result) ? result : ([] as FxTrack[]),
    isLoading: result === 'loading' || result === undefined,
    isError: result === 'error',
    retry,
  }
}
