export type DragAxis = 'y' | 'xy'

export interface DragPointer {
  x: number
  y: number
}

export interface DragTargetRect {
  top: number
  left: number
  width: number
  height: number
}

/**
 * Returns the index to move `fromIndex` to while dragging over `overIndex`,
 * or null when the list should not change yet (midpoint hysteresis).
 *
 * Synthetic drag events (clientX/clientY both 0) skip midpoint gates so
 * Playwright/jsdom reorder still commits on dragover.
 */
export function resolveDragReorderIndex(
  fromIndex: number,
  overIndex: number,
  pointer: DragPointer,
  rect: DragTargetRect,
  axis: DragAxis = 'y',
): number | null {
  if (fromIndex < 0 || overIndex < 0 || fromIndex === overIndex) {
    return null
  }

  const pointerActive = pointer.x !== 0 || pointer.y !== 0
  if (pointerActive) {
    const midY = rect.top + rect.height / 2
    const midX = rect.left + rect.width / 2

    if (axis === 'y') {
      if (fromIndex < overIndex && pointer.y < midY) {
        return null
      }
      if (fromIndex > overIndex && pointer.y > midY) {
        return null
      }
    } else {
      // Grid: require the pointer to cross the tile center in the drag direction.
      if (fromIndex < overIndex && pointer.y < midY && pointer.x < midX) {
        return null
      }
      if (fromIndex > overIndex && pointer.y > midY && pointer.x > midX) {
        return null
      }
    }
  }

  return overIndex
}

export function reorderIdsByIndex(ids: readonly string[], fromIndex: number, toIndex: number): string[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
    return [...ids]
  }
  const next = [...ids]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

export function reorderIdsForDragOver(
  ids: readonly string[],
  sourceId: string,
  overId: string,
  pointer: DragPointer,
  rect: DragTargetRect,
  axis: DragAxis = 'y',
): string[] | null {
  const fromIndex = ids.indexOf(sourceId)
  const overIndex = ids.indexOf(overId)
  const toIndex = resolveDragReorderIndex(fromIndex, overIndex, pointer, rect, axis)
  if (toIndex === null) {
    return null
  }
  const next = reorderIdsByIndex(ids, fromIndex, toIndex)
  if (next.every((id, index) => id === ids[index])) {
    return null
  }
  return next
}
