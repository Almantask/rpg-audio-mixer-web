import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ImportFxModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (files: File[]) => void
}

function audioFilesFromList(list: FileList | null | undefined): File[] {
  if (!list || list.length === 0) {
    return []
  }
  return Array.from(list).filter(
    (file) => file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(file.name),
  )
}

export function ImportFxModal({ open, onOpenChange, onImport }: ImportFxModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = (list: FileList | null | undefined) => {
    const files = audioFilesFromList(list)
    if (files.length === 0) {
      return
    }
    onImport(files)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-labelledby="import-fx-modal-title"
        className="max-w-lg"
        data-fx-import-modal
      >
        <DialogHeader>
          <DialogTitle id="import-fx-modal-title">Import FX</DialogTitle>
          <p className="text-sm text-muted">
            Add one or more audio files from your computer to the FX library.
          </p>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          multiple
          className="sr-only"
          data-fx-import-input
          onChange={(event) => {
            // Copy before clearing — FileList is live and empties with value = ''.
            const files = audioFilesFromList(event.target.files)
            event.target.value = ''
            if (files.length === 0) {
              return
            }
            onImport(files)
            onOpenChange(false)
          }}
        />

        <button
          type="button"
          data-fx-import-dropzone
          className={cn(
            'flex w-full flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors',
            dragging
              ? 'border-gold bg-gold/10 text-gold'
              : 'border-parchment/20 bg-ink/30 text-muted hover:border-gold/50 hover:text-parchment',
          )}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            setDragging(false)
          }}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            handleFiles(event.dataTransfer.files)
          }}
        >
          <Upload className="mb-3 h-8 w-8" aria-hidden="true" />
          <span className="text-sm font-medium text-parchment">Drop audio files here</span>
          <span className="mt-1 text-xs">or click to choose one or more files</span>
        </button>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" data-fx-import-choose onClick={() => inputRef.current?.click()}>
            Choose files
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
