import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { ActiveSceneView } from './ActiveSceneView'

describe('ActiveSceneView', () => {
  it('renders active scene tabs and stop all button', () => {
    render(
      <MemoryRouter initialEntries={['/scenes/scene-dragon-lair']}>
        <AppProvider>
          <Routes>
            <Route path="/scenes/:sceneId" element={<ActiveSceneView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /dragon's lair/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /stop all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /soundscapes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /soundboard/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /soundboard/i }))
    expect(screen.getByText(/soundboard master/i)).toBeInTheDocument()
  })
})
