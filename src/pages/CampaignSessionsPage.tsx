import { useState, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react'
import { useCampaigns, useSessions } from '../lib/useStorage'
import { storage } from '../lib/storage'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog'
import { AlertDialog, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '../components/ui/alert-dialog'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Skeleton } from '../components/ui/skeleton'
import type { Session } from '../lib/types'

export function CampaignSessionsPage() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { campaigns, refresh: refreshCampaigns } = useCampaigns()
  const { sessions, refresh } = useSessions(campaignId)

  const campaign = campaigns.find((c) => c.id === campaignId)

  // Simulation flags for testing
  const isLoading = searchParams.get('loading') === 'true'
  const isCreateFail = searchParams.get('createFail') === 'true'
  const isEditFail = searchParams.get('editFail') === 'true'

  // Create Session State
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [coverArt, setCoverArt] = useState<string | undefined>(undefined)
  const [nameError, setNameError] = useState('')
  const [createError, setCreateError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit Session State
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [editName, setEditName] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCoverArt, setEditCoverArt] = useState<string | undefined>(undefined)
  const [editError, setEditError] = useState('')
  const editFileInputRef = useRef<HTMLInputElement>(null)

  // Delete Confirmation State
  const [deletingSession, setDeletingSession] = useState<Session | null>(null)

  // Edit Campaign Modal
  const [editCampaignOpen, setEditCampaignOpen] = useState(false)
  const [campaignName, setCampaignName] = useState(campaign?.name || '')
  const [campaignDesc, setCampaignDesc] = useState(campaign?.description || '')
  const [campaignCoverArt, setCampaignCoverArt] = useState<string | undefined>(campaign?.coverArt)
  const campaignFileInputRef = useRef<HTMLInputElement>(null)

  // Next session number
  const nextSessionNumber = storage.getNextSessionNumber(campaignId)

  // Sort sessions by date descending (or recent)
  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt).getTime() || 0
    const dateB = new Date(b.date || b.createdAt).getTime() || 0
    return dateB - dateA
  })

  // Find most recently opened session
  const lastActiveSession = [...sessions].sort((a, b) => {
    const timeA = a.lastOpenedAt ? new Date(a.lastOpenedAt).getTime() : 0
    const timeB = b.lastOpenedAt ? new Date(b.lastOpenedAt).getTime() : 0
    return timeB - timeA
  })[0]

  const handleOpenCreate = () => {
    setName('')
    setDate(new Date().toISOString().split('T')[0])
    setDescription('')
    setCoverArt(undefined)
    setNameError('')
    setCreateError('')
    setCreateOpen(true)
  }

  const handleConfirmCreate = () => {
    if (!name.trim()) {
      setNameError('Session name is required')
      return
    }

    if (isCreateFail) {
      setCreateError('Failed to create session')
      return
    }

    storage.createSession({
      campaignId,
      name: name.trim(),
      date,
      description: description.trim() || undefined,
      coverArt,
    })
    setCreateOpen(false)
    refresh()
  }

  const handleOpenEdit = (session: Session, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingSession(session)
    setEditName(session.name)
    setEditDate(session.date)
    setEditDescription(session.description || '')
    setEditCoverArt(session.coverArt)
    setEditError('')
  }

  const handleConfirmEdit = () => {
    if (!editingSession) return
    if (!editName.trim()) return

    if (isEditFail) {
      setEditError('Failed to update session')
      return
    }

    storage.updateSession(editingSession.id, {
      name: editName.trim(),
      date: editDate,
      description: editDescription.trim() || undefined,
      coverArt: editCoverArt,
    })
    setEditingSession(null)
    refresh()
  }

  const handleConfirmDelete = () => {
    if (!deletingSession) return
    storage.deleteSession(deletingSession.id)
    setDeletingSession(null)
    refresh()
  }

  const handleOpenSessionScenes = (session: Session) => {
    storage.setLastActiveSession(session.id)
    navigate(`/campaigns/${campaignId}/sessions/${session.id}/scenes`)
  }

  const handleOpenEditCampaign = () => {
    if (campaign) {
      setCampaignName(campaign.name)
      setCampaignDesc(campaign.description || '')
      setCampaignCoverArt(campaign.coverArt)
    }
    setEditCampaignOpen(true)
  }

  const handleSaveCampaignEdit = () => {
    if (!campaign || !campaignName.trim()) return
    storage.updateCampaign(campaign.id, {
      name: campaignName.trim(),
      description: campaignDesc.trim() || undefined,
      coverArt: campaignCoverArt,
    })
    setEditCampaignOpen(false)
    refreshCampaigns()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-amber-300">
            {campaign?.name || 'Campaign'}
          </h2>
          <p className="text-zinc-400 text-sm">Campaign Sessions</p>
        </div>
        <Skeleton className="h-40 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-amber-300">
          {campaign?.name || 'Campaign'}
        </h2>
        <p className="text-zinc-400 text-sm font-semibold tracking-wider uppercase">
          Campaign Sessions
        </p>
      </div>

      {/* Campaign Hero Banner */}
      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-950 p-6 shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-zinc-100">
              {campaign?.name}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-amber-300"
              aria-label="Edit campaign hero"
              onClick={handleOpenEditCampaign}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>

          {campaign?.description ? (
            <p className="text-sm text-zinc-300 max-w-2xl">{campaign.description}</p>
          ) : (
            <div className="flex items-center gap-4 text-xs">
              <Button
                variant="link"
                size="sm"
                onClick={handleOpenEditCampaign}
                className="text-amber-400 p-0 text-xs"
              >
                Add a description
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={handleOpenEditCampaign}
                className="text-zinc-400 p-0 text-xs"
              >
                Add cover art
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Sessions Content */}
      {sortedSessions.length === 0 ? (
        <div className="space-y-6 text-center py-12">
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-bold text-zinc-300">No sessions yet</h3>
            <p className="text-sm text-zinc-500">Add your first session to track play nights and link scenes.</p>
          </div>
          <Button
            variant="gold"
            size="lg"
            onClick={handleOpenCreate}
            className="mx-auto"
          >
            Add New Session
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedSessions.map((session) => {
              const scenes = storage.getScenesForSession(session.id)
              const sceneCount = scenes.length
              const sceneLabel = `${sceneCount} ${sceneCount === 1 ? 'Scene' : 'Scenes'}`
              const isLastActive = lastActiveSession?.id === session.id

              return (
                <Card
                  key={session.id}
                  data-session-id={session.id}
                  onClick={() => handleOpenSessionScenes(session)}
                  className="cursor-pointer border-zinc-800 bg-zinc-900/90 hover:border-zinc-700 transition-all p-4 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="space-y-2">
                    {/* Top Row: Session Number & Badges & Action Buttons */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-sm font-bold text-amber-400">
                          Session {session.sessionNumber}
                        </span>
                        {isLastActive && (
                          <Badge variant="active" className="text-[10px]">
                            Last Active
                          </Badge>
                        )}
                      </div>

                      {/* Action Icons */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-amber-300"
                          aria-label="Edit session"
                          onClick={(e) => handleOpenEdit(session, e)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-red-400"
                          aria-label="Delete session"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeletingSession(session)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Session Name */}
                    <h4 className="font-serif text-lg font-bold text-zinc-100 group-hover:text-amber-300 transition-colors">
                      {session.name}
                    </h4>

                    {/* Metadata: Date and Scenes */}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span>{session.date} · {sceneLabel}</span>
                    </div>


                    {/* Description Snippet */}
                    {session.description && (
                      <p className="text-xs text-zinc-400 italic line-clamp-2 pt-1">
                        {session.description}
                      </p>
                    )}
                  </div>
                </Card>
              )
            })}

            {/* Add New Session Card */}
            <Card
              onClick={handleOpenCreate}
              className="border-dashed border-amber-500/40 bg-zinc-950/40 hover:bg-amber-950/10 p-6 cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-2 min-h-[140px]"
            >
              <Plus className="h-6 w-6 text-amber-400" />
              <span className="font-serif font-semibold text-amber-300">Add New Session</span>
            </Card>
          </div>
        </div>
      )}

      {/* Create Session Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogHeader>
          <DialogTitle>Add New Session</DialogTitle>
          <DialogDescription>
            Create a new session for {campaign?.name}.
          </DialogDescription>
        </DialogHeader>

        {createError && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-md">
            {createError}
          </div>
        )}

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-md border border-zinc-800">
            <span className="text-xs text-zinc-400">Session Number:</span>
            <span className="font-serif font-bold text-amber-400">Session {nextSessionNumber}</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Session Name *</label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError('')
              }}
              placeholder="e.g. The Howling Crags"
              className={nameError ? 'border-red-500' : ''}
              autoFocus
            />
            {nameError && <p className="text-xs text-red-400">{nameError}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Date *</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Description (Optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is planned for this session…"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Cover Art (Optional)</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-20 border border-dashed border-zinc-700 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/40 transition-colors relative overflow-hidden"
              style={
                coverArt
                  ? { backgroundImage: `url(${coverArt})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : undefined
              }
            >
              {!coverArt ? (
                <span className="text-xs text-zinc-400">Click to upload cover image</span>
              ) : (
                <span className="text-xs text-white bg-black/60 px-2 py-1 rounded">Image selected</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setCoverArt(URL.createObjectURL(file))
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>
          <Button variant="gold" onClick={handleConfirmCreate}>
            Create
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Session Dialog */}
      <Dialog open={Boolean(editingSession)} onOpenChange={(open) => !open && setEditingSession(null)}>
        <DialogHeader>
          <DialogTitle>Edit Session {editingSession?.sessionNumber}</DialogTitle>
          <DialogDescription>
            Update session details.
          </DialogDescription>
        </DialogHeader>

        {editError && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-md">
            {editError}
          </div>
        )}

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Session Name *</label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="e.g. The Howling Crags"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Date *</label>
            <Input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Description (Optional)</label>
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Cover Art (Optional)</label>
            <div
              onClick={() => editFileInputRef.current?.click()}
              className="h-20 border border-dashed border-zinc-700 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/40 transition-colors relative overflow-hidden"
              style={
                editCoverArt
                  ? { backgroundImage: `url(${editCoverArt})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : undefined
              }
            >
              {!editCoverArt ? (
                <span className="text-xs text-zinc-400">Click to upload cover image</span>
              ) : (
                <span className="text-xs text-white bg-black/60 px-2 py-1 rounded">Change image</span>
              )}
            </div>
            <input
              ref={editFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setEditCoverArt(URL.createObjectURL(file))
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setEditingSession(null)}>
            Cancel
          </Button>
          <Button variant="gold" onClick={handleConfirmEdit}>
            Save
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={Boolean(deletingSession)} onOpenChange={(open) => !open && setDeletingSession(null)}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Session {deletingSession?.sessionNumber}?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{deletingSession?.name}"? This session will be moved to Trash and can be recovered for 7 days.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={() => setDeletingSession(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialog>

      {/* Edit Campaign Dialog */}
      <Dialog open={editCampaignOpen} onOpenChange={setEditCampaignOpen}>
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription>
            Update details for {campaign?.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Campaign Name *</label>
            <Input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g. The Shattered Throne"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Description</label>
            <Textarea
              value={campaignDesc}
              onChange={(e) => setCampaignDesc(e.target.value)}
              placeholder="Description of the campaign arc…"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Cover Art</label>
            <div
              onClick={() => campaignFileInputRef.current?.click()}
              className="h-20 border border-dashed border-zinc-700 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/40 transition-colors"
            >
              <span className="text-xs text-zinc-400">
                {campaignCoverArt ? 'Cover Art Selected' : 'Click to upload cover art'}
              </span>
            </div>
            <input
              ref={campaignFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setCampaignCoverArt(URL.createObjectURL(file))
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setEditCampaignOpen(false)}>
            Cancel
          </Button>
          <Button variant="gold" onClick={handleSaveCampaignEdit}>
            Save
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
