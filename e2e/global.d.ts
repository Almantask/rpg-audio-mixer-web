export {}

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
    __arcanumShowError?: (message: string) => void
    __arcanumDismissError?: () => void
    __arcanumSimulateAudioInterruption?: (durationMs: number) => void
    __arcanumRegainAudioFocus?: () => void
    __arcanumSwitchToBackgroundTab?: () => void
    __arcanumAudioEngine?: {
      getSnapshot: () => {
        loops: Array<{ categoryName: string; status: string; trackName: string; gain?: number }>
        effects: Array<{ effectName: string; playing: boolean }>
        activeLoopCount?: number
        activeFxCount?: number
      }
      pauseAllForSystemEvent: () => void
      resumeAfterSystemEvent: () => void
      isMasterMuted: () => boolean
    }
  }
}
