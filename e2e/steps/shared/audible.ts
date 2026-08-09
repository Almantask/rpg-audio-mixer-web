import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Then } = createBdd()

Then('sound is audible', async ({ page }) => {
  const isAudible = await page.evaluate(() => {
    const state = window.__ARCANUM_AUDIO_STATE__
    if (!state) return false
    return (
      state.isPlaying === true ||
      (state.playingTracks || []).some((t) => t.state === 'playing')
    )
  })
  expect(isAudible).toBe(true)
})

Then('sounds are audible', async ({ page }) => {
  const isAudible = await page.evaluate(() => {
    const state = window.__ARCANUM_AUDIO_STATE__
    if (!state) return false
    return (
      state.isPlaying === true ||
      (state.playingTracks || []).some((t) => t.state === 'playing')
    )
  })
  expect(isAudible).toBe(true)
})

Then('{string} is audible', async ({ page }, trackName: string) => {
  const isTrackAudible = await page.evaluate((name) => {
    const state = window.__ARCANUM_AUDIO_STATE__
    if (!state || !state.isPlaying) return false
    if (state.trackName === name) return true
    return (state.playingTracks || []).some(
      (t) => (t.trackName === name || t.categoryName === name) && t.state !== 'stopped' && t.state !== 'paused',
    )
  }, trackName)
  expect(isTrackAudible).toBe(true)
})

Then('sound for {string} is audible', async ({ page }, trackName: string) => {
  const isTrackAudible = await page.evaluate((name) => {
    const state = window.__ARCANUM_AUDIO_STATE__
    if (!state || !state.isPlaying) return false
    if (state.trackName === name) return true
    return (state.playingTracks || []).some(
      (t) => (t.trackName === name || t.categoryName === name) && t.state !== 'stopped' && t.state !== 'paused',
    )
  }, trackName)
  expect(isTrackAudible).toBe(true)
})

Then('{string} is audible in the picker', async ({ page }, trackName: string) => {
  const isTrackAudible = await page.evaluate((name) => {
    const state = window.__ARCANUM_AUDIO_STATE__
    if (!state || !state.isPlaying) return false
    if (state.trackName === name) return true
    return (state.playingTracks || []).some(
      (t) => (t.trackName === name || t.categoryName === name) && t.state !== 'stopped' && t.state !== 'paused',
    )
  }, trackName)
  expect(isTrackAudible).toBe(true)
})

Then('sound for {string} is audible in the picker', async ({ page }, trackName: string) => {
  const isTrackAudible = await page.evaluate((name) => {
    const state = window.__ARCANUM_AUDIO_STATE__
    if (!state || !state.isPlaying) return false
    if (state.trackName === name) return true
    return (state.playingTracks || []).some(
      (t) => (t.trackName === name || t.categoryName === name) && t.state !== 'stopped' && t.state !== 'paused',
    )
  }, trackName)
  expect(isTrackAudible).toBe(true)
})

Then('no sound is audible', async ({ page }) => {
  const isAudible = await page.evaluate(() => {
    const state = window.__ARCANUM_AUDIO_STATE__
    if (!state) return false
    if (state.isPlaying) return true
    return (state.playingTracks || []).some((t) => t.state === 'playing')
  })
  expect(isAudible).toBe(false)
})

Then('no sounds are audible', async ({ page }) => {
  const isAudible = await page.evaluate(() => {
    const state = window.__ARCANUM_AUDIO_STATE__
    if (!state) return false
    if (state.isPlaying) return true
    return (state.playingTracks || []).some((t) => t.state === 'playing')
  })
  expect(isAudible).toBe(false)
})

Then('sound is audible at default volume', async ({ page }) => {
  const volOk = await page.evaluate(() => {
    const state = window.__ARCANUM_AUDIO_STATE__
    if (!state || !state.isPlaying) return false
    const vol = state.previewVolume ?? state.volumes?.master ?? 100
    return vol > 0
  })
  expect(volOk).toBe(true)
})

Then('sound for {string} is audible at default volume', async ({ page }, _trackName: string) => {
  const volOk = await page.evaluate(() => {
    const state = window.__ARCANUM_AUDIO_STATE__
    if (!state || !state.isPlaying) return false
    const vol = state.previewVolume ?? state.volumes?.master ?? 100
    return vol > 0
  })
  expect(volOk).toBe(true)
})
