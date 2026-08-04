import React, { useState } from 'react'
import { Plus, Play, Pause, Trash2, ArrowLeft, Youtube, X } from 'lucide-react'
import type { SoundscapeCategory, SoundscapeTrack } from '../types'

interface CategoryComposerProps {
  category: SoundscapeCategory
  onBackToLibrary: () => void
  onAddTrackToLevel: (level: 'level1' | 'level2' | 'level3', track: SoundscapeTrack) => void
  onRemoveTrackFromLevel: (level: 'level1' | 'level2' | 'level3', trackId: string) => void
}

export const CategoryComposer: React.FC<CategoryComposerProps> = ({
  category,
  onBackToLibrary,
  onAddTrackToLevel,
  onRemoveTrackFromLevel,
}) => {
  const [activeLevel, setActiveLevel] = useState<'level1' | 'level2' | 'level3' | null>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)

  // Track creation/import state
  const [importTab, setImportTab] = useState<'Preset' | 'YouTube Track' | 'YouTube Playlist'>('Preset')
  const [presetName, setPresetName] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [playlistUrl, setPlaylistUrl] = useState('')

  const openTrackPickerForLevel = (level: 'level1' | 'level2' | 'level3') => {
    setActiveLevel(level)
    setPresetName('')
    setYoutubeUrl('')
    setPlaylistUrl('')
    setIsPickerOpen(true)
  }

  const handleAddPresetTrack = () => {
    if (!activeLevel || !presetName.trim()) return
    const track: SoundscapeTrack = {
      id: `tr-${Date.now()}`,
      name: presetName.trim(),
      audioUrl: '/assets/audio/crowd.ogg',
      durationSeconds: 60,
    }
    onAddTrackToLevel(activeLevel, track)
    setIsPickerOpen(false)
  }

  const handleAddYoutubeTrack = async () => {
    if (!activeLevel || !youtubeUrl.trim()) return
    try {
      const res = await fetch(`/api/youtube/oembed?url=${encodeURIComponent(youtubeUrl)}`)
      const data = await res.json()
      const track: SoundscapeTrack = {
        id: `yt-${Date.now()}`,
        name: data.title || 'YouTube Track',
        youtubeId: data.youtubeId || 'dQw4w9WgXcQ',
        durationSeconds: 180,
      }
      onAddTrackToLevel(activeLevel, track)
      setIsPickerOpen(false)
    } catch {
      // fallback
      const track: SoundscapeTrack = {
        id: `yt-${Date.now()}`,
        name: 'Custom YouTube Track',
        youtubeId: 'dQw4w9WgXcQ',
        durationSeconds: 180,
      }
      onAddTrackToLevel(activeLevel, track)
      setIsPickerOpen(false)
    }
  }

  const handleAddYoutubePlaylist = async () => {
    if (!activeLevel || !playlistUrl.trim()) return
    try {
      const listMatch = playlistUrl.match(/[?&]list=([^&]+)/)
      const listId = listMatch?.[1] || 'PL12345'
      const res = await fetch(`/api/youtube/playlist?list=${encodeURIComponent(listId)}`)
      const data = await res.json()
      if (data.videos && data.videos.length > 0) {
        data.videos.forEach((v: { youtubeId: string; name: string }) => {
          onAddTrackToLevel(activeLevel, {
            id: `yt-${v.youtubeId}-${Date.now()}`,
            name: v.name,
            youtubeId: v.youtubeId,
            durationSeconds: 180,
          })
        })
      }
      setIsPickerOpen(false)
    } catch {
      setIsPickerOpen(false)
    }
  }

  const levels: { id: 'level1' | 'level2' | 'level3'; title: string; tracks: SoundscapeTrack[] }[] = [
    { id: 'level1', title: 'Level I — Baseline Ambience', tracks: category.tracks.level1 },
    { id: 'level2', title: 'Level II — Environmental Details', tracks: category.tracks.level2 },
    { id: 'level3', title: 'Level III — Focal Elements', tracks: category.tracks.level3 },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Link & Header */}
      <div className="space-y-2">
        <button
          onClick={onBackToLibrary}
          className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ← Library
        </button>
        <h1 className="text-3xl font-serif font-bold text-gray-100">{category.name} Composer</h1>
        <p className="text-gray-400 text-sm">Assign soundscape tracks across three fixed intensity levels.</p>
      </div>

      {/* Fixed Three Levels */}
      <div className="space-y-6">
        {levels.map((lvl) => (
          <div key={lvl.id} className="bg-[#121212] border border-amber-900/30 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-amber-400">{lvl.title}</h3>
              <button
                onClick={() => openTrackPickerForLevel(lvl.id)}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Track
              </button>
            </div>

            {lvl.tracks.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-2">No tracks added to this level yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lvl.tracks.map((tr) => {
                  const isPlaying = playingTrackId === tr.id

                  return (
                    <div key={tr.id} className="bg-[#0D0D0D] border border-amber-900/20 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setPlayingTrackId(isPlaying ? null : tr.id)}
                          className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                        </button>
                        <div>
                          <div className="font-serif font-semibold text-sm text-gray-200">{tr.name}</div>
                          {tr.youtubeId ? (
                            <span className="text-[10px] text-red-400 flex items-center gap-1">
                              <Youtube className="w-3 h-3" /> YouTube Track
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-500">Audio Track</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveTrackFromLevel(lvl.id, tr.id)}
                        className="p-1 text-gray-500 hover:text-red-400 rounded"
                        title="Detach track from level"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Track Picker Modal */}
      {isPickerOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-amber-500/30 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-amber-400">Add Track to Level</h2>
              <button onClick={() => setIsPickerOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex border-b border-amber-900/30 gap-2">
              {(['Preset', 'YouTube Track', 'YouTube Playlist'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setImportTab(tab)}
                  className={`py-1.5 px-2.5 text-xs font-semibold border-b-2 transition ${
                    importTab === tab ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {importTab === 'Preset' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Track Name</label>
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="e.g. Crowd Chatter"
                    className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  onClick={handleAddPresetTrack}
                  disabled={!presetName.trim()}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-lg disabled:opacity-50"
                >
                  Add Track
                </button>
              </div>
            )}

            {importTab === 'YouTube Track' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">YouTube URL</label>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  onClick={handleAddYoutubeTrack}
                  disabled={!youtubeUrl.trim()}
                  className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-sm rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Youtube className="w-4 h-4" /> Import YouTube Track
                </button>
              </div>
            )}

            {importTab === 'YouTube Playlist' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">YouTube Playlist URL</label>
                  <input
                    type="text"
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                    placeholder="https://www.youtube.com/playlist?list=..."
                    className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  onClick={handleAddYoutubePlaylist}
                  disabled={!playlistUrl.trim()}
                  className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-sm rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Youtube className="w-4 h-4" /> Import Playlist Tracks
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
