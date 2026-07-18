import { useCallback, useEffect, useMemo, useState } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { ScreenLandmark } from '@/components/layout/AppShell'
import { useToast } from '@/components/shared/ToastProvider'
import { TrashEmptyState } from '@/components/trash/TrashEmptyState'
import {
  TrashItemCard,
  TrashItemCardSkeleton,
  type TrashEntityType,
} from '@/components/trash/TrashItemCard'
import { TrashSelectionBar } from '@/components/trash/TrashSelectionBar'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/dialog'
import { useCampaignData } from '@/context/CampaignDataContext'
import { getTrashedCampaigns, getTrashedSessions } from '@/lib/campaignStorage'
import { getTrashedFxTracks } from '@/lib/libraryStorage'
import { getTrashedScenes } from '@/lib/sceneStorage'
import { formatSessionContextLabel } from '@/lib/sessionTitle'
import { sortByDaysRemaining } from '@/lib/trashStorage'
import type { BulkTrashResult, TrashTab } from '@/types/campaign'
import { cn } from '@/lib/utils'

const TABS: { id: TrashTab; label: string }[] = [
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'scenes', label: 'Scenes' },
  { id: 'soundscapes', label: 'Soundscapes' },
  { id: 'fx', label: 'FX' },
]

const TAB_SECTION_ATTR: Record<TrashTab, string> = {
  campaigns: 'data-trash-campaigns',
  sessions: 'data-trash-sessions',
  scenes: 'data-trash-scenes',
  soundscapes: 'data-trash-soundscapes',
  fx: 'data-trash-fx',
}

type ConfirmAction =
  | { kind: 'purge-one'; id: string; title: string }
  | { kind: 'purge-selected' }
  | { kind: 'purge-all' }
  | { kind: 'restore-all' }

interface TrashListItem {
  id: string
  type: TrashEntityType
  title: string
  dataLabel: string
  deletedAt: string
}

function trashTabFromQuery(value: string | null): TrashTab {
  if (
    value === 'sessions' ||
    value === 'scenes' ||
    value === 'fx' ||
    value === 'campaigns' ||
    value === 'soundscapes'
  ) {
    return value
  }
  return 'campaigns'
}

function showBulkToast(
  showToast: (message: string) => void,
  verb: 'Restored' | 'Purged',
  result: BulkTrashResult,
) {
  const total = result.succeeded.length + result.failed.length
  if (total === 0) {
    return
  }
  if (result.failed.length === 0) {
    return
  }
  showToast(`${verb} ${result.succeeded.length} of ${total}`)
}

