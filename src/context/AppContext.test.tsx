import { describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { AppProvider, useApp } from './AppContext'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
)

describe('AppContext', () => {
  it('provides initial seed data for campaigns and sessions', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    expect(result.current.campaigns.length).toBeGreaterThan(0)
    expect(result.current.sessions.length).toBeGreaterThan(0)
    expect(result.current.scenes.length).toBeGreaterThan(0)
    expect(result.current.soundscapeCategories.length).toBeGreaterThan(0)
  })

  it('creates, updates, and deletes a campaign', () => {
    const { result } = renderHook(() => useApp(), { wrapper })

    let newCamp: ReturnType<typeof result.current.createCampaign> = undefined!
    act(() => {
      newCamp = result.current.createCampaign({
        title: 'New Underdark Expedition',
        description: 'Exploring subterranean caves',
      })
    })

    expect(result.current.campaigns.some((c) => c.id === newCamp.id)).toBe(true)

    act(() => {
      result.current.updateCampaign(newCamp.id, { title: 'Updated Title' })
    })

    expect(result.current.campaigns.find((c) => c.id === newCamp.id)?.title).toBe('Updated Title')

    act(() => {
      result.current.deleteCampaign(newCamp.id)
    })

    expect(result.current.trashItems.some((t) => t.id === newCamp.id)).toBe(true)
  })

  it('creates and deletes a scene', () => {
    const { result } = renderHook(() => useApp(), { wrapper })

    let newScene: ReturnType<typeof result.current.createScene> = undefined!
    act(() => {
      newScene = result.current.createScene({
        name: 'Haunted Crypt',
        description: 'Dusty tombs',
      })
    })

    expect(result.current.scenes.some((s) => s.id === newScene.id)).toBe(true)

    act(() => {
      result.current.deleteScene(newScene.id)
    })

    expect(result.current.trashItems.some((t) => t.id === newScene.id)).toBe(true)
  })

  it('duplicates scene correctly', () => {
    const { result } = renderHook(() => useApp(), { wrapper })

    const sourceScene = result.current.scenes[0]
    let dup: ReturnType<typeof result.current.duplicateScene> = undefined!

    act(() => {
      dup = result.current.duplicateScene(sourceScene.id)
    })

    expect(dup.name).toContain('(Copy)')
    expect(result.current.scenes.some((s) => s.id === dup.id)).toBe(true)
  })
})
