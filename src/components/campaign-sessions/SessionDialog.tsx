import { useEffect, useState } from 'react'
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
import { formatSessionLabel, todayIsoDate } from '@/lib/format'
import { getNextSessionNumber } from '@/lib/storage/sessionRepository'
import type { Session } from '@/lib/storage/types'

export interface SessionFormValues {
  name: string
  date: string
  description: string
  coverArtUrl?: string
}

interface SessionDialogProps {
  mode: 'create' | 'edit'
  open: boolean
  campaignId: string
  session?: Session
  onOpenChange: (open: boolean) => void
  onSubmit: (values: SessionFormValues) => Promise<void>
}

export function SessionDialog({
  mode,
  open,
  campaignId,
  session,
  onOpenChange,
  onSubmit,
}: SessionDialogProps) {
  const [name, setName] = useState('')
  const [date, setDate] = useState(todayIsoDate())
  const [description, setDescription] = useState('')
  const [coverArtUrl, setCoverArtUrl] = useState<string | undefined>()
  const [sessionNumber, setSessionNumber] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && session) {
      setName(session.name)
      setDate(session.date)
      setDescription(session.description ?? '')
      setCoverArtUrl(session.coverArtUrl)
      setSessionNumber(session.number)
      return
    }
    setName('')
    setDate(todayIsoDate())
    setDescription('')
    setCoverArtUrl(undefined)
    void getNextSessionNumber(campaignId).then(setSessionNumber)
  }, [open, mode, session, campaignId])

  const reset = () => {
    setError(null)
    setSubmitError(null)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset()
    onOpenChange(nextOpen)
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Session name is required')
      return
    }
    setSubmitting(true)
    setError(null)
    setSubmitError(null)
    try {
      await onSubmit({ name, date, description, coverArtUrl })
      handleOpenChange(false)
    } catch {
      setSubmitError('Unable to save session. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent aria-describedby="session-dialog-description">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Session' : 'Edit Session'}</DialogTitle>
          <DialogDescription id="session-dialog-description">
            {mode === 'create'
              ? 'Create a new play session for this campaign.'
              : 'Update session details.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <CoverArtPicker coverArtUrl={coverArtUrl} label="Session" onChange={setCoverArtUrl} />
          <div className="space-y-2">
            <Label htmlFor="session-number">Session number</Label>
            <Input
              aria-readonly="true"
              id="session-number"
              readOnly
              value={formatSessionLabel(sessionNumber)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session-name">Session name</Label>
            <Input
              aria-invalid={Boolean(error)}
              id="session-name"
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
            <Label htmlFor="session-date">Date</Label>
            <Input
              aria-label="Date"
              id="session-date"
              onChange={(event) => setDate(event.target.value)}
              type="date"
              value={date}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session-description">Description (optional)</Label>
            <Textarea
              id="session-description"
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </div>
          {submitError ? (
            <p className="text-sm text-red-400" role="alert">
              {submitError}
            </p>
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
