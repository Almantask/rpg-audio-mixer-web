import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Play, Pause, Trash2, Search, Check, Upload, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

export const CategoryComposerPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>()
  const navigate = useNavigate()

  const {
    soundscapeCategories,
    createSoundscapeCategory,
    updateSoundscapeCategory,
    soundscapeTracks,
    createSoundscapeTrack,
    showToast,
  } = useApp()

  const existingCategory = categoryId ? soundscapeCategories.find((c) => c.id === categoryId) : null

  // Form states
  const [name, setName] = useState(existingCategory?.name || 'New Soundscape Category')
  const [description, setDescription] = useState(existingCategory?.description || '')
  const [tagsInput, setTagsInput] = useState(existingCategory?.tags.join(', ') || '')

  // Intensity level track IDs
  const [level1Ids, setLevel1Ids] = useState<string[]>(existingCategory?.level1TrackIds || [])
  const [level2Ids, setLevel2Ids] = useState<string[]>(existingCategory?.level2TrackIds || [])
  const [level3Ids, setLevel3Ids] = useState<string[]>(existingCategory?.level3TrackIds || [])

  // Sync if category changes
  useEffect(() => {
    if (existingCategory) {
      setName(existingCategory.name)
      setDescription(existingCategory.description || '')
      setTagsInput(existingCategory.tags.join(', '))
      setLevel1Ids(existingCategory.level1TrackIds)
      setLevel2Ids(existingCategory.level2TrackIds)
      setLevel3Ids(existingCategory.level3TrackIds)
    }
  }, [existingCategory])

  // Track Picker Modal state
  const [pickerLevel, setPickerLevel] = useState<1 | 2 | 3 | null>(null)
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([])
  const [pickerSearch, setPickerSearch] = useState('')
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null)

  // Track Import inside modal state
  const [isImportTrackOpen, setIsImportTrackOpen] = useState(false)
  const [newTrackName, setNewTrackName] = useState('')
  const [newTrackUrl, setNewTrackUrl] = useState('')

  const handleSaveCategory = () => {
    if (!name.trim()) return
    const tagsArr = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    if (existingCategory) {
      updateSoundscapeCategory(existingCategory.id, {
        name: name.trim(),
        description: description.trim(),
        tags: tagsArr,
        level1TrackIds: level1Ids,
        level2TrackIds: level2Ids,
        level3TrackIds: level3Ids,
      })
      showToast(`Category "${name}" updated`)
    } else {
      const newCat = createSoundscapeCategory(name.trim(), description.trim(), tagsArr)
      updateSoundscapeCategory(newCat.id, {
        level1TrackIds: level1Ids,
        level2TrackIds: level2Ids,
        level3TrackIds: level3Ids,
      })
      showToast(`Category "${name}" created`)
    }
    navigate('/library')
  }

  // Open Track Picker for a level
  const openTrackPicker = (level: 1 | 2 | 3) => {
    setPickerLevel(level)
    setSelectedTrackIds([])
    setPickerSearch('')
    setPreviewTrackId(null)
  }

  // Toggle selection checkbox
  const toggleTrackSelection = (trId: string) => {
    setSelectedTrackIds((prev) =>
      prev.includes(trId) ? prev.filter((id) => id !== trId) : [...prev, trId]
    )
  }

  // Toggle preview on card body click
  const toggleTrackPreview = (trId: string) => {
    setPreviewTrackId((prev) => (prev === trId ? null : trId))
  }

  // Commit tracks from modal to active level
  const handleCommitTracks = () => {
    if (!pickerLevel || selectedTrackIds.length === 0) return
    const count = selectedTrackIds.length

    if (pickerLevel === 1) {
      setLevel1Ids((prev) => Array.from(new Set([...prev, ...selectedTrackIds])))
    } else if (pickerLevel === 2) {
      setLevel2Ids((prev) => Array.from(new Set([...prev, ...selectedTrackIds])))
    } else if (pickerLevel === 3) {
      setLevel3Ids((prev) => Array.from(new Set([...prev, ...selectedTrackIds])))
    }

    showToast(`${count} ${count === 1 ? 'track' : 'tracks'} added to Level ${pickerLevel === 1 ? 'I' : pickerLevel === 2 ? 'II' : 'III'}`)
    setPickerLevel(null)
  }

  // Submit track import inside modal
  const handleImportTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTrackName.trim()) return
    const tr = createSoundscapeTrack(
      newTrackName.trim(),
      ['custom'],
      newTrackUrl || '/assets/audio/soundscapes/gentle_rain.ogg'
    )
    setSelectedTrackIds((prev) => [...prev, tr.id])
    setNewTrackName('')
    setNewTrackUrl('')
    setIsImportTrackOpen(false)
    showToast(`Track "${tr.name}" imported to library`)
  }

  // Detach track from level (PW-44)
  const removeTrackFromLevel = (level: 1 | 2 | 3, trackId: string) => {
    if (level === 1) setLevel1Ids((prev) => prev.filter((id) => id !== trackId))
    if (level === 2) setLevel2Ids((prev) => prev.filter((id) => id !== trackId))
    if (level === 3) setLevel3Ids((prev) => prev.filter((id) => id !== trackId))
    showToast('Track removed from level')
  }

  // Determine current attached IDs for picker filtering (block duplicates within same level per PW-45)
  const activeLevelAttachedIds =
    pickerLevel === 1 ? level1Ids : pickerLevel === 2 ? level2Ids : pickerLevel === 3 ? level3Ids : []

  const pickerFilteredTracks = soundscapeTracks.filter(
    (tr) =>
      !activeLevelAttachedIds.includes(tr.id) &&
      (tr.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        tr.tags.some((t) => t.toLowerCase().includes(pickerSearch.toLowerCase())))
  )

  const renderLevelBlock = (level: 1 | 2 | 3, label: string, trackIds: string[]) => {
    const attachedTracks = soundscapeTracks.filter((tr) => trackIds.includes(tr.id))

    return (
      <div className="bg-[#171717] border border-yellow-900/30 rounded-xl p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-3">
            <span className="font-serif text-lg font-bold text-amber-300">{label}</span>
            <span className="text-xs text-gray-500 font-mono">
              ({attachedTracks.length} {attachedTracks.length === 1 ? 'track' : 'tracks'})
            </span>
          </div>
          <button
            onClick={() => openTrackPicker(level)}
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/30 flex items-center space-x-1"
          >
            <Plus size={14} />
            <span>Add track</span>
          </button>
        </div>

        {attachedTracks.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-2">No tracks added to this level yet.</p>
        ) : (
          <div className="space-y-2">
            {attachedTracks.map((tr) => (
              <div
                key={tr.id}
                className="bg-[#121212] border border-gray-800 rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-sm text-gray-200">{tr.name}</div>
                  <div className="text-xs text-gray-500">{tr.tags.map((t) => `#${t}`).join(' ')}</div>
                </div>
                <button
                  onClick={() => removeTrackFromLevel(level, tr.id)}
                  className="p-1.5 text-gray-500 hover:text-red-400 rounded"
                  title="Remove from level"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Shallow parent back link per platform-design */}
      <div>
        <Link
          to="/library"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-500 hover:underline uppercase tracking-wider"
        >
          <ArrowLeft size={14} />
          <span>Library</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-yellow-900/30">
        <div>
          <h1 className="font-serif text-3xl font-bold text-amber-300">Category Composer</h1>
          <p className="text-sm text-gray-400 mt-1">
            Configure multi-tiered soundscape intensity levels (Level I · II · III)
          </p>
        </div>
        <button
          onClick={handleSaveCategory}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-lg shadow transition cursor-pointer"
        >
          Save Category
        </button>
      </div>

      {/* Category Metadata Form */}
      <div className="bg-[#171717] border border-yellow-900/30 rounded-xl p-6 space-y-4">
        <h2 className="font-serif text-lg font-bold text-amber-400">Category Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Category Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Fixed Three Intensity Levels (PW-46 / CC-05) */}
      <div className="space-y-6">
        {renderLevelBlock(1, 'Level I · Calm / Atmosphere', level1Ids)}
        {renderLevelBlock(2, 'Level II · Moderate / Action', level2Ids)}
        {renderLevelBlock(3, 'Level III · Intense / Climax', level3Ids)}
      </div>

      {/* Scoped Track Picker Modal */}
      {pickerLevel !== null && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-amber-500/40 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-6 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h2 className="font-serif text-xl font-bold text-amber-300">
                  Select Tracks for Level {pickerLevel === 1 ? 'I' : pickerLevel === 2 ? 'II' : 'III'}
                </h2>
                <p className="text-xs text-gray-400">Checkbox selects; card body previews audio</p>
              </div>
              <button onClick={() => setPickerLevel(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Filter and Search */}
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Filter available tracks..."
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={() => setIsImportTrackOpen(true)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg flex items-center space-x-1"
              >
                <Upload size={14} />
                <span>Import Track</span>
              </button>
            </div>

            {/* Tracks List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px]">
              {pickerFilteredTracks.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-8">
                  No available tracks match your filter.
                </p>
              ) : (
                pickerFilteredTracks.map((tr) => {
                  const isChecked = selectedTrackIds.includes(tr.id)
                  const isPreviewing = previewTrackId === tr.id

                  return (
                    <div
                      key={tr.id}
                      className={`p-3 bg-[#121212] border rounded-lg flex items-center space-x-3 transition ${
                        isChecked ? 'border-amber-500 bg-amber-950/20' : 'border-gray-800'
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleTrackSelection(tr.id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition shrink-0 ${
                          isChecked
                            ? 'bg-amber-500 border-amber-400 text-gray-950'
                            : 'border-gray-600 bg-gray-800'
                        }`}
                        aria-label={`Select track ${tr.name}`}
                      >
                        {isChecked && <Check size={14} className="stroke-[3]" />}
                      </button>

                      {/* Card Body Click Previews Audio */}
                      <button
                        type="button"
                        onClick={() => toggleTrackPreview(tr.id)}
                        className="flex-1 flex items-center justify-between text-left focus:outline-none group"
                        aria-label={isPreviewing ? `Pause preview ${tr.name}` : `Preview ${tr.name}`}
                      >
                        <div>
                          <div className="font-semibold text-sm text-gray-200 group-hover:text-amber-300">
                            {tr.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {tr.tags.map((t) => `#${t}`).join(' ')}
                          </div>
                        </div>
                        <div
                          className={`p-1.5 rounded-full ${
                            isPreviewing ? 'bg-amber-500 text-gray-950' : 'bg-gray-800 text-amber-400'
                          }`}
                        >
                          {isPreviewing ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
                        </div>
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            {/* Commit Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
              <button
                onClick={() => setPickerLevel(null)}
                className="px-4 py-2 bg-gray-800 text-gray-300 text-sm font-semibold rounded-lg"
              >
                Close
              </button>
              <button
                disabled={selectedTrackIds.length === 0}
                onClick={handleCommitTracks}
                className={`px-5 py-2 rounded-lg text-sm font-bold shadow ${
                  selectedTrackIds.length > 0
                    ? 'bg-amber-500 hover:bg-amber-400 text-gray-950'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                Add Selected ({selectedTrackIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Track Modal Inside Picker */}
      {isImportTrackOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-amber-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="font-serif text-xl font-bold text-amber-300">Import New Audio Track</h2>
              <button onClick={() => setIsImportTrackOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleImportTrackSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Track Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTrackName}
                  onChange={(e) => setNewTrackName(e.target.value)}
                  placeholder="e.g. Whispering Winds"
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Audio URL / File Path
                </label>
                <input
                  type="text"
                  value={newTrackUrl}
                  onChange={(e) => setNewTrackUrl(e.target.value)}
                  placeholder="/assets/audio/soundscapes/gentle_rain.ogg"
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportTrackOpen(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-gray-950 text-sm font-bold rounded-lg shadow"
                >
                  Import Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
