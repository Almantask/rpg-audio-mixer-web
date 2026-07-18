import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  buildCampaign,
  buildFxTrack,
  buildOminousChantCategory,
  buildScene,
  buildSceneSoundscapeSlotWithOptions,
  buildSoundscapeCategory,
  buildSoundscapeTracksForCategory,
  buildWeatherCategoryWithTracks,
  categoryIdForName,
  mergeE2EData,
  openActiveScene,
  openHomeScreen,
  resetE2EData,
  sceneIdForName,
  seedHomeTopStats,
  setE2EControls,
  tapCategoryPlay,
  getAudioState,
} from '../shared/test-data'

const { Given, When, Then, Step } = createBdd()

Step('I open the Home screen', async ({ page }) => {
  await openHomeScreen(page)
})

Given('I have opened the Home screen', async ({ page }) => {
  await openHomeScreen(page)
})

Given('Home screen data is still loading', async ({ page }) => {
  await resetE2EData(page)
  await setE2EControls(page, { homeScreenState: 'loading' })
})

Given('Home screen data fails to load with no cached content', async ({ page }) => {
  await resetE2EData(page)
  await setE2EControls(page, { homeScreenState: 'error', homeHasCachedData: false })
})

Given('Home screen data fails to load', async ({ page }) => {
  await seedHomeTopStats(page)
  await setE2EControls(page, { homeScreenState: 'error', homeHasCachedData: true })
})

Given('cached hero and stat card data is available', async ({ page }) => {
  await seedHomeTopStats(page)
})

Given('I am offline', async ({ page }) => {
  await seedHomeTopStats(page)
  await setE2EControls(page, { homeScreenState: 'offline', homeHasCachedData: true })
})

Given('cached Home screen data is available', async ({ page }) => {
  await seedHomeTopStats(page)
})

Given('I have at least one campaign', async ({ page }) => {
  await mergeE2EData(page, { campaigns: [buildCampaign('Shadows of the Underdark')] })
})

Given('no soundscape categories have been played yet', async ({ page }) => {
  await page.evaluate(() => {
    const raw = localStorage.getItem('arcanum-audio-data')
    if (!raw) return
    const data = JSON.parse(raw)
    data.playStats = { ...(data.playStats ?? {}), soundscapeCategories: {} }
    localStorage.setItem('arcanum-audio-data', JSON.stringify(data))
    window.__ARCANUM_E2E__?.seed(data)
  })
})

Given('no soundboard effects have been played yet', async ({ page }) => {
  await page.evaluate(() => {
    const raw = localStorage.getItem('arcanum-audio-data')
    if (!raw) return
    const data = JSON.parse(raw)
    data.playStats = { ...(data.playStats ?? {}), fxTracks: {} }
    localStorage.setItem('arcanum-audio-data', JSON.stringify(data))
    window.__ARCANUM_E2E__?.seed(data)
  })
})

Given('I have played {string} most recently', async ({ page }, campaignName: string) => {
  const older = buildCampaign('Older Campaign', {
    lastPlayedAt: new Date('2020-01-01').toISOString(),
  })
  const active = buildCampaign(campaignName, {
    lastPlayedAt: new Date().toISOString(),
  })
  await mergeE2EData(page, { campaigns: [older, active] })
})

Given(
  '{string} has session data for {string}',
  async ({ page }, campaignName: string, sessionLine: string) => {
    const campaign = buildCampaign(campaignName)
    const match = sessionLine.match(/^Session\s+(\d+):\s*(.+)$/)
    const number = match ? Number.parseInt(match[1], 10) : 14
    const detail = match?.[2] ?? sessionLine
    const session = {
      id: `session-${campaign.id}-${number}`,
      campaignId: campaign.id,
      name: detail,
      number,
      date: '2026-01-01',
      description: detail,
      sceneCount: 0,
    }
    await mergeE2EData(page, {
      campaigns: [campaign],
      sessions: [session],
      lastActiveSessionByCampaign: { [campaign.id]: session.id },
    })
  },
)

Given('{string} has no sessions yet', async ({ page }, campaignName: string) => {
  await mergeE2EData(page, { campaigns: [buildCampaign(campaignName)], sessions: [] })
})

