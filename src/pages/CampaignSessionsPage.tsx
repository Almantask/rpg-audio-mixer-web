import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { SessionCard } from '@/components/campaign-sessions/SessionCard'
import { SessionDeleteDialog } from '@/components/campaign-sessions/SessionDeleteDialog'
import {
  SessionDialog,
  type SessionFormValues,
} from '@/components/campaign-sessions/SessionDialog'
import {
  AddSessionCard,
  CampaignHeroBanner,
  SessionsEmptyState,
  SessionsErrorState,
} from '@/components/campaign-sessions/SessionsList'
import { LoadingSkeletonGroup } from '@/components/ui/skeleton'
import { useCampaignSessions } from '@/hooks/useCampaignSessions'
import { db } from '@/lib/storage/db'
import {
  createSession,
  softDeleteSession,
  updateSession,
} from '@/lib/storage/sessionRepository'
import type { Session } from '@/lib/storage/types'

export function CampaignSessionsPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const campaign = useLiveQuery(
    () => (campaignId ? db.campaigns.get(campaignId) : undefined),
    [campaignId],
  )
  const { sessions, lastActiveSessionId, isLoading, isError, retry } =
    useCampaignSessions(campaignId)

  const [sessionDialogOpen, setSessionDialogOpen] = useState(false)
  const [sessionDialogMode, setSessionDialogMode] = useState<'create' | 'edit'>('create')
  const [editingSession, setEditingSession] = useState<Session | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null)

  if (!campaignId) {
    return <Navigate replace to="/campaigns" />
  }

  if (campaign === undefined) {
    return (
      <section aria-labelledby="campaign-sessions-heading">
        <LoadingSkeletonGroup label="Loading campaign" />
      </section>
    )
  }

  if (!campaign || campaign.deletedAt) {
    return <Navigate replace to="/campaigns" />
  }

  const openCreateDialog = () => {
    setSessionDialogMode('create')
    setEditingSession(undefined)
    setSessionDialogOpen(true)
  }

  const openEditDialog = (session: Session) => {
    setSessionDialogMode('edit')
    setEditingSession(session)
    setSessionDialogOpen(true)
  }

  const handleSessionSubmit = async (values: SessionFormValues) => {
    if (sessionDialogMode === 'create') {
      await createSession({
        campaignId,
        name: values.name,
        date: values.date,
        description: values.description,
        coverArtUrl: values.coverArtUrl,
      })
      return
    }
    if (!editingSession) return
    await updateSession(editingSession.id, values)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    await softDeleteSession(deleteTarget.id)
    toast(`${deleteTarget.name} moved to Trash`)
    setDeleteTarget(null)
  }

  return (
    <section aria-labelledby="campaign-sessions-heading">
      <h1 className="font-serif text-2xl text-gold" id="campaign-sessions-heading">
        {campaign.name}
      </h1>
      <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">Campaign Sessions</p>

      <div className="mt-6">
        <CampaignHeroBanner
          coverArtUrl={campaign.coverArtUrl}
          description={campaign.description}
          name={campaign.name}
        />
      </div>

      {isError ? <SessionsErrorState onRetry={retry} /> : null}

      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        data-testid="sessions-list"
      >
        {isLoading ? <LoadingSkeletonGroup label="Loading sessions" /> : null}

        {!isLoading && !isError && sessions.length === 0 ? (
          <SessionsEmptyState onAddSession={openCreateDialog} />
        ) : null}

        {!isLoading && !isError
          ? sessions.map((session) => (
              <SessionCard
                isLastActive={session.id === lastActiveSessionId}
                key={session.id}
                onDelete={setDeleteTarget}
                onEdit={openEditDialog}
                session={session}
              />
            ))
          : null}

        {!isLoading && !isError ? <AddSessionCard onClick={openCreateDialog} /> : null}
      </div>

      <SessionDialog
        campaignId={campaignId}
        mode={sessionDialogMode}
        onOpenChange={setSessionDialogOpen}
        onSubmit={handleSessionSubmit}
        open={sessionDialogOpen}
        session={editingSession}
      />

      <SessionDeleteDialog
        onConfirm={handleDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        open={Boolean(deleteTarget)}
        session={deleteTarget}
      />
    </section>
  )
}
