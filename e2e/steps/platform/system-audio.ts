import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  buildScene,
  buildSoundscapeCategory,
  buildSceneSoundscapeSlotWithOptions,
  buildSoundscapeTracksForCategory,
  buildFxTrack,
  buildSoundboardEntry,
  mergeE2EData,
  openActiveScene,
  resetE2EData,
  tapCategoryPlay,
} from '../shared/test-data'

async function tapSoundboardEffect(page: Page, effectName: string) {
  await page
    .locator('[data-soundboard-grid]')
    .locator(`[data-soundboard-tile="${effectName}"]`)
    .first()
    .getByRole('button', { name: `Play ${effectName}`, exact: true })
    .click()
}

async function seedPlayingAmbienceScene(page: Page, options?: { withFx?: string }) {
  await resetE2EData(page)
  const sceneId = 'scene-dungeon'
  const category = buildSoundscapeCategory('Ambience')
  const tracks = buildSoundscapeTracksForCategory('Ambience')
  const fxName = options?.withFx
  const fx = fxName ? buildFxTrack(fxName) : null

  await mergeE2EData(page, {
    scenes: [buildScene('Dungeon', { id: sceneId })],
    soundscapeCategories: [category],
    soundscapeTracks: tracks,
    sceneSoundscapeSlots: [
      buildSceneSoundscapeSlotWithOptions(sceneId, category.id, 0, {
        intensity: 'II',
        currentTrackId: category.levels?.II?.[0],
      }),
    ],
    ...(fx
      ? {
          fxTracks: [fx],
          sceneSoundboardEntries: [buildSoundboardEntry(sceneId, fx.id, 1)],
        }
      : {}),
  })

  await openActiveScene(page, 'Dungeon', 'Soundscapes')
  await tapCategoryPlay(page, 'Ambience')
  if (fxName) {
    await page.locator('[data-active-scene-tab="Soundboard"]').click()
    await tapSoundboardEffect(page, fxName)
  }
}

const { Given, When, Then } = createBdd()

Given('the app is playing a soundscape and a soundboard effect', async ({ page }) => {
  await seedPlayingAmbienceScene(page, { withFx: 'Scream' })
})

When('the browser receives an audio interruption (e.g., another tab takes exclusive audio focus)', async ({ page }) => {
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__ARCANUM_SIMULATE_INTERRUPTION_START__?.(0)
  })
})

Then('all playing audio in the app pauses immediately', async ({ page }) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBe(false)
})

Then('the app visually reflects the paused state on the active playing cards', async ({ page }) => {
  await page.locator('[data-active-scene-tab="Soundscapes"]').click()
  const playbackState = page.locator('[data-soundscape-playback-state]').first()
  await expect(playbackState).toHaveAttribute('data-state', 'paused')
  await expect(playbackState).toHaveText('Paused')
})

Given('the app is playing audio loops on the Active Scene screen', async ({ page }) => {
  await seedPlayingAmbienceScene(page)
})

When('an audio interruption lasts for {int} minutes', async ({ page }, minutes: number) => {
  const ms = minutes * 60 * 1000
  await page.evaluate((durationMs) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__ARCANUM_SIMULATE_INTERRUPTION_START__?.(durationMs)
  }, ms)
})

When('audio focus is regained', async ({ page }) => {
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__ARCANUM_SIMULATE_INTERRUPTION_END__?.()
  })
})

Then('the previously playing loops and soundscapes resume automatically', async ({ page }) => {
  const playbackState = page.locator('[data-soundscape-playback-state]').first()
  await expect(playbackState).toHaveAttribute('data-state', 'playing')
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBe(true)
})

Then('the app remains paused', async ({ page }) => {
  const playbackState = page.locator('[data-soundscape-playback-state]').first()
  await expect(playbackState).toHaveAttribute('data-state', 'paused')
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBe(false)
})

Then('requires a manual play to resume the soundscape', async ({ page }) => {
  await page.locator('[data-soundscape-play]').first().click()
  const playbackState = page.locator('[data-soundscape-playback-state]').first()
  await expect(playbackState).toHaveAttribute('data-state', 'playing')
})

When('I switch to another browser tab', async ({ page }) => {
  await page.evaluate(() => {
    window.dispatchEvent(new Event('blur'))
  })
})

Then('the soundscape loops continue playing without interruption', async ({ page }) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBe(true)
})

Given('the app is playing a soundscape loop', async ({ page }) => {
  await seedPlayingAmbienceScene(page)
})

When('I view the browser media controls (OS media overlay or browser media hub)', async () => {
  // Simulating viewing controls
})

Then('the media controls display a player for Arcanum Audio', async ({ page }) => {
  const metadata = await page.evaluate(() => {
    if (!navigator.mediaSession.metadata) return null
    return {
      title: navigator.mediaSession.metadata.title,
      artist: navigator.mediaSession.metadata.artist,
    }
  })
  expect(metadata).not.toBeNull()
  expect(metadata?.artist).toBe('Arcanum Audio')
})

Then('they show the currently playing scene and master track information', async ({ page }) => {
  const metadata = await page.evaluate(() => {
    if (!navigator.mediaSession.metadata) return null
    return {
      title: navigator.mediaSession.metadata.title,
      artist: navigator.mediaSession.metadata.artist,
      album: navigator.mediaSession.metadata.album,
    }
  })
  expect(metadata?.album).toBe('Dungeon')
  expect(metadata?.title).toBeDefined()
})

Given('the Media Session controls are active', async ({ page }) => {
  const hasMetadata = await page.evaluate(() => navigator.mediaSession.metadata !== null)
  expect(hasMetadata).toBe(true)
})

When('I tap pause on the media controls', async ({ page }) => {
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__ARCANUM_MEDIA_PAUSE__?.()
  })
})

Then('the app audio pauses', async ({ page }) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBe(false)
})
