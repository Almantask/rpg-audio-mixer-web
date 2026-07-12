import { useState } from 'react'
import { toast } from 'sonner'
import {
  NewSceneCard,
  SceneCard,
  ScenesEmptyState,
} from '@/components/scenes/SceneCard'
import { SceneDeleteDialog } from '@/components/scenes/SceneDeleteDialog'
import { SceneDialog, type SceneFormValues } from '@/components/scenes/SceneDialog'
import { Input } from '@/components/ui/input'
import { useSceneSearch, useScenes } from '@/hooks/useScenes'
import {
  countSceneSessionLinks,
  createScene,
  duplicateScene,
  restoreScene,
  softDeleteScene,
  updateScene,
} from '@/lib/storage/sceneRepository'
import type { Scene } from '@/lib/storage/types'

export function ScenesPage() {
  const { scenes, isLoading } = useScenes()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editingScene, setEditingScene] = useState<Scene | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Scene | null>(null)
  const [deleteLinkCount, setDeleteLinkCount] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const filteredScenes = useSceneSearch(scenes, search)

  const openCreateDialog = () => {
    setDialogMode('create')
    setEditingScene(undefined)
    setDialogOpen(true)
  }

  const openEditDialog = (scene: Scene) => {
    setDialogMode('edit')
    setEditingScene(scene)
    setDialogOpen(true)
  }

  const handleSubmit = async (values: SceneFormValues) => {
    if (dialogMode === 'create') {
      await createScene(values)
      return
    }
    if (!editingScene) return
    await updateScene(editingScene.id, values)
  }

  const requestDelete = async (scene: Scene) => {
    const linkCount = await countSceneSessionLinks(scene.id)
    if (linkCount > 0) {
      setDeleteTarget(scene)
      setDeleteLinkCount(linkCount)
      setDeleteDialogOpen(true)
      return
    }
    await performDelete(scene)
  }

  const performDelete = async (scene: Scene) => {
    await softDeleteScene(scene.id)
    toast(`${scene.name} moved to Trash`, {
      action: {
        label: 'Undo',
        onClick: () => {
          void restoreScene(scene.id)
        },
      },
    })
  }

  const handleDuplicate = async (scene: Scene) => {
    await duplicateScene(scene.id)
    toast(`Copy of ${scene.name} created`)
  }

  const showEmpty = !isLoading && scenes.length === 0
  const showNoMatches = !isLoading && scenes.length > 0 && filteredScenes.length === 0

  return (
    <section aria-labelledby="scenes-heading">
      <h1 className="font-serif text-2xl text-gold" id="scenes-heading">
        Scenes
      </h1>
      <p className="mt-2 text-zinc-400">Curate and manage your immersive environments.</p>

      <div className="mt-6">
        <Input
          aria-label="Search scenes"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search scenes…"
          value={search}
        />
      </div>

      <div className="mt-6 space-y-4">
        {showEmpty ? <ScenesEmptyState onCreate={openCreateDialog} /> : null}

        {showNoMatches ? (
          <p className="text-center text-zinc-500" data-testid="scenes-no-matches">
            No scenes match
          </p>
        ) : null}

        {filteredScenes.map((scene) => (
          <SceneCard
            key={scene.id}
            onDelete={(target) => void requestDelete(target)}
            onDuplicate={(target) => void handleDuplicate(target)}
            onEdit={openEditDialog}
            scene={scene}
          />
        ))}

        {!showEmpty ? <NewSceneCard label="New Scene" onClick={openCreateDialog} /> : null}
      </div>

      <SceneDialog
        mode={dialogMode}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        open={dialogOpen}
        scene={editingScene}
      />

      {deleteTarget ? (
        <SceneDeleteDialog
          onConfirm={() => {
            void performDelete(deleteTarget)
            setDeleteDialogOpen(false)
            setDeleteTarget(null)
          }}
          onOpenChange={setDeleteDialogOpen}
          open={deleteDialogOpen}
          sceneName={deleteTarget.name}
          sessionLinkCount={deleteLinkCount}
        />
      ) : null}
    </section>
  )
}