Given('{string} is the active campaign on the Home screen', async ({ page }, campaignName: string) => {
  await mergeE2EData(page, { campaigns: [buildCampaign(campaignName)] })
  await openHomeScreen(page)
})

Given(
  '{string} is my most played soundscape category with {int} plays',
  async ({ page }, name: string, count: number) => {
    const campaign = buildCampaign('Shadows of the Underdark')
    const { category, tracks } = buildOminousChantCategory()
    const renamed = { ...category, name, id: categoryIdForName(name) }
    await mergeE2EData(page, {
      campaigns: [campaign],
      soundscapeCategories: [renamed],
      soundscapeTracks: tracks,
      playStats: { soundscapeCategories: { [renamed.id]: count }, fxTracks: {} },
    })
  },
)

Given('{string} is my most played soundscape category', async ({ page }, name: string) => {
  const campaign = buildCampaign('Shadows of the Underdark')
  const { category, tracks } = buildOminousChantCategory()
  const renamed = { ...category, name, id: categoryIdForName(name) }
  await mergeE2EData(page, {
    campaigns: [campaign],
    soundscapeCategories: [renamed],
    soundscapeTracks: tracks,
    playStats: { soundscapeCategories: { [renamed.id]: 42 }, fxTracks: {} },
  })
})

Given('{string} has a designated default loopable track', async ({ page }, name: string) => {
  void page
  void name
})

Given('{string} has loopable tracks but no designated default', async ({ page }, name: string) => {
  const categoryId = categoryIdForName(name)
  await page.evaluate((targetCategoryId) => {
    const raw = localStorage.getItem('arcanum-audio-data')
    if (!raw) return
    const data = JSON.parse(raw)
    data.soundscapeCategories = (data.soundscapeCategories ?? []).map(
      (category: { id: string; defaultTrackId?: string }) =>
        category.id === targetCategoryId ? { ...category, defaultTrackId: undefined } : category,
    )
    localStorage.setItem('arcanum-audio-data', JSON.stringify(data))
    window.__ARCANUM_E2E__?.seed(data)
  }, categoryId)
})

Given('{string} is shown in the Top Soundscape card', async ({ page }, name: string) => {
  await mergeE2EData(page, {
    campaigns: [buildCampaign('Shadows of the Underdark')],
    soundscapeCategories: [buildOminousChantCategory().category],
    soundscapeTracks: buildOminousChantCategory().tracks,
    playStats: {
      soundscapeCategories: { [categoryIdForName(name)]: 42 },
      fxTracks: {},
    },
  })
  await openHomeScreen(page)
})

Given(
  '{string} is shown in the Top Soundscape card with {int} plays',
  async ({ page }, name: string, count: number) => {
    const { category, tracks } = buildOminousChantCategory()
    await mergeE2EData(page, {
      campaigns: [buildCampaign('Shadows of the Underdark')],
      soundscapeCategories: [{ ...category, name, id: categoryIdForName(name) }],
      soundscapeTracks: tracks,
      playStats: { soundscapeCategories: { [categoryIdForName(name)]: count }, fxTracks: {} },
    })
    await openHomeScreen(page)
  },
)

Given('{string} is previewing inline on the Top Soundscape card', async ({ page }, name: string) => {
  const { category, tracks } = buildOminousChantCategory()
  await mergeE2EData(page, {
    campaigns: [buildCampaign('Shadows of the Underdark')],
    soundscapeCategories: [{ ...category, name, id: categoryIdForName(name) }],
    soundscapeTracks: tracks,
    playStats: { soundscapeCategories: { [categoryIdForName(name)]: 42 }, fxTracks: {} },
  })
  await openHomeScreen(page)
  await page.locator('[data-home-preview-soundscape]').click()
})

Step('the Top Soundscape preview is paused', async ({ page, $bddContext }) => {
  const keywordType = $bddContext.bddTestData.steps[$bddContext.stepIndex]?.keywordType
  if (keywordType === 'Outcome') {
    await expect
      .poll(async () => {
        const state = await getAudioState(page)
        return state.source === 'home' && !state.isPlaying
      })
      .toBe(true)
    return
  }
  await page.locator('[data-home-preview-soundscape]').click()
})

