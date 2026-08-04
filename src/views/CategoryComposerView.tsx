import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, Plus, X, ArrowLeft, Save } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Dialog } from '../components/common/Dialog'
import { Toast } from '../components/common/Toast'
import type { IntensityLevel, SoundscapeTrack } from '../types'

export const CategoryComposerView: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>()
  const navigate = useNavigate()

  const { categories, addTrackToCategoryLevel, removeTrackFromCategoryLevel } = useApp()

  const category = categories.find((c) => c.id === categoryId)

  const [expandedLevels, setExpandedLevels] = useState<Record<IntensityLevel, boolean>>({
    I: true,
    II: false,
    III: false,
  })

  const [pickerTargetLevel, setPickerTargetLevel] = useState<IntensityLevel | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [customTitle, setCustomTitle] = useState('')
  const [customUrl, setCustomUrl] = useState('')

  if (!category) {
    return (
      <div className="p-8 text-center text-neutral-400">
        Category not found.{' '}
        <button onClick={() => navigate('/library')} className="text-amber-400 underline">
          Go back to Library
        </button>
      </div>
    )
  }

  const toggleLevel = (level: IntensityLevel) => {
    setExpandedLevels((prev) => ({ ...prev, [level]: !prev[level] }))
  }

  const handleSaveComposition = () => {
    setToastMessage('Composition saved')
  }

  const handleAddTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pickerTargetLevel || !customTitle.trim()) return

    const newTrack: SoundscapeTrack = {
      id: `tr-${Date.now()}`,
      title: customTitle.trim(),
      url: customUrl.trim() || '/assets/audio/rain.ogg',
      format: 'OGG',
      channel: 'Stereo',
      durationSeconds: 180,
    }

    addTrackToCategoryLevel(category.id, pickerTargetLevel, newTrack)
    setCustomTitle('')
    setCustomUrl('')
    setPickerTargetLevel(null)
  }

  const levels: IntensityLevel[] = ['I', 'II', 'III']

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header with Back link */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <button
            onClick={() => navigate('/library')}
            className="text-xs font-semibold text-neutral-400 hover:text-amber-400 flex items-center space-x-1 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Library</span>
          </button>

          <h1 className="font-serif text-3xl font-bold text-amber-400">{category.name}</h1>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Category Composer
          </p>
        </div>

        <button
          onClick={handleSaveComposition}
          className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm flex items-center space-x-2 transition shadow-lg"
        >
          <Save className="w-4 h-4" />
          <span>Save Composition</span>
        </button>
      </div>

      <p className="text-sm text-neutral-400">
        Assign tracks to intensity levels for this category.
      </p>

      {/* 3 Fixed Intensity Level Rows */}
      <div className="space-y-4">
        {levels.map((level) => {
          const isExpanded = expandedLevels[level]
          const levelTracks = category.tracksByLevel[level] || []

          return (
            <div
              key={level}
              className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden shadow-lg"
            >
              {/* Level Row Header */}
              <button
                onClick={() => toggleLevel(level)}
                className="w-full p-4 flex items-center justify-between bg-neutral-900/90 hover:bg-neutral-800/80 transition text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-serif font-bold text-lg text-amber-400">
                    Level {level}
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">
                    ({levelTracks.length} {levelTracks.length === 1 ? 'track' : 'tracks'})
                  </span>
                </div>

                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-neutral-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                )}
              </button>

              {/* Expanded Level Track List */}
              {isExpanded && (
                <div className="p-4 border-t border-neutral-800 space-y-3 bg-neutral-950/50">
                  <button
                    onClick={() => setPickerTargetLevel(level)}
                    className="w-full py-2.5 px-4 rounded-lg border border-dashed border-amber-500/40 hover:border-amber-400 text-amber-400 font-bold text-sm flex items-center justify-center space-x-2 bg-neutral-900/60 hover:bg-neutral-900 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add track to Level {level}</span>
                  </button>

                  <div className="space-y-2">
                    {levelTracks.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center justify-between bg-neutral-900 border border-neutral-800 p-3 rounded-lg"
                      >
                        <div>
                          <h4 className="font-serif font-bold text-neutral-200">{track.title}</h4>
                          <p className="text-xs text-neutral-400">
                            {track.format || 'OGG'} · {track.channel || 'Stereo'} · 3:00
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            removeTrackFromCategoryLevel(category.id, level, track.id)
                          }
                          className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition"
                          aria-label={`Remove ${track.title}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add Track Dialog Modal */}
      <Dialog
        isOpen={Boolean(pickerTargetLevel)}
        onClose={() => setPickerTargetLevel(null)}
        title={`Add Track to Level ${pickerTargetLevel || ''}`}
      >
        <form onSubmit={handleAddTrackSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Track Title *
            </label>
            <input
              type="text"
              required
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Thunderous Downpour"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Audio File URL (Optional)
            </label>
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="/assets/audio/rain.ogg"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setPickerTargetLevel(null)}
              className="px-4 py-2 text-sm rounded-lg bg-neutral-800 text-neutral-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm rounded-lg bg-amber-500 text-neutral-950 font-bold"
            >
              Add Track
            </button>
          </div>
        </form>
      </Dialog>

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  )
}
