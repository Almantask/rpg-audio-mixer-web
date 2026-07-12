import { audioEngine } from './engine'
import { mappedVolume } from './volume'

export function installAudioTestHooks(): void {
  if (typeof window === 'undefined') return

  window.__arcanumIsPlaying = () =>
    audioEngine.getSnapshot().loops.some((loop) => loop.status === 'playing') ||
    audioEngine.getSnapshot().activeFxCount > 0

  window.__arcanumGetCategoryGain = (categoryName: string) =>
    audioEngine.getCategoryGain(categoryName)

  window.__arcanumGetEffectGain = (effectName: string) => audioEngine.getEffectGain(effectName)

  window.__arcanumGetMappedVolume = (masterPercent: number, categoryPercent: number) =>
    mappedVolume(masterPercent, categoryPercent)

  window.__arcanumIsCategoryPlaying = (categoryName: string) =>
    audioEngine.isCategoryPlaying(categoryName)

  window.__arcanumIsEffectPlaying = (effectName: string) => audioEngine.isEffectPlaying(effectName)

  window.__arcanumGetEffectInstanceCount = (effectName: string) =>
    audioEngine.getEffectInstanceCount(effectName)

  window.__arcanumGetActiveFxCount = () => audioEngine.getActiveFxCount()

  window.__arcanumGetActiveLoopCount = () => audioEngine.getActiveLoopCount()

  window.__arcanumIsDucked = () => audioEngine.isDucked()

  window.__arcanumSimulateTrackEnd = (categoryName: string) => {
    audioEngine.simulateTrackEnd(categoryName)
  }

  window.__arcanumGetCategoryTrack = (categoryName: string) => {
    const state = audioEngine.getCategoryState(categoryName)
    return state?.trackName
  }
}

declare global {
  interface Window {
    __arcanumGetCategoryGain?: (categoryName: string) => number
    __arcanumGetEffectGain?: (effectName: string) => number
    __arcanumGetMappedVolume?: (masterPercent: number, categoryPercent: number) => number
    __arcanumIsCategoryPlaying?: (categoryName: string) => boolean
    __arcanumIsEffectPlaying?: (effectName: string) => boolean
    __arcanumGetEffectInstanceCount?: (effectName: string) => number
    __arcanumGetActiveFxCount?: () => number
    __arcanumGetActiveLoopCount?: () => number
    __arcanumIsDucked?: () => boolean
    __arcanumSimulateTrackEnd?: (categoryName: string) => void
    __arcanumGetCategoryTrack?: (categoryName: string) => string | undefined
    __arcanumAudioEngine?: import('./engine').AudioEngine
  }
}

installAudioTestHooks()