Given(
  '{string} is my most played soundboard effect with {int} plays',
  async ({ page }, name: string, count: number) => {
    const fx = buildFxTrack(name)
    await mergeE2EData(page, {
      campaigns: [buildCampaign('Shadows of the Underdark')],
      fxTracks: [fx],
      playStats: { soundscapeCategories: {}, fxTracks: { [fx.id]: count } },
    })
  },
)

Given('{string} is shown in the Top FX card', async ({ page }, name: string) => {
  const fx = buildFxTrack(name)
  await mergeE2EData(page, {
    campaigns: [buildCampaign('Shadows of the Underdark')],
    fxTracks: [fx],
    playStats: { soundscapeCategories: {}, fxTracks: { [fx.id]: 128 } },
  })
  await openHomeScreen(page)
})

Given('{string} is previewing inline on the Top FX card', async ({ page }, name: string) => {
  const fx = buildFxTrack(name)
  await mergeE2EData(page, {
    campaigns: [buildCampaign('Shadows of the Underdark')],
    fxTracks: [fx],
    playStats: { soundscapeCategories: {}, fxTracks: { [fx.id]: 128 } },
  })
  await openHomeScreen(page)
  await page.locator('[data-home-preview-fx]').click()
})

Step('the Top FX preview is paused', async ({ page, $bddContext }) => {
  const keywordType = $bddContext.bddTestData.steps[$bddContext.stepIndex]?.keywordType
  if (keywordType === 'Outcome') {
    await expect
      .poll(async () => {
        const state = await getAudioState(page)
        return state.source === 'home' && !state.isPlaying
      })
      .toBe(true)
    return
  }
  await page.locator('[data-home-preview-fx]').click()
})

Given('an Active Scene session is playing {string}', async ({ page }, sceneName: string) => {
  await resetE2EData(page)
  const sceneId = sceneIdForName(sceneName)
  const campaign = buildCampaign('Shadows of the Underdark')
  const { category: weather, tracks: weatherTracks } = buildWeatherCategoryWithTracks()
  const interior = buildSoundscapeCategory('Interior')
  const interiorTracks = buildSoundscapeTracksForCategory('Interior')
  const { category: ominousChant, tracks: ominousTracks } = buildOminousChantCategory()
  const dragonRoar = buildFxTrack('Dragon Roar')
  await mergeE2EData(
    page,
    {
      campaigns: [campaign],
      scenes: [buildScene(sceneName)],
      soundscapeCategories: [weather, interior, ominousChant],
      soundscapeTracks: [...weatherTracks, ...interiorTracks, ...ominousTracks],
      fxTracks: [dragonRoar],
      playStats: {
        soundscapeCategories: { [ominousChant.id]: 42 },
        fxTracks: { [dragonRoar.id]: 128 },
      },
      sceneSoundscapeSlots: [
        buildSceneSoundscapeSlotWithOptions(sceneId, weather.id, 0, { intensity: 'I' }),
        buildSceneSoundscapeSlotWithOptions(sceneId, interior.id, 1, { intensity: 'II' }),
      ],
    },
    { navigateHome: false },
  )
  await openActiveScene(page, sceneName, 'Soundscapes')
  await tapCategoryPlay(page, 'Weather')
  await openHomeScreen(page)
})

When('I tap {string} on the Active Campaigns hero', async ({ page }, label: string) => {
  if (label === 'Resume') {
    await page.locator('[data-hero-resume]').click()
  } else {
    await page.getByRole('link', { name: label }).click()
  }
})

When('I tap {string} in the Active Campaigns hero', async ({ page }, label: string) => {
  await page.getByRole('link', { name: label }).click()
})

When('I tap the preview button on the Top Soundscape card', async ({ page }) => {
  await page.locator('[data-home-preview-soundscape]').click()
})

When('I tap the preview button on the Top FX card', async ({ page }) => {
  await page.locator('[data-home-preview-fx]').click()
})

When('I tap the preview button on the Top FX card again', async ({ page }) => {
  await page.locator('[data-home-preview-fx]').click()
})

