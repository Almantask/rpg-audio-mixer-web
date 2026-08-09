import React, { useState, useEffect } from 'react'
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react'
import { getDb, saveDb, type Campaign, type Session, type Scene, type FxTrack } from '../lib/storage/db'

type TrashTab = 'campaigns' | 'sessions' | 'scenes' | 'soundscapes' | 'fx'

export const TrashPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TrashTab>('campaigns')
  const [deletedCampaigns, setDeletedCampaigns] = useState<Campaign[]>([])
  const [deletedSessions, setDeletedSessions] = useState<Session[]>([])
  const [deletedScenes, setDeletedScenes] = useState<Scene[]>([])
  const [deletedFx, setDeletedFx] = useState<FxTrack[]>([])
  const [isPurgeConfirmOpen, setIsPurgeConfirmOpen] = useState(false)

  const loadData = () => {
    const db = getDb()
    setDeletedCampaigns(db.campaigns.filter((c) => !!c.deletedAt))
    setDeletedSessions(db.sessions.filter((s) => !!s.deletedAt))
    setDeletedScenes(db.scenes.filter((sc) => !!sc.deletedAt))
    setDeletedFx(db.fxTracks.filter((f) => !!f.deletedAt))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRestoreCampaign = (campaignId: string) => {
    const db = getDb()
    const target = db.campaigns.find((c) => c.id === campaignId)
    if (target) {
      delete target.deletedAt
      // Auto-restore orphaned sessions
      db.sessions.forEach((s) => {
        if (s.campaignId === campaignId) {
          delete s.deletedAt
        }
      })
      saveDb(db)
      loadData()
    }
  }

  const handleRestoreSession = (sessionId: string) => {
    const db = getDb()
    const target = db.sessions.find((s) => s.id === sessionId)
    if (target) {
      delete target.deletedAt
      saveDb(db)
      loadData()
    }
  }

  const handleRestoreScene = (sceneId: string) => {
    const db = getDb()
    const target = db.scenes.find((s) => s.id === sceneId)
    if (target) {
      delete target.deletedAt
      saveDb(db)
      loadData()
    }
  }

  const handleRestoreFx = (fxId: string) => {
    const db = getDb()
    const target = db.fxTracks.find((f) => f.id === fxId)
    if (target) {
      delete target.deletedAt
      saveDb(db)
      loadData()
    }
  }

  const handlePurgeAllActiveTab = () => {
    const db = getDb()
    if (activeTab === 'campaigns') {
      db.campaigns = db.campaigns.filter((c) => !c.deletedAt)
    } else if (activeTab === 'sessions') {
      db.sessions = db.sessions.filter((s) => !s.deletedAt)
    } else if (activeTab === 'scenes') {
      db.scenes = db.scenes.filter((sc) => !sc.deletedAt)
    } else if (activeTab === 'fx') {
      db.fxTracks = db.fxTracks.filter((f) => !f.deletedAt)
    }
    saveDb(db)
    loadData()
    setIsPurgeConfirmOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-amber-400">Trash</h1>
          <p className="text-sm text-neutral-400">Soft-deleted items are retained for 7 days.</p>
        </div>

        <button
          onClick={() => setIsPurgeConfirmOpen(true)}
          className="px-4 py-2 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-semibold rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Empty Trash</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 overflow-x-auto pb-1">
        {(['campaigns', 'sessions', 'scenes', 'soundscapes', 'fx'] as TrashTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? 'bg-[#141414] text-amber-400 border-t border-x border-amber-900/40'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-3">
        {activeTab === 'campaigns' && (
          deletedCampaigns.length === 0 ? (
            <p className="text-sm text-neutral-500 py-6 text-center">No deleted campaigns in Trash.</p>
          ) : (
            deletedCampaigns.map((c) => (
              <div
                key={c.id}
                className="bg-[#121212] border border-neutral-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-serif font-semibold text-neutral-200">{c.name}</h3>
                  <p className="text-xs text-neutral-500">7 days remaining</p>
                </div>
                <button
                  onClick={() => handleRestoreCampaign(c.id)}
                  className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 font-semibold text-xs rounded-lg flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </button>
              </div>
            ))
          )
        )}

        {activeTab === 'sessions' && (
          deletedSessions.length === 0 ? (
            <p className="text-sm text-neutral-500 py-6 text-center">No deleted sessions in Trash.</p>
          ) : (
            deletedSessions.map((s) => (
              <div
                key={s.id}
                className="bg-[#121212] border border-neutral-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-serif font-semibold text-neutral-200">{s.name}</h3>
                  <p className="text-xs text-neutral-500">7 days remaining</p>
                </div>
                <button
                  onClick={() => handleRestoreSession(s.id)}
                  className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 font-semibold text-xs rounded-lg flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </button>
              </div>
            ))
          )
        )}

        {activeTab === 'scenes' && (
          deletedScenes.length === 0 ? (
            <p className="text-sm text-neutral-500 py-6 text-center">No deleted scenes in Trash.</p>
          ) : (
            deletedScenes.map((sc) => (
              <div
                key={sc.id}
                className="bg-[#121212] border border-neutral-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-serif font-semibold text-neutral-200">{sc.name}</h3>
                  <p className="text-xs text-neutral-500">7 days remaining</p>
                </div>
                <button
                  onClick={() => handleRestoreScene(sc.id)}
                  className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 font-semibold text-xs rounded-lg flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </button>
              </div>
            ))
          )
        )}

        {activeTab === 'fx' && (
          deletedFx.length === 0 ? (
            <p className="text-sm text-neutral-500 py-6 text-center">No deleted FX tracks in Trash.</p>
          ) : (
            deletedFx.map((f) => (
              <div
                key={f.id}
                className="bg-[#121212] border border-neutral-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-serif font-semibold text-neutral-200">{f.name}</h3>
                  <p className="text-xs text-neutral-500">7 days remaining · Audio file retained</p>
                </div>
                <button
                  onClick={() => handleRestoreFx(f.id)}
                  className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 font-semibold text-xs rounded-lg flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </button>
              </div>
            ))
          )
        )}

        {activeTab === 'soundscapes' && (
          <p className="text-sm text-neutral-500 py-6 text-center">No deleted soundscapes in Trash.</p>
        )}
      </div>

      {/* Purge Confirmation AlertDialog */}
      {isPurgeConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-red-900/40 rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-serif text-lg font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Empty Trash
            </h3>
            <p className="text-sm text-neutral-300">
              Permanently purge all deleted items on the active tab? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsPurgeConfirmOpen(false)}
                className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeAllActiveTab}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-sm"
              >
                Purge Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
