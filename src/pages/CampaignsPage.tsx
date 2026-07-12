import { useState } from 'react'
import { toast } from 'sonner'
import {
  CampaignCard,
} from '@/components/campaigns/CampaignCard'
import {
  CampaignCreateDialog,
  type CampaignFormValues,
} from '@/components/campaigns/CampaignCreateDialog'
import {
  CampaignsEmptyState,
  CampaignsErrorState,
  CreateCampaignCard,
} from '@/components/campaigns/CampaignsList'
import { LoadingSkeletonGroup } from '@/components/ui/skeleton'
import { useCampaigns } from '@/hooks/useCampaigns'
import {
  createCampaign,
  restoreCampaign,
  softDeleteCampaign,
} from '@/lib/storage/campaignRepository'
import type { CampaignWithSessionCount } from '@/lib/storage/types'

export function CampaignsPage() {
  const { campaigns, isLoading, isError, retry } = useCampaigns()
  const [createOpen, setCreateOpen] = useState(false)

  const handleCreate = async (values: CampaignFormValues) => {
    await createCampaign(values)
  }

  const handleDelete = async (campaign: CampaignWithSessionCount) => {
    await softDeleteCampaign(campaign.id)
    toast(`${campaign.name} moved to Trash`, {
      action: {
        label: 'Undo',
        onClick: () => {
          void restoreCampaign(campaign.id)
        },
      },
    })
  }

  return (
    <section aria-labelledby="campaigns-heading">
      <h1 className="font-serif text-2xl text-gold" id="campaigns-heading">
        Active Campaigns
      </h1>
      <p className="mt-2 text-zinc-400">Manage your campaigns.</p>

      <div className="mt-8 space-y-4">
        {isError ? <CampaignsErrorState onRetry={retry} /> : null}

        {isLoading ? <LoadingSkeletonGroup label="Loading campaigns" /> : null}

        {!isLoading && !isError && campaigns.length === 0 ? <CampaignsEmptyState /> : null}

        {!isLoading && !isError
          ? campaigns.map((campaign) => (
              <CampaignCard campaign={campaign} key={campaign.id} onDelete={handleDelete} />
            ))
          : null}

        {!isLoading && !isError ? (
          <CreateCampaignCard onClick={() => setCreateOpen(true)} />
        ) : null}
      </div>

      <CampaignCreateDialog
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        open={createOpen}
      />
    </section>
  )
}
