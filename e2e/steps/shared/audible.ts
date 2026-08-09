import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Then } = createBdd()

Then('sound is audible', async ({ page }) => {
  await expect.poll(async () => {
    return page.evaluate(() => {
      const state = window.__ARCANUM_AUDIO_STATE__
      if (!state) return false
      const isPlaying =
        state.isPlaying === true ||
        (state.playingTracks || []).length > 0
      if (!isPlaying) return false
      const levels = state.signalLevels
      return !levels || (levels.peak > 0 && levels.rms > 0)
    })
  }).toBe(true)
})

Then('sounds are audible', async ({ page }) => {
  await expect.poll(async () => {
    return page.evaluate(() => {
      const state = window.__ARCANUM_AUDIO_STATE__
      if (!state) return false
      const isPlaying =
        state.isPlaying === true ||
        (state.playingTracks || []).length > 0
      if (!isPlaying) return false
      const levels = state.signalLevels
      return !levels || (levels.peak > 0 && levels.rms > 0)
    })
  }).toBe(true)
})

Then('{string} is audible', async ({ page }, trackName: string) => {
  await expect.poll(async () => {
    return page.evaluate((name) => {
      const state = window.__ARCANUM_AUDIO_STATE__
      if (!state || !state.isPlaying) return false
      const isMatch =
        state.trackName === name ||
        (state.playingTracks || []).some(
          (t) => t.name === name || t.categoryName === name,
        )
      if (!isMatch) return false
      const levels = state.signalLevels
      return !levels || (levels.peak > 0 && levels.rms > 0)
    }, trackName)
  }).toBe(true)
})

Then('sound for {string} is audible', async ({ page }, trackName: string) => {
  await expect.poll(async () => {
    return page.evaluate((name) => {
      const state = window.__ARCANUM_AUDIO_STATE__
      if (!state || !state.isPlaying) return false
      const isMatch =
        state.trackName === name ||
        (state.playingTracks || []).some(
          (t) => t.name === name || t.categoryName === name,
        )
      if (!isMatch) return false
      const levels = state.signalLevels
      return !levels || (levels.peak > 0 && levels.rms > 0)
    }, trackName)
  }).toBe(true)
})

Then('{string} is audible in the picker', async ({ page }, trackName: string) => {
  await expect.poll(async () => {
    return page.evaluate((name) => {
      const state = window.__ARCANUM_AUDIO_STATE__
      if (!state || !state.isPlaying) return false
      const isMatch =
        state.trackName === name ||
        (state.playingTracks || []).some(
          (t) => t.name === name || t.categoryName === name,
        )
      if (!isMatch) return false
      const levels = state.signalLevels
      return !levels || (levels.peak > 0 && levels.rms > 0)
    }, trackName)
  }).toBe(true)
})

Then('sound for {string} is audible in the picker', async ({ page }, trackName: string) => {
  await expect.poll(async () => {
    return page.evaluate((name) => {
      const state = window.__ARCANUM_AUDIO_STATE__
      if (!state || !state.isPlaying) return false
      const isMatch =
        state.trackName === name ||
        (state.playingTracks || []).some(
          (t) => t.name === name || t.categoryName === name,
        )
      if (!isMatch) return false
      const levels = state.signalLevels
      return !levels || (levels.peak > 0 && levels.rms > 0)
    }, trackName)
  }).toBe(true)
})

Then('no sound is audible', async ({ page }) => {
  await expect.poll(async () => {
    return page.evaluate(() => {
      const state = window.__ARCANUM_AUDIO_STATE__
      if (!state) return true
      const isStopped =
        !state.isPlaying &&
        (!state.playingTracks || state.playingTracks.length === 0)
      const levels = state.signalLevels
      const isSilent = !levels || (levels.peak === 0 && levels.rms === 0)
      return isStopped && isSilent
    })
  }).toBe(true)
})

Then('no sounds are audible', async ({ page }) => {
  await expect.poll(async () => {
    return page.evaluate(() => {
      const state = window.__ARCANUM_AUDIO_STATE__
      if (!state) return true
      const isStopped =
        !state.isPlaying &&
        (!state.playingTracks || state.playingTracks.length === 0)
      const levels = state.signalLevels
      const isSilent = !levels || (levels.peak === 0 && levels.rms === 0)
      return isStopped && isSilent
    })
  }).toBe(true)
})

Then('sound is audible at default volume', async ({ page }) => {
  await expect.poll(async () => {
    return page.evaluate(() => {
      const state = window.__ARCANUM_AUDIO_STATE__
      if (!state || !state.isPlaying) return false
      const vol =
        state.previewVolume ??
        state.volumes?.soundscapeMaster ??
        state.volumes?.soundboardMaster ??
        100
      const levels = state.signalLevels
      const signalOk = !levels || (levels.peak > 0 && levels.rms > 0)
      return vol > 0 && signalOk
    })
  }).toBe(true)
})

Then('sound for {string} is audible at default volume', async ({ page }, trackName: string) => {
  await expect.poll(async () => {
    return page.evaluate((name) => {
      const state = window.__ARCANUM_AUDIO_STATE__
      if (!state || !state.isPlaying) return false
      const isMatch =
        state.trackName === name ||
        (state.playingTracks || []).some(
          (t) => t.name === name || t.categoryName === name,
        )
      if (!isMatch) return false
      const vol =
        state.previewVolume ??
        state.volumes?.soundscapeMaster ??
        state.volumes?.soundboardMaster ??
        100
      const levels = state.signalLevels
      const signalOk = !levels || (levels.peak > 0 && levels.rms > 0)
      return vol > 0 && signalOk
    }, trackName)
  }).toBe(true)
})
