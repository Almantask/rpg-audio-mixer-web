import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import type { ArcanumAudioState } from '../../src/services/audioState'

const { Given } = createBdd()

export async function getAudioState(page: any): Promise<ArcanumAudioState> {
  return page.evaluate(() => (window as any).__ARCANUM_AUDIO_STATE__ || { isPlaying: false, playingTracks: [] })
}

export async function seedE2EData(page: any, data: any) {
  if (page.url() === 'about:blank') {
    await page.goto('/')
    await page.waitForSelector('#root > *')
  }
  await page.evaluate((seedData: any) => {
    sessionStorage.clear()
    if ((window as any).__ARCANUM_SEED__) {
      ;(window as any).__ARCANUM_SEED__(seedData)
    }
  }, data)
  await page.reload()
  await page.waitForSelector('#root > *')
}

Given('I reset the application state', async ({ page }) => {
  await page.goto('/')
  await seedE2EData(page, {
    campaigns: [],
    sessions: [],
    scenes: [],
    fx: [],
    soundscapes: [],
  })
  await page.reload()
})
