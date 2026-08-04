import { describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { AppProvider, useApp } from './AppContext'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
)

describe('AppContext', () => {
  it('provides initial seed data', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    expect(result.current.campaigns.length).toBeGreaterThan(0)
    expect(result.current.sessions.length).toBeGreaterThan(0)
    expect(result.current.scenes.length).toBeGreaterThan(0)
    expect(result.current.categories.length).toBeGreaterThan(0)
  })

  it('creates and soft-deletes campaign to trash', () => {
    const { result } = renderHook(() => useApp(), { wrapper })

    let newCamp: ReturnType<typeof result.current.createCampaign> = undefined!
    act(() => {
      newCamp = result.current.createCampaign({
        name: 'Test Campaign',
        description: 'Test description',
      })
    })

    expect(result.current.campaigns.some((c) => c.id === newCamp.id)).toBe(true)

    act(() => {
      result.current.softDeleteCampaign(newCamp.id)
    })

    expect(result.current.campaigns.some((c) => c.id === newCamp.id)).toBe(false)
    expect(result.current.trash.some((t) => t.entityId === newCamp.id)).toBe(true)
  })

  it('restores soft-deleted campaign from trash', () => {
    const { result } = renderHook(() => useApp(), { wrapper })

    let newCamp: ReturnType<typeof result.current.createCampaign> = undefined!
    act(() => {
      newCamp = result.current.createCampaign({ name: 'Restoration Campaign' })
    })

    act(() => {
      result.current.softDeleteCampaign(newCamp.id)
    })

    const trashItem = result.current.trash.find((t) => t.entityId === newCamp.id)!
    expect(trashItem).toBeDefined()

    act(() => {
      result.current.restoreTrashItem(trashItem.id)
    })

    expect(result.current.campaigns.some((c) => c.name.startsWith('Restoration Campaign'))).toBe(true)
    expect(result.current.trash.some((t) => t.id === trashItem.id)).toBe(false)
  })

  it('duplicates scene with Copy of prefix', () => {
    const { result } = renderHook(() => useApp(), { wrapper })

    const origScene = result.current.scenes[0]
    let dup: ReturnType<typeof result.current.duplicateScene> = undefined!

    act(() => {
      dup = result.current.duplicateScene(origScene.id)
    })

    expect(dup.name).toBe(`Copy of ${origScene.name}`)
    expect(result.current.scenes.some((s) => s.id === dup.id)).toBe(true)
  })
})
