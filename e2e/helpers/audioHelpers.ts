import type { Page } from '@playwright/test'
import type { ArcanumAudioState } from '../../src/lib/types'

export async function getAudioStateFromBrowser(page: Page): Promise<ArcanumAudioState | undefined> {
  return await page.evaluate(() => {
    return window.__ARCANUM_AUDIO_STATE__
  })
}

export async function isTrackPlayingInBrowser(page: Page, trackName: string): Promise<boolean> {
  return await page.evaluate((name) => {
    const state = window.__ARCANUM_AUDIO_STATE__
    if (!state || !state.isPlaying) return false
    if (state.trackName === name) return true
    return state.playingTracks?.some((t) => t.trackName === name) ?? false
  }, trackName)
}
