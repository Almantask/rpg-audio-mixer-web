export { audioEngine, AudioEngine } from './engine'
export { createSyntheticBuffer, fxDurationSeconds, loopDurationSeconds } from './bufferFactory'
export { installAudioTestHooks } from './testHooks'
export type {
  CategoryPlaybackState,
  EffectPlaybackState,
  EngineSnapshot,
  PlaybackStatus,
} from './types'
export {
  CROSSFADE_SECONDS,
  DUCK_RATIO,
  mappedVolume,
  MAX_FX_INSTANCES,
  MAX_FX_INSTANCES_PER_EFFECT,
  MAX_LOOPING_CATEGORIES,
  percentToGain,
} from './volume'
