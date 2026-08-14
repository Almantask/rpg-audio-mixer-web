import React, { useState, useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import { db } from '../storage/db'
import type { TrashItem } from '../types'

export const TrashPage: React.FC = () => {
  const [trashItems, setTrashItems] = useState<TrashItem[]>([])
  const [activeTab, setActiveTab] = useState<'campaign' | 'session' | 'scene' | 'fx'>('campaign')

  const reloadTrash = () => {
    setTrashItems([...db.getTrash()])
  }

  useEffect(() => {
    reloadTrash()
    const handleUpdate = () => reloadTrash()
    window.addEventListener('arcanum_db_updated', handleUpdate)
    return () => window.removeEventListener('arcanum_db_updated', handleUpdate)
  }, [])

  const handleRestore = (item: TrashItem) => {
    if (item.type === 'campaign') {
      db.restoreCampaign(item.originalData.id)
    } else if (item.type === 'scene') {
      db.restoreScene(item.originalData.id)
    } else if (item.type === 'fx') {
      db.getFXTracks().push(item.originalData as any)
      db.getTrash().splice(db.getTrash().indexOf(item), 1)
    } else if (item.type === 'session') {
      db.getSessionsByCampaign((item.originalData as any).campaignId).push(item.originalData as any)
      db.getTrash().splice(db.getTrash().indexOf(item), 1)
    }
    reloadTrash()
  }

  const filteredItems = trashItems.filter((item) => item.type === activeTab)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-neutral-100">Trash</h1>
        <p className="text-neutral-400 text-sm mt-1">
          Recover deleted campaigns, sessions, scenes, and sound effects
        </p>
      </div>

      <div className="border-b border-neutral-800 flex gap-6">
        {(['campaign', 'session', 'scene', 'fx'] as const).map((type) => (
          <button
            key={type}
            role="tab"
            aria-selected={activeTab === type}
            aria-label={`Trash ${type} tab`}
            data-trash-tab={type}
            onClick={() => setActiveTab(type)}
            className={`pb-3 font-bold text-sm capitalize transition-colors border-b-2 ${
              activeTab === type
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {type === 'fx'
              ? 'FX Tracks'
              : type === 'campaign'
              ? 'Campaigns'
              : type === 'session'
              ? 'Sessions'
              : 'Scenes'}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center text-neutral-400 text-sm">
          No deleted items in this category.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const title =
              'name' in item.originalData
                ? item.originalData.name
                : 'title' in item.originalData
                ? item.originalData.title
                : 'Deleted Item'

            return (
              <div
                key={item.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-neutral-100">{title}</div>
                  <div className="text-xs text-neutral-400">
                    Deleted {new Date(item.deletedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleRestore(item)}
                  className="bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
