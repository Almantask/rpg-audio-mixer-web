import React, { useState, useEffect } from 'react'
import { Download, ShoppingBag, Gift, Play, Pause, Edit2, Trash2, Check, X } from 'lucide-react'
import { db } from '../storage/db'
import { sceneAudioManager } from '../audio/sceneAudioManager'
import type { FXTrack } from '../types'
import { ImportFXModal } from '../components/library/ImportFXModal'

export const LibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'soundscapes' | 'soundboard'>('soundboard')
  const [fxTracks, setFxTracks] = useState<FXTrack[]>([])
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isStoreOpen, setIsStoreOpen] = useState(false)
  const [isFreeTracksOpen, setIsFreeTracksOpen] = useState(false)

  // Mini Player State
  const [previewingFX, setPreviewingFX] = useState<FXTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Inline Edit State
  const [editingFXId, setEditingFXId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editTagsInput, setEditTagsInput] = useState('')

  const reloadTracks = () => {
    setFxTracks([...db.getFXTracks()])
  }

  useEffect(() => {
    reloadTracks()
    const handleUpdate = () => reloadTracks()
    window.addEventListener('arcanum_db_updated', handleUpdate)
    return () => {
      window.removeEventListener('arcanum_db_updated', handleUpdate)
      sceneAudioManager.stopBySource('library')
    }
  }, [])

  // Stop mini player when switching tabs
  const handleTabChange = (tab: 'soundscapes' | 'soundboard') => {
    if (previewingFX) {
      sceneAudioManager.stopBySource('library')
      setPreviewingFX(null)
      setIsPlaying(false)
    }
    setActiveTab(tab)
  }

  const handleCardClick = (fx: FXTrack) => {
    if (previewingFX?.id === fx.id) {
      if (isPlaying) {
        sceneAudioManager.stopTrack(fx.id, fx.title, 'library')
        setIsPlaying(false)
      } else {
        sceneAudioManager.playTrack(fx.id, fx.title, 'library', fx.fileUrl)
        setIsPlaying(true)
      }
    } else {
      if (previewingFX) {
        sceneAudioManager.stopBySource('library')
      }
      sceneAudioManager.playTrack(fx.id, fx.title, 'library', fx.fileUrl)
      setPreviewingFX(fx)
      setIsPlaying(true)
    }
  }

  const handleTogglePlayPause = () => {
    if (!previewingFX) return
    if (isPlaying) {
      sceneAudioManager.stopTrack(previewingFX.id, previewingFX.title, 'library')
      setIsPlaying(false)
    } else {
      sceneAudioManager.playTrack(previewingFX.id, previewingFX.title, 'library', previewingFX.fileUrl)
      setIsPlaying(true)
    }
  }

  const handleStartInlineEdit = (fx: FXTrack, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingFXId(fx.id)
    setEditTitle(fx.title)
    setEditTagsInput(fx.tags.join(', '))
  }

  const handleSaveInlineEdit = (fx: FXTrack) => {
    const parsedTags = editTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    db.updateFXTrack(fx.id, {
      title: editTitle.trim() || fx.title,
      tags: parsedTags,
    })
    setEditingFXId(null)
    reloadTracks()
  }

  const handleDeleteFX = (fx: FXTrack, e: React.MouseEvent) => {
    e.stopPropagation()
    db.deleteFXTrack(fx.id)
    if (previewingFX?.id === fx.id) {
      sceneAudioManager.stopBySource('library')
      setPreviewingFX(null)
      setIsPlaying(false)
    }
    setEditingFXId(null)
    reloadTracks()
  }

  const handleImportConfirm = (files: { name: string; url: string }[]) => {
    for (const f of files) {
      db.importFXTrack(f.name.replace(/\.[^/.]+$/, ''), '0:04', ['Imported'], f.url)
    }
    reloadTracks()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-neutral-100">Library</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-800 flex gap-6">
        <button
          onClick={() => handleTabChange('soundscapes')}
          className={`pb-3 font-bold text-sm transition-colors border-b-2 ${
            activeTab === 'soundscapes'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Soundscapes
        </button>
        <button
          onClick={() => handleTabChange('soundboard')}
          className={`pb-3 font-bold text-sm transition-colors border-b-2 ${
            activeTab === 'soundboard'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Sound Effects
        </button>
      </div>

      {/* Sound Effects Tab */}
      {activeTab === 'soundboard' && (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsImportOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" /> Import FX
            </button>
            <button
              onClick={() => setIsStoreOpen(true)}
              className="border border-neutral-700 hover:bg-neutral-800 text-neutral-200 font-bold px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" /> Buy More
            </button>
            <button
              onClick={() => setIsFreeTracksOpen(true)}
              className="border border-neutral-700 hover:bg-neutral-800 text-neutral-200 font-bold px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm"
            >
              <Gift className="w-4 h-4 text-amber-400" /> Free Tracks
            </button>
          </div>

          {/* Grid of FX Cards */}
          {fxTracks.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center space-y-4 max-w-md mx-auto">
              <h2 className="text-xl font-bold text-neutral-200">No Sound Effects</h2>
              <p className="text-sm text-neutral-400">
                Import audio files from your computer or acquire free tracks to populate your library.
              </p>
              <button
                onClick={() => setIsImportOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2.5 rounded-lg inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Import FX
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {fxTracks.map((fx) => {
                const isCurrentPreview = previewingFX?.id === fx.id
                const isEditing = editingFXId === fx.id

                return (
                  <div
                    key={fx.id}
                    onClick={() => !isEditing && handleCardClick(fx)}
                    className={`bg-neutral-900 border rounded-xl p-4 cursor-pointer flex flex-col justify-between transition-all relative group ${
                      isCurrentPreview && isPlaying
                        ? 'border-amber-500 bg-amber-950/20 shadow-md'
                        : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                    data-fx-card={fx.title}
                  >
                    {isEditing ? (
                      <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                        <div className="font-bold text-xs text-amber-400">Inline Edit</div>
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">Name</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">Tags (comma separated)</label>
                          <input
                            type="text"
                            value={editTagsInput}
                            onChange={(e) => setEditTagsInput(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-100"
                          />
                        </div>

                        {/* Live draft tag chips */}
                        <div className="flex flex-wrap gap-1">
                          {editTagsInput.split(',').map((t) => t.trim()).filter(Boolean).map((t) => (
                            <span key={t} className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <button
                            onClick={(e) => handleDeleteFX(fx, e)}
                            className="text-xs text-red-400 hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                          <button
                            onClick={() => handleSaveInlineEdit(fx)}
                            className="bg-amber-500 hover:bg-amber-600 text-neutral-950 px-3 py-1 rounded font-bold text-xs flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isCurrentPreview && isPlaying
                                  ? 'bg-amber-500 text-neutral-950'
                                  : 'bg-neutral-800 text-neutral-300 group-hover:bg-amber-500/20 group-hover:text-amber-400'
                              }`}
                            >
                              {isCurrentPreview && isPlaying ? (
                                <Pause className="w-4 h-4 fill-current" />
                              ) : (
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              )}
                            </div>
                            <h3 className="font-bold text-neutral-100 text-sm">{fx.title}</h3>
                          </div>

                          <button
                            onClick={(e) => handleStartInlineEdit(fx, e)}
                            aria-label={`Edit ${fx.title}`}
                            className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-amber-400 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-xs text-neutral-400">{fx.duration}</div>

                        {fx.tags && fx.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {fx.tags.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] uppercase font-bold bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded"
                                data-tag-chip={t}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Mini Player */}
      {previewingFX && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-900 border-t border-neutral-800 px-6 py-3 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-600 text-neutral-950 flex items-center justify-center font-bold"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
            <div>
              <div className="text-xs uppercase font-bold text-amber-400">Previewing</div>
              <div className="font-bold text-neutral-100 text-sm">{previewingFX.title}</div>
            </div>
          </div>

          <button
            onClick={() => {
              sceneAudioManager.stopBySource('library')
              setPreviewingFX(null)
              setIsPlaying(false)
            }}
            className="p-1.5 text-neutral-400 hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Modals */}
      <ImportFXModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onConfirm={handleImportConfirm}
      />

      {isStoreOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-sm w-full p-6 text-center space-y-4">
            <h3 className="text-xl font-bold text-neutral-100">FX Storefront</h3>
            <p className="text-sm text-neutral-400">Browse official sound packs and audio extensions.</p>
            <button
              onClick={() => setIsStoreOpen(false)}
              className="bg-amber-500 text-neutral-950 font-bold px-4 py-2 rounded-lg text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isFreeTracksOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-sm w-full p-6 text-center space-y-4">
            <h3 className="text-xl font-bold text-neutral-100">Free Tracks</h3>
            <p className="text-sm text-neutral-400">Free track packs coming soon!</p>
            <button
              onClick={() => setIsFreeTracksOpen(false)}
              className="bg-amber-500 text-neutral-950 font-bold px-4 py-2 rounded-lg text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
