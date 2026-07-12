import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  addEffectToScene,
  effectTile,
  openSceneTab,
  SCENE_NAME,
  triggerEffect,
} from '../audio/playback'
import {
  clearSeedData,
  createSceneSeed,
  getSceneIdByName,
} from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

async function bootstrapSoundboardScene(page: Page): Promise<string> {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: SCENE_NAME })
  await openSceneTab(page, 'soundboard', sceneId)
  return sceneId
}

async function getEffectOrder(page: Page): Promise<string[]> {
  return page.locator('[data-testid="soundboard-effect-tile"]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-effect-name') ?? ''),
  )
}

async function dragEffectByHandle(
  page: Page,
  sourceName: string,
  targetName: string,
  position: 'first' | 'after' = 'first',
): Promise<void> {
  const source = effectTile(page, sourceName).getByTestId('effect-drag-handle')
  const target = effectTile(page, targetName)
  const box = await target.boundingBox()
  if (!box) throw new Error(`Target effect not found: ${targetName}`)
  const y = position === 'first' ? box.y + 5 : box.y + box.height - 5
  await source.hover()
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2, y)
  await page.mouse.up()
}

Given('the soundboard has effect tiles available for playback', async ({ page }) => {
  const sceneId = await getSceneIdByName(page, SCENE_NAME).catch(async () => bootstrapSoundboardScene(page))
  for (const name of ['Thunder Crack', 'Wolf Howl', 'Whip', 'Dog Bark', 'Owl Hooting']) {
    const exists = (await effectTile(page, name).count()) > 0
    if (!exists) {
      await addEffectToScene(page, sceneId, name)
    }
  }
  await page.reload()
  await page.waitForLoadState('networkidle')
  await page.getByTestId('soundboard-tab').click()
})

Given(/^"([^"]+)" is on the soundboard and idle$/, async ({ page }, effectName: string) => {
  const sceneId = await getSceneIdByName(page, SCENE_NAME).catch(async () => bootstrapSoundboardScene(page))
  await addEffectToScene(page, sceneId, effectName)
  await page.reload()
  await page.waitForLoadState('networkidle')
  await page.getByTestId('soundboard-tab').click()
  await expect(effectTile(page, effectName)).toHaveAttribute('data-playing', 'false')
})

Given(
  /^"([^"]+)" is on the soundboard and idle with a subtle play affordance$/,
  async ({ page }, effectName: string) => {
    const sceneId = await getSceneIdByName(page, SCENE_NAME).catch(async () => bootstrapSoundboardScene(page))
    await addEffectToScene(page, sceneId, effectName)
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.getByTestId('soundboard-tab').click()
    await expect(effectTile(page, effectName).getByTestId('effect-play-icon')).toBeVisible()
  },
)

Given(/^"([^"]+)" is playing with a visible glow$/, async ({ page }, effectName: string) => {
  const sceneId = await getSceneIdByName(page, SCENE_NAME).catch(async () => bootstrapSoundboardScene(page))
  await addEffectToScene(page, sceneId, effectName)
  await page.reload()
  await page.waitForLoadState('networkidle')
  await page.getByTestId('soundboard-tab').click()
  await triggerEffect(page, effectName)
  await expect(effectTile(page, effectName)).toHaveAttribute('data-playing', 'true')
})

Given(
  /^"([^"]+)" and "([^"]+)" are both playing with visible glow$/,
  async ({ page }, first: string, second: string) => {
    const sceneId = await getSceneIdByName(page, SCENE_NAME).catch(async () => bootstrapSoundboardScene(page))
    for (const name of [first, second]) {
      await addEffectToScene(page, sceneId, name)
    }
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.getByTestId('soundboard-tab').click()
    await triggerEffect(page, first)
    await triggerEffect(page, second)
  },
)

Given(/^I have tapped "([^"]+)" and it is currently playing$/, async ({ page }, effectName: string) => {
  const sceneId = await getSceneIdByName(page, SCENE_NAME).catch(async () => bootstrapSoundboardScene(page))
  await addEffectToScene(page, sceneId, effectName)
  await page.reload()
  await page.waitForLoadState('networkidle')
  await page.getByTestId('soundboard-tab').click()
  await triggerEffect(page, effectName)
})