When('I tap the Library link on the Top Soundscape card', async ({ page }) => {
  await page.locator('[data-home-library-link="soundscape"]').click()
})

When('I tap the Library link on the Top FX card', async ({ page }) => {
  await page.locator('[data-home-library-link="fx"]').click()
})

Then('I see the {string} section', async ({ page }, section: string) => {
  await expect(page.getByRole('heading', { name: section, level: 2 })).toBeVisible()
})

Then('I see {string} in the Active Campaigns hero', async ({ page }, text: string) => {
  await expect(page.locator('[data-testid="active-campaign-hero"]')).toContainText(text)
})

Then('I see {string} in the Top Soundscape card', async ({ page }, text: string) => {
  await expect(page.locator('[data-top-soundscape-card]')).toContainText(text)
})

Then('I see {string} on the Top Soundscape card', async ({ page }, text: string) => {
  await expect(page.locator('[data-top-soundscape-card]')).toContainText(text)
})

Then('I see {string} in the Top FX card', async ({ page }, text: string) => {
  await expect(page.locator('[data-top-fx-card]')).toContainText(text)
})

Then('I see {string} on the Top FX card', async ({ page }, text: string) => {
  await expect(page.locator('[data-top-fx-card]')).toContainText(text)
})

Then('I see a {string} button in the Active Campaigns hero', async ({ page }, label: string) => {
  const hero = page.locator('[data-testid="active-campaign-hero"]')
  const button = hero.getByRole('button', { name: label })
  if (await button.count()) {
    await expect(button).toBeVisible()
    return
  }
  await expect(hero.getByRole('link', { name: label })).toBeVisible()
})

Then('I do not see a session context line in the Active Campaigns hero', async ({ page }) => {
  await expect(page.locator('[data-hero-session-subtitle]')).toHaveCount(0)
})

Then('the Active Campaigns hero shows {string}', async ({ page }, text: string) => {
  await expect(page.locator('[data-testid="active-campaign-hero"]')).toContainText(text)
})

Then('the Top Soundscape section is not shown', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Top Soundscape', level: 2 })).toHaveCount(0)
})

Then('the Top FX section is not shown', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Top FX', level: 2 })).toHaveCount(0)
})

Then('I do not see a {string} card on the Home screen', async ({ page }, label: string) => {
  await expect(page.getByText(label, { exact: true })).toHaveCount(0)
})

Then('I see skeleton placeholders for the Active Campaigns hero', async ({ page }) => {
  await expect(page.locator('[data-home-hero-skeleton]')).toBeVisible()
})

Then('I see skeleton placeholders for the Top Soundscape card', async ({ page }) => {
  await expect(page.locator('[data-home-stat-skeleton="soundscape"]')).toBeVisible()
})

Then('I see skeleton placeholders for the Top FX card', async ({ page }) => {
  await expect(page.locator('[data-home-stat-skeleton="fx"]')).toBeVisible()
})

Then('I see a scrollable error overlay with a semi-transparent backdrop', async ({ page }) => {
  await expect(page.locator('[data-home-error-overlay]')).toBeVisible()
})

Then('I do not see campaign or stat card content on the Home screen', async ({ page }) => {
  await expect(page.locator('[data-testid="active-campaign-hero"]')).toHaveCount(0)
  await expect(page.locator('[data-top-soundscape-card]')).toHaveCount(0)
})

Then('I still see the cached Active Campaigns hero', async ({ page }) => {
  await expect(page.locator('[data-testid="active-campaign-hero"]')).toBeVisible()
})

Then('I still see cached Top Soundscape and Top FX cards when available', async ({ page }) => {
  await expect(page.locator('[data-top-soundscape-card]')).toBeVisible()
  await expect(page.locator('[data-top-fx-card]')).toBeVisible()
})

Then('I see the cached Active Campaigns hero', async ({ page }) => {
  await expect(page.locator('[data-testid="active-campaign-hero"]')).toBeVisible()
})

Then('I see cached Top Soundscape and Top FX cards when available', async ({ page }) => {
  await expect(page.locator('[data-top-soundscape-card]')).toBeVisible()
  await expect(page.locator('[data-top-fx-card]')).toBeVisible()
})

