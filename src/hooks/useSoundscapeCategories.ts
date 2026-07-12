import { useCallback, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getE2EState, setE2EState } from '@/lib/storage/e2eState'
import { listActiveCategories } from '@/lib/storage/soundscapeCategoryRepository'
import type { SoundscapeCategoryWithCounts } from '@/lib/storage/types'

export function useSoundscapeCategories() {
  const [retryCount, setRetryCount] = useState(0)

  const result = useLiveQuery(async () => {
    void retryCount
    if (getE2EState().soundscapesLoading) return 'loading' as const
    if (getE2EState().soundscapesLoadFail) return 'error' as const
    return listActiveCategories()
  }, [retryCount])

  const retry = useCallback(() => {
    setE2EState({ soundscapesLoadFail: false })
    setRetryCount((count) => count + 1)
  }, [])

  return {
    categories: Array.isArray(result) ? result : [],
    isLoading: result === 'loading' || result === undefined,
    isError: result === 'error',
    retry,
  }
}

export function useCategorySearch(
  categories: SoundscapeCategoryWithCounts[],
  query: string,
): SoundscapeCategoryWithCounts[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return categories
  return categories.filter((category) => category.name.toLowerCase().includes(normalized))
}
