import { useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, Search, Edit2, Copy, Trash2, Check, Download } from 'lucide-react'
import { useCampaigns, useSessions, useScenes } from '../lib/useStorage'
import { storage } from '../lib/storage'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog'
import { AlertDialog, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '../components/ui/alert-dialog'
import { toast } from '../components/ui/toast'
import type { Scene } from '../lib/types'

export function SessionScenesPage() {
  const { campaignId = '', sessionId = '' } = useParams<{ campaignId: string; sessionId: string }>()
  const navigate = useNavigate()

  const { campaigns } = useCampaigns()
  const { sessions } = useSessions(campaignId)
  const { scenes, refresh } = useScenes()

  const campaign = campaigns.find((c) => c.id === campaignId)
  const session = sessions.find((s) => s.id === sessionId)

  // Filter linked scenes for this session
  const linkedScenes = scenes.filter((sc) => sc.sessionIds?.includes(sessionId))

  // Sort: Last Active pinned first, then lastPlayedAt descending
  const sortedScenes = [...linkedScenes].sort((a, b) => {
    const timeA = a.lastPlayedAt ? new Date(a.lastPlayedAt).getTime() : 0
    const timeB = b.lastPlayedAt ? new Date(b.lastPlayedAt).getTime() : 0
    return timeB - timeA
  })

  // Create Scene Dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined)
  const [nameError, setNameError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Import Scene Dialog
  const [importOpen, setImportOpen] = useState(false)
  const [importSearch, setImportSearch] = useState('')
  const [selectedToImport, setSelectedToImport] = useState<string[]>([])

  // Edit Scene Dialog
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  // Unlink Dialog
  const [unlinkingScene, setUnlinkingScene] = useState<Scene | null>(null)

  // Available scenes for import (not yet linked)
  const unlinkedGlobalScenes = scenes.filter((sc) => !sc.sessionIds?.includes(sessionId))
  const filteredImportScenes = unlinkedGlobalScenes.filter((sc) => {
    if (!importSearch.trim()) return true
    const q = importSearch.toLowerCase().trim()
    const nameMatch = sc.name.toLowerCase().includes(q)
    const tagMatch = sc.tags?.some((t) => t.toLowerCase().includes(q))
    return nameMatch || tagMatch
  })

  const handleOpenCreate = () => {
    setName('')
    setDescription('')
    setCoverImage(undefined)
    setNameError('')
    setCreateOpen(true)
  }

  const handleConfirmCreate = () => {
    if (!name.trim()) {
      setNameError('Scene name is required')
      return
    }

    storage.createScene({
      name: name.trim(),
      description: description.trim() || undefined,
      coverImage,
      sessionId,
    })
    setCreateOpen(false)
    refresh()
    toast.show(`Created and linked "${name}"`)
  }

  const handleOpenImport = () => {
    setImportSearch('')
    setSelectedToImport([])
    setImportOpen(true)
  }

  const handleConfirmImport = () => {
    for (const id of selectedToImport) {
      storage.linkSceneToSession(id, sessionId)
    }
    setImportOpen(false)
    refresh()
    toast.show(`Imported ${selectedToImport.length} ${selectedToImport.length === 1 ? 'scene' : 'scenes'}`)
  }

  const handleDuplicate = (scene: Scene, e: React.MouseEvent) => {
    e.stopPropagation()
    storage.duplicateScene(scene.id, sessionId)
    refresh()
    toast.show(`Duplicated "${scene.name}"`)
  }

  const handleConfirmUnlink = () => {
    if (!unlinkingScene) return
    storage.unlinkSceneFromSession(unlinkingScene.id, sessionId)
    setUnlinkingScene(null)
    refresh()
    toast.show(`Unlinked "${unlinkingScene.name}" from this session`)
  }

  const handleSaveEdit = () => {
    if (!editingScene || !editName.trim()) return
    storage.updateScene(editingScene.id, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
    })
    setEditingScene(null)
    refresh()
  }

  const handleOpenScene = (scene: Scene) => {
    storage.updateScene(scene.id, { lastPlayedAt: new Date().toISOString() })
    navigate(`/scenes/${scene.id}?from=session&campaignId=${campaignId}&sessionId=${sessionId}`)
  }

  const headerTitle = session
    ? `Session ${session.sessionNumber} – ${session.name}`
    : 'Session Scenes'

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Uppercase Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        <Link to="/campaigns" className="hover:text-amber-300">
          CAMPAIGN
        </Link>
        <span>&gt;</span>
        <Link to={`/campaigns/${campaignId}/sessions`} className="hover:text-amber-300 text-amber-400">
          {campaign?.name || 'CAMPAIGN'}
        </Link>
        <span>&gt;</span>
        <button
          onClick={() => refresh()}
          className="hover:text-amber-300 text-zinc-300 uppercase cursor-pointer"
        >
          SESSION {session?.sessionNumber || '1'}
        </button>
      </nav>

      {/* Page Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-amber-300">
          {headerTitle}
        </h2>
        {session?.description ? (
          <p className="text-zinc-400 text-sm mt-1">{session.description}</p>
        ) : null}
      </div>

      {/* Linked Scenes List */}
      {sortedScenes.length === 0 ? (
        <div className="space-y-6 text-center py-12">
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-bold text-zinc-300">No scenes in this session</h3>
            <p className="text-sm text-zinc-500">Create a new scene or import existing ones from your catalogue.</p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button variant="gold" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Scene
            </Button>
            <Button variant="outline" onClick={handleOpenImport}>
              <Download className="h-4 w-4 mr-1.5" />
              Import Scene
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedScenes.map((scene, index) => {
            const isLastActive = index === 0 && Boolean(scene.lastPlayedAt)
            const scCount = scene.soundscapeCategoryIds?.length || 0
            const fxCount = scene.soundboardEffects?.length || 0
            const statsLabel = `${scCount} SC · ${fxCount} FX`

            return (
              <Card
                key={scene.id}
                data-scene-id={scene.id}
                onClick={() => handleOpenScene(scene)}
                className="cursor-pointer border-zinc-800 bg-zinc-900/90 hover:border-zinc-700 transition-all p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group relative overflow-hidden"
                style={
                  scene.coverImage
                    ? {
                        backgroundImage: `linear-gradient(to right, rgba(13,13,13,0.92), rgba(13,13,13,0.8)), url(${scene.coverImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : undefined
                }
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isLastActive && (
                      <Badge variant="active" className="text-[10px] tracking-wider uppercase font-semibold">
                        ● LAST ACTIVE
                      </Badge>
                    )}
                    {scene.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] tracking-wider uppercase font-semibold">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <h3 className="font-serif text-xl font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
                    {scene.name}
                  </h3>

                  {scene.description && (
                    <p className="text-xs text-zinc-400 max-w-xl line-clamp-1">
                      {scene.description}
                    </p>
                  )}

                  <div className="text-xs font-semibold text-zinc-400 tracking-wider">
                    {statsLabel}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:text-amber-300"
                    aria-label="Edit scene"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingScene(scene)
                      setEditName(scene.name)
                      setEditDescription(scene.description || '')
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:text-amber-300"
                    aria-label="Duplicate scene"
                    onClick={(e) => handleDuplicate(scene, e)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:text-red-400"
                    aria-label="Unlink scene"
                    onClick={(e) => {
                      e.stopPropagation()
                      setUnlinkingScene(scene)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )
          })}

          {/* Bottom CTAs: New Scene on LEFT, Import Scene on RIGHT */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <Card
              onClick={handleOpenCreate}
              className="border-dashed border-amber-500/40 bg-zinc-950/40 hover:bg-amber-950/10 p-4 cursor-pointer text-center transition-all flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5 text-amber-400" />
              <span className="font-serif font-semibold text-amber-300">New Scene</span>
            </Card>

            <Card
              onClick={handleOpenImport}
              className="border-dashed border-zinc-700 bg-zinc-950/40 hover:bg-zinc-800/40 p-4 cursor-pointer text-center transition-all flex items-center justify-center gap-2"
            >
              <Download className="h-5 w-5 text-zinc-300" />
              <span className="font-serif font-semibold text-zinc-200">Import Scene</span>
            </Card>
          </div>
        </div>
      )}

      {/* New Scene Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogHeader>
          <DialogTitle>New Scene</DialogTitle>
          <DialogDescription>Create a new scene and link it to this session.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Scene Name *</label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError('')
              }}
              placeholder="e.g. Frostwind Pass"
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
              placeholder="Atmosphere and context…"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Background Image (Optional)</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-20 border border-dashed border-zinc-700 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/40 transition-colors"
            >
              <span className="text-xs text-zinc-400">
                {coverImage ? 'Image Selected' : 'Click to upload image'}
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setCoverImage(URL.createObjectURL(file))
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

      {/* Import Scene Modal */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogHeader>
          <DialogTitle>Import Scene to Session</DialogTitle>
          <DialogDescription>Link existing global scenes to this session.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search available scenes…"
              value={importSearch}
              onChange={(e) => setImportSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {unlinkedGlobalScenes.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <p className="text-sm font-semibold text-zinc-300">All scenes are already in this session</p>
              <Button
                variant="link"
                className="text-amber-400 text-xs"
                onClick={() => {
                  setImportOpen(false)
                  handleOpenCreate()
                }}
              >
                Create a new scene
              </Button>
            </div>
          ) : filteredImportScenes.length === 0 ? (
            <div className="text-center py-6 text-sm text-zinc-400">
              No matching scenes found
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {filteredImportScenes.map((sc) => {
                const isSelected = selectedToImport.includes(sc.id)
                return (
                  <div
                    key={sc.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedToImport(selectedToImport.filter((id) => id !== sc.id))
                      } else {
                        setSelectedToImport([...selectedToImport, sc.id])
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-amber-500 bg-amber-950/20 text-amber-200'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="font-serif font-bold">{sc.name}</div>
                      {sc.tags && sc.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {sc.tags.map((t) => (
                            <span key={t} className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div
                      className={`h-5 w-5 rounded border flex items-center justify-center ${
                        isSelected ? 'border-amber-500 bg-amber-500 text-black' : 'border-zinc-600'
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setImportOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="gold"
            disabled={selectedToImport.length === 0}
            onClick={handleConfirmImport}
          >
            Import Selected ({selectedToImport.length})
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Scene Dialog */}
      <Dialog open={Boolean(editingScene)} onOpenChange={(open) => !open && setEditingScene(null)}>
        <DialogHeader>
          <DialogTitle>Edit Scene</DialogTitle>
          <DialogDescription>Update scene details globally.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Scene Name *</label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Description</label>
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setEditingScene(null)}>
            Cancel
          </Button>
          <Button variant="gold" onClick={handleSaveEdit}>
            Save
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Unlink Confirmation Dialog */}
      <AlertDialog open={Boolean(unlinkingScene)} onOpenChange={(open) => !open && setUnlinkingScene(null)}>
        <AlertDialogHeader>
          <AlertDialogTitle>Unlink Scene?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove "{unlinkingScene?.name}" from this session? The global scene will remain available in your Scenes catalogue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={() => setUnlinkingScene(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirmUnlink}>
            Unlink
          </Button>
        </AlertDialogFooter>
      </AlertDialog>
    </div>
  )
}
