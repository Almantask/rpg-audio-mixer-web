import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Then } = createBdd()

Then('{string} appears above {string}', async ({ page }, first: string, second: string) => {
  const sceneFirst = page.locator(`[data-session-scene-title="${first}"], [data-scene-title="${first}"]`).first()
  if ((await sceneFirst.count()) > 0) {
    const firstIndex = await page
      .locator('[data-session-scene-title], [data-scene-title]')
      .evaluateAll((elements, target) => {
        return elements.findIndex((element) => element.textContent?.trim() === target)
      }, first)
    const secondIndex = await page
      .locator('[data-session-scene-title], [data-scene-title]')
      .evaluateAll((elements, target) => {
        return elements.findIndex((element) => element.textContent?.trim() === target)
      }, second)
    expect(firstIndex).toBeGreaterThanOrEqual(0)
    expect(secondIndex).toBeGreaterThanOrEqual(0)
    expect(firstIndex).toBeLessThan(secondIndex)
    return
  }

  const firstLocator = page
    .locator(`[data-campaign-title="${first}"], [data-session-number="${first}"]`)
    .first()
  const secondLocator = page
    .locator(`[data-campaign-title="${second}"], [data-session-number="${second}"]`)
    .first()

  const isCampaignOrder = (await page.locator(`[data-campaign-title="${first}"]`).count()) > 0

  if (isCampaignOrder) {
    const firstBox = await firstLocator.boundingBox()
    const secondBox = await secondLocator.boundingBox()
    expect(firstBox && secondBox && firstBox.y < secondBox.y).toBeTruthy()
    return
  }

  const firstIndex = await page
    .locator('[data-session-number]')
    .evaluateAll((elements, target) => {
      return elements.findIndex((element) => element.textContent?.trim() === target)
    }, first)
  const secondIndex = await page
    .locator('[data-session-number]')
    .evaluateAll((elements, target) => {
      return elements.findIndex((element) => element.textContent?.trim() === target)
    }, second)

  expect(firstIndex).toBeGreaterThanOrEqual(0)
  expect(secondIndex).toBeGreaterThanOrEqual(0)
  expect(firstIndex).toBeLessThan(secondIndex)
})
