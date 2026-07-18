import { useState } from 'react'
import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'
import {
  CampaignCard,
  CampaignCardSkeleton,
  CampaignsEmptyState,
  CampaignsErrorState,
  CreateCampaignCard,
} from '@/components/campaigns/CampaignCard'
import { CreateCampaignDialog } from '@/components/campaigns/CreateCampaignDialog'
import { EditCampaignDialog } from '@/components/campaigns/EditCampaignDialog'
import { useToast } from '@/components/shared/ToastProvider'
import { useCampaignData } from '@/context/CampaignDataContext'
import type { Campaign } from '@/types/campaign'

export function CampaignsPage() {
  const {
    activeCampaigns,
    e2e,
    getSessionCount,
    createCampaign,
    updateCampaign,
    softDeleteCampaign,
    restoreCampaign,
    markCampaignPlayed,
    reload,
    setE2EControls,
  } = useCampaignData()
  const { showToast } = useToast()
  const [createOpen, setCreateOpen] = useState(false)
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null)

  const handleDelete = (campaignId: string, campaignName: string) => {
    softDeleteCampaign(campaignId)
    showToast(`${campaignName} moved to Trash`, {
      label: 'Undo',
      onClick: () => restoreCampaign(campaignId),
    })
  }

  if (e2e.campaignListState === 'error') {
    return (
      <ScreenLandmark screenName="Active Campaigns screen">
        <PageHeader title="Active Campaigns" />
        <CampaignsErrorState
          onRetry={() => {
            setE2EControls({ campaignListState: 'ready' })
            reload()
          }}
        />
      </ScreenLandmark>
    )
  }

  if (e2e.campaignListState === 'loading') {
    return (
      <ScreenLandmark screenName="Active Campaigns screen">
        <PageHeader title="Active Campaigns" />
        <div className="space-y-4" data-testid="campaigns-loading">
          <CampaignCardSkeleton />
          <CampaignCardSkeleton />
        </div>
      </ScreenLandmark>
    )
  }

  const isEmpty = activeCampaigns.length === 0

  return (
    <ScreenLandmark screenName="Active Campaigns screen">
      <PageHeader title="Active Campaigns" />

      {isEmpty ? <CampaignsEmptyState /> : null}

      <div className="space-y-3">
        {activeCampaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            sessionCount={getSessionCount(campaign.id)}
            onDelete={() => handleDelete(campaign.id, campaign.name)}
            onOpen={() => markCampaignPlayed(campaign.id)}
            onEdit={() => setEditCampaign(campaign)}
          />
        ))}
        <CreateCampaignCard onClick={() => setCreateOpen(true)} />
      </div>

      <CreateCampaignDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(input) => {
          createCampaign(input)
        }}
      />

      <EditCampaignDialog
        open={editCampaign !== null}
        campaignName={editCampaign?.name ?? ''}
        initialName={editCampaign?.name ?? ''}
        initialDescription={editCampaign?.description}
        initialCoverArtUrl={editCampaign?.coverArtUrl}
        onOpenChange={(open) => {
          if (!open) {
            setEditCampaign(null)
          }
        }}
        onSave={(input) => {
          if (!editCampaign) {
            return
          }
          updateCampaign(editCampaign.id, input)
          setEditCampaign(null)
        }}
      />
    </ScreenLandmark>
  )
}
