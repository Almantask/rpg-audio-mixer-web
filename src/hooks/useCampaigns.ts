import { useCallback, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/storage/db'
import { getE2EState, setE2EState } from '@/lib/storage/e2eState'
import type { CampaignWithSessionCount } from '@/lib/storage/types'

async function fetchCampaigns(): Promise<CampaignWithSessionCount[]> {
  const campaigns = await db.campaigns.filter((campaign) => !campaign.deletedAt).toArray()
  const withCounts = await Promise.all(
    campaigns.map(async (campaign) => ({
      ...campaign,
      sessionCount: await db.sessions
        .where('campaignId')
        .equals(campaign.id)
        .filter((session) => !session.deletedAt)
        .count(),
    })),
  )
  return withCounts.sort((left, right) => right.lastPlayedAt - left.lastPlayedAt)
}

export function useCampaigns() {
  const [retryCount, setRetryCount] = useState(0)

  const result = useLiveQuery(async () => {
    void retryCount
    if (getE2EState().campaignsLoading) return 'loading' as const
    if (getE2EState().campaignsLoadFail) return 'error' as const
    return fetchCampaigns()
  }, [retryCount])

  const retry = useCallback(() => {
    setE2EState({ campaignsLoadFail: false })
    setRetryCount((count) => count + 1)
  }, [])

  return {
    campaigns: Array.isArray(result) ? result : [],
    isLoading: result === 'loading' || result === undefined,
    isError: result === 'error',
    retry,
  }
}
