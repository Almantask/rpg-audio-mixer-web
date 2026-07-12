import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CoverArtPicker } from '@/components/shared/CoverArtPicker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export interface CampaignFormValues {
  name: string
  description: string
  coverArtUrl?: string
}

interface CampaignCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CampaignFormValues) => Promise<void>
}

export function CampaignCreateDialog({
  open,
  onOpenChange,
  onSubmit,
}: CampaignCreateDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [coverArtUrl, setCoverArtUrl] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    setName('')
    setDescription('')
    setCoverArtUrl(undefined)
    setError(null)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset()
    onOpenChange(nextOpen)
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Campaign name is required')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ name, description, coverArtUrl })
      handleOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent aria-describedby="campaign-create-description">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription id="campaign-create-description">
            Add a new campaign to organise your sessions and scenes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <CoverArtPicker
            coverArtUrl={coverArtUrl}
            label="Campaign"
            onChange={setCoverArtUrl}
          />
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Campaign name</Label>
            <Input
              aria-invalid={Boolean(error)}
              id="campaign-name"
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
            <Label htmlFor="campaign-description">Description (optional)</Label>
            <Textarea
              id="campaign-description"
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => handleOpenChange(false)} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={submitting} onClick={() => void handleSubmit()} type="button">
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
