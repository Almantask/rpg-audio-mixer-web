import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CoverArtPicker } from '@/components/shared/CoverArtPicker'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { PREDEFINED_SCENE_TAGS } from '@/lib/storage/types'
import type { Scene } from '@/lib/storage/types'

export interface SceneFormValues {
  name: string
  description: string
  coverArtUrl?: string
  tags: string[]
}

interface SceneDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  scene?: Scene
  onOpenChange: (open: boolean) => void
  onSubmit: (values: SceneFormValues) => Promise<void>
}

export function SceneDialog({
  open,
  mode,
  scene,
  onOpenChange,
  onSubmit,
}: SceneDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [coverArtUrl, setCoverArtUrl] = useState<string | undefined>()
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(scene?.name ?? '')
    setDescription(scene?.description ?? '')
    setCoverArtUrl(scene?.coverArtUrl)
    setTags(scene?.tags ?? [])
    setCustomTag('')
    setError(null)
  }, [open, scene])

  const reset = () => {
    setName('')
    setDescription('')
    setCoverArtUrl(undefined)
    setTags([])
    setCustomTag('')
    setError(null)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset()
    onOpenChange(nextOpen)
  }

  const toggleTag = (tag: string) => {
    setTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    )
  }

  const addCustomTag = () => {
    const trimmed = customTag.trim()
    if (!trimmed || tags.includes(trimmed)) return
    setTags((current) => [...current, trimmed])
    setCustomTag('')
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Scene name is required')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ name, description, coverArtUrl, tags })
      handleOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'create' ? 'New Scene' : `Edit ${scene?.name ?? 'Scene'}`

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent aria-describedby="scene-dialog-description">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-zinc-400" id="scene-dialog-description">
            {mode === 'create'
              ? 'Create a new scene with a location name.'
              : 'Update scene metadata and tags.'}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <CoverArtPicker
            coverArtUrl={coverArtUrl}
            label="Scene"
            onChange={setCoverArtUrl}
          />
          <div className="space-y-2">
            <Label htmlFor="scene-name">Scene name</Label>
            <Input
              aria-invalid={Boolean(error)}
              id="scene-name"
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
            {error ? (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="scene-description">Description (optional)</Label>
            <Textarea
              id="scene-description"
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </div>

          {mode === 'edit' ? (
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_SCENE_TAGS.map((tag) => (
                  <button
                    className="rounded-full"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    type="button"
                  >
                    <Badge variant={tags.includes(tag) ? 'default' : 'outline'}>{tag}</Badge>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  aria-label="Custom tag"
                  onChange={(event) => setCustomTag(event.target.value)}
                  placeholder="Custom tag"
                  value={customTag}
                />
                <Button onClick={addCustomTag} type="button" variant="outline">
                  Add
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button onClick={() => handleOpenChange(false)} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={submitting} onClick={() => void handleSubmit()} type="button">
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
