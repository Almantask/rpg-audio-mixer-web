import { Label } from '@/components/ui/label'

export type LibrarySortOrder = 'recently-added' | 'name-asc' | 'name-desc'

interface LibraryFilterSidebarProps {
  mode: 'soundscapes' | 'effects'
  categoryTypes?: string[]
  fxTypes?: string[]
  categoryType?: string
  fxType?: string
  maxBaseIntensity?: number
  sortOrder: LibrarySortOrder
  onCategoryTypeChange?: (value: string) => void
  onFxTypeChange?: (value: string) => void
  onMaxBaseIntensityChange?: (value: number) => void
  onSortOrderChange: (value: LibrarySortOrder) => void
}

const SORT_OPTIONS: LibrarySortOrder[] = ['recently-added', 'name-asc', 'name-desc']

export function LibraryFilterSidebar({
  mode,
  categoryTypes = [],
  fxTypes = [],
  categoryType = 'all',
  fxType = 'all',
  maxBaseIntensity = 3,
  sortOrder,
  onCategoryTypeChange,
  onFxTypeChange,
  onMaxBaseIntensityChange,
  onSortOrderChange,
}: LibraryFilterSidebarProps) {
  return (
    <aside
      aria-label="Library filters"
      className="rounded-lg border border-zinc-800 bg-surface p-4"
      data-testid="library-filter-sidebar"
    >
      {mode === 'soundscapes' ? (
        <div className="space-y-2">
          <Label htmlFor="category-type-filter">Category type</Label>
          <select
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            data-testid="category-type-filter"
            id="category-type-filter"
            onChange={(event) => onCategoryTypeChange?.(event.target.value)}
            value={categoryType}
          >
            <option value="all">All types</option>
            {categoryTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="fx-type-filter">FX type</Label>
            <select
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              data-testid="fx-type-filter"
              id="fx-type-filter"
              onChange={(event) => onFxTypeChange?.(event.target.value)}
              value={fxType}
            >
              <option value="all">All types</option>
              {fxTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="fx-intensity-filter">Base intensity up to</Label>
            <select
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              data-testid="fx-intensity-filter"
              id="fx-intensity-filter"
              onChange={(event) =>
                onMaxBaseIntensityChange?.(Number.parseInt(event.target.value, 10) as 1 | 2 | 3)
              }
              value={maxBaseIntensity}
            >
              <option value="1">I</option>
              <option value="2">II</option>
              <option value="3">III</option>
            </select>
          </div>
        </>
      )}

      <div className="mt-4 space-y-2">
        <Label htmlFor="library-sort-order">Sort order</Label>
        <select
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          data-testid="library-sort-order"
          id="library-sort-order"
          onChange={(event) => onSortOrderChange(event.target.value as LibrarySortOrder)}
          value={sortOrder}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === 'recently-added'
                ? 'Recently Added'
                : option === 'name-asc'
                  ? 'Name A–Z'
                  : 'Name Z–A'}
            </option>
          ))}
        </select>
      </div>
    </aside>
  )
}
