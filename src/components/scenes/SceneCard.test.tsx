import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { SceneCard } from '@/components/scenes/SceneCard'
import type { Scene } from '@/types/scene'

const scene: Scene = {
  id: 'scene-1',
  name: 'Bonfire talk',
  description: 'A mix of ambiences intended to be played all at once.',
  tags: ['Camp'],
  createdAt: '2026-01-01T00:00:00.000Z',
  lastUsedAt: '2026-01-01T00:00:00.000Z',
}

function renderSceneCard(overrides: Partial<Scene> = {}, variant: 'global' | 'session' = 'global') {
  return render(
    <MemoryRouter>
      <SceneCard
        scene={{ ...scene, ...overrides }}
        soundscapeSlots={[]}
        soundboardEntries={[]}
        variant={variant}
        onEdit={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />
    </MemoryRouter>,
  )
}

describe('SceneCard description', () => {
  it('shows the scene description on global list cards', () => {
    renderSceneCard()

    const descriptions = document.querySelectorAll(
      `[data-scene-description="${scene.name}"], [data-scene-description-mobile="${scene.name}"]`,
    )
    expect(descriptions.length).toBeGreaterThan(0)
    for (const node of descriptions) {
      expect(node).toHaveTextContent(scene.description!)
    }
  })

  it('omits the description line when description is empty', () => {
    renderSceneCard({ description: undefined })

    expect(document.querySelector(`[data-scene-description="${scene.name}"]`)).toBeNull()
    expect(document.querySelector(`[data-scene-description-mobile="${scene.name}"]`)).toBeNull()
    expect(screen.queryByText(/mix of ambiences/i)).not.toBeInTheDocument()
  })

  it('omits the description line when description is only whitespace', () => {
    renderSceneCard({ description: '   ' })

    expect(document.querySelector(`[data-scene-description="${scene.name}"]`)).toBeNull()
    expect(document.querySelector(`[data-scene-description-mobile="${scene.name}"]`)).toBeNull()
  })

  it('keeps session description attributes for session variant', () => {
    renderSceneCard({}, 'session')

    expect(
      document.querySelector(`[data-session-scene-description="${scene.name}"]`),
    ).toHaveTextContent(scene.description!)
    expect(
      document.querySelector(`[data-session-scene-description-mobile="${scene.name}"]`),
    ).toHaveTextContent(scene.description!)
  })
})
