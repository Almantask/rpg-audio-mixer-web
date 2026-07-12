import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { toast } from 'sonner'
import { TrashItemCard } from '@/components/trash/TrashItemCard'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  listTrashItems,
  purgeTrashItems,
  restoreTrashItems,
  type TrashEntityType,
  type TrashItem,
} from '@/lib/storage/trashRepository'

const TAB_LABELS: Record<TrashEntityType, string> = {
  campaigns: 'Campaigns',
  sessions: 'Sessions',
  scenes: 'Scenes',
  soundscapes: 'Soundscapes',
  fx: 'FX',
}

const EMPTY_COPY: Record<TrashEntityType, { headline: string; body: string }> = {
  campaigns: {
    headline: 'No deleted campaigns',
    body: 'Deleted campaigns will appear here for 7 days.',
  },
  sessions: {
    headline: 'No deleted sessions',
    body: 'Deleted sessions will appear here for 7 days.',
  },
  scenes: {
    headline: 'No deleted scenes',
    body: 'Deleted scenes will appear here for 7 days.',
  },
  soundscapes: {
    headline: 'No deleted soundscapes',
    body: 'Deleted soundscapes will appear here for 7 days.',
  },
  fx: {
    headline: 'No deleted FX',
    body: 'Deleted FX tracks will appear here for 7 days.',
  },
}

type ConfirmAction = 'purge-one' | 'purge-selected' | 'purge-all' | 'restore-all' | null

