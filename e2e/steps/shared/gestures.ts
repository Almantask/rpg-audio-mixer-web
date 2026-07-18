import type { Locator } from '@playwright/test'

const SWIPE_START_X = 10
const SWIPE_END_X = 100

export async function swipeRight(target: Locator): Promise<void> {
  await target.waitFor({ state: 'visible' })
  await target.evaluate(
    (element, { startX, endX }) => {
      const touchStart = new Event('touchstart', { bubbles: true })
      Object.defineProperty(touchStart, 'touches', {
        value: [{ clientX: startX }],
      })
      element.dispatchEvent(touchStart)

      const touchEnd = new Event('touchend', { bubbles: true })
      Object.defineProperty(touchEnd, 'changedTouches', {
        value: [{ clientX: endX }],
      })
      element.dispatchEvent(touchEnd)
    },
    { startX: SWIPE_START_X, endX: SWIPE_END_X },
  )
}
