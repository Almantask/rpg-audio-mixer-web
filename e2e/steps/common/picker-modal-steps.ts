import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import { setE2EFlags } from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

function fxPickerCard(page: Page, name: string) {
  return page.locator('[data-testid="fx-picker-card"]', {
    has: page.locator(`[data-effect-name="${name}"]`),
  })
}

function soundscapePickerCard(page: Page, name: string) {
  return page.locator('[data-testid="soundscape-picker-card"]', {
    has: page.locator(`[data-category-name="${name}"]`),
  })
}

function trackPickerItem(page: Page, name: string) {
  return page.locator(`[data-track-name="${name}"]`)
}

function pickerItem(page: Page, name: string) {
  return fxPickerCard(page, name).or(soundscapePickerCard(page, name)).or(trackPickerItem(page, name))
}

async function checkInPicker(page: Page, name: string): Promise<void> {
  const fx = fxPickerCard(page, name)
  if (await fx.count()) {
    await fx.getByRole('checkbox').check()
    return
  }
  const soundscape = soundscapePickerCard(page, name)
  if (await soundscape.count()) {
    await soundscape.getByRole('checkbox').check()
    return
  }
  await trackPickerItem(page, name).getByRole('checkbox').check()
}

async function tapPickerCardBody(page: Page, name: string): Promise<void> {
  const fx = fxPickerCard(page, name)
  if (await fx.count()) {
    await fx.getByTestId('fx-picker-card-body').click()
    return
  }
  const soundscape = soundscapePickerCard(page, name)
  if (await soundscape.count()) {
    await soundscape.locator('button').last().click()
    return
  }
  await trackPickerItem(page, name).getByRole('button').first().click()
}

async function startPickerPreview(page: Page, name: string): Promise<void> {
  await tapPickerCardBody(page, name)
  const item = pickerItem(page, name)
  if (await item.getAttribute('data-previewing')) {
    await expect(item).toHaveAttribute('data-previewing', 'true')
  }
}

Given(/^"([^"]+)" is previewing in the picker$/, async ({ page }, name: string) => {
  await startPickerPreview(page, name)
})

Given(/^I have added "([^"]+)" and "([^"]+)" via Add Selected$/, async ({ page }, a: string, b: string) => {
  for (const name of [a, b]) {
    await checkInPicker(page, name)
  }
  await page.getByTestId('picker-add-selected').click()
})

Given(/^I have checked "([^"]+)" in the picker$/, async ({ page }, name: string) => {
  await checkInPicker(page, name)
})

When(/^I type "([^"]+)" in the picker search bar$/, async ({ page }, query: string) => {
  const search = page.getByTestId('picker-search').or(page.getByLabel('Search tracks in picker'))
  await search.fill(query)
})

When(/^I check "([^"]+)" in the picker$/, async ({ page }, name: string) => {
  await checkInPicker(page, name)
})

When(/^I tap the card body for "([^"]+)"$/, async ({ page }, name: string) => {
  await tapPickerCardBody(page, name)
})

When(/^I tap the card body for "([^"]+)" again$/, async ({ page }, name: string) => {
  await tapPickerCardBody(page, name)
})

When(/^I tap the back link "Back to Active Scene"$/, async ({ page }) => {
  await page.getByTestId('picker-back-link').click()
})

When(/^I use the clear-filters action in the picker$/, async ({ page }) => {
  await page.getByTestId('picker-clear-filters').click()
})

Then(/^I do not see "([^"]+)" in the picker grid$/, async ({ page }, name: string) => {
  await expect(pickerItem(page, name)).toHaveCount(0)
})

Then(/^"([^"]+)" begins previewing in the picker$/, async ({ page }, name: string) => {
  await expect(pickerItem(page, name)).toHaveAttribute('data-previewing', 'true')
})

Then(/^"([^"]+)" stops previewing$/, async ({ page }, name: string) => {
  const item = pickerItem(page, name)
  if (await item.count()) {
    await expect(item).toHaveAttribute('data-previewing', 'false')
    return
  }
  await expect(page.locator(`[data-track-name="${name}"][data-previewing="true"]`)).toHaveCount(0)
})

Given('the soundscape library is still loading', async ({ page }) => {
  await setE2EFlags(page, { tracksLoading: true, soundscapesLoading: true })
})
