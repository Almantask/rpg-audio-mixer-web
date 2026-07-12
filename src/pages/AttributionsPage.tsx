import { useCallback, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getE2EState, setE2EState } from '@/lib/storage/e2eState'

interface AttributionContent {
  soundLibrary: string
  openSource: string
}

async function loadAttributions(): Promise<AttributionContent> {
  const { attributionsLoadFail } = getE2EState()
  if (attributionsLoadFail) {
    throw new Error('Failed to load attributions')
  }
  return {
    soundLibrary:
      'Bundled ambience and FX samples courtesy of Arcanum Audio partners. All purchased packs remain licensed for personal tabletop use.',
    openSource:
      'This app uses React, Vite, Dexie, Tailwind CSS, Radix UI, and other open-source libraries under MIT and Apache 2.0 licenses.',
  }
}

export function AttributionsPage() {
  const [retryCount, setRetryCount] = useState(0)

  const result = useLiveQuery(async () => {
    void retryCount
    const flags = getE2EState()
    if (flags.attributionsLoading) return 'loading' as const
    try {
      return await loadAttributions()
    } catch {
      return 'error' as const
    }
  }, [retryCount])

  const retry = useCallback(() => {
    setE2EState({ attributionsLoadFail: false })
    setRetryCount((count) => count + 1)
  }, [])

  const isLoading = result === 'loading' || result === undefined
  const isError = result === 'error'

  return (
    <section aria-labelledby="attributions-heading">
      <h1 className="font-serif text-2xl text-gold" id="attributions-heading">
        Attributions
      </h1>

      {isLoading ? (
        <div className="mt-8 space-y-6">
          <Skeleton className="h-24 w-full" data-testid="attributions-skeleton" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : null}

      {isError ? (
        <div className="mt-8 rounded-lg border border-red-900/50 bg-surface p-6" role="alert">
          <p>Unable to load attributions content.</p>
          <Button className="mt-4" onClick={retry} type="button" variant="outline">
            Retry
          </Button>
        </div>
      ) : null}

      {result && typeof result === 'object' ? (
        <div className="mt-8 space-y-8">
          <section aria-labelledby="sound-library-attributions">
            <h2 className="font-serif text-lg text-gold" id="sound-library-attributions">
              Sound library attributions
            </h2>
            <p className="mt-3 text-zinc-300">{result.soundLibrary}</p>
          </section>
          <section aria-labelledby="open-source-licenses">
            <h2 className="font-serif text-lg text-gold" id="open-source-licenses">
              Open-source licenses
            </h2>
            <p className="mt-3 text-zinc-300">{result.openSource}</p>
          </section>
        </div>
      ) : null}
    </section>
  )
}
