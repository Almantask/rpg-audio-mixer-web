import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

import { CoverArtUpload } from '@/components/shared/CoverArtUpload'

import {

  Dialog,

  DialogContent,

  DialogFooter,

  DialogHeader,

  DialogTitle,

} from '@/components/ui/dialog'

import { Input, Textarea } from '@/components/ui/input'

import { Label } from '@/components/ui/label'

import { Badge } from '@/components/ui/badge'

import { PREDEFINED_SCENE_TAGS } from '@/lib/sceneStorage'

import type { Scene } from '@/types/scene'



interface SceneFormDialogProps {

  open: boolean

  onOpenChange: (open: boolean) => void

  scene?: Scene

  onSave: (input: {

    name: string

    description?: string

    coverArtUrl?: string

    tags: string[]

  }) => void

}



export function SceneFormDialog({ open, onOpenChange, scene, onSave }: SceneFormDialogProps) {

  const [name, setName] = useState(scene?.name ?? '')

  const [description, setDescription] = useState(scene?.description ?? '')

  const [coverArtUrl, setCoverArtUrl] = useState<string | undefined>(scene?.coverArtUrl)

  const [tags, setTags] = useState<string[]>(scene?.tags ?? [])

  const [customTag, setCustomTag] = useState('')

  const [nameError, setNameError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }
    setName(scene?.name ?? '')
    setDescription(scene?.description ?? '')
    setCoverArtUrl(scene?.coverArtUrl)
    setTags(scene?.tags ?? [])
    setCustomTag('')
    setNameError(null)
  }, [open, scene])

  const reset = () => {

    setName(scene?.name ?? '')

    setDescription(scene?.description ?? '')

    setCoverArtUrl(scene?.coverArtUrl)

    setTags(scene?.tags ?? [])

    setCustomTag('')

    setNameError(null)

  }



  const handleClose = () => {

    reset()

    onOpenChange(false)

  }



  const removeTag = (tag: string) => {

    setTags((current) => current.filter((item) => item !== tag))

  }



  const addCustomTag = () => {

    const trimmed = customTag.trim()

    if (!trimmed || tags.includes(trimmed)) {

      return

    }

    setTags((current) => [...current, trimmed])

    setCustomTag('')

  }



  const handleConfirm = () => {

    if (!name.trim()) {

      setNameError('Scene name is required')

      return

    }

    onSave({

      name: name.trim(),

      description: description.trim() || undefined,

      coverArtUrl,

      tags,

    })

    reset()

    onOpenChange(false)

  }



  const tagSuggestions = PREDEFINED_SCENE_TAGS.filter(

    (tag) =>

      customTag.trim().length > 0 &&

      tag.toLowerCase().includes(customTag.trim().toLowerCase()) &&

      !tags.includes(tag),

  )



  return (

    <Dialog

      open={open}

      onOpenChange={(next) => {

        if (next) {

          setName(scene?.name ?? '')

          setDescription(scene?.description ?? '')

          setCoverArtUrl(scene?.coverArtUrl)

          setTags(scene?.tags ?? [])

          onOpenChange(true)

        } else {

          handleClose()

        }

      }}

    >

      <DialogContent aria-labelledby="scene-form-title">

        <DialogHeader>

          <DialogTitle id="scene-form-title">{scene ? 'Edit Scene' : 'New Scene'}</DialogTitle>

        </DialogHeader>



        <div className="space-y-4">

          <CoverArtUpload

            value={coverArtUrl}

            onChange={setCoverArtUrl}

            label="Background image"

          />



          <div className="space-y-2">

            <Label htmlFor="scene-name">Scene name</Label>

            <Input

              id="scene-name"

              aria-label="Scene name"

              value={name}

              onChange={(event) => {

                setName(event.target.value)

                setNameError(null)

              }}

            />

            {nameError ? (

              <p role="alert" className="text-sm text-red-400">

                {nameError}

              </p>

            ) : null}

          </div>



          <div className="space-y-2">

            <Label htmlFor="scene-description">Description (optional)</Label>

            <Textarea

              id="scene-description"

              aria-label="Scene description"

              value={description}

              onChange={(event) => setDescription(event.target.value)}

            />

          </div>



          {scene ? (

            <div className="space-y-2" data-scene-tags-field>

              <Label>Tags</Label>

              {tags.length > 0 ? (

                <div className="flex flex-wrap gap-2">

                  {tags.map((tag) => (

                    <Badge key={tag} data-scene-edit-tag={tag} className="gap-2">

                      {tag}

                      <button

                        type="button"

                        className="text-xs uppercase tracking-wide"

                        onClick={() => removeTag(tag)}

                      >

                        Remove

                      </button>

                    </Badge>

                  ))}

                </div>

              ) : null}

              <div className="relative flex gap-2">

                <Input

                  aria-label="Custom tag"

                  placeholder="Custom tag"

                  value={customTag}

                  onChange={(event) => setCustomTag(event.target.value)}

                  data-scene-tag-input

                  list="scene-tag-suggestions"

                />

                {tagSuggestions.length > 0 ? (

                  <ul className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border border-white/10 bg-charcoal-elevated">

                    {tagSuggestions.map((tag) => (

                      <li key={tag}>

                        <button

                          type="button"

                          role="option"

                          className="block w-full px-3 py-2 text-left text-sm hover:bg-white/5"

                          onClick={() => {

                            setTags((current) => [...current, tag])

                            setCustomTag('')

                          }}

                        >

                          {tag}

                        </button>

                      </li>

                    ))}

                  </ul>

                ) : null}

                <Button type="button" variant="ghost" onClick={addCustomTag}>

                  Add tag

                </Button>

              </div>

            </div>

          ) : null}

        </div>



        <DialogFooter>

          <Button type="button" variant="ghost" onClick={handleClose}>

            Cancel

          </Button>

          <Button type="button" onClick={handleConfirm} data-scene-save={scene ? true : undefined}>

            {scene ? 'Save' : 'Create'}

          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>

  )

}

