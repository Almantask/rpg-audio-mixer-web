import { useMemo, useState } from 'react'

import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'

import {

  CreateSceneCard,

  SceneCard,

  SceneCardSkeleton,

  ScenesEmptyState,

  ScenesNoMatchMessage,

} from '@/components/scenes/SceneCard'

import { SceneFormDialog } from '@/components/scenes/SceneFormDialog'

import { DeleteSceneDialog } from '@/components/scenes/DeleteSceneDialog'

import { useToast } from '@/components/shared/ToastProvider'

import { Input } from '@/components/ui/input'

import { useCampaignData } from '@/context/CampaignDataContext'

import { filterScenesByName } from '@/lib/sceneStorage'



export function ScenesPage() {

  const {

    activeScenes,

    data,

    e2e,

    createScene,

    updateScene,

    duplicateScene,

    softDeleteScene,

    restoreScene,

    getLinkedSessionCountForScene,

  } = useCampaignData()

  const { showToast } = useToast()

  const [search, setSearch] = useState('')

  const [createOpen, setCreateOpen] = useState(false)

  const [editSceneId, setEditSceneId] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)



  const filteredScenes = useMemo(

    () => filterScenesByName(activeScenes, search),

    [activeScenes, search],

  )



  const editScene = editSceneId ? activeScenes.find((scene) => scene.id === editSceneId) : undefined



  const handleDelete = (sceneId: string, sceneName: string) => {

    const linkedCount = getLinkedSessionCountForScene(sceneId)

    if (linkedCount > 0) {

      setDeleteTarget({ id: sceneId, name: sceneName })

      return

    }

    softDeleteScene(sceneId)

    showToast(`${sceneName} moved to Trash`, {

      label: 'Undo',

      onClick: () => restoreScene(sceneId),

    })

  }



  if (e2e.sceneListState === 'loading') {

    return (

      <ScreenLandmark screenName="Scenes screen">

        <PageHeader

          title="Scenes"

          subtitle="Curate and manage your immersive environments."

        />

        <div className="space-y-4" data-testid="scenes-loading">

          <SceneCardSkeleton />

          <SceneCardSkeleton />

        </div>

      </ScreenLandmark>

    )

  }



  const isEmpty = activeScenes.length === 0



  return (

    <ScreenLandmark screenName="Scenes screen">

      <PageHeader title="Scenes" subtitle="Curate and manage your immersive environments." />



      <div className="mb-6">

        <Input

          aria-label="Search scenes"

          placeholder="Search scenes…"

          value={search}

          onChange={(event) => setSearch(event.target.value)}

          data-scenes-search

        />

      </div>



      {isEmpty ? <ScenesEmptyState /> : null}



      {!isEmpty && filteredScenes.length === 0 ? <ScenesNoMatchMessage /> : null}



      <div className="space-y-4">

        {filteredScenes.map((scene) => (

          <SceneCard

            key={scene.id}

            scene={scene}

            soundscapeSlots={data.sceneSoundscapeSlots}

            soundboardEntries={data.sceneSoundboardEntries}

            onEdit={() => setEditSceneId(scene.id)}

            onDuplicate={() => duplicateScene(scene.id)}

            onDelete={() => handleDelete(scene.id, scene.name)}

          />

        ))}

        <CreateSceneCard onClick={() => setCreateOpen(true)} />

      </div>



      <SceneFormDialog

        open={createOpen}

        onOpenChange={setCreateOpen}

        onSave={(input) => {

          createScene(input)

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



      <DeleteSceneDialog

        open={Boolean(deleteTarget)}

        onOpenChange={(open) => {

          if (!open) {

            setDeleteTarget(null)

          }

        }}

        sceneName={deleteTarget?.name ?? ''}

        linkedSessionCount={deleteTarget ? getLinkedSessionCountForScene(deleteTarget.id) : 0}

        onConfirm={() => {

          if (!deleteTarget) {

            return

          }

          softDeleteScene(deleteTarget.id)

          showToast(`${deleteTarget.name} moved to Trash`, {

            label: 'Undo',

            onClick: () => restoreScene(deleteTarget.id),

          })

        }}

      />

    </ScreenLandmark>

  )

}


