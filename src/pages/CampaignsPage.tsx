import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Trash2, Edit2, Image as ImageIcon, RotateCcw } from 'lucide-react'
import { useCampaigns } from '../lib/useStorage'
import { storage } from '../lib/storage'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { toast } from '../components/ui/toast'
import { Skeleton } from '../components/ui/skeleton'
import type { Campaign } from '../lib/types'

export function CampaignsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { campaigns, refresh } = useCampaigns()

  // Create Campaign State
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [coverArt, setCoverArt] = useState<string | undefined>(undefined)
  const [nameError, setNameError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit Campaign State
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCoverArt, setEditCoverArt] = useState<string | undefined>(undefined)
  const [editNameError, setEditNameError] = useState('')
  const editFileInputRef = useRef<HTMLInputElement>(null)

  // Simulation flags for error / loading test scenarios if search params present
  const isLoading = searchParams.get('loading') === 'true'
  const isError = searchParams.get('error') === 'true'
  const [retryError, setRetryError] = useState(isError)

  // Sort campaigns by lastPlayedAt descending
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    const timeA = a.lastPlayedAt ? new Date(a.lastPlayedAt).getTime() : 0
    const timeB = b.lastPlayedAt ? new Date(b.lastPlayedAt).getTime() : 0
    return timeB - timeA
  })

  const handleOpenCreate = () => {
    setName('')
    setDescription('')
    setCoverArt(undefined)
    setNameError('')
    setCreateOpen(true)
  }

  const handleConfirmCreate = () => {
    if (!name.trim()) {
      setNameError('Campaign name is required')
      return
    }

    storage.createCampaign({
      name: name.trim(),
      description: description.trim() || undefined,
      coverArt,
    })
    setCreateOpen(false)
    refresh()
  }

  const handleOpenEdit = (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingCampaign(campaign)
    setEditName(campaign.name)
    setEditDescription(campaign.description || '')
    setEditCoverArt(campaign.coverArt)
    setEditNameError('')
  }

  const handleConfirmEdit = () => {
    if (!editingCampaign) return
    if (!editName.trim()) {
      setEditNameError('Campaign name is required')
      return
    }

    storage.updateCampaign(editingCampaign.id, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
      coverArt: editCoverArt,
    })
    setEditingCampaign(null)
    refresh()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setCoverArt(url)
    }
  }

  const handleDeleteCampaign = (campaign: Campaign) => {
    storage.deleteCampaign(campaign.id)
    refresh()
    toast.show(`Campaign "${campaign.name}" moved to Trash`, {
      actionLabel: 'Undo',
      onAction: () => {
        const trash = storage.getTrashItems('campaign').find((t) => t.originalId === campaign.id)
        if (trash) {
          storage.restoreTrashItem(trash.id)
          refresh()
        }
      },
    })
  }

  const handleNavigateSessions = (campaign: Campaign) => {
    storage.touchCampaignPlayed(campaign.id)
    navigate(`/campaigns/${campaign.id}/sessions`)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-amber-300">Active Campaigns</h2>
          <p className="text-zinc-400 text-sm">Manage your campaigns.</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    )
  }

  if (retryError) {
    return (
      <div className="space-y-6 text-center py-12">
        <h2 className="font-serif text-2xl font-bold text-red-400">Failed to load campaigns</h2>
        <p className="text-zinc-400 text-sm">There was an issue fetching your campaigns.</p>
        <Button variant="outline" onClick={() => setRetryError(false)}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-amber-300">Active Campaigns</h2>
        <p className="text-zinc-400 text-sm">Manage your campaigns.</p>
      </div>

      {/* Campaigns List */}
      {sortedCampaigns.length === 0 ? (
        <div className="space-y-6 text-center py-8">
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-bold text-zinc-300">No campaigns yet</h3>
            <p className="text-sm text-zinc-500">Create your first campaign to begin organising sessions.</p>
          </div>
          <Card
            onClick={handleOpenCreate}
            className="border-dashed border-amber-500/40 bg-zinc-950/40 hover:bg-amber-950/10 p-8 cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-2"
          >
            <Plus className="h-6 w-6 text-amber-400" />
            <span className="font-serif font-semibold text-amber-300">Create Campaign</span>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedCampaigns.map((campaign) => {
            const sessions = storage.getSessions(campaign.id)
            const sessionCount = sessions.length
            const sessionLabel = sessionCount === 1 ? '1 session' : `${sessionCount} sessions`
            const ctaLabel = sessionCount === 0 ? 'Start' : 'Resume'

            return (
              <Card
                key={campaign.id}
                data-campaign-id={campaign.id}
                className="overflow-hidden border-zinc-800 bg-zinc-900/90 hover:border-zinc-700 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4">
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="h-20 w-20 rounded-md bg-zinc-800 border border-zinc-700/80 shrink-0 overflow-hidden flex items-center justify-center relative"
                      style={
                        campaign.coverArt
                          ? { backgroundImage: `url(${campaign.coverArt})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                          : undefined
                      }
                    >
                      {!campaign.coverArt && <ImageIcon className="h-8 w-8 text-zinc-600" />}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-serif text-xl font-bold text-amber-300">
                        {campaign.name}
                      </h3>
                      {campaign.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 max-w-lg">
                          {campaign.description}
                        </p>
                      )}
                      <div className="text-xs text-zinc-500 font-medium pt-1">
                        {sessionLabel}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center justify-end gap-3 shrink-0">
                    <Button
                      variant="gold"
                      onClick={() => handleNavigateSessions(campaign)}
                      className="min-w-[90px]"
                    >
                      {ctaLabel}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Edit campaign"
                      onClick={(e) => handleOpenEdit(campaign, e)}
                      className="text-zinc-400 hover:text-amber-300"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete campaign"
                      onClick={() => handleDeleteCampaign(campaign)}
                      className="text-zinc-500 hover:text-red-400 hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}

          {/* Create Campaign Card below list */}
          <Card
            onClick={handleOpenCreate}
            className="border-dashed border-amber-500/40 bg-zinc-950/40 hover:bg-amber-950/10 p-4 cursor-pointer text-center transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5 text-amber-400" />
            <span className="font-serif font-semibold text-amber-300">Create Campaign</span>
          </Card>
        </div>
      )}

      {/* Create Campaign Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>
            Enter details to start a new campaign.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Campaign Name *</label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError('')
              }}
              placeholder="e.g. The Shattered Throne"
              className={nameError ? 'border-red-500' : ''}
              autoFocus
            />
            {nameError && <p className="text-xs text-red-400">{nameError}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Description (Optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the story arc…"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Cover Art (Optional)</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-28 border border-dashed border-zinc-700 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/40 transition-colors relative overflow-hidden"
              style={
                coverArt
                  ? { backgroundImage: `url(${coverArt})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : undefined
              }
            >
              {!coverArt ? (
                <>
                  <ImageIcon className="h-6 w-6 text-zinc-500 mb-1" />
                  <span className="text-xs text-zinc-400">Click to upload cover image</span>
                </>
              ) : (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-xs text-white bg-black/60 px-2 py-1 rounded">Change image</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
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

      {/* Edit Campaign Dialog */}
      <Dialog open={Boolean(editingCampaign)} onOpenChange={(open) => !open && setEditingCampaign(null)}>
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription>
            Update details for {editingCampaign?.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Campaign Name *</label>
            <Input
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value)
                if (editNameError) setEditNameError('')
              }}
              placeholder="e.g. The Shattered Throne"
              className={editNameError ? 'border-red-500' : ''}
              autoFocus
            />
            {editNameError && <p className="text-xs text-red-400">{editNameError}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Description (Optional)</label>
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Brief description of the story arc…"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Cover Art (Optional)</label>
            <div
              onClick={() => editFileInputRef.current?.click()}
              className="h-28 border border-dashed border-zinc-700 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/40 transition-colors relative overflow-hidden"
              style={
                editCoverArt
                  ? { backgroundImage: `url(${editCoverArt})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : undefined
              }
            >
              {!editCoverArt ? (
                <>
                  <ImageIcon className="h-6 w-6 text-zinc-500 mb-1" />
                  <span className="text-xs text-zinc-400">Click to upload cover image</span>
                </>
              ) : (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-xs text-white bg-black/60 px-2 py-1 rounded">Change image</span>
                </div>
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
          <Button variant="ghost" onClick={() => setEditingCampaign(null)}>
            Cancel
          </Button>
          <Button variant="gold" onClick={handleConfirmEdit}>
            Save
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