Given(
  /^the soundboard has tiles in the order "([^"]+)", "([^"]+)", "([^"]+)"$/,
  async ({ page }, a: string, b: string, c: string) => {
    const sceneId = await bootstrapSoundboardScene(page)
    for (const name of [a, b, c]) {
      await addEffectToScene(page, sceneId, name)
    }
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.getByTestId('soundboard-tab').click()
  },
)

Given(/^"([^"]+)" is the first tile in the soundboard$/, async ({ page }, effectName: string) => {
  const sceneId = await bootstrapSoundboardScene(page)
  for (const name of ['Wolf Howl', 'Thunder Crack', 'Door Creak']) {
    await addEffectToScene(page, sceneId, name)
  }
  await page.reload()
  await page.waitForLoadState('networkidle')
  await page.getByTestId('soundboard-tab').click()
  await dragEffectByHandle(page, effectName, 'Thunder Crack', 'first')
  await expect.poll(async () => {
    const order = await getEffectOrder(page)
    return order[0]
  }).toBe(effectName)
})

Given(/^"([^"]+)" is currently playing from the soundboard$/, async ({ page }, effectName: string) => {
  const sceneId = await getSceneIdByName(page, SCENE_NAME).catch(async () => bootstrapSoundboardScene(page))
  await addEffectToScene(page, sceneId, effectName)
  await page.reload()
  await page.waitForLoadState('networkidle')
  await page.getByTestId('soundboard-tab').click()
  await triggerEffect(page, effectName)
})

Given(
  /^those tiles show hotkey labels "Num 1", "Num 2", and "Num 3"$/,
  async ({ page }) => {
    await expect(effectTile(page, 'Thunder Crack').getByTestId('effect-hotkey')).toHaveText('Num 1')
    await expect(effectTile(page, 'Wolf Howl').getByTestId('effect-hotkey')).toHaveText('Num 2')
    await expect(effectTile(page, 'Door Creak').getByTestId('effect-hotkey')).toHaveText('Num 3')
  },
)

When(/^I tap the "([^"]+)" effect tile$/, async ({ page }, effectName: string) => {
  await effectTile(page, effectName).getByTestId('effect-tile-body').click()
})

When(/^I tap the "([^"]+)" tile body$/, async ({ page }, effectName: string) => {
  await effectTile(page, effectName).getByTestId('effect-tile-body').click()
})

When(/^I tap the pause icon on the "([^"]+)" tile$/, async ({ page }, effectName: string) => {
  await effectTile(page, effectName).getByRole('button', { name: new RegExp(`Stop all ${effectName}`, 'i') }).click()
})

When(/^I drag "([^"]+)" by its drag handle to the first position$/, async ({ page }, source: string) => {
  const order = await getEffectOrder(page)
  const target = order[0] === source ? order[1] : order[0]
  await dragEffectByHandle(page, source, target, 'first')
})

When('I leave and reopen the scene', async ({ page }) => {
  const sceneId = await getSceneIdByName(page, SCENE_NAME)
  await page.goto('/scenes')
  await page.waitForLoadState('networkidle')
  await page.goto(`/scenes/${sceneId}`)
  await page.waitForLoadState('networkidle')
})

When(
  /^I drag "([^"]+)" by its drag handle to the position after "([^"]+)"$/,
  async ({ page }, source: string, after: string) => {
    await dragEffectByHandle(page, source, after, 'after')
  },
)

When(/^I tap the "([^"]+)" tile body again$/, async ({ page }, effectName: string) => {
  await effectTile(page, effectName).getByTestId('effect-tile-body').click()
})

Then(
  /^the "([^"]+)" sound begins playing before the tile leaves the idle state$/,
  async ({ page }, effectName: string) => {
    await expect.poll(async () =>
      page.evaluate((name) => window.__arcanumIsEffectPlaying?.(name) ?? false, effectName),
    ).toBe(true)
    await expect(effectTile(page, effectName)).toHaveAttribute('data-playing', 'true')
  },
)

Then(/^the "([^"]+)" sound plays$/, async ({ page }, effectName: string) => {
  await expect.poll(async () =>
    page.evaluate((name) => window.__arcanumIsEffectPlaying?.(name) ?? false, effectName),
  ).toBe(true)
})

