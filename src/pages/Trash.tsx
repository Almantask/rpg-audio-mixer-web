import React, { useState } from 'react'
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react'
import type { Campaign, Session, Scene, FxTrack, SoundscapeCategory } from '../types'

interface TrashProps {
  campaigns: Campaign[]
  sessions: Session[]
  scenes: Scene[]
  soundscapes: SoundscapeCategory[]
  fxTracks: FxTrack[]
  onRestoreCampaign: (id: string) => void
  onRestoreSession: (id: string) => void
  onRestoreScene: (id: string) => void
  onRestoreSoundscape: (id: string) => void
  onRestoreFx: (id: string) => void
  onEmptyTrash: (tab: string) => void
}

export const Trash: React.FC<TrashProps> = ({
  campaigns,
  sessions,
  scenes,
  soundscapes,
  fxTracks,
  onRestoreCampaign,
  onRestoreSession,
  onRestoreScene,
  onRestoreSoundscape,
  onRestoreFx,
  onEmptyTrash,
}) => {
  const [activeTab, setActiveTab] = useState<'Campaigns' | 'Sessions' | 'Scenes' | 'Soundscapes' | 'FX'>('Campaigns')
  const [confirmEmpty, setConfirmEmpty] = useState(false)

  const deletedCampaigns = campaigns.filter((c) => c.deletedAt)
  const deletedSessions = sessions.filter((s) => s.deletedAt)
  const deletedScenes = scenes.filter((sc) => sc.deletedAt)
  const deletedSoundscapes = soundscapes.filter((s) => s.deletedAt)
  const deletedFx = fxTracks.filter((f) => f.deletedAt)

  const getActiveItems = () => {
    switch (activeTab) {
      case 'Campaigns': return deletedCampaigns.map((i) => ({ id: i.id, name: i.name, type: 'Campaign' }))
      case 'Sessions': return deletedSessions.map((i) => ({ id: i.id, name: i.name, type: 'Session' }))
      case 'Scenes': return deletedScenes.map((i) => ({ id: i.id, name: i.name, type: 'Scene' }))
      case 'Soundscapes': return deletedSoundscapes.map((i) => ({ id: i.id, name: i.name, type: 'Soundscape' }))
      case 'FX': return deletedFx.map((i) => ({ id: i.id, name: i.name, type: 'FX' }))
    }
  }

  const handleRestore = (id: string) => {
    switch (activeTab) {
      case 'Campaigns': onRestoreCampaign(id); break
      case 'Sessions': onRestoreSession(id); break
      case 'Scenes': onRestoreScene(id); break
      case 'Soundscapes': onRestoreSoundscape(id); break
      case 'FX': onRestoreFx(id); break
    }
  }

  const items = getActiveItems()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-amber-400">Trash</h1>
          <p className="text-gray-400 text-sm">Items in trash are retained for 7 days before permanent deletion.</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => setConfirmEmpty(true)}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Empty Trash ({activeTab})</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-amber-900/30 gap-2">
        {(['Campaigns', 'Sessions', 'Scenes', 'Soundscapes', 'FX'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-4 py-2 text-sm font-semibold border-b-2 transition
              ${activeTab === tab ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400 hover:text-gray-200'}
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="bg-[#121212] border border-amber-900/20 rounded-xl p-12 text-center space-y-3">
          <Trash2 className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-serif font-semibold text-gray-300">Trash is empty</h3>
          <p className="text-xs text-gray-500">No deleted {activeTab.toLowerCase()} found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-[#121212] border border-amber-900/20 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <h4 className="font-serif font-semibold text-gray-200">{item.name}</h4>
                <span className="text-xs text-amber-400/80">Expires in 7 days</span>
              </div>
              <button
                onClick={() => handleRestore(item.id)}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmEmpty && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-red-500/30 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-xl font-serif font-bold">Empty Trash?</h2>
            </div>
            <p className="text-gray-300 text-sm">
              This will permanently delete all {activeTab.toLowerCase()} in Trash. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmEmpty(false)}
                className="px-4 py-2 text-gray-400 hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onEmptyTrash(activeTab)
                  setConfirmEmpty(false)
                }}
                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg"
              >
                Permanently Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
