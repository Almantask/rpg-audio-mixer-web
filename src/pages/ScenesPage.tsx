import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit2, Copy, Trash2, X } from 'lucide-react'
import { useScenes } from '../lib/useStorage'
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

const PREDEFINED_TAGS = ['Tavern', 'Combat', 'Forest', 'Dungeon', 'City', 'Night', 'Social', 'Boss', 'Mystery']

export function ScenesPage() {
  const navigate = useNavigate()
  const { scenes, refresh } = useScenes()

  const [searchQuery, setSearchQuery] = useState('')

  // Create Scene Dialog State
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined)
  const [nameError, setNameError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit Scene Dialog State
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCoverImage, setEditCoverImage] = useState<string | undefined>(undefined)
  const [editTags, setEditTags] = useState<string[]>([])
  const [customTagInput, setCustomTagInput] = useState('')
  const editFileInputRef = useRef<HTMLInputElement>(null)

  // Delete Scene State
  const [deletingScene, setDeletingScene] = useState<Scene | null>(null)

  // Filter scenes
  const filteredScenes = scenes.filter((scene) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    const nameMatch = scene.name.toLowerCase().includes(q)
    const tagMatch = scene.tags?.some((t) => t.toLowerCase().includes(q))
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
    })
    setCreateOpen(false)
    refresh()
  }

  const handleDuplicate = (scene: Scene, e: React.MouseEvent) => {
    e.stopPropagation()
    storage.duplicateScene(scene.id)
    refresh()
    toast.show(`Duplicated "${scene.name}"`)
  }

  const handleOpenEdit = (scene: Scene, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingScene(scene)
    setEditName(scene.name)
    setEditDescription(scene.description || '')
    setEditCoverImage(scene.coverImage)
    setEditTags(scene.tags || [])
    setCustomTagInput('')
  }

  const handleSaveEdit = () => {
    if (!editingScene) return
    if (!editName.trim()) return

    storage.updateScene(editingScene.id, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
      coverImage: editCoverImage,
      tags: editTags,
    })
    setEditingScene(null)
    refresh()
  }

  const handleInitiateDelete = (scene: Scene, e: React.MouseEvent) => {
    e.stopPropagation()
    const sessionLinks = scene.sessionIds?.length || 0
    if (sessionLinks > 0) {
      setDeletingScene(scene)
    } else {
      // Direct soft-delete with undo
      storage.deleteScene(scene.id)
      refresh()
      toast.show(`Scene "${scene.name}" moved to Trash`, {
        actionLabel: 'Undo',
        onAction: () => {
          const trash = storage.getTrashItems('scene').find((t) => t.originalId === scene.id)
          if (trash) {
            storage.restoreTrashItem(trash.id)
            refresh()
          }
        },
      })
    }
  }

  const handleConfirmLinkedDelete = () => {
    if (!deletingScene) return
    storage.deleteScene(deletingScene.id)
    setDeletingScene(null)
    refresh()
    toast.show(`Scene "${deletingScene.name}" unlinked and moved to Trash`)
  }

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim()
    if (!trimmed) return
    if (!editTags.includes(trimmed)) {
      setEditTags([...editTags, trimmed])
    }
    setCustomTagInput('')
  }

  const handleRemoveTag = (tag: string) => {
    setEditTags(editTags.filter((t) => t !== tag))
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-amber-300">Scenes</h2>
        <p className="text-zinc-400 text-sm">Curate and manage your immersive environments.</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search scenes by name or tag…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-zinc-950/80 border-zinc-800"
        />
      </div>

      {/* Populated Scenes List or Empty Message */}
      {scenes.length === 0 ? (
        <div className="space-y-6 text-center py-12">
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-bold text-zinc-300">No scenes yet</h3>
            <p className="text-sm text-zinc-500">Create your first scene of sounds for your RPG encounters.</p>
          </div>
          <Button variant="gold" size="lg" onClick={handleOpenCreate}>
            New Scene
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredScenes.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 font-medium">
              No scenes match
            </div>
          ) : (
            filteredScenes.map((scene) => {
              const scCount = scene.soundscapeCategoryIds?.length || 0
              const fxCount = scene.soundboardEffects?.length || 0
              const statsLabel = `${scCount} SC · ${fxCount} FX`

              return (
                <Card
                  key={scene.id}
                  data-scene-id={scene.id}
                  onClick={() => navigate(`/scenes/${scene.id}`)}
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
                    {/* Tags & Badges */}
                    {scene.tags && scene.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {scene.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] tracking-wider uppercase font-semibold">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Scene Location Name */}
                    <h3 className="font-serif text-xl font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
                      {scene.name}
                    </h3>

                    {/* Description Snippet */}
                    {scene.description && (
                      <p className="text-xs text-zinc-400 max-w-xl line-clamp-1">
                        {scene.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="text-xs font-semibold text-zinc-400 tracking-wider">
                      {statsLabel}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-400 hover:text-amber-300"
                      aria-label="Edit scene"
                      onClick={(e) => handleOpenEdit(scene, e)}
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
                      aria-label="Delete scene"
                      onClick={(e) => handleInitiateDelete(scene, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )
            })
          )}

          {/* New Scene Row at bottom */}
          <Card
            onClick={handleOpenCreate}
            className="border-dashed border-amber-500/40 bg-zinc-950/40 hover:bg-amber-950/10 p-4 cursor-pointer text-center transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5 text-amber-400" />
            <span className="font-serif font-semibold text-amber-300">New Scene</span>
          </Card>
        </div>
      )}

      {/* Create Scene Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogHeader>
          <DialogTitle>New Scene</DialogTitle>
          <DialogDescription>Create a location-based scene for your audio environment.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Scene Name (Location) *</label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError('')
              }}
              placeholder="e.g. Dragon's Lair or Tavern"
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
              placeholder="Describe the atmosphere or lore of this location…"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Background Image (Optional)</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-24 border border-dashed border-zinc-700 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/40 transition-colors relative overflow-hidden"
              style={
                coverImage
                  ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : undefined
              }
            >
              {!coverImage ? (
                <span className="text-xs text-zinc-400">Click to upload background image</span>
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

      {/* Edit Scene Dialog */}
      <Dialog open={Boolean(editingScene)} onOpenChange={(open) => !open && setEditingScene(null)}>
        <DialogHeader>
          <DialogTitle>Edit Scene</DialogTitle>
          <DialogDescription>Update scene metadata and tags.</DialogDescription>
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

          {/* Tags Manager */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">Tags</label>
            {editTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950 rounded-md border border-zinc-800">
                {editTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-zinc-800 text-amber-300"
                  >
                    {tag}
                    <button
                      type="button"
                      aria-label={`Remove ${tag} tag`}
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Predefined Tags */}
            <div className="flex flex-wrap gap-1 pt-1">
              {PREDEFINED_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                    editTags.includes(tag)
                      ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  +{tag}
                </button>
              ))}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2 pt-1">
              <Input
                placeholder="Add custom tag…"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag(customTagInput)
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleAddTag(customTagInput)}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Background Image</label>
            <div
              onClick={() => editFileInputRef.current?.click()}
              className="h-20 border border-dashed border-zinc-700 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/40 transition-colors relative overflow-hidden"
              style={
                editCoverImage
                  ? { backgroundImage: `url(${editCoverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : undefined
              }
            >
              {!editCoverImage ? (
                <span className="text-xs text-zinc-400">Click to upload image</span>
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
                if (file) setEditCoverImage(URL.createObjectURL(file))
              }}
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

      {/* Linked Scene Warning Alert Dialog */}
      <AlertDialog open={Boolean(deletingScene)} onOpenChange={(open) => !open && setDeletingScene(null)}>
        <AlertDialogHeader>
          <AlertDialogTitle>Unlink & Move to Trash?</AlertDialogTitle>
          <AlertDialogDescription>
            This scene is linked to {deletingScene?.sessionIds?.length || 0}{' '}
            {deletingScene?.sessionIds?.length === 1 ? 'session' : 'sessions'}. It will be unlinked and moved to Trash.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={() => setDeletingScene(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirmLinkedDelete}>
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialog>
    </div>
  )
}