export function TrashPage() {
  const {
    data,
    e2e,
    reload,
    setE2EControls,
    restoreCampaign,
    restoreSession,
    restoreScene,
    restoreFx,
    restoreSoundscapeCategory,
    purgeCampaign,
    purgeSession,
    purgeScene,
    purgeFx,
    purgeSoundscapeCategory,
    restoreTrashItems,
    purgeTrashItems,
  } = useCampaignData()
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<TrashTab>(() => trashTabFromQuery(searchParams.get('tab')))
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({})
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)

  useEffect(() => {
    setActiveTab(trashTabFromQuery(searchParams.get('tab')))
  }, [searchParams])

  const tabItems = useMemo((): TrashListItem[] => {
    switch (activeTab) {
      case 'campaigns':
        return sortByDaysRemaining(getTrashedCampaigns(data.campaigns)).map((campaign) => ({
          id: campaign.id,
          type: 'campaign',
          title: campaign.name,
          dataLabel: campaign.name,
          deletedAt: campaign.deletedAt!,
        }))
      case 'sessions':
        return sortByDaysRemaining(getTrashedSessions(data.sessions)).map((session) => ({
          id: session.id,
          type: 'session',
          title: session.name
            ? formatSessionContextLabel(session)
            : `Session ${session.number}`,

          dataLabel: `Session ${session.number}`,
          deletedAt: session.deletedAt!,
        }))
      case 'scenes':
        return sortByDaysRemaining(getTrashedScenes(data.scenes)).map((scene) => ({
          id: scene.id,
          type: 'scene',
          title: scene.name,
          dataLabel: scene.name,
          deletedAt: scene.deletedAt!,
        }))
      case 'soundscapes':
        return sortByDaysRemaining(
          (data.soundscapeCategories ?? []).filter((category) => category.deletedAt),
        ).map((category) => ({
          id: category.id,
          type: 'soundscape',
          title: category.name,
          dataLabel: category.name,
          deletedAt: category.deletedAt!,
        }))
      case 'fx':
        return sortByDaysRemaining(getTrashedFxTracks(data.fxTracks)).map((track) => ({
          id: track.id,
          type: 'fx',
          title: track.name,
          dataLabel: track.name,
          deletedAt: track.deletedAt!,
        }))
      default:
        return []
    }
  }, [activeTab, data])

  const tabItemIds = useMemo(() => tabItems.map((item) => item.id), [tabItems])
  const selectedOnTab = useMemo(
    () => tabItemIds.filter((id) => selectedIds.has(id)),
    [selectedIds, tabItemIds],
  )
  const allSelected = tabItems.length > 0 && selectedOnTab.length === tabItems.length
  const someSelected = selectedOnTab.length > 0 && !allSelected
  const tabEmpty = tabItems.length === 0

  const switchTab = (tab: TrashTab) => {
    if (tab === activeTab) {
      return
    }
    setSearchParams({ tab })
    setSelectedIds(new Set())
    setItemErrors({})
  }

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(tabItemIds))
  }

  const applyBulkResult = (result: BulkTrashResult, verb: 'Restored' | 'Purged') => {
    showBulkToast(showToast, verb, result)
    if (result.succeeded.length > 0 || result.failed.length > 0) {
      setItemErrors((current) => {
        const next = { ...current }
        for (const id of result.succeeded) {
          delete next[id]
        }
        for (const failure of result.failed) {
          next[failure.id] = failure.reason
        }
        return next
      })
      setSelectedIds((current) => {
        const next = new Set(current)
        for (const id of result.succeeded) {
          next.delete(id)
        }
        if (result.failed.length > 0) {
          return new Set(result.failed.map((failure) => failure.id))
        }
        return next
      })
    }
  }

  const restoreOne = (id: string) => {
    const item = tabItems.find((entry) => entry.id === id)
    if (!item) {
      return
    }
    switch (item.type) {
      case 'campaign':
        restoreCampaign(id)
        break
      case 'session':
        restoreSession(id)
        break
      case 'scene':
        restoreScene(id)
        break
      case 'soundscape':
        restoreSoundscapeCategory(id)
        break
      case 'fx':
        restoreFx(id)
        break
    }
    setSelectedIds((current) => {
      const next = new Set(current)
      next.delete(id)
      return next
    })
    setItemErrors((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  const purgeOne = (id: string) => {
    const item = tabItems.find((entry) => entry.id === id)
    if (!item) {
      return
    }
    switch (item.type) {
      case 'campaign':
        purgeCampaign(id)
        break
      case 'session':
        purgeSession(id)
        break
      case 'scene':
        purgeScene(id)
        break
      case 'soundscape':
        purgeSoundscapeCategory(id)
        break
      case 'fx':
        purgeFx(id)
        break
    }
    setSelectedIds((current) => {
      const next = new Set(current)
      next.delete(id)
      return next
    })
    setItemErrors((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  const handleConfirm = () => {
    if (!confirmAction) {
      return
    }

    switch (confirmAction.kind) {
      case 'purge-one':
        purgeOne(confirmAction.id)
        break
      case 'purge-selected': {
        const result = purgeTrashItems(activeTab, selectedOnTab)
        applyBulkResult(result, 'Purged')
        break
      }
      case 'purge-all': {
        const result = purgeTrashItems(activeTab, tabItemIds)
        applyBulkResult(result, 'Purged')
        setSelectedIds(new Set())
        break
      }
      case 'restore-all': {
        const result = restoreTrashItems(activeTab, tabItemIds)
        applyBulkResult(result, 'Restored')
        setSelectedIds(new Set())
        break
      }
    }

    setConfirmAction(null)
  }

  const confirmTitle = (() => {
    if (!confirmAction) {
      return ''
    }
    switch (confirmAction.kind) {
      case 'purge-one':
        return `Permanently delete "${confirmAction.title}"?`
      case 'purge-selected':
        return `Permanently delete ${selectedOnTab.length} selected items?`
      case 'purge-all':
        return `Empty Trash on the ${TABS.find((tab) => tab.id === activeTab)?.label ?? 'active'} tab?`
      case 'restore-all':
        return `Restore all items on the ${TABS.find((tab) => tab.id === activeTab)?.label ?? 'active'} tab?`
    }
  })()

  const confirmDescription = (() => {
    if (!confirmAction) {
      return ''
    }
    if (confirmAction.kind === 'restore-all') {
      return 'Selected items will return to their original locations.'
    }
    return 'This action cannot be undone.'
  })()

  if (e2e.trashListState === 'error') {
    return (
      <ScreenLandmark screenName="Trash screen">
        <header className="mb-8">
          <h2 className="font-serif text-3xl text-gold">Trash</h2>
          <p className="mt-2 text-muted">
            Recently deleted items are kept for 7 days before permanent removal.
          </p>
        </header>
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-red-400">Failed to load Trash items.</p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => {
              setE2EControls({ trashListState: 'ready' })
              reload()
            }}
          >
            Retry
          </Button>
        </div>
      </ScreenLandmark>
    )
  }

  return (
    <ScreenLandmark screenName="Trash screen">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-gold">Trash</h2>
          <p
            className="mt-2 text-muted"
            {...(activeTab === 'fx' ? { 'data-fx-retention-notice': true } : {})}
          >
            Recently deleted items are kept for 7 days before permanent removal.
          </p>
        </div>
        {!tabEmpty ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-gold/50 text-gold hover:bg-gold/10"
              data-trash-restore-all
              onClick={() => setConfirmAction({ kind: 'restore-all' })}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Restore All
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              data-trash-empty-trash
              onClick={() => setConfirmAction({ kind: 'purge-all' })}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Empty Trash
            </Button>
          </div>
        ) : null}
      </header>

      <div
        role="tablist"
        aria-label="Trash tabs"
        className="-mx-1 mb-6 flex gap-1 overflow-x-auto overscroll-x-contain border-b border-white/10 px-1 pb-px [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            data-trash-tab={tab.id}
            className={cn(
              'shrink-0 whitespace-nowrap px-3 pb-2 text-sm',
              activeTab === tab.id ? 'border-b-2 border-gold text-gold' : 'text-muted',
            )}
            onClick={() => switchTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section
        aria-label={`Trash ${TABS.find((tab) => tab.id === activeTab)?.label} tab`}
        {...{ [TAB_SECTION_ATTR[activeTab]]: '' }}
      >
        {e2e.trashListState === 'loading' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TrashItemCardSkeleton />
            <TrashItemCardSkeleton />
            <TrashItemCardSkeleton />
          </div>
        ) : tabEmpty ? (
          <TrashEmptyState tab={activeTab} />
        ) : (
          <>
            <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-white">
              <input
                type="checkbox"
                data-trash-select-all
                aria-label={`Select all (${tabItems.length})`}
                checked={allSelected}
                ref={(element) => {
                  if (element) {
                    element.indeterminate = someSelected
                  }
                }}
                className="h-4 w-4 accent-gold"
                onChange={toggleSelectAll}
              />
              Select all ({tabItems.length})
            </label>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tabItems.map((item) => (
                <TrashItemCard
                  key={item.id}
                  id={item.id}
                  type={item.type}
                  title={item.title}
                  dataLabel={item.dataLabel}
                  deletedAt={item.deletedAt}
                  selected={selectedIds.has(item.id)}
                  error={itemErrors[item.id]}
                  onToggleSelect={toggleSelect}
                  onRestore={restoreOne}
                  onPurge={(id) => {
                    const entry = tabItems.find((row) => row.id === id)
                    if (entry) {
                      setConfirmAction({ kind: 'purge-one', id, title: entry.title })
                    }
                  }}
                />
              ))}
            </div>

            <TrashSelectionBar
              selectedCount={selectedOnTab.length}
              onRestoreSelected={() => {
                const result = restoreTrashItems(activeTab, selectedOnTab)
                applyBulkResult(result, 'Restored')
              }}
              onPurgeSelected={() => setConfirmAction({ kind: 'purge-selected' })}
            />
          </>
        )}
      </section>

      <p className="mt-10 text-center font-serif italic text-muted">
        Items in Trash are permanently deleted after 7 days. This cannot be undone.
      </p>

      <AlertDialog open={confirmAction !== null} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent aria-labelledby="trash-confirm-title">
          <AlertDialogHeader>
            <AlertDialogTitle id="trash-confirm-title">{confirmTitle}</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-muted">{confirmDescription}</p>
          <AlertDialogFooter>
            <Button type="button" variant="ghost" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              className={
                confirmAction?.kind === 'restore-all'
                  ? undefined
                  : 'bg-red-600 text-white hover:bg-red-500'
              }
              onClick={handleConfirm}
            >
              {confirmAction?.kind === 'restore-all' ? 'Restore' : 'Confirm'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScreenLandmark>
  )
}
