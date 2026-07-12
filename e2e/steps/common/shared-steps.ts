import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { clearSeedData } from '../../support/fixtures/seed-data'

const { Given, Then, When } = createBdd()

function itemInPickerGrid(page: Page, name: string) {
  return page
    .getByTestId('picker-grid')
    .getByText(name, { exact: true })
    .or(page.locator(`[data-track-name="${name}"]`))
    .or(
      page.locator('[data-testid="fx-picker-card"]', {
        has: page.locator(`[data-effect-name="${name}"]`),
      }),
    )
    .or(
      page.locator('[data-testid="soundscape-picker-card"]', {
        has: page.locator(`[data-category-name="${name}"]`),
      }),
    )
}

function namedCard(page: Page, name: string) {
  return page
    .locator('[data-testid="soundscape-category-card"]', {
      has: page.locator(`[data-category-name="${name}"]`),
    })
    .or(
      page.locator('[data-testid="soundscape-picker-card"]', {
        has: page.locator(`[data-category-name="${name}"]`),
      }),
    )
}

Given('I have no campaigns', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
})

Then(/^I see the sessions list for "([^"]+)"$/, async ({ page }, campaignName: string) => {
  await expect(page.getByRole('heading', { level: 1, name: campaignName })).toBeVisible()
  await expect(page.getByTestId('sessions-list')).toBeVisible()
})

Then(/^I see the subtitle "([^"]+)"$/, async ({ page }, subtitle: string) => {
  await expect(page.getByText(subtitle, { exact: true })).toBeVisible()
})

Then(/^I see "([^"]+)"$/, async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: true }).first()).toBeVisible()
})

Then(/^I see a "([^"]+)" button$/, async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible()
})

Then(/^I see a toast "([^"]+)"$/, async ({ page }, message: string) => {
  await expect(page.getByText(message)).toBeVisible()
})

Then(/^I see the title "([^"]+)"$/, async ({ page }, title: string) => {
  await expect(
    page.getByRole('heading', { name: title }).or(page.getByText(title, { exact: true })),
  ).toBeVisible()
})

Then(/^I see a back link "([^"]+)"$/, async ({ page }, label: string) => {
  await expect(
    page
      .getByRole('button', { name: label, exact: true })
      .or(page.getByRole('button', { name: new RegExp(label) })),
  ).toBeVisible()
})

Then('I see a clear-filters action', async ({ page }) => {
  await expect(
    page.getByTestId('picker-clear-filters').or(page.getByRole('button', { name: /clear filters/i })),
  ).toBeVisible()
})

Then(/^I see "([^"]+)" in the picker grid$/, async ({ page }, name: string) => {
  await expect(itemInPickerGrid(page, name)).toBeVisible()
})

Then(/^But I see "([^"]+)" in the picker grid$/, async ({ page }, name: string) => {
  await expect(itemInPickerGrid(page, name)).toBeVisible()
})

Then(/^the "([^"]+)" card shows "([^"]+)"$/, async ({ page }, name: string, text: string) => {
  await expect(namedCard(page, name)).toContainText(text)
})

Then(/^"([^"]+)" is no longer shown in "([^"]+)"$/, async ({ page }, name: string, container: string) => {
  const levelRow = page.locator(`[data-level="${container}"]`).getByText(name)
  if (await levelRow.count()) {
    await expect(levelRow).toHaveCount(0)
    return
  }
  await expect(page.locator(`[data-scene-name="${name}"]`)).toHaveCount(0)
})

Then('I see a scrollable error overlay with a semi-transparent backdrop', async ({ page }) => {
  await expect(page.getByTestId('error-overlay')).toBeVisible()
})

Then('I see skeleton placeholder cards in the grid', async ({ page }) => {
  await expect(
    page
      .getByRole('status', { name: 'Loading soundscape categories' })
      .or(page.getByTestId('fx-grid-skeleton')),
  ).toBeVisible()
})

Then(/^the "([^"]+)" button is disabled$/, async ({ page }, label: string) => {
  const addSelected = label.match(/^Add Selected \((\d+)\)$/)
  if (addSelected) {
    await expect(page.getByRole('button', { name: label })).toBeDisabled()
    return
  }
  if (label === 'Add Soundscape') {
    await expect(page.getByTestId('add-soundscape-button')).toBeDisabled()
    return
  }
  if (label === 'Add Sound') {
    await page.getByTestId('soundboard-tab').click()
    await expect(page.getByTestId('add-sound-button')).toBeDisabled()
    return
  }
  await expect(page.getByRole('button', { name: label })).toBeDisabled()
})

Then(/^the "([^"]+)" button is enabled$/, async ({ page }, label: string) => {
  const addSelected = label.match(/^Add Selected \((\d+)\)$/)
  if (addSelected) {
    await expect(page.getByRole('button', { name: label })).toBeEnabled()
    return
  }
  await expect(page.getByRole('button', { name: label })).toBeEnabled()
})

Then(/^the "([^"]+)" button is not available$/, async ({ page }, label: string) => {
  if (label === 'Add Selected') {
    await expect(page.getByTestId('picker-add-selected')).toHaveCount(0)
    return
  }
  await expect(page.getByRole('button', { name: label })).toHaveCount(0)
})

When('I tap {string}', async ({ page }, label: string) => {
  if (label === 'Play Scene') {
    await page.getByTestId('play-scene-button').click()
    return
  }
  const button = page.getByRole('button', { name: label, exact: true })
  if (await button.count()) {
    await button.click()
    return
  }
  await page.getByRole('link', { name: label, exact: true }).click()
})

When(/^I tap the "([^"]+)" card body$/, async ({ page }, name: string) => {
  const fxCard = page.locator('[data-testid="fx-track-card"]', {
    has: page.locator(`[data-effect-name="${name}"]`),
  })
  if (await fxCard.count()) {
    await fxCard.getByTestId('fx-track-body').click()
    return
  }
  await namedCard(page, name).getByRole('heading', { level: 3, name }).click()
  await page.waitForLoadState('networkidle')
})

When(/^I preview "([^"]+)" from its card$/, async ({ page }, name: string) => {
  const fxCard = page.locator('[data-testid="fx-track-card"]', {
    has: page.locator(`[data-effect-name="${name}"]`),
  })
  if (await fxCard.count()) {
    await fxCard.getByTestId('fx-track-body').click()
    return
  }
  await namedCard(page, name).getByRole('button', { name: `Preview ${name}` }).click()
})

Then(/^the "([^"]+)" card no longer shows a playing preview state$/, async ({ page }, name: string) => {
  await expect(
    namedCard(page, name).or(
      page.locator('[data-testid="fx-track-card"]', {
        has: page.locator(`[data-effect-name="${name}"]`),
      }),
    ),
  ).not.toContainText('● PLAYING')
})
