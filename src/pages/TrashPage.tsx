import React, { useState } from 'react'
import { Trash2, RotateCcw, AlertTriangle, CheckSquare, Square as SquareIcon } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { EntityType } from '../types'

export const TrashPage: React.FC = () => {
  const {
    trashItems,
    restoreTrashItem,
    restoreAllTrashItems,
    purgeTrashItem,
    emptyTrash,
  } = useApp()

  const [activeTab, setActiveTab] = useState<EntityType>('campaign')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPurgeConfirmOpen, setIsPurgeConfirmOpen] = useState(false)

  // Items for active tab
  const tabItems = trashItems.filter((t) => t.entityType === activeTab)

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === tabItems.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(tabItems.map((t) => t.id))
    }
  }

  const handleRestoreSelected = () => {
    selectedIds.forEach((id) => restoreTrashItem(id))
    setSelectedIds([])
  }

  const handleRestoreAll = () => {
    restoreAllTrashItems(activeTab)
    setSelectedIds([])
  }

  const handleConfirmEmptyTrash = () => {
    emptyTrash(activeTab)
    setSelectedIds([])
    setIsPurgeConfirmOpen(false)
  }

  const tabLabels: { key: EntityType; label: string }[] = [
    { key: 'campaign', label: 'Campaigns' },
    { key: 'session', label: 'Sessions' },
    { key: 'scene', label: 'Scenes' },
    { key: 'soundscape', label: 'Soundscapes' },
    { key: 'fx', label: 'FX Tracks' },
  ]

  // Calculate days remaining
  const getDaysRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return Math.max(1, Math.min(7, days))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-yellow-900/30">
        <div>
          <h1 className="font-serif text-3xl font-bold text-amber-300">Trash</h1>
          <p className="text-sm text-gray-400 mt-1">
            Soft-deleted items are retained for 7 days before permanent expiry
          </p>
        </div>

        {tabItems.length > 0 && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRestoreAll}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg flex items-center space-x-1.5"
            >
              <RotateCcw size={14} />
              <span>Restore All</span>
            </button>
            <button
              onClick={() => setIsPurgeConfirmOpen(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shadow flex items-center space-x-1.5 cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Empty Trash</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs Menu per entity type */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 pb-2">
        {tabLabels.map((t) => {
          const count = trashItems.filter((item) => item.entityType === t.key).length

          return (
            <button
              key={t.key}
              onClick={() => {
                setActiveTab(t.key)
                setSelectedIds([])
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === t.key
                  ? 'bg-amber-500 text-gray-950 shadow'
                  : 'bg-gray-800/60 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              <span>{t.label}</span>
              {count > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-black/30 font-mono">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      {tabItems.length === 0 ? (
        <div className="bg-[#141414] border border-dashed border-gray-800 rounded-xl p-12 text-center space-y-4">
          <Trash2 size={48} className="mx-auto text-gray-600" />
          <h2 className="font-serif text-xl font-bold text-gray-300">Trash is empty</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            No soft-deleted {activeTab}s in Trash.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="flex items-center justify-between bg-[#171717] p-3 rounded-lg border border-gray-800">
            <button
              onClick={toggleSelectAll}
              className="flex items-center space-x-2 text-xs font-semibold text-gray-300 hover:text-white"
            >
              {selectedIds.length === tabItems.length ? (
                <CheckSquare size={16} className="text-amber-400" />
              ) : (
                <SquareIcon size={16} className="text-gray-500" />
              )}
              <span>
                Select All ({selectedIds.length}/{tabItems.length})
              </span>
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={handleRestoreSelected}
                className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded hover:bg-amber-500/30 flex items-center space-x-1"
              >
                <RotateCcw size={12} />
                <span>Restore Selected ({selectedIds.length})</span>
              </button>
            )}
          </div>

          {/* Items List */}
          <div className="space-y-2">
            {tabItems.map((item) => {
              const daysLeft = getDaysRemaining(item.expiresAt)
              const isUrgent = daysLeft <= 1
              const isChecked = selectedIds.includes(item.id)

              return (
                <div
                  key={item.id}
                  className="bg-[#171717] border border-yellow-900/20 rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className="text-gray-500 hover:text-amber-400"
                    >
                      {isChecked ? (
                        <CheckSquare size={18} className="text-amber-400" />
                      ) : (
                        <SquareIcon size={18} />
                      )}
                    </button>
                    <div>
                      <div className="font-semibold text-gray-200 text-sm">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        Deleted {new Date(item.deletedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Retention countdown badge */}
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isUrgent
                          ? 'bg-red-950 text-red-300 border-red-800/60 animate-pulse'
                          : 'bg-gray-800 text-gray-400 border-gray-700'
                      }`}
                    >
                      {daysLeft} {daysLeft === 1 ? 'day left' : 'days left'}
                    </span>

                    <button
                      onClick={() => restoreTrashItem(item.id)}
                      className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg hover:bg-amber-500/30 flex items-center space-x-1"
                      title="Restore item"
                    >
                      <RotateCcw size={14} />
                      <span>Restore</span>
                    </button>

                    <button
                      onClick={() => purgeTrashItem(item.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 rounded"
                      title="Delete permanently"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty Trash Confirmation AlertDialog */}
      {isPurgeConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-red-800/60 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertTriangle size={24} />
              <h2 className="font-serif text-xl font-bold text-gray-100">Empty Trash?</h2>
            </div>
            <p className="text-sm text-gray-300">
              This will permanently delete all soft-deleted items under the <strong className="text-amber-300">{activeTab}s</strong> tab. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsPurgeConfirmOpen(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEmptyTrash}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg shadow"
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
