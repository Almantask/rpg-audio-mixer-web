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

export interface EditCampaignInput {
  name: string
  description?: string
  coverArtUrl?: string
}

interface EditCampaignDialogProps {
  open: boolean
  campaignName: string
  initialName: string
  initialDescription?: string
  initialCoverArtUrl?: string
  onOpenChange: (open: boolean) => void
  onSave: (input: EditCampaignInput) => void
}

export function EditCampaignDialog({
  open,
  campaignName,
  initialName,
  initialDescription = '',
  initialCoverArtUrl,
  onOpenChange,
  onSave,
}: EditCampaignDialogProps) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [coverArtUrl, setCoverArtUrl] = useState<string | undefined>(initialCoverArtUrl)
  const [nameError, setNameError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(initialName)
      setDescription(initialDescription)
      setCoverArtUrl(initialCoverArtUrl)
      setNameError(null)
    }
  }, [open, initialName, initialDescription, initialCoverArtUrl])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleConfirm = () => {
    if (!name.trim()) {
      setNameError('Campaign name is required')
      return
    }
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      coverArtUrl,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
      <DialogContent aria-labelledby="edit-campaign-title" data-edit-campaign-dialog={campaignName}>
        <DialogHeader>
          <DialogTitle id="edit-campaign-title">Edit Campaign</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <CoverArtUpload
            value={coverArtUrl}
            onChange={setCoverArtUrl}
            label="Campaign cover art"
          />

          <div className="space-y-2">
            <Label htmlFor="edit-campaign-name">Campaign name</Label>
            <Input
              id="edit-campaign-name"
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
            <Label htmlFor="edit-campaign-description">Description (optional)</Label>
            <Textarea
              id="edit-campaign-description"
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
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