export function TrashPage() {
  const [activeTab, setActiveTab] = useState<TrashEntityType>('campaigns')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [confirmTarget, setConfirmTarget] = useState<TrashItem | null>(null)

  const items = useLiveQuery(() => listTrashItems(activeTab), [activeTab]) ?? undefined
  const isLoading = items === undefined
  const sortedItems = useMemo(
    () =>
      [...(items ?? [])].sort(
        (left, right) => daysRemainingSort(left.deletedAt) - daysRemainingSort(right.deletedAt),
      ),
    [items],
  )

  const selectedItems = sortedItems.filter((item) => selectedIds.includes(item.id))
  const allSelected = sortedItems.length > 0 && selectedItems.length === sortedItems.length

  const clearSelection = () => setSelectedIds([])

  const toggleItem = (id: string, checked: boolean) => {
    setSelectedIds((current) =>
      checked ? [...new Set([...current, id])] : current.filter((itemId) => itemId !== id),
    )
  }

  const toggleSelectAll = () => {
    if (allSelected) {
      clearSelection()
      return
    }
    setSelectedIds(sortedItems.map((item) => item.id))
  }

  const handleRestoreOne = async (item: TrashItem) => {
    const result = await restoreTrashItems([item])
    if (result.failed.length > 0) {
      setErrors((current) => ({ ...current, [item.id]: `Unable to restore ${item.name}` }))
      return
    }
    setErrors((current) => {
      const next = { ...current }
      delete next[item.id]
      return next
    })
    toast.success(`${item.name} restored`)
  }

  const handleRestoreSelected = async () => {
    const result = await restoreTrashItems(selectedItems)
    if (result.failed.length > 0) {
      toast.message(`Restored ${result.restored} of ${selectedItems.length}`)
      const nextErrors: Record<string, string> = {}
      for (const item of result.failed) {
        nextErrors[item.id] = `Unable to restore ${item.name}`
      }
      setErrors(nextErrors)
      setSelectedIds(result.failed.map((item) => item.id))
      return
    }
    toast.success(`Restored ${result.restored} item${result.restored === 1 ? '' : 's'}`)
    clearSelection()
  }

  const handleRestoreAll = async () => {
    const result = await restoreTrashItems(sortedItems)
    if (result.failed.length > 0) {
      toast.message(`Restored ${result.restored} of ${sortedItems.length}`)
      setSelectedIds(result.failed.map((item) => item.id))
      return
    }
    toast.success('All items restored')
    clearSelection()
  }

  const handlePurge = async (targets: TrashItem[]) => {
    const result = await purgeTrashItems(targets)
    if (result.failed.length > 0) {
      toast.message(`Purged ${result.purged} of ${targets.length}`)
      const nextErrors: Record<string, string> = {}
      for (const item of result.failed) {
        nextErrors[item.id] = `Unable to purge ${item.name}`
      }
      setErrors(nextErrors)
      setSelectedIds(result.failed.map((item) => item.id))
      return
    }
    toast.success(`Purged ${result.purged} item${result.purged === 1 ? '' : 's'}`)
    clearSelection()
  }

  const runConfirmedAction = async () => {
    if (confirmAction === 'purge-one' && confirmTarget) {
      await handlePurge([confirmTarget])
    } else if (confirmAction === 'purge-selected') {
      await handlePurge(selectedItems)
    } else if (confirmAction === 'purge-all') {
      await handlePurge(sortedItems)
    } else if (confirmAction === 'restore-all') {
      await handleRestoreAll()
    }
    setConfirmAction(null)
    setConfirmTarget(null)
  }

  const tabContent = (type: TrashEntityType) => {
    const tabItems = type === activeTab ? sortedItems : []
    const empty = EMPTY_COPY[type]

    return (
      <TabsContent data-testid={`trash-${type}-tab`} value={type}>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : null}

        {!isLoading && tabItems.length === 0 ? (
          <div className="py-16 text-center" data-testid="trash-empty-state">
            <p className="font-serif text-xl text-gold">{empty.headline}</p>
            <p className="mt-2 text-sm text-zinc-400">{empty.body}</p>
          </div>
        ) : null}

        {!isLoading && tabItems.length > 0 ? (
          <>
            <label className="mb-4 flex items-center gap-2 text-sm text-zinc-300">
              <Checkbox
                checked={allSelected}
                data-testid="trash-select-all"
                onChange={() => toggleSelectAll()}
              />
              Select all ({tabItems.length})
            </label>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tabItems.map((item) => (
                <TrashItemCard
                  errorMessage={errors[item.id]}
                  item={item}
                  key={item.id}
                  onPurge={() => {
                    setConfirmTarget(item)
                    setConfirmAction('purge-one')
                  }}
                  onRestore={() => void handleRestoreOne(item)}
                  onToggleSelect={(checked) => toggleItem(item.id, checked)}
                  selected={selectedIds.includes(item.id)}
                />
              ))}
            </div>
          </>
        ) : null}
      </TabsContent>
    )
  }

  return (
    <section aria-labelledby="trash-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-gold" id="trash-heading">
            Trash
          </h1>
          <p className="mt-2 text-zinc-400">
            Recently deleted items are kept for 7 days before permanent removal.
          </p>
        </div>
        {!isLoading && sortedItems.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <Button
              data-testid="trash-restore-all"
              onClick={() => setConfirmAction('restore-all')}
              type="button"
              variant="outline"
            >
              Restore All
            </Button>
            <Button
              className="text-red-400"
              data-testid="trash-empty-tab"
              onClick={() => setConfirmAction('purge-all')}
              type="button"
              variant="outline"
            >
              Empty Trash
            </Button>
          </div>
        ) : null}
      </div>

      <Tabs
        className="mt-6"
        onValueChange={(value) => {
          setActiveTab(value as TrashEntityType)
          clearSelection()
          setErrors({})
        }}
        value={activeTab}
      >
        <TabsList>
          {(Object.keys(TAB_LABELS) as TrashEntityType[]).map((type) => (
            <TabsTrigger key={type} value={type}>
              {TAB_LABELS[type]}
            </TabsTrigger>
          ))}
        </TabsList>
        {(Object.keys(TAB_LABELS) as TrashEntityType[]).map((type) => tabContent(type))}
      </Tabs>

      {selectedItems.length > 0 ? (
        <div
          className="sticky bottom-4 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gold/40 bg-zinc-950/95 p-4"
          data-testid="trash-selection-bar"
        >
          <span>{selectedItems.length} selected</span>
          <div className="flex gap-2">
            <Button onClick={() => void handleRestoreSelected()} type="button" variant="outline">
              Restore Selected
            </Button>
            <Button
              className="text-red-400"
              onClick={() => setConfirmAction('purge-selected')}
              type="button"
              variant="outline"
            >
              Purge Selected
            </Button>
          </div>
        </div>
      ) : null}

      <p className="mt-8 text-center font-serif text-sm italic text-zinc-500">
        Items in Trash are permanently deleted after 7 days. This cannot be undone.
      </p>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setConfirmAction(null)
            setConfirmTarget(null)
          }
        }}
        open={confirmAction !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'restore-all' ? 'Restore all items?' : 'Permanently delete?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'restore-all'
                ? 'This will restore every item on the active tab.'
                : 'This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void runConfirmedAction()}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

function daysRemainingSort(deletedAt: number): number {
  const expiresAt = deletedAt + 7 * 24 * 60 * 60 * 1000
  return expiresAt - Date.now()
}
