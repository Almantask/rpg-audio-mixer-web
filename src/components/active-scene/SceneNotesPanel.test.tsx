import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SceneNotesPanel } from './SceneNotesPanel'

vi.mock('@/lib/storage/sceneContentRepository', () => ({
  updateSceneNotes: vi.fn().mockResolvedValue(undefined),
}))

describe('SceneNotesPanel', () => {
  it('renders markdown heading and bold text when expanded', async () => {
    render(<SceneNotesPanel notes="" sceneId="scene-1" />)

    await userEvent.click(screen.getByRole('button', { name: /scene notes/i }))
    await userEvent.type(
      screen.getByLabelText('Scene notes'),
      '## Trap\nWatch the **pit** near the altar',
    )

    expect(screen.getByRole('heading', { name: 'Trap' })).toBeInTheDocument()
    expect(screen.getByText('pit')).toBeInTheDocument()
  })
})
