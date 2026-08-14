import { useState } from 'react'
import { RotateCcw, Trash2, Check, BookOpen, Calendar, Film, Music, Zap } from 'lucide-react'
import { useTrash } from '../lib/useStorage'
import { storage } from '../lib/storage'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import { AlertDialog, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '../components/ui/alert-dialog'
import { toast } from '../components/ui/toast'
import type { TrashEntityType, TrashItem } from '../lib/types'

const ENTITY_ICONS: Record<TrashEntityType, React.ElementType> = {
  campaign: BookOpen,
  session: Calendar,
  scene: Film,
  soundscape: Music,
  fx: Zap,
}

export function TrashPage() {
  const [activeTab, setActiveTab] = useState<TrashEntityType>('campaign')
  const { trashItems, refresh } = useTrash(activeTab)

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmRestoreAllOpen, setConfirmRestoreAllOpen] = useState(false)
  const [confirmEmptyTrashOpen, setConfirmEmptyTrashOpen] = useState(false)
  const [purgingItem, setPurgingItem] = useState<TrashItem | null>(null)

  const handleSelectAll = () => {
    if (selectedIds.length === trashItems.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(trashItems.map((t) => t.id))
    }
  }

  const handleToggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleRestoreSingle = (item: TrashItem) => {
    storage.restoreTrashItem(item.id)
    refresh()
    toast.show(`Restored "${item.title}"`)
  }

  const handlePurgeSingle = (item: TrashItem) => {
    storage.purgeTrashItem(item.id)
    refresh()
    toast.show(`Permanently deleted "${item.title}"`)
  }

  const handleRestoreSelected = () => {
    for (const id of selectedIds) {
      storage.restoreTrashItem(id)
    }
    const count = selectedIds.length
    setSelectedIds([])
    refresh()
    toast.show(`Restored ${count} ${count === 1 ? 'item' : 'items'}`)
  }

  const handlePurgeSelected = () => {
    for (const id of selectedIds) {
      storage.purgeTrashItem(id)
    }
    const count = selectedIds.length
    setSelectedIds([])
    refresh()
    toast.show(`Purged ${count} ${count === 1 ? 'item' : 'items'}`)
  }

  const handleConfirmRestoreAll = () => {
    storage.restoreAllTrash(activeTab)
    setConfirmRestoreAllOpen(false)
    setSelectedIds([])
    refresh()
    toast.show(`Restored all items from ${activeTab} tab`)
  }

  const handleConfirmEmptyTrash = () => {
    storage.emptyTrash(activeTab)
    setConfirmEmptyTrashOpen(false)
    setSelectedIds([])
    refresh()
    toast.show(`Emptied ${activeTab} trash`)
  }

  const isAllSelected = trashItems.length > 0 && selectedIds.length === trashItems.length

  const renderTabContent = (type: TrashEntityType) => {
    const emptyTitles: Record<TrashEntityType, string> = {
      campaign: 'No deleted campaigns',
      session: 'No deleted sessions',
      scene: 'No deleted scenes',
      soundscape: 'No deleted soundscapes',
      fx: 'No deleted FX',
    }

    if (trashItems.length === 0) {
      return (
        <div className="text-center py-16 space-y-3">
          <Trash2 className="h-12 w-12 text-zinc-700 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-zinc-300">
            {emptyTitles[type]}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Deleted {type} items will appear here for 7 days before permanent removal.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Select All */}
        <div className="flex items-center gap-2 py-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className={`h-5 w-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
              isAllSelected
                ? 'border-amber-400 bg-amber-400 text-black'
                : 'border-zinc-700 bg-zinc-950'
            }`}
          >
            {isAllSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
          </button>
          <span className="text-xs text-zinc-400 font-medium">
            Select all ({trashItems.length})
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trashItems.map((item) => {
            const isSelected = selectedIds.includes(item.id)
            const Icon = ENTITY_ICONS[item.entityType] || Trash2

            return (
              <Card
                key={item.id}
                data-trash-id={item.id}
                className={`p-4 flex flex-col justify-between transition-all border ${
                  isSelected
                    ? 'border-amber-500/80 bg-amber-950/10'
                    : 'border-zinc-800 bg-zinc-900/90'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleItem(item.id)}
                      className={`h-5 w-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400 text-black'
                          : 'border-zinc-700 bg-zinc-950 hover:border-zinc-500'
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </button>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                      <span>7 days left</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-amber-400 shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-zinc-100 line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500">Deleted recently</p>
                    </div>
                  </div>
                </div>

                {/* Per-card restore and purge actions */}
                <div className="flex items-center justify-between pt-4 mt-3 border-t border-zinc-800/80">
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-xs text-amber-400 hover:text-amber-300"
                    onClick={() => handleRestoreSingle(item)}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Restore
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-xs text-red-400 hover:text-red-300"
                    onClick={() => setPurgingItem(item)}
                  >
                    Purge
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-amber-300">Trash</h2>
          <p className="text-zinc-400 text-sm">
            Recently deleted items are kept for 7 days before permanent removal.
          </p>
        </div>

        {trashItems.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmRestoreAllOpen(true)}
              className="text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Restore All
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmEmptyTrashOpen(true)}
              className="text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Empty Trash
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => {
        setActiveTab(val as TrashEntityType)
        setSelectedIds([])
      }}>
        <TabsList className="bg-zinc-950 border-zinc-800">
          <TabsTrigger value="campaign">Campaigns</TabsTrigger>
          <TabsTrigger value="session">Sessions</TabsTrigger>
          <TabsTrigger value="scene">Scenes</TabsTrigger>
          <TabsTrigger value="soundscape">Soundscapes</TabsTrigger>
          <TabsTrigger value="fx">FX</TabsTrigger>
        </TabsList>

        <TabsContent value="campaign">{renderTabContent('campaign')}</TabsContent>
        <TabsContent value="session">{renderTabContent('session')}</TabsContent>
        <TabsContent value="scene">{renderTabContent('scene')}</TabsContent>
        <TabsContent value="soundscape">{renderTabContent('soundscape')}</TabsContent>
        <TabsContent value="fx">{renderTabContent('fx')}</TabsContent>
      </Tabs>

      {/* Selection Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky bottom-4 z-40 bg-zinc-900 border border-amber-500/40 p-4 rounded-lg shadow-2xl flex items-center justify-between">
          <span className="text-sm font-semibold text-amber-200">
            {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} selected
          </span>
          <div className="flex items-center gap-2">
            <Button variant="gold" size="sm" onClick={handleRestoreSelected}>
              Restore Selected
            </Button>
            <Button variant="destructive" size="sm" onClick={handlePurgeSelected}>
              Purge Selected
            </Button>
          </div>
        </div>
      )}

      {/* Restore All Confirmation */}
      <AlertDialog open={confirmRestoreAllOpen} onOpenChange={setConfirmRestoreAllOpen}>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore all {activeTab} items?</AlertDialogTitle>
          <AlertDialogDescription>
            All deleted items in the {activeTab} tab will be restored to their original location.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={() => setConfirmRestoreAllOpen(false)}>
            Cancel
          </Button>
          <Button variant="gold" onClick={handleConfirmRestoreAll}>
            Restore All
          </Button>
        </AlertDialogFooter>
      </AlertDialog>

      {/* Empty Trash Confirmation */}
      <AlertDialog open={confirmEmptyTrashOpen} onOpenChange={setConfirmEmptyTrashOpen}>
        <AlertDialogHeader>
          <AlertDialogTitle>Empty {activeTab} trash?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete all {activeTab} items? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={() => setConfirmEmptyTrashOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirmEmptyTrash}>
            Empty Trash
          </Button>
        </AlertDialogFooter>
      </AlertDialog>

      {/* Single Purge Confirmation */}
      <AlertDialog open={Boolean(purgingItem)} onOpenChange={(open) => !open && setPurgingItem(null)}>
        <AlertDialogHeader>
          <AlertDialogTitle>Permanently delete "{purgingItem?.title}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The item will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={() => setPurgingItem(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (purgingItem) {
                handlePurgeSingle(purgingItem)
                setPurgingItem(null)
              }
            }}
          >
            Purge
          </Button>
        </AlertDialogFooter>
      </AlertDialog>
    </div>
  )
}
