/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import TrackSlider from '@/components/TrackSlider'

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Mock fetch
global.fetch = jest.fn()

describe('TrackSlider Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should render slider with current turn on left (my turn)', () => {
    render(
      <TrackSlider
        trackId="track123"
        currentTurnUserId="user1"
        currentUserId="user1"
        otherUserName="Alex"
        currentUserName="You"
      />
    )

    expect(screen.getByText('You')).toBeInTheDocument()
    expect(screen.getByText('Alex')).toBeInTheDocument()
  })

  test('should render slider with current turn on right (their turn)', () => {
    render(
      <TrackSlider
        trackId="track123"
        currentTurnUserId="user2"
        currentUserId="user1"
        otherUserName="Alex"
        currentUserName="You"
      />
    )

    expect(screen.getByText('You')).toBeInTheDocument()
    expect(screen.getByText('Alex')).toBeInTheDocument()
  })

  test('should call API when clicking on your turn side', async () => {
    const mockFetch = global.fetch as jest.Mock
    mockFetch.mockResolvedValueOnce({ ok: true })

    render(
      <TrackSlider
        trackId="track123"
        currentTurnUserId="user2"
        currentUserId="user1"
        otherUserName="Alex"
        currentUserName="You"
      />
    )

    const yourTurnButton = screen.getByText('You')
    fireEvent.click(yourTurnButton)

    expect(mockFetch).toHaveBeenCalledWith('/api/tracks/track123/toggle', {
      method: 'POST',
    })
  })

  test('should call API when clicking on their turn side', async () => {
    const mockFetch = global.fetch as jest.Mock
    mockFetch.mockResolvedValueOnce({ ok: true })

    render(
      <TrackSlider
        trackId="track123"
        currentTurnUserId="user1"
        currentUserId="user1"
        otherUserName="Alex"
        currentUserName="You"
      />
    )

    const theirTurnButton = screen.getByText('Alex')
    fireEvent.click(theirTurnButton)

    expect(mockFetch).toHaveBeenCalledWith('/api/tracks/track123/toggle', {
      method: 'POST',
    })
  })

  test('should not call API when clicking on already active side', async () => {
    const mockFetch = global.fetch as jest.Mock

    render(
      <TrackSlider
        trackId="track123"
        currentTurnUserId="user1"
        currentUserId="user1"
        otherUserName="Alex"
        currentUserName="You"
      />
    )

    const yourTurnButton = screen.getByText('You')
    fireEvent.click(yourTurnButton)

    expect(mockFetch).not.toHaveBeenCalled()
  })

  test('should show loading state during toggle', async () => {
    const mockFetch = global.fetch as jest.Mock
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
    )

    render(
      <TrackSlider
        trackId="track123"
        currentTurnUserId="user2"
        currentUserId="user1"
        otherUserName="Alex"
        currentUserName="You"
      />
    )

    const yourTurnButton = screen.getByText('You')
    fireEvent.click(yourTurnButton)

    // Button should be disabled during loading
    expect(yourTurnButton.closest('button')).toBeDisabled()
  })
})
