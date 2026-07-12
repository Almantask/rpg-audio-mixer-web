import { useState } from 'react'
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

interface CreateCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (input: { name: string; description?: string; coverArtUrl?: string }) => void
}

export function CreateCampaignDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateCampaignDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [coverArtUrl, setCoverArtUrl] = useState<string>()
  const [nameError, setNameError] = useState<string | null>(null)

  const reset = () => {
    setName('')
    setDescription('')
    setCoverArtUrl(undefined)
    setNameError(null)
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  const handleConfirm = () => {
    if (!name.trim()) {
      setNameError('Campaign name is required')
      return
    }
    onCreate({
      name: name.trim(),
      description: description.trim() || undefined,
      coverArtUrl,
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
      <DialogContent aria-labelledby="create-campaign-title">
        <DialogHeader>
          <DialogTitle id="create-campaign-title">Create Campaign</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <CoverArtUpload
            value={coverArtUrl}
            onChange={setCoverArtUrl}
            label="Campaign cover art"
          />

          <div className="space-y-2">
            <Label htmlFor="campaign-name">Campaign name</Label>
            <Input
              id="campaign-name"
              aria-label="Campaign name"
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
            <Label htmlFor="campaign-description">Description (optional)</Label>
            <Textarea
              id="campaign-description"
              aria-label="Campaign description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
