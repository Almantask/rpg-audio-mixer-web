import React, { useState } from 'react'
import {
  Trash2,
  RotateCcw,
  BookOpen,
  Scroll,
  Image as ImageIcon,
  Music,
  Volume2,
  AlertTriangle,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { AlertDialog } from '../components/common/Dialog'

export const TrashPage: React.FC = () => {
  const {
    trashItems,
    restoreTrashItem,
    purgeTrashItem,
    restoreAllTrashTab,
    emptyTrashTab,
    bulkRestoreTrashItems,
    bulkPurgeTrashItems,
  } = useApp()

  type TabType = 'campaigns' | 'sessions' | 'scenes' | 'soundscapes' | 'fx'
  const [activeTab, setActiveTab] = useState<TabType>('campaigns')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const [isRestoreAllConfirmOpen, setIsRestoreAllConfirmOpen] = useState(false)
  const [isEmptyTrashConfirmOpen, setIsEmptyTrashConfirmOpen] = useState(false)
  const [isBulkPurgeConfirmOpen, setIsBulkPurgeConfirmOpen] = useState(false)

  const entityTypeMap: Record<TabType, string> = {
    campaigns: 'campaign',
    sessions: 'session',
    scenes: 'scene',
    soundscapes: 'soundscape',
    fx: 'fx',
  }

  const currentTabItems = trashItems.filter(
    (t) => t.entityType === entityTypeMap[activeTab]
  )

  const isAllSelected =
    currentTabItems.length > 0 &&
    currentTabItems.every((item) => selectedIds.includes(item.id))

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(currentTabItems.map((item) => item.id))
    }
  }

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'campaign':
        return <BookOpen size={20} className="text-yellow-500" />
      case 'session':
        return <Scroll size={20} className="text-yellow-500" />
      case 'scene':
        return <ImageIcon size={20} className="text-yellow-500" />
      case 'soundscape':
        return <Music size={20} className="text-yellow-500" />
      case 'fx':
        return <Volume2 size={20} className="text-purple-400" />
      default:
        return <Trash2 size={20} className="text-gray-400" />
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-yellow-500">Trash</h1>
          <p className="text-sm text-gray-400 mt-1">
            Recently deleted items are kept for 7 days before permanent removal.
          </p>
        </div>

        {currentTabItems.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRestoreAllConfirmOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
            >
              <RotateCcw size={16} /> Restore All
            </button>
            <button
              onClick={() => setIsEmptyTrashConfirmOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-red-500/40 text-red-400 hover:bg-red-950/40"
            >
              <Trash2 size={16} /> Empty Trash
            </button>
          </div>
        )}
      </div>

      {/* Entity Tabs */}
      <div className="flex gap-4 border-b border-yellow-900/30 overflow-x-auto">
        {(['campaigns', 'sessions', 'scenes', 'soundscapes', 'fx'] as TabType[]).map((tab) => {
          const count = trashItems.filter((t) => t.entityType === entityTypeMap[tab]).length
          const isActive = activeTab === tab

          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                setSelectedIds([])
              }}
              className={`pb-3 px-2 font-serif text-base capitalize font-bold transition-all whitespace-nowrap relative ${
                isActive
                  ? 'text-yellow-500 border-b-2 border-yellow-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab} ({count})
            </button>
          )
        })}
      </div>

      {/* Select All Checkbox */}
      {currentTabItems.length > 0 && (
        <div className="flex items-center gap-3 px-2">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleSelectAll}
            className="w-5 h-5 accent-yellow-500 cursor-pointer"
          />
          <span className="text-xs font-semibold text-gray-300">
            Select all ({currentTabItems.length})
          </span>
        </div>
      )}

      {/* Grid of Trash Items */}
      {currentTabItems.length === 0 ? (
        <div className="text-center py-16 bg-[#141414] rounded-xl border border-yellow-900/20 p-8 space-y-3">
          <Trash2 size={48} className="mx-auto text-yellow-500/30" />
          <h3 className="font-serif text-2xl font-bold text-yellow-500 capitalize">
            No deleted {activeTab}
          </h3>
          <p className="text-sm text-gray-400">
            Deleted {activeTab} will appear here for 7 days before permanent removal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {currentTabItems.map((item) => {
            const isSelected = selectedIds.includes(item.id)
            const title =
              (item.originalData as { name?: string; title?: string }).name ||
              (item.originalData as { title?: string }).title ||
              'Item'

            // Days remaining calculation
            const deletedTime = new Date(item.deletedAt).getTime()
            const daysPassed = Math.floor((Date.now() - deletedTime) / (86400 * 1000))
            const daysLeft = Math.max(1, 7 - daysPassed)
            const isUrgent = daysLeft <= 1

            return (
              <div
                key={item.id}
                className={`p-5 rounded-xl border bg-[#161616] flex flex-col justify-between space-y-4 transition-all ${
                  isSelected
                    ? 'border-yellow-500 bg-yellow-900/20 ring-2 ring-yellow-500/50'
                    : 'border-yellow-900/20 hover:border-yellow-900/50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectItem(item.id)}
                      className="w-5 h-5 accent-yellow-500 cursor-pointer"
                    />
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                        isUrgent
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}
                    >
                      {isUrgent && <AlertTriangle size={12} />} ⏳ {daysLeft} day(s) left
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-black/40 border border-yellow-900/20">
                      {getIcon(item.entityType)}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-gray-100 text-base">{title}</h4>
                      <p className="text-[11px] text-gray-500">
                        Deleted {daysPassed === 0 ? 'today' : `${daysPassed}d ago`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-yellow-900/20">
                  <button
                    onClick={() => restoreTrashItem(item.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-yellow-400 hover:text-yellow-300"
                  >
                    <RotateCcw size={14} /> Restore
                  </button>
                  <button
                    onClick={() => purgeTrashItem(item.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={14} /> Purge
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Sticky Bulk Selection Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 md:left-72 z-40 bg-[#1A1A1A] border border-yellow-500/50 rounded-xl p-4 shadow-2xl flex items-center justify-between">
          <span className="text-xs font-semibold text-yellow-400">
            {selectedIds.length} item(s) selected
          </span>

          <div className="flex gap-3">
            <button
              onClick={() => {
                bulkRestoreTrashItems(selectedIds)
                setSelectedIds([])
              }}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-yellow-500 text-black hover:bg-yellow-400"
            >
              Restore Selected
            </button>
            <button
              onClick={() => setIsBulkPurgeConfirmOpen(true)}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-500"
            >
              Purge Selected
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <AlertDialog
        isOpen={isRestoreAllConfirmOpen}
        onClose={() => setIsRestoreAllConfirmOpen(false)}
        onConfirm={() => restoreAllTrashTab(activeTab)}
        title={`Restore All ${activeTab}`}
        description={`Are you sure you want to restore all items on the ${activeTab} tab?`}
        confirmText="Restore All"
        isDestructive={false}
      />

      <AlertDialog
        isOpen={isEmptyTrashConfirmOpen}
        onClose={() => setIsEmptyTrashConfirmOpen(false)}
        onConfirm={() => emptyTrashTab(activeTab)}
        title={`Empty Trash — ${activeTab}`}
        description={`This action will permanently delete all items on the ${activeTab} tab. This cannot be undone.`}
        confirmText="Empty Trash"
        isDestructive={true}
      />

      <AlertDialog
        isOpen={isBulkPurgeConfirmOpen}
        onClose={() => setIsBulkPurgeConfirmOpen(false)}
        onConfirm={() => {
          bulkPurgeTrashItems(selectedIds)
          setSelectedIds([])
        }}
        title="Purge Selected Items"
        description={`Are you sure you want to permanently delete ${selectedIds.length} selected item(s)?`}
        confirmText="Purge Selected"
        isDestructive={true}
      />
    </div>
  )
}