Then(/^"([^"]+)" and "([^"]+)" play simultaneously$/, async ({ page }, first: string, second: string) => {
  await expect.poll(async () =>
    page.evaluate((name) => window.__arcanumIsEffectPlaying?.(name) ?? false, first),
  ).toBe(true)
  await expect.poll(async () =>
    page.evaluate((name) => window.__arcanumIsEffectPlaying?.(name) ?? false, second),
  ).toBe(true)
})

Then(
  /^the "([^"]+)" tile shows the playing state \(glow or pulse\)$/,
  async ({ page }, effectName: string) => {
    await expect(effectTile(page, effectName)).toHaveAttribute('data-playing', 'true')
  },
)

Then(/^the tile shows a pause icon instead of the idle play affordance$/, async ({ page }) => {
  await expect(page.getByTestId('effect-pause-icon').first()).toBeVisible()
})

Then(/^all "([^"]+)" instances stop$/, async ({ page }, effectName: string) => {
  await expect.poll(async () =>
    page.evaluate((name) => window.__arcanumGetEffectInstanceCount?.(name) ?? 0, effectName),
  ).toBe(0)
})

Then(/^the "([^"]+)" tile no longer glows$/, async ({ page }, effectName: string) => {
  await expect(effectTile(page, effectName)).toHaveAttribute('data-playing', 'false')
})

Then(/^the tile shows the idle play affordance$/, async ({ page }) => {
  await expect(page.getByTestId('effect-play-icon').first()).toBeVisible()
})

Then('neither tile shows the playing glow', async ({ page }) => {
  await expect(page.locator('[data-testid="soundboard-effect-tile"][data-playing="true"]')).toHaveCount(0)
})

Then('both tiles show the idle play affordance', async ({ page }) => {
  await expect(page.getByTestId('effect-play-icon')).toHaveCount(2)
})

Then(/^"([^"]+)" is still the first tile$/, async ({ page }, effectName: string) => {
  await expect.poll(async () => {
    const order = await getEffectOrder(page)
    return order[0]
  }).toBe(effectName)
})

Then(/^"([^"]+)" continues playing uninterrupted$/, async ({ page }, effectName: string) => {
  await expect.poll(async () =>
    page.evaluate((name) => window.__arcanumIsEffectPlaying?.(name) ?? false, effectName),
  ).toBe(true)
})

Then(/^the soundboard order is "([^"]+)", "([^"]+)", "([^"]+)"$/, async ({ page }, a: string, b: string, c: string) => {
  await expect.poll(async () => getEffectOrder(page)).toEqual([a, b, c])
})

Then(/^"([^"]+)" shows hotkey label "([^"]+)"$/, async ({ page }, effectName: string, hotkey: string) => {
  await expect(effectTile(page, effectName).getByTestId('effect-hotkey')).toHaveText(hotkey)
})

Then(
  /^the second "([^"]+)" instance starts from the beginning before the tile leaves the playing state$/,
  async ({ page }, effectName: string) => {
    await expect.poll(async () =>
      page.evaluate((name) => window.__arcanumGetEffectInstanceCount?.(name) ?? 0, effectName),
    ).toBe(2)
    await expect(effectTile(page, effectName)).toHaveAttribute('data-playing', 'true')
  },
)

Then(
  /^the first "([^"]+)" instance continues playing simultaneously$/,
  async ({ page }, effectName: string) => {
    await expect.poll(async () =>
      page.evaluate((name) => window.__arcanumGetEffectInstanceCount?.(name) ?? 0, effectName),
    ).toBe(2)
  },
)

Then(/^a new "([^"]+)" instance starts$/, async ({ page }, effectName: string) => {
  await expect.poll(async () =>
    page.evaluate((name) => window.__arcanumGetEffectInstanceCount?.(name) ?? 0, effectName),
  ).toBeGreaterThan(1)
})

Then(/^"([^"]+)" continues uninterrupted$/, async ({ page }, effectName: string) => {
  await expect.poll(async () =>
    page.evaluate((name) => window.__arcanumIsEffectPlaying?.(name) ?? false, effectName),
  ).toBe(true)
})
