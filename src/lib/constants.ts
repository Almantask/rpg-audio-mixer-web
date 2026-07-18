export const SIDEBAR_ITEMS = [
  'Home',
  'Campaigns',
  'Scenes',
  'Library',
  'Credits',
  'Trash',
] as const

export type SidebarItem = (typeof SIDEBAR_ITEMS)[number]

export const SIDEBAR_ROUTES: Record<SidebarItem, string> = {
  Home: '/',
  Campaigns: '/campaigns',
  Scenes: '/scenes',
  Library: '/library',
  Credits: '/credits',
  Trash: '/trash',
}

export const E2E_CAMPAIGN_ID = 'curse-of-strahd'
export const E2E_SESSION_ID = 'session-1'
export const E2E_TAVERN_SCENE_ID = 'tavern'
