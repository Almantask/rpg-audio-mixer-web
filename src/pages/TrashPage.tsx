import React, { useState, useEffect } from 'react'
import {
  getTrashCampaigns,
  restoreCampaign,
  purgeCampaign,
  purgeAllTrashCampaigns,
} from '../services/campaignService'
import {
  getTrashSessions,
  restoreSession,
  purgeSession,
  purgeAllTrashSessions,
} from '../services/sessionService'
import {
  getTrashScenes,
  restoreScene,
  purgeScene,
  purgeAllTrashScenes,
} from '../services/sceneService'
import {
  getTrashFXTracks,
  restoreFXTrack,
  purgeFXTrack,
  purgeAllTrashFX,
  getTrashSoundscapeCategories,
} from '../services/libraryService'
import type { Campaign, Session } from '../types/campaign'
import type { Scene } from '../types/scene'
import type { FXTrack, SoundscapeCategory } from '../types/library'
import { RotateCcw, Trash2, AlertTriangle } from 'lucide-react'

export const TrashPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'sessions' | 'scenes' | 'soundscapes' | 'fx'>('campaigns')

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [scenes, setScenes] = useState<Scene[]>([])
  const [fxTracks, setFxTracks] = useState<FXTrack[]>([])
  const [soundscapes, setSoundscapes] = useState<SoundscapeCategory[]>([])

  const [purgeConfirmOpen, setPurgeConfirmOpen] = useState(false)

  const refreshTrash = () => {
    setCampaigns(getTrashCampaigns())
    setSessions(getTrashSessions())
    setScenes(getTrashScenes())
    setFxTracks(getTrashFXTracks())
    setSoundscapes(getTrashSoundscapeCategories())
  }

  useEffect(() => {
    refreshTrash()
  }, [])

  const handleRestore = (id: string) => {
    if (activeTab === 'campaigns') restoreCampaign(id)
    if (activeTab === 'sessions') restoreSession(id)
    if (activeTab === 'scenes') restoreScene(id)
    if (activeTab === 'fx') restoreFXTrack(id)
    refreshTrash()
  }

  const handlePurgeSingle = (id: string) => {
    if (activeTab === 'campaigns') purgeCampaign(id)
    if (activeTab === 'sessions') purgeSession(id)
    if (activeTab === 'scenes') purgeScene(id)
    if (activeTab === 'fx') purgeFXTrack(id)
    refreshTrash()
  }

  const handlePurgeAllConfirm = () => {
    if (activeTab === 'campaigns') purgeAllTrashCampaigns()
    if (activeTab === 'sessions') purgeAllTrashSessions()
    if (activeTab === 'scenes') purgeAllTrashScenes()
    if (activeTab === 'fx') purgeAllTrashFX()
    setPurgeConfirmOpen(false)
    refreshTrash()
  }

  const getActiveList = () => {
    if (activeTab === 'campaigns') return campaigns
    if (activeTab === 'sessions') return sessions
    if (activeTab === 'scenes') return scenes
    if (activeTab === 'fx') return fxTracks
    return soundscapes
  }

  const currentList = getActiveList()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-amber-400">Trash</h1>
          <p className="text-stone-400 text-sm mt-1">Soft-deleted items are retained for 7 days.</p>
        </div>

        {currentList.length > 0 && (
          <button
            type="button"
            onClick={() => setPurgeConfirmOpen(true)}
            className="px-4 py-2 rounded-lg bg-red-950/80 border border-red-900/80 text-red-300 hover:bg-red-900 font-semibold text-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Empty Trash ({activeTab})</span>
          </button>
        )}
      </div>

      {/* Tab Strip */}
      <div className="flex border-b border-amber-900/30 overflow-x-auto">
        {(['campaigns', 'sessions', 'scenes', 'soundscapes', 'fx'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {currentList.length === 0 ? (
          <div className="text-center py-10 bg-stone-900/30 rounded-xl border border-dashed border-stone-800 text-stone-400 text-sm">
            No deleted {activeTab} in Trash.
          </div>
        ) : (
          currentList.map((item) => (
            <div
              key={item.id}
              className="bg-[#121212] border border-stone-800 rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-200">{item.name}</h3>
                <span className="text-[11px] text-red-400 font-mono">Expires in 7 days</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={`Restore ${item.name}`}
                  onClick={() => handleRestore(item.id)}
                  className="px-3 py-1.5 rounded-lg border border-amber-900/60 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
                <button
                  type="button"
                  aria-label={`Delete permanently ${item.name}`}
                  onClick={() => handlePurgeSingle(item.id)}
                  className="p-2 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirm Empty Trash AlertDialog */}
      {purgeConfirmOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div role="alertdialog" aria-labelledby="purge-title" aria-describedby="purge-desc" className="bg-[#141414] border border-red-900/60 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 font-bold font-serif text-xl">
              <AlertTriangle className="w-6 h-6" />
              <h2 id="purge-title">Empty Trash ({activeTab})?</h2>
            </div>
            <p id="purge-desc" className="text-stone-300 text-sm">
              This action cannot be undone. All items in the <strong>{activeTab}</strong> tab will be permanently deleted.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPurgeConfirmOpen(false)}
                className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 text-sm hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurgeAllConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-sm"
              >
                Empty Trash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
