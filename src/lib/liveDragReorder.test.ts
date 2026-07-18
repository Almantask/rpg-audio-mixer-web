import { describe, expect, it } from 'vitest'
import {
  reorderIdsByIndex,
  reorderIdsForDragOver,
  resolveDragReorderIndex,
} from '@/lib/liveDragReorder'

const rect = { top: 100, left: 40, width: 200, height: 80 }

describe('resolveDragReorderIndex', () => {
  it('returns null when indices match', () => {
    expect(resolveDragReorderIndex(1, 1, { x: 50, y: 140 }, rect)).toBeNull()
  })

  it('allows downward reorder once pointer passes the midpoint', () => {
    expect(resolveDragReorderIndex(0, 2, { x: 50, y: 150 }, rect, 'y')).toBe(2)
  })

  it('blocks downward reorder while pointer is still in the upper half', () => {
    expect(resolveDragReorderIndex(0, 2, { x: 50, y: 120 }, rect, 'y')).toBeNull()
  })

  it('allows upward reorder once pointer is above the midpoint', () => {
    expect(resolveDragReorderIndex(2, 0, { x: 50, y: 120 }, rect, 'y')).toBe(0)
  })

  it('blocks upward reorder while pointer is still in the lower half', () => {
    expect(resolveDragReorderIndex(2, 0, { x: 50, y: 150 }, rect, 'y')).toBeNull()
  })

  it('skips midpoint gates for synthetic events with zero pointer coords', () => {
    expect(resolveDragReorderIndex(0, 2, { x: 0, y: 0 }, rect, 'y')).toBe(2)
    expect(resolveDragReorderIndex(2, 0, { x: 0, y: 0 }, rect, 'y')).toBe(0)
  })

  it('uses 2D midpoint hysteresis for grid axis', () => {
    expect(resolveDragReorderIndex(0, 2, { x: 50, y: 120 }, rect, 'xy')).toBeNull()
    expect(resolveDragReorderIndex(0, 2, { x: 180, y: 150 }, rect, 'xy')).toBe(2)
  })
})

describe('reorderIdsForDragOver', () => {
  const ids = ['a', 'b', 'c']

  it('moves an id downward across the midpoint', () => {
    expect(reorderIdsForDragOver(ids, 'a', 'c', { x: 50, y: 150 }, rect, 'y')).toEqual([
      'b',
      'c',
      'a',
    ])
  })

  it('moves an id back upward (bidirectional)', () => {
    const afterDown = ['b', 'c', 'a']
    expect(reorderIdsForDragOver(afterDown, 'a', 'b', { x: 50, y: 120 }, rect, 'y')).toEqual([
      'a',
      'b',
      'c',
    ])
  })

  it('returns null when midpoint hysteresis says wait', () => {
    expect(reorderIdsForDragOver(ids, 'a', 'c', { x: 50, y: 120 }, rect, 'y')).toBeNull()
  })

  it('returns null when order would be unchanged', () => {
    expect(reorderIdsForDragOver(ids, 'a', 'a', { x: 50, y: 150 }, rect, 'y')).toBeNull()
  })
})

describe('reorderIdsByIndex', () => {
  it('moves an item to a new index', () => {
    expect(reorderIdsByIndex(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a'])
    expect(reorderIdsByIndex(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b'])
  })
})
