import { render, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { FxTagList } from '@/components/library/FxTagList'

function stubLayout(clientWidth: number, chipWidth: number) {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => clientWidth,
  })
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get: () => chipWidth,
  })
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn()
      disconnect = vi.fn()
      unobserve = vi.fn()
    },
  )
}

function visibleRow(container: HTMLElement) {
  const rows = container.querySelectorAll('.flex.min-w-0.flex-nowrap')
  return rows[rows.length - 1] as HTMLElement
}

describe('FxTagList', () => {
  it('renders every tag when they fit', () => {
    stubLayout(400, 60)

    const { container } = render(<FxTagList tags={['Combat', 'Creature']} />)
    const row = within(visibleRow(container))

    expect(row.getByText('COMBAT')).toBeVisible()
    expect(row.getByText('CREATURE')).toBeVisible()
    expect(row.queryByText(/\+\d+ more/)).toBeNull()
  })

  it('collapses overflow tags into +N more', () => {
    stubLayout(80, 50)

    const { container } = render(
      <FxTagList tags={['Combat', 'Impact', 'Creature', 'Magic']} />,
    )
    const row = within(visibleRow(container))

    expect(row.getByText('COMBAT')).toBeVisible()
    expect(row.getByText(/\+3 more/)).toBeVisible()
    expect(row.queryByText('IMPACT')).toBeNull()
  })
})
