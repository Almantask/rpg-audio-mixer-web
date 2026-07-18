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
import { formatTodayIso } from '@/lib/dateFormat'

interface SessionFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  sessionNumber: number
  initialName?: string
  initialDate?: string
  initialDescription?: string
  initialCoverArtUrl?: string
  onOpenChange: (open: boolean) => void
  onSubmit: (input: {
    name: string
    date: string
    description?: string
    coverArtUrl?: string
  }) => void
  errorMessage?: string | null
}

export function SessionFormDialog({
  open,
  mode,
  sessionNumber,
  initialName = '',
  initialDate,
  initialDescription = '',
  initialCoverArtUrl,
  onOpenChange,
  onSubmit,
  errorMessage,
}: SessionFormDialogProps) {
  const [name, setName] = useState(initialName)
  const [date, setDate] = useState(initialDate ?? formatTodayIso())
  const [description, setDescription] = useState(initialDescription)
  const [coverArtUrl, setCoverArtUrl] = useState<string | undefined>(initialCoverArtUrl)
  const [nameError, setNameError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(initialName)
      setDate(initialDate ?? formatTodayIso())
      setDescription(initialDescription)
      setCoverArtUrl(initialCoverArtUrl)
      setNameError(null)
    }
  }, [open, initialName, initialDate, initialDescription, initialCoverArtUrl])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleConfirm = () => {
    if (!name.trim()) {
      setNameError('Session name is required')
      return
    }
    onSubmit({
      name: name.trim(),
      date,
      description: description.trim() || undefined,
      coverArtUrl,
    })
  }

  const title = mode === 'create' ? 'Add New Session' : 'Edit Session'
  const titleId = mode === 'create' ? 'create-session-title' : 'edit-session-title'

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
      <DialogContent aria-labelledby={titleId}>
        <DialogHeader>
          <DialogTitle id={titleId}>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <CoverArtUpload
            value={coverArtUrl}
            onChange={setCoverArtUrl}
            label="Session cover art"
          />

          <div className="space-y-2">
            <Label htmlFor="session-number">Session number</Label>
            <Input
              id="session-number"
              aria-label="Session number"
              readOnly
              value={`Session ${sessionNumber}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-name">Session name</Label>
            <Input
              id="session-name"
              aria-label="Session name"
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
            <Label htmlFor="session-date">Date</Label>
            <Input
              id="session-date"
              aria-label="Session date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-description">Description (optional)</Label>
            <Textarea
              id="session-description"
              aria-label="Session description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          {errorMessage ? (
            <p role="alert" className="text-sm text-red-400">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm}>
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
