import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'
import {
  AddNewSessionCard,
  CampaignHeroBanner,
  SessionCard,
  SessionCardSkeleton,
  SessionsEmptyState,
} from '@/components/sessions/SessionCard'
import { DeleteSessionDialog } from '@/components/sessions/DeleteSessionDialog'
import { SessionFormDialog } from '@/components/sessions/SessionFormDialog'
import { useCampaignData } from '@/context/CampaignDataContext'
import { getNextSessionNumber } from '@/lib/campaignStorage'
import type { Session } from '@/types/campaign'

export function CampaignSessionsPage() {
  const { campaignId = '' } = useParams()
  const {
    e2e,
    getCampaign,
    getCampaignSessions,
    getLastActiveSessionId,
    createSession,
    updateSession,
    softDeleteSession,
    markSessionOpened,
    markCampaignPlayed,
    data,
  } = useCampaignData()

  const campaign = getCampaign(campaignId)
  const sessions = getCampaignSessions(campaignId)
  const lastActiveSessionId = getLastActiveSessionId(campaignId)

  const [createOpen, setCreateOpen] = useState(false)
  const [editSession, setEditSession] = useState<Session | null>(null)
  const [deleteSession, setDeleteSession] = useState<Session | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const sessionsState = e2e.sessionsListState[campaignId] ?? 'ready'

  useEffect(() => {
    if (campaignId) {
      markCampaignPlayed(campaignId)
    }
  }, [campaignId, markCampaignPlayed])

  if (!campaign) {
    return <Navigate to="/campaigns" replace />
  }

  const nextSessionNumber = getNextSessionNumber(campaignId, data.sessions)

  const handleCreate = (input: {
    name: string
    date: string
    description?: string
    coverArtUrl?: string
  }) => {
    try {
      createSession({ campaignId, ...input })
      setFormError(null)
      setCreateOpen(false)
    } catch {
      setFormError('Unable to create session. Please try again.')
    }
  }

  const handleEdit = (input: {
    name: string
    date: string
    description?: string
    coverArtUrl?: string
  }) => {
    if (!editSession) {
      return
    }
    try {
      updateSession(editSession.id, input)
      setFormError(null)
      setEditSession(null)
    } catch {
      setFormError('Unable to save session. Please try again.')
    }
  }

  return (
    <ScreenLandmark
      screenName="Campaign Sessions screen"
      className="max-w-6xl"
      data-campaign-name={campaign.name}
    >
      <PageHeader title={campaign.name} subtitle="Campaign Sessions" />

      <CampaignHeroBanner coverArtUrl={campaign.coverArtUrl} campaignName={campaign.name} />

      {sessionsState === 'loading' ? (
        <div
          className="grid gap-4 sm:grid-cols-2"
          data-testid="sessions-loading"
          aria-label="Loading sessions"
        >
          <SessionCardSkeleton />
          <SessionCardSkeleton />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2" data-testid="sessions-list">
          {sessions.length === 0 ? <SessionsEmptyState /> : null}
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              campaignId={campaignId}
              showLastActive={session.id === lastActiveSessionId}
              onEdit={() => {
                setFormError(null)
                setEditSession(session)
              }}
              onDelete={() => setDeleteSession(session)}
              onOpen={() => markSessionOpened(campaignId, session.id)}
            />
          ))}
          <AddNewSessionCard onClick={() => {
            setFormError(null)
            setCreateOpen(true)
          }} />
        </div>
      )}

      <SessionFormDialog
        open={createOpen}
        mode="create"
        sessionNumber={nextSessionNumber}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        errorMessage={formError}
      />

      <SessionFormDialog
        open={editSession !== null}
        mode="edit"
        sessionNumber={editSession?.number ?? 1}
        initialName={editSession?.name}
        initialDate={editSession?.date}
        initialDescription={editSession?.description}
        initialCoverArtUrl={editSession?.coverArtUrl}
        onOpenChange={(open) => {
          if (!open) {
            setEditSession(null)
            setFormError(null)
          }
        }}
        onSubmit={handleEdit}
        errorMessage={formError}
      />

      <DeleteSessionDialog
        open={deleteSession !== null}
        sessionLabel={deleteSession ? `Session ${deleteSession.number}` : ''}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteSession(null)
          }
        }}
        onConfirm={() => {
          if (deleteSession) {
            softDeleteSession(deleteSession.id)
          }
        }}
      />
    </ScreenLandmark>
  )
}