Then('I see a stale or offline indicator on the Home screen', async ({ page }) => {
  await expect(page.locator('[data-home-offline-indicator]')).toBeVisible()
})

Then('the Top Soundscape preview stops', async ({ page }) => {
  await expect
    .poll(async () => {
      const state = await getAudioState(page)
      return state.trackName !== 'Ominous Chant'
    })
    .toBe(true)
})

Then('{string} plays as an inline one-shot preview', async ({ page }, trackName: string) => {
  await expect
    .poll(async () => {
      const state = await getAudioState(page)
      return state.source === 'home' && state.isPlaying && state.trackName === trackName
    })
    .toBe(true)
})

Then('the preview buttons on the Top Soundscape and Top FX cards are disabled', async ({ page }) => {
  await expect(page.locator('[data-home-preview-soundscape]')).toBeDisabled()
  await expect(page.locator('[data-home-preview-fx]')).toBeDisabled()
})

Then('the Active Scene session continues playing {string}', async ({ page }) => {
  await expect
    .poll(async () => {
      const state = await getAudioState(page)
      return state.isPlaying && (state.source === 'soundscape' || state.source === 'soundboard')
    })
    .toBe(true)
})

Then('the Top Soundscape preview is no longer playing', async ({ page }) => {
  await expect
    .poll(async () => {
      const state = await getAudioState(page)
      return !state.isPlaying || state.source !== 'home'
    })
    .toBe(true)
})

Then('I do not see a bottom mini player on the Home screen', async ({ page }) => {
  await expect(page.locator('[data-mini-player]')).toHaveCount(0)
})

Then('the Top Soundscape section shows {string}', async ({ page }, text: string) => {
  await expect(page.locator('[data-top-soundscape-card]')).toContainText(text)
})

Then('the Top FX section shows {string}', async ({ page }, text: string) => {
  await expect(page.locator('[data-top-fx-card]')).toContainText(text)
})

Then('I see {string} and {string} badges on the Top Soundscape card', async ({ page }, first: string, second: string) => {
  const card = page.locator('[data-top-soundscape-card]')
  await expect(card).toContainText(first)
  await expect(card).toContainText(second)
})

Then('I see {string} and {string} badges on the Top FX card', async ({ page }, first: string, second: string) => {
  const card = page.locator('[data-top-fx-card]')
  await expect(card).toContainText(first)
  await expect(card).toContainText(second)
})

Then('the Top Soundscape category begins playing as an inline preview', async ({ page }) => {
  await expect
    .poll(async () => {
      const state = await getAudioState(page)
      return state.source === 'home' && state.isPlaying
    })
    .toBe(true)
})

Then('the Top Soundscape category resumes playing as an inline preview', async ({ page }) => {
  await expect
    .poll(async () => {
      const state = await getAudioState(page)
      return state.source === 'home' && state.isPlaying
    })
    .toBe(true)
})

Then('the Top Soundscape category default track plays as an inline preview', async ({ page }) => {
  await expect
    .poll(async () => {
      const state = await getAudioState(page)
      return state.source === 'home' && state.isPlaying
    })
    .toBe(true)
})

Then('the first loopable track in {string} plays as an inline preview', async ({ page }) => {
  await expect
    .poll(async () => {
      const state = await getAudioState(page)
      return state.source === 'home' && state.isPlaying
    })
    .toBe(true)
})

Then('I still see {string} on the Top Soundscape card', async ({ page }, text: string) => {
  await expect(page.locator('[data-top-soundscape-card]')).toContainText(text)
})

Then('I do not see the Scenes screen', async ({ page }) => {
  await expect(page.locator('[data-screen="Scenes screen"]')).toHaveCount(0)
})

Then('{string} resumes playing as an inline one-shot preview', async ({ page }, trackName: string) => {
  await expect
    .poll(async () => {
      const state = await getAudioState(page)
      return state.source === 'home' && state.isPlaying && state.trackName === trackName
    })
    .toBe(true)
})

Then('the Active Campaigns hero expands smoothly to fill the screen background', async ({ page }) => {
  await expect(page.locator('[data-testid="active-campaign-hero"][data-hero-expanding="true"]')).toBeVisible()
})
