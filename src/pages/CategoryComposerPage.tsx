import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronRight, Plus, X, Music } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { TrackPickerModal } from '../components/modals/TrackPickerModal'

export const CategoryComposerPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>()
  const navigate = useNavigate()
  const {
    soundscapeCategories,
    soundscapeTracks,
    removeTrackFromCategoryLevel,
    showToast,
  } = useApp()

  const category = soundscapeCategories.find((c) => c.id === categoryId)

  // Expand/collapse state for levels I, II, III
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({
    I: true,
    II: false,
    III: false,
  })

  const [activePickerLevel, setActivePickerLevel] = useState<'I' | 'II' | 'III' | null>(null)

  if (!category) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Category not found.</p>
        <button
          onClick={() => navigate('/library')}
          className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold"
        >
          Return to Library
        </button>
      </div>
    )
  }

  const toggleLevel = (lvl: string) => {
    setExpandedLevels((prev) => ({ ...prev, [lvl]: !prev[lvl] }))
  }

  const levels: ('I' | 'II' | 'III')[] = ['I', 'II', 'III']

  const handleSaveComposition = () => {
    showToast('Composition saved.')
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/library"
            className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-500 hover:text-yellow-400 mb-1"
          >
            <ArrowLeft size={16} /> ← Library
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-yellow-500">
            {category.name}
          </h1>
          <h2 className="font-serif text-xl font-semibold text-gray-200">Category Composer</h2>
          <p className="text-xs text-gray-400 mt-1">
            Assign tracks to intensity levels for this category.
          </p>
        </div>

        <button
          onClick={handleSaveComposition}
          className="px-6 py-2.5 rounded-lg bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 self-start sm:self-center transition-colors"
        >
          Save Composition
        </button>
      </div>

      {/* Fixed Three Intensity Levels (I, II, III) */}
      <div className="space-y-4">
        {levels.map((lvl) => {
          const isExpanded = expandedLevels[lvl]
          const trackIds = category.levels[lvl] || []

          return (
            <div
              key={lvl}
              className="rounded-xl border border-yellow-900/30 bg-[#161616] overflow-hidden transition-all"
            >
              {/* Level Header Bar */}
              <div
                onClick={() => toggleLevel(lvl)}
                className="p-4 bg-[#141414] hover:bg-[#1A1A1A] cursor-pointer flex items-center justify-between border-b border-yellow-900/20"
              >
                <div className="flex items-center gap-3">
                  <span className="font-serif font-bold text-lg text-yellow-500">Level {lvl}</span>
                  <span className="text-xs text-gray-400 font-medium">
                    ({trackIds.length} {trackIds.length === 1 ? 'track' : 'tracks'})
                  </span>
                </div>

                <div className="p-1 text-gray-400 hover:text-white">
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </div>

              {/* Level Content */}
              {isExpanded && (
                <div className="p-5 space-y-4">
                  {/* Add Track Button at Top */}
                  <button
                    onClick={() => setActivePickerLevel(lvl)}
                    className="w-full py-3 px-4 border border-dashed border-yellow-500/40 rounded-lg bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-400 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus size={16} /> Add track to Level {lvl}
                  </button>

                  {/* Tracks List */}
                  {trackIds.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-500">
                      No tracks assigned to Level {lvl} yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {trackIds.map((tId) => {
                        const track = soundscapeTracks.find((t) => t.id === tId)
                        return (
                          <div
                            key={tId}
                            className="p-3.5 rounded-lg border border-yellow-900/20 bg-[#1A1A1A] flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded bg-yellow-500/10 text-yellow-500">
                                <Music size={16} />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-200 text-sm">
                                  {track?.title || tId}
                                </h4>
                                <p className="text-[11px] text-gray-400">
                                  {track?.format || 'MP3'} · {track?.channels || 'Stereo'} · 3:42
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => removeTrackFromCategoryLevel(category.id, lvl, tId)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded transition-colors"
                              title="Remove track from this level"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Track Picker Modal */}
      {activePickerLevel && (
        <TrackPickerModal
          isOpen={Boolean(activePickerLevel)}
          onClose={() => setActivePickerLevel(null)}
          categoryId={category.id}
          intensity={activePickerLevel}
        />
      )}
    </div>
  )
}
