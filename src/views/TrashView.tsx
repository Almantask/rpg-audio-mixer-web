import React, { useState } from 'react'
import { RotateCcw, Trash2, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Badge } from '../components/common/Badge'
import { AlertDialog } from '../components/common/AlertDialog'
import type { TrashEntityType, TrashItem } from '../types'

export const TrashView: React.FC = () => {
  const {
    trash,
    restoreTrashItem,
    restoreAllTab,
    purgeTrashItem,
    purgeSelectedItems,
    emptyTrashTab,
  } = useApp()

  const [activeTab, setActiveTab] = useState<TrashEntityType>('campaign')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [purgingItem, setPurgingItem] = useState<TrashItem | null>(null)
  const [isConfirmEmptyOpen, setIsConfirmEmptyOpen] = useState(false)
  const [isConfirmRestoreAllOpen, setIsConfirmRestoreAllOpen] = useState(false)

  const tabItems = trash.filter((t) => t.entityType === activeTab)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(tabItems.map((t) => t.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const tabs: { type: TrashEntityType; label: string }[] = [
    { type: 'campaign', label: 'Campaigns' },
    { type: 'session', label: 'Sessions' },
    { type: 'scene', label: 'Scenes' },
    { type: 'soundscape', label: 'Soundscapes' },
    { type: 'fx', label: 'FX' },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-amber-400">Trash</h1>
          <p className="text-sm text-neutral-400">
            Recently deleted items are kept for 7 days before permanent removal.
          </p>
        </div>

        {tabItems.length > 0 && (
          <div className="flex space-x-2 self-start sm:self-auto">
            <button
              onClick={() => setIsConfirmRestoreAllOpen(true)}
              className="px-3.5 py-2 rounded-lg border border-amber-500/40 text-amber-300 hover:bg-amber-950/40 font-bold text-xs flex items-center space-x-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore All</span>
            </button>

            <button
              onClick={() => setIsConfirmEmptyOpen(true)}
              className="px-3.5 py-2 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-950/40 font-bold text-xs flex items-center space-x-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Trash</span>
            </button>
          </div>
        )}
      </div>

      {/* Entity Tabs */}
      <div className="flex border-b border-neutral-800 space-x-6 overflow-x-auto">
        {tabs.map((tab) => {
          const count = trash.filter((t) => t.entityType === tab.type).length
          const isActive = activeTab === tab.type

          return (
            <button
              key={tab.type}
              onClick={() => {
                setActiveTab(tab.type)
                setSelectedIds([])
              }}
              className={`pb-3 font-serif font-bold text-sm transition border-b-2 whitespace-nowrap flex items-center space-x-2 ${
                isActive
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>{tab.label}</span>
              {count > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Main Tab Content */}
      {tabItems.length > 0 ? (
        <div className="space-y-4">
          {/* Select All Bar */}
          <div className="flex items-center space-x-3 px-1 text-xs text-neutral-400 font-semibold">
            <input
              type="checkbox"
              checked={selectedIds.length === tabItems.length && tabItems.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="accent-amber-500 w-4 h-4 cursor-pointer"
            />
            <span>Select all ({tabItems.length})</span>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tabItems.map((item) => {
              const isSelected = selectedIds.includes(item.id)
              const daysLeft = Math.max(
                1,
                Math.ceil((item.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)),
              )

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-4 bg-neutral-900 space-y-3 shadow-lg transition ${
                    isSelected ? 'border-amber-400 bg-amber-950/20' : 'border-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.id)}
                        className="accent-amber-500 w-4 h-4 cursor-pointer"
                      />
                      <Badge variant={daysLeft === 1 ? 'destructive' : 'gold'}>
                        {daysLeft === 1 ? '⚠ 1 day left' : `⏳ ${daysLeft} days left`}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-neutral-100 truncate">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                    <button
                      onClick={() => restoreTrashItem(item.id)}
                      className="px-3 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded text-xs font-bold flex items-center space-x-1 transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>

                    <button
                      onClick={() => setPurgingItem(item)}
                      className="px-3 py-1 bg-red-950/40 text-red-400 hover:bg-red-950/80 rounded text-xs font-bold flex items-center space-x-1 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Purge</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Multi-Selection Action Bar */}
          {selectedIds.length > 0 && (
            <div className="sticky bottom-4 z-40 bg-neutral-900 border border-amber-500/50 p-4 rounded-xl shadow-2xl flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-200">
                {selectedIds.length} selected
              </span>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    selectedIds.forEach((id) => restoreTrashItem(id))
                    setSelectedIds([])
                  }}
                  className="px-4 py-2 bg-amber-500 text-neutral-950 font-bold text-xs rounded-lg hover:bg-amber-400"
                >
                  Restore Selected
                </button>

                <button
                  onClick={() => {
                    purgeSelectedItems(selectedIds)
                    setSelectedIds([])
                  }}
                  className="px-4 py-2 bg-red-700 text-white font-bold text-xs rounded-lg hover:bg-red-600"
                >
                  Purge Selected
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-12 text-center space-y-3">
          <Trash2 className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-neutral-200">
            No deleted {activeTab}s
          </h3>
          <p className="text-xs text-neutral-400">
            Deleted {activeTab}s will appear here for 7 days before permanent removal.
          </p>
        </div>
      )}

      {/* Purge Single Item AlertDialog */}
      <AlertDialog
        isOpen={Boolean(purgingItem)}
        onClose={() => setPurgingItem(null)}
        onConfirm={() => {
          if (purgingItem) {
            purgeTrashItem(purgingItem.id)
            setPurgingItem(null)
          }
        }}
        title="Permanently Delete Item"
        description={
          purgingItem
            ? `Permanently delete "${purgingItem.title}"? This action cannot be undone.`
            : ''
        }
        confirmText="Permanently Delete"
      />

      {/* Confirm Empty Trash Tab AlertDialog */}
      <AlertDialog
        isOpen={isConfirmEmptyOpen}
        onClose={() => setIsConfirmEmptyOpen(false)}
        onConfirm={() => {
          emptyTrashTab(activeTab)
          setIsConfirmEmptyOpen(false)
        }}
        title={`Empty ${activeTab.toUpperCase()} Trash`}
        description={`Are you sure you want to permanently delete all ${activeTab} items in Trash? This cannot be undone.`}
        confirmText="Empty Trash"
      />

      {/* Confirm Restore All Tab AlertDialog */}
      <AlertDialog
        isOpen={isConfirmRestoreAllOpen}
        onClose={() => setIsConfirmRestoreAllOpen(false)}
        onConfirm={() => {
          restoreAllTab(activeTab)
          setIsConfirmRestoreAllOpen(false)
        }}
        title={`Restore All ${activeTab.toUpperCase()}s`}
        description={`Restore all ${activeTab} items from Trash back to active lists?`}
        confirmText="Restore All"
        isDestructive={false}
      />
    </div>
  )
}
