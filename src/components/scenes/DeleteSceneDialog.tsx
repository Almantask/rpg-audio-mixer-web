import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'

import {

  AlertDialog,

  AlertDialogContent,

  AlertDialogFooter,

  AlertDialogHeader,

  AlertDialogTitle,

  Dialog,

  DialogContent,

  DialogFooter,

  DialogHeader,

  DialogTitle,

} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'
import { filterScenesByName } from '@/lib/sceneStorage'



interface DeleteSceneDialogProps {

  open: boolean

  onOpenChange: (open: boolean) => void

  sceneName: string

  linkedSessionCount: number

  onConfirm: () => void

}



export function DeleteSceneDialog({

  open,

  onOpenChange,

  sceneName,

  linkedSessionCount,

  onConfirm,

}: DeleteSceneDialogProps) {

  return (

    <AlertDialog open={open} onOpenChange={onOpenChange}>

      <AlertDialogContent aria-labelledby="delete-scene-title">

        <AlertDialogHeader>

          <AlertDialogTitle id="delete-scene-title">Delete {sceneName}?</AlertDialogTitle>

        </AlertDialogHeader>

        {linkedSessionCount > 0 ? (

          <p className="text-sm text-muted" data-linked-session-warning>

            This scene is linked to {linkedSessionCount}{' '}

            {linkedSessionCount === 1 ? 'session' : 'sessions'}. It will be unlinked from those

            sessions and moved to Trash.

          </p>

        ) : null}

        <AlertDialogFooter>

          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>

            Cancel

          </Button>

          <Button

            type="button"

            data-confirm-delete-scene={sceneName}

            onClick={() => {

              onConfirm()

              onOpenChange(false)

            }}

          >

            Confirm Delete

          </Button>

        </AlertDialogFooter>

      </AlertDialogContent>

    </AlertDialog>

  )

}



interface UnlinkSceneDialogProps {

  open: boolean

  onOpenChange: (open: boolean) => void

  sceneName: string

  onConfirm: () => void

}



export function UnlinkSceneDialog({

  open,

  onOpenChange,

  sceneName,

  onConfirm,

}: UnlinkSceneDialogProps) {

  return (

    <AlertDialog open={open} onOpenChange={onOpenChange}>

      <AlertDialogContent aria-labelledby="unlink-scene-title">

        <AlertDialogHeader>

          <AlertDialogTitle id="unlink-scene-title">Unlink {sceneName}?</AlertDialogTitle>

        </AlertDialogHeader>

        <p className="text-sm text-muted">

          This removes the scene from this session only. The global scene will remain available.

        </p>

        <AlertDialogFooter>

          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>

            Cancel

          </Button>

          <Button

            type="button"

            data-confirm-unlink-scene={sceneName}

            onClick={() => {

              onConfirm()

              onOpenChange(false)

            }}

          >

            Confirm Unlink

          </Button>

        </AlertDialogFooter>

      </AlertDialogContent>

    </AlertDialog>

  )

}



interface ImportScenePickerDialogProps {

  open: boolean

  onOpenChange: (open: boolean) => void

  availableScenes: { id: string; name: string; tags: string[] }[]

  onImport: (sceneIds: string[]) => void

}



export function ImportScenePickerDialog({

  open,

  onOpenChange,

  availableScenes,

  onImport,

}: ImportScenePickerDialogProps) {

  const [selected, setSelected] = useState<string[]>([])

  const [search, setSearch] = useState('')



  const filteredScenes = useMemo(
    () => filterScenesByName(availableScenes, search),
    [availableScenes, search],
  )



  const toggle = (sceneId: string) => {

    setSelected((current) =>

      current.includes(sceneId)

        ? current.filter((id) => id !== sceneId)

        : [...current, sceneId],

    )

  }



  const handleClose = () => {

    setSelected([])

    setSearch('')

    onOpenChange(false)

  }



  return (

    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>

      <DialogContent aria-labelledby="import-scene-title" className="max-w-lg">

        <DialogHeader>

          <DialogTitle id="import-scene-title">Import Scene</DialogTitle>

        </DialogHeader>



        {availableScenes.length === 0 ? (

          <div data-import-picker-empty>

            <p className="text-muted">All scenes are already in this session</p>

            <a href="/scenes" className="mt-2 inline-block text-gold hover:underline">

              Scenes → New Scene

            </a>

          </div>

        ) : (

          <>

            <Input

              aria-label="Search scenes to import"

              placeholder="Search scenes by name or tag…"

              value={search}

              onChange={(event) => setSearch(event.target.value)}

              data-import-scene-search

            />

            <ul className="max-h-64 space-y-2 overflow-y-auto">

              {filteredScenes.map((scene) => (

                <li key={scene.id} data-import-scene-item={scene.name}>

                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-white/10 p-3">

                    <input

                      type="checkbox"

                      checked={selected.includes(scene.id)}

                      onChange={() => toggle(scene.id)}

                      data-import-scene-check={scene.name}

                    />

                    <span>{scene.name}</span>

                  </label>

                </li>

              ))}

            </ul>

          </>

        )}



        <DialogFooter>

          <Button type="button" variant="ghost" onClick={handleClose}>

            Cancel

          </Button>

          <Button

            type="button"

            disabled={selected.length === 0}

            data-import-scenes-confirm

            onClick={() => {

              onImport(selected)

              handleClose()

            }}

          >

            Import Selected ({selected.length})

          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>

  )

}

