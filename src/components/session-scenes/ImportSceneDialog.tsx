import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { Scene } from '@/lib/storage/types'

interface ImportSceneDialogProps {
  open: boolean
  availableScenes: Scene[]
  onOpenChange: (open: boolean) => void
  onImport: (sceneIds: string[]) => Promise<void>
}

export function ImportSceneDialog({
  open,
  availableScenes,
  onOpenChange,
  onImport,
}: ImportSceneDialogProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) return availableScenes
    return availableScenes.filter((scene) => scene.name.toLowerCase().includes(normalized))
  }, [availableScenes, search])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearch('')
      setSelected([])
    }
    onOpenChange(nextOpen)
  }

  const toggleScene = (sceneId: string) => {
    setSelected((current) =>
      current.includes(sceneId)
        ? current.filter((id) => id !== sceneId)
        : [...current, sceneId],
    )
  }

  const handleImport = async () => {
    setSubmitting(true)
    try {
      await onImport(selected)
      handleOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  const allLinked = availableScenes.length === 0

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent aria-describedby="import-scene-description">
        <DialogHeader>
          <DialogTitle>Import Scene</DialogTitle>
          <p className="text-sm text-zinc-400" id="import-scene-description">
            Link existing scenes to this session.
          </p>
        </DialogHeader>

        {allLinked ? (
          <div className="space-y-4 py-4 text-center" data-testid="import-scene-empty">
            <p className="text-zinc-400">All scenes are already in this session</p>
            <Link className="text-gold underline" to="/scenes">
              Scenes → New Scene
            </Link>
          </div>
        ) : (
          <>
            <Input
              aria-label="Search scenes in picker"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search scenes…"
              value={search}
            />
            <ul className="max-h-64 space-y-2 overflow-y-auto" data-testid="import-scene-picker">
              {filtered.map((scene) => (
                <li
                  className="flex items-center gap-3 rounded-md border border-zinc-800 px-3 py-2"
                  data-scene-picker-name={scene.name}
                  key={scene.id}
                >
                  <Checkbox
                    checked={selected.includes(scene.id)}
                    onChange={() => toggleScene(scene.id)}
                  />
                  <span className="text-zinc-100">{scene.name}</span>
                </li>
              ))}
            </ul>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)} type="button" variant="outline">
                Cancel
              </Button>
              <Button
                disabled={selected.length === 0 || submitting}
                onClick={() => void handleImport()}
                type="button"
              >
                Import Selected ({selected.length})
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
