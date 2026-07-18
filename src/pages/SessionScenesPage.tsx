import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'
import {
  CreateSceneCard,
  SceneCard,
  SceneCardSkeleton,
  SessionScenesEmptyState,
} from '@/components/scenes/SceneCard'
import { SceneFormDialog } from '@/components/scenes/SceneFormDialog'
import {
  ImportScenePickerDialog,
  UnlinkSceneDialog,
} from '@/components/scenes/DeleteSceneDialog'
import { useCampaignData } from '@/context/CampaignDataContext'
import { getUnlinkedScenesForSession } from '@/lib/sceneStorage'
import { formatSessionPageTitle } from '@/lib/sessionTitle'

export function SessionScenesPage() {
  const { campaignId = '', sessionId = '' } = useParams()
  const navigate = useNavigate()
  const {
    data,
    e2e,
    getCampaign,
    getSessionScenes,
    createScene,
    duplicateScene,
    updateScene,
    unlinkSceneFromSession,
    linkScenesToSession,
    markScenePlayed,
  } = useCampaignData()

  const [createOpen, setCreateOpen] = useState(false)
  const [editSceneId, setEditSceneId] = useState<string | null>(null)
  const [unlinkTarget, setUnlinkTarget] = useState<{ id: string; name: string } | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  const campaign = getCampaign(campaignId)
  const session = data.sessions.find((item) => item.id === sessionId && !item.deletedAt)
  const sessionScenes = getSessionScenes(sessionId)
  const lastActiveSceneId = data.lastActiveSceneBySession[sessionId]
  const listState = e2e.sessionScenesListState[sessionId] ?? 'ready'

  const campaignName = campaign?.name ?? campaignId
  const sessionLabel = session ? `Session ${session.number}` : sessionId
  const pageTitle = session ? formatSessionPageTitle(session) : sessionLabel

  const availableToImport = useMemo(
    () => getUnlinkedScenesForSession(data.scenes, sessionId, data.sessionSceneLinks),
    [data.scenes, data.sessionSceneLinks, sessionId],
  )

  const editScene = editSceneId ? sessionScenes.find((scene) => scene.id === editSceneId) : undefined

  if (listState === 'loading') {
    return (
      <ScreenLandmark screenName="Session Scenes screen">
        <p className="mb-2 text-xs uppercase tracking-widest text-muted" data-session-breadcrumb>
          Campaign &gt; {campaignName.toUpperCase()} &gt; {sessionLabel.toUpperCase()}
        </p>
        <PageHeader title={pageTitle} subtitle="Session Scenes" />
        <SceneCardSkeleton />
      </ScreenLandmark>
    )
  }

  const isEmpty = sessionScenes.length === 0

  return (
    <ScreenLandmark screenName="Session Scenes screen">
      <nav
        className="mb-2 text-xs uppercase tracking-widest text-muted"
        aria-label="Breadcrumb"
        data-session-breadcrumb
      >
        <Link
          to={`/campaigns/${campaignId}/sessions`}
          data-breadcrumb-campaign
          data-breadcrumb={campaignName.toUpperCase()}
        >
          {campaignName.toUpperCase()}
        </Link>
        {' > '}
        <button
          type="button"
          className="hover:text-gold"
          data-breadcrumb-session
          data-breadcrumb={sessionLabel.toUpperCase()}
          onClick={() => navigate(`/campaigns/${campaignId}/sessions/${sessionId}/scenes`)}
        >
          {sessionLabel.toUpperCase()}
        </button>
      </nav>

      <PageHeader title={pageTitle} subtitle="Session Scenes" />
      <p className="sr-only" data-session-label={sessionLabel}>
        {sessionLabel}
      </p>

      {isEmpty ? (
        <SessionScenesEmptyState />
      ) : (
        <div className="space-y-4">
          {sessionScenes.map((scene) => (
            <SceneCard
              key={scene.id}
              variant="session"
              scene={scene}
              soundscapeSlots={data.sceneSoundscapeSlots}
              soundboardEntries={data.sceneSoundboardEntries}
              showLastActive={scene.id === lastActiveSceneId}
              navigateState={{ campaignId, sessionId }}
              onOpen={() => markScenePlayed(sessionId, scene.id)}
              onEdit={() => setEditSceneId(scene.id)}
              onDuplicate={() => {
                const copy = duplicateScene(scene.id)
                linkScenesToSession(sessionId, [copy.id])
              }}
              onDelete={() => setUnlinkTarget({ id: scene.id, name: scene.name })}
            />
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4">
        <CreateSceneCard onClick={() => setCreateOpen(true)} />
        <CreateSceneCard label="Import Scene" onClick={() => setImportOpen(true)} />
      </div>

      <SceneFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSave={(input) => {
          const scene = createScene(input)
          linkScenesToSession(sessionId, [scene.id])
        }}
      />

      <SceneFormDialog
        open={Boolean(editScene)}
        onOpenChange={(open) => {
          if (!open) {
            setEditSceneId(null)
          }
        }}
        scene={editScene}
        onSave={(input) => {
          if (editSceneId) {
            updateScene(editSceneId, input)
          }
        }}
      />

      <UnlinkSceneDialog
        open={Boolean(unlinkTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setUnlinkTarget(null)
          }
        }}
        sceneName={unlinkTarget?.name ?? ''}
        onConfirm={() => {
          if (unlinkTarget) {
            unlinkSceneFromSession(sessionId, unlinkTarget.id)
          }
        }}
      />

      <ImportScenePickerDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        availableScenes={availableToImport.map((scene) => ({
          id: scene.id,
          name: scene.name,
          tags: scene.tags,
        }))}
        onImport={(sceneIds) => linkScenesToSession(sessionId, sceneIds)}
      />
    </ScreenLandmark>
  )
}
