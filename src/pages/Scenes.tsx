import React, { useState } from 'react'
import { Plus, Play, Trash2, Tag as TagIcon, Edit3, Image, AlertTriangle, Undo2, X, Copy, Search } from 'lucide-react'
import type { Scene, SessionScene } from '../types'

interface ScenesProps {
  scenes: Scene[]
  sessionScenes?: SessionScene[]
  onCreateScene: (name: string, description: string, tags: string[]) => void
  onUpdateScene: (id: string, updates: Partial<Scene>) => void
  onDeleteScene: (id: string) => void
  onOpenScene: (id: string) => void
}

const PREDEFINED_TAGS = ['Tavern', 'City', 'Combat', 'Night', 'Dungeon', 'Exploration']

export const Scenes: React.FC<ScenesProps> = ({
  scenes,
  sessionScenes = [],
  onCreateScene,
  onUpdateScene,
  onDeleteScene,
  onOpenScene,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingLinkedScene, setDeletingLinkedScene] = useState<{ scene: Scene; count: number } | null>(null)
  const [undoSceneId, setUndoSceneId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [currentTags, setCurrentTags] = useState<string[]>([])

  const activeScenes = scenes.filter((s) => !s.deletedAt)

  // Collect all unique tags
  const allTags = Array.from(new Set(activeScenes.flatMap((s) => s.tags)))

  const filteredScenes = activeScenes.filter((s) => {
    const matchesTag = selectedTag ? s.tags.includes(selectedTag) : true
    const q = searchQuery.toLowerCase().trim()
    const matchesQuery = !q || s.name.toLowerCase().includes(q) || s.tags.some((t) => t.toLowerCase().includes(q))
    return matchesTag && matchesQuery
  })

  const handleRequestDelete = (scene: Scene) => {
    const linkedCount = sessionScenes.filter((ss) => ss.sceneId === scene.id).length
    if (linkedCount > 0) {
      setDeletingLinkedScene({ scene, count: linkedCount })
    } else {
      onDeleteScene(scene.id)
      setUndoSceneId(scene.id)
    }
  }

  const handleConfirmLinkedDelete = () => {
    if (deletingLinkedScene) {
      onDeleteScene(deletingLinkedScene.scene.id)
      setUndoSceneId(deletingLinkedScene.scene.id)
      setDeletingLinkedScene(null)
    }
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreateScene(name.trim(), description.trim(), [])
    setName('')
    setDescription('')
    setTagsInput('')
    setCurrentTags([])
    setIsCreateOpen(false)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingScene || !name.trim()) return
    
    const customTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const combinedTags = Array.from(new Set([...currentTags, ...customTags]))

    onUpdateScene(editingScene.id, {
      name: name.trim(),
      description: description.trim(),
      tags: combinedTags,
    })
    setEditingScene(null)
    setName('')
    setDescription('')
    setTagsInput('')
    setCurrentTags([])
  }

  const addTag = (tag: string) => {
    if (!currentTags.includes(tag)) {
      setCurrentTags([...currentTags, tag])
    }
  }

  const removeTag = (tag: string) => {
    setCurrentTags(currentTags.filter((t) => t.toLowerCase() !== tag.toLowerCase()))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/30 pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-amber-400">Scenes</h1>
          <p className="text-gray-400 text-sm mt-1">Global audio scenes catalogue for all campaigns.</p>
        </div>
        <button
          onClick={() => {
            setName('')
            setDescription('')
            setTagsInput('')
            setCurrentTags([])
            setIsCreateOpen(true)
          }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm flex items-center gap-2 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Build your own scene
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search scenes by name or tag…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#121212] border border-amber-900/30 rounded-xl pl-10 pr-4 py-2.5 text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:border-amber-400 transition"
        />
      </div>

      {/* Filter Tags */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Filter:</span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              selectedTag === null ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedTag === tag ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Empty State vs Search No Matches vs Grid */}
      {activeScenes.length === 0 ? (
        <div data-testid="empty-state" className="bg-[#121212] border border-amber-900/20 rounded-xl p-12 text-center space-y-3">
          <Image className="w-12 h-12 text-amber-500/40 mx-auto" />
          <h3 className="text-xl font-serif font-semibold text-gray-200">No scenes found</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Create your first scene to start building audio atmospheres.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg text-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Scene
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredScenes.length === 0 && searchQuery && (
            <div className="p-8 text-center text-gray-400 bg-[#121212] border border-amber-900/20 rounded-xl">
              No scenes match "{searchQuery}"
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScenes.map((scene) => (
              <div
                key={scene.id}
                className="bg-[#121212] border border-amber-900/30 hover:border-amber-500/50 rounded-xl p-5 flex flex-col justify-between transition group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3
                      onClick={() => onOpenScene(scene.id)}
                      className="text-xl font-serif font-bold text-gray-100 group-hover:text-amber-400 cursor-pointer transition"
                    >
                      {scene.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        aria-label={`Edit ${scene.name}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingScene(scene)
                          setName(scene.name)
                          setDescription(scene.description || '')
                          setCurrentTags(scene.tags || [])
                          setTagsInput('')
                        }}
                        className="p-1.5 text-gray-400 hover:text-amber-400 rounded hover:bg-white/5"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        aria-label={`Duplicate ${scene.name}`}
                        title={`Duplicate ${scene.name}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onCreateScene(`${scene.name} (Copy)`, scene.description || '', scene.tags || [])
                        }}
                        className="p-1.5 text-gray-400 hover:text-amber-400 rounded hover:bg-white/5"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        aria-label={`Delete ${scene.name}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRequestDelete(scene)
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-white/5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm line-clamp-2">{scene.description || 'No description provided.'}</p>

                  {scene.tags && scene.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {scene.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs rounded border border-amber-500/20 flex items-center gap-1">
                          <TagIcon className="w-3 h-3" /> {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-amber-900/10 mt-4">
                  <span className="text-xs text-gray-500 font-mono">
                    {scene.soundscapeCategoryIds.length} SC · {scene.soundboardFxIds.length} FX
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenScene(scene.id)
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded text-xs flex items-center gap-1 transition"
                  >
                    <Play className="w-3 h-3 fill-current" /> Open Scene
                  </button>
                </div>
              </div>
            ))}

            {/* New Scene Card at bottom of grid */}
            <div
              onClick={() => {
                setName('')
                setDescription('')
                setTagsInput('')
                setCurrentTags([])
                setIsCreateOpen(true)
              }}
              className="border-2 border-dashed border-amber-900/40 hover:border-amber-500/60 bg-[#121212]/50 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer transition min-h-[160px] group"
            >
              <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-serif font-bold text-gray-300 group-hover:text-amber-400">New Scene</span>
            </div>
          </div>
        </div>
      )}

      {/* Linked Scene Delete Warning Dialog */}
      {deletingLinkedScene && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-red-500/30 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-serif font-bold">Delete Linked Scene</h3>
            </div>
            <p className="text-gray-300 text-sm">
              The scene <strong className="text-white">"{deletingLinkedScene.scene.name}"</strong> is linked to{' '}
              <strong className="text-amber-400">{deletingLinkedScene.count} session(s)</strong> and will be unlinked and moved to Trash.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingLinkedScene(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLinkedDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition"
              >
                Delete Scene
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Delete Toast */}
      {undoSceneId && (
        <div className="fixed bottom-6 right-6 bg-[#1A1A1A] border border-amber-500/40 rounded-xl p-4 shadow-2xl flex items-center gap-4 z-50">
          <span className="text-sm text-gray-200">Scene moved to Trash</span>
          <button
            onClick={() => {
              onUpdateScene(undoSceneId, { deletedAt: undefined })
              setUndoSceneId(null)
            }}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
          >
            <Undo2 className="w-3.5 h-3.5" /> Undo
          </button>
        </div>
      )}

      {/* Create / Edit Dialog */}
      {(isCreateOpen || editingScene) && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-amber-900/40 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <h2 className="text-xl font-serif font-bold text-amber-400">
              {editingScene ? 'Edit Scene' : 'Build New Scene'}
            </h2>

            <form onSubmit={editingScene ? handleEditSubmit : handleCreateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Scene Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tavern"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the environment..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>

              {/* Tags Section ONLY shown when Editing */}
              {editingScene && (
                <div className="space-y-3 pt-2 border-t border-amber-900/20">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">Tags</label>

                  {/* Predefined Tag Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {PREDEFINED_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold border transition ${
                          currentTags.includes(tag)
                            ? 'bg-amber-500 text-black border-amber-500'
                            : 'bg-white/5 text-gray-300 border-amber-900/40 hover:bg-white/10'
                        }`}
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>

                  {/* Current Active Tags with Remove Control */}
                  {currentTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {currentTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs rounded-full flex items-center gap-1.5"
                        >
                          #{tag}
                          <button
                            type="button"
                            aria-label={`Remove ${tag} tag`}
                            title={`Remove ${tag} tag`}
                            onClick={() => removeTag(tag)}
                            className="p-0.5 hover:text-white rounded-full hover:bg-amber-500/30 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Custom Tag Input */}
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="Add custom tag (press enter or comma)..."
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && tagsInput.trim()) {
                          e.preventDefault()
                          addTag(tagsInput.trim())
                          setTagsInput('')
                        }
                      }}
                      className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-1.5 text-gray-100 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-900/20">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false)
                    setEditingScene(null)
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-lg transition"
                >
                  {editingScene ? 'Save Changes' : 'Create Scene'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
