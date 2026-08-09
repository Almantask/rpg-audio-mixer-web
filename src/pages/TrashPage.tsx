import React, { useState } from 'react'
import { getData } from '../services/store'

export const TrashPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'sessions' | 'scenes' | 'soundscapes' | 'fx'>('campaigns')
  const data = getData()

  const deletedCampaigns = data.campaigns.filter((c) => c.deletedAt)
  const deletedSessions = data.sessions.filter((s) => s.deletedAt)
  const deletedScenes = data.scenes.filter((s) => s.deletedAt)
  const deletedFX = data.fxTracks.filter((f) => f.deletedAt)
  const deletedSoundscapes = data.soundscapeCategories.filter((sc) => sc.deletedAt)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-amber-400">Trash</h1>

      <div className="flex gap-4 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'campaigns'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Campaigns ({deletedCampaigns.length})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'sessions'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Sessions ({deletedSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('scenes')}
          className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'scenes'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Scenes ({deletedScenes.length})
        </button>
        <button
          onClick={() => setActiveTab('soundscapes')}
          className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'soundscapes'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Soundscapes ({deletedSoundscapes.length})
        </button>
        <button
          onClick={() => setActiveTab('fx')}
          className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'fx'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          FX ({deletedFX.length})
        </button>
      </div>

      <div className="pt-4">
        {activeTab === 'campaigns' && (
          <div>
            {deletedCampaigns.length === 0 ? (
              <p className="text-zinc-500">No soft-deleted campaigns.</p>
            ) : (
              <div className="space-y-2">
                {deletedCampaigns.map((c) => (
                  <div key={c.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded">
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'sessions' && (
          <div>
            {deletedSessions.length === 0 ? (
              <p className="text-zinc-500">No soft-deleted sessions.</p>
            ) : (
              <div className="space-y-2">
                {deletedSessions.map((s) => (
                  <div key={s.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded">
                    {s.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'scenes' && (
          <div>
            {deletedScenes.length === 0 ? (
              <p className="text-zinc-500">No soft-deleted scenes.</p>
            ) : (
              <div className="space-y-2">
                {deletedScenes.map((sc) => (
                  <div key={sc.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded">
                    {sc.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'soundscapes' && (
          <div>
            {deletedSoundscapes.length === 0 ? (
              <p className="text-zinc-500">No soft-deleted soundscape categories.</p>
            ) : (
              <div className="space-y-2">
                {deletedSoundscapes.map((sc) => (
                  <div key={sc.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded">
                    {sc.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'fx' && (
          <div>
            {deletedFX.length === 0 ? (
              <p className="text-zinc-500">No soft-deleted FX tracks.</p>
            ) : (
              <div className="space-y-2">
                {deletedFX.map((f) => (
                  <div key={f.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded">
                    {f.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
