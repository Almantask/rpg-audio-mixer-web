import { Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  formatSessionLabel,
  formatSessionMetadata,
} from '@/lib/format'
import { getSessionScenesPath } from '@/lib/storage/db'
import { touchSessionOpened } from '@/lib/storage/sessionRepository'
import type { Session } from '@/lib/storage/types'
import { useSwipeRight } from '@/hooks/useSwipeRight'

interface SessionCardProps {
  session: Session
  isLastActive: boolean
  onEdit: (session: Session) => void
  onDelete: (session: Session) => void
}

export function SessionCard({ session, isLastActive, onEdit, onDelete }: SessionCardProps) {
  const navigate = useNavigate()
  const { swipeHandlers } = useSwipeRight(() => onDelete(session))

  const openScenes = async () => {
    await touchSessionOpened(session.id)
    navigate(getSessionScenesPath(session.campaignId, session.id))
  }

  return (
    <article
      aria-label={`${formatSessionLabel(session.number)} ${session.name}`}
      className="relative flex min-h-40 flex-col rounded-lg border border-zinc-800 bg-surface p-4"
      data-session-label={formatSessionLabel(session.number)}
      data-testid="session-card"
      {...swipeHandlers}
    >
      <button
        className="flex flex-1 flex-col items-start text-left"
        data-testid="session-card-body"
        onClick={() => void openScenes()}
        type="button"
      >
        <div className="mb-3 h-16 w-full overflow-hidden rounded-md bg-zinc-900">
          {session.coverArtUrl ? (
            <img alt="" className="h-full w-full object-cover" src={session.coverArtUrl} />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-zinc-600">
              Cover
            </div>
          )}
        </div>
        <div className="flex w-full items-start justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              {formatSessionLabel(session.number)}
            </p>
            <h3 className="font-serif text-lg text-gold">{session.name}</h3>
          </div>
          {isLastActive ? (
            <Badge aria-label="Last Active session" variant="active">
              Last Active
            </Badge>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          {formatSessionMetadata(session.date, session.sceneCount)}
        </p>
        {session.description ? (
          <p className="mt-2 line-clamp-2 text-sm italic text-zinc-500">{session.description}</p>
        ) : null}
      </button>

      <div className="mt-3 flex justify-end gap-1">
        <Button
          aria-label={`Edit ${formatSessionLabel(session.number)}`}
          onClick={() => onEdit(session)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Pencil aria-hidden="true" className="h-4 w-4" />
        </Button>
        <Button
          aria-label={`Trash ${formatSessionLabel(session.number)}`}
          className="text-zinc-400 hover:text-red-400"
          onClick={() => onDelete(session)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
    </article>
  )
}
