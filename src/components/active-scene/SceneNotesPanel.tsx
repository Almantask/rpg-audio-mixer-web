import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { updateSceneNotes } from '@/lib/storage/sceneContentRepository'

interface SceneNotesPanelProps {
  sceneId: string
  notes?: string
}

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n')
  return lines.map((line, index) => {
    const heading = line.match(/^##\s+(.+)$/)
    if (heading) {
      return (
        <h3 className="font-serif text-base text-gold" key={index}>
          {heading[1]}
        </h3>
      )
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    return (
      <p className="text-sm text-zinc-400" key={index}>
        {parts.map((part, partIndex) => {
          const bold = part.match(/^\*\*(.+)\*\*$/)
          if (bold) {
            return (
              <strong className="font-semibold text-zinc-200" key={partIndex}>
                {bold[1]}
              </strong>
            )
          }
          return part
        })}
      </p>
    )
  })
}

export function SceneNotesPanel({ sceneId, notes = '' }: SceneNotesPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState(notes)
  const [saved, setSaved] = useState(notes)

  useEffect(() => {
    setDraft(notes)
    setSaved(notes)
  }, [notes])

  const handleChange = (value: string) => {
    setDraft(value)
    void updateSceneNotes(sceneId, value).then(() => setSaved(value))
  }

  return (
    <section className="mt-4 rounded-md border border-zinc-800" data-testid="scene-notes-panel">
      <Button
        aria-expanded={expanded}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        data-testid="scene-notes-toggle"
        onClick={() => setExpanded((open) => !open)}
        type="button"
        variant="ghost"
      >
        <span className="text-sm font-medium text-zinc-300">Scene Notes</span>
        {expanded ? (
          <ChevronUp aria-hidden className="h-4 w-4 text-zinc-500" />
        ) : (
          <ChevronDown aria-hidden className="h-4 w-4 text-zinc-500" />
        )}
      </Button>

      {expanded ? (
        <div className="space-y-3 border-t border-zinc-800 px-4 py-3">
          <textarea
            aria-label="Scene notes"
            className="min-h-24 w-full resize-y rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
            data-testid="scene-notes-input"
            onChange={(event) => handleChange(event.target.value)}
            placeholder="Session notes (markdown supported)…"
            value={draft}
          />
          {draft ? (
            <div className="space-y-1 rounded-md bg-zinc-900/50 p-3" data-testid="scene-notes-preview">
              {renderMarkdown(draft)}
            </div>
          ) : null}
          <p className="sr-only" data-testid="scene-notes-saved">
            {saved}
          </p>
        </div>
      ) : null}
    </section>
  )
}
