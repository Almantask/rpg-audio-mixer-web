export interface E2EState {
  campaignsLoading: boolean
  campaignsLoadFail: boolean
  sessionsLoading: boolean
  sessionsLoadFail: boolean
  sessionCreateFail: boolean
  sessionSaveFail: boolean
  scenesLoading: boolean
  scenesLoadFail: boolean
  soundscapesLoading: boolean
  soundscapesLoadFail: boolean
  tracksLoading: boolean
  fxLoading: boolean
  fxLoadFail: boolean
  homeLoading: boolean
  homeLoadFail: boolean
  homeOffline: boolean
  homeHasCachedData: boolean
  attributionsLoading: boolean
  attributionsLoadFail: boolean
  trashRestoreFailIds: string[]
  trashPurgeFailIds: string[]
  playbackFailEffects: string[]
  playbackFailCategories: string[]
  composerSaveFail: boolean
  homeStatLoadFail: boolean
}

const defaultState: E2EState = {
  campaignsLoading: false,
  campaignsLoadFail: false,
  sessionsLoading: false,
  sessionsLoadFail: false,
  sessionCreateFail: false,
  sessionSaveFail: false,
  scenesLoading: false,
  scenesLoadFail: false,
  soundscapesLoading: false,
  soundscapesLoadFail: false,
  tracksLoading: false,
  fxLoading: false,
  fxLoadFail: false,
  homeLoading: false,
  homeLoadFail: false,
  homeOffline: false,
  homeHasCachedData: false,
  attributionsLoading: false,
  attributionsLoadFail: false,
  trashRestoreFailIds: [],
  trashPurgeFailIds: [],
  playbackFailEffects: [],
  playbackFailCategories: [],
  composerSaveFail: false,
  homeStatLoadFail: false,
}

let e2eState: E2EState = { ...defaultState }

export function getE2EState(): E2EState {
  return e2eState
}

export function setE2EState(partial: Partial<E2EState>): void {
  e2eState = { ...e2eState, ...partial }
}

export function resetE2EState(): void {
  e2eState = { ...defaultState }
}

declare global {
  interface Window {
    __arcanumSetE2E?: (partial: Partial<E2EState>) => void
    __arcanumResetE2E?: () => void
  }
}

if (typeof window !== 'undefined') {
  window.__arcanumSetE2E = setE2EState
  window.__arcanumResetE2E = resetE2EState
}
