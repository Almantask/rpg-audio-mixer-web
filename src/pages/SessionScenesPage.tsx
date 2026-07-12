import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  NewSceneCard,
  SceneCard,
  ScenesEmptyState,
} from '@/components/scenes/SceneCard'
import { UnlinkSceneDialog } from '@/components/scenes/SceneDeleteDialog'
import { SceneDialog, type SceneFormValues } from '@/components/scenes/SceneDialog'
import { ImportSceneDialog } from '@/components/session-scenes/ImportSceneDialog'
import { LoadingSkeletonGroup } from '@/components/ui/skeleton'
import { useSessionScenes } from '@/hooks/useSessionScenes'
import { db, getCampaignSessionsPath } from '@/lib/storage/db'
import { formatSessionLabel, formatSessionTitle } from '@/lib/format'
import {
  duplicateScene,
  updateScene,
} from '@/lib/storage/sceneRepository'
import {
  linkScenesToSession,
  listUnlinkedScenes,
  unlinkSceneFromSession,
} from '@/lib/storage/sessionSceneLinkRepository'
import type { Scene } from '@/lib/storage/types'

export function SessionScenesPage() {
  const { campaignId, sessionId } = useParams<{
    campaignId: string
    sessionId: string
  }>()
  const navigate = useNavigate()

  const campaign = useLiveQuery(
    () => (campaignId ? db.campaigns.get(campaignId) : undefined),
    [campaignId],
  )
  const session = useLiveQuery(
    () => (sessionId ? db.sessions.get(sessionId) : undefined),
    [sessionId],
  )
  const unlinkedScenes = useLiveQuery(
    () => (sessionId ? listUnlinkedScenes(sessionId) : []),
    [sessionId],
  )

  const { items, lastActiveSceneId, isLoading } = useSessionScenes(sessionId)

  const [importOpen, setImportOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | undefined>()
  const [unlinkTarget, setUnlinkTarget] = useState<Scene | null>(null)
  const [unlinkOpen, setUnlinkOpen] = useState(false)

  if (!campaignId || !sessionId) {
    return <Navigate replace to="/campaigns" />
  }

  if (campaign === undefined || session === undefined) {
    return <LoadingSkeletonGroup label="Loading session scenes" />
  }

  if (!campaign || campaign.deletedAt || !session || session.deletedAt) {
    return <Navigate replace to="/campaigns" />
  }

  const sessionTitle = formatSessionTitle(session.number, session.name)
  const breadcrumbCampaign = campaign.name.toUpperCase()
  const breadcrumbSession = formatSessionLabel(session.number).toUpperCase()

  const sortedItems = [...items].sort((left, right) => {
    if (left.scene.id === lastActiveSceneId) return -1
    if (right.scene.id === lastActiveSceneId) return 1
    const leftPlayed = left.link.lastPlayedAt ?? 0
    const rightPlayed = right.link.lastPlayedAt ?? 0
    return rightPlayed - leftPlayed
  })

  const handleEdit = async (values: SceneFormValues) => {
    if (!editingScene) return
    await updateScene(editingScene.id, values)
  }

  const handleDuplicate = async (scene: Scene) => {
    await duplicateScene(scene.id)
    toast(`Copy of ${scene.name} created`)
  }

  const handleUnlink = async () => {
    if (!unlinkTarget || !sessionId) return
    await unlinkSceneFromSession(sessionId, unlinkTarget.id)
    setUnlinkOpen(false)
    setUnlinkTarget(null)
  }

  const handleImport = async (sceneIds: string[]) => {
    await linkScenesToSession(sessionId, sceneIds)
  }

  const showEmpty = !isLoading && items.length === 0

  return (
    <section aria-labelledby="session-scenes-heading">
      <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-wide text-zinc-500">
        <span>CAMPAIGN</span>
        <span aria-hidden="true"> &gt; </span>
        <button
          className="hover:text-gold"
          onClick={() => navigate(getCampaignSessionsPath(campaignId))}
          type="button"
        >
          {breadcrumbCampaign}
        </button>
        <span aria-hidden="true"> &gt; </span>
        <button className="hover:text-gold" onClick={() => navigate(0)} type="button">
          {breadcrumbSession}
        </button>
      </nav>

      <h1 className="mt-2 font-serif text-2xl text-gold" id="session-scenes-heading">
        {sessionTitle}
      </h1>
      <p className="mt-1 text-zinc-400">Session Scenes</p>

      <div className="mt-8 space-y-4" data-testid="session-scenes-list">
        {showEmpty ? (
          <div data-testid="session-scenes-empty-state">
            <ScenesEmptyState ctaLabel="Import Scene" onCreate={() => setImportOpen(true)} />
            <p className="mt-4 text-center text-sm text-zinc-500">
              Or{' '}
              <Link className="text-gold underline" to="/scenes">
                create a scene in Scenes
              </Link>
            </p>
          </div>
        ) : null}

        {sortedItems.map(({ scene }) => (
          <SceneCard
            deleteAriaLabel={`Unlink ${scene.name}`}
            isLastActive={scene.id === lastActiveSceneId}
            key={scene.id}
            onDelete={(target) => {
              setUnlinkTarget(target)
              setUnlinkOpen(true)
            }}
            onDuplicate={(target) => void handleDuplicate(target)}
            onEdit={(target) => {
              setEditingScene(target)
              setEditOpen(true)
            }}
            scene={scene}
          />
        ))}

        <NewSceneCard label="Import Scene" onClick={() => setImportOpen(true)} />
      </div>

      <ImportSceneDialog
        availableScenes={unlinkedScenes ?? []}
        onImport={handleImport}
        onOpenChange={setImportOpen}
        open={importOpen}
      />

      <SceneDialog
        mode="edit"
        onOpenChange={setEditOpen}
        onSubmit={handleEdit}
        open={editOpen}
        scene={editingScene}
      />

      {unlinkTarget ? (
        <UnlinkSceneDialog
          onConfirm={() => void handleUnlink()}
          onOpenChange={setUnlinkOpen}
          open={unlinkOpen}
          sceneName={unlinkTarget.name}
        />
      ) : null}
    </section>
  )
}
