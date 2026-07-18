import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreateSoundscapeCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string) => void
}

export function CreateSoundscapeCategoryDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateSoundscapeCategoryDialogProps) {
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName('')
      setNameError(null)
    }
  }, [open])

  const handleClose = () => {
    setName('')
    setNameError(null)
    onOpenChange(false)
  }

  useEffect(() => {
    if (!open) {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setName('')
        setNameError(null)
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  const handleConfirm = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError('Category name is required')
      return
    }
    onCreate(trimmed)
    setName('')
    setNameError(null)
    onOpenChange(false)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    handleConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
      <DialogContent
        aria-labelledby="create-soundscape-category-title"
        data-sc-create-category-modal
        className="w-full max-w-md"
      >
        <DialogHeader>
          <DialogTitle id="create-soundscape-category-title">Add Soundscape</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="soundscape-category-name">Category name</Label>
            <Input
              id="soundscape-category-name"
              aria-label="Category name"
              value={name}
              autoFocus
              className="min-h-11"
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

          <DialogFooter>
            <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
