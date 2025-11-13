'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface TrackSliderProps {
  trackId: string
  currentTurnUserId: string
  currentUserId: string
  otherUserName: string
  currentUserName: string
}

export default function TrackSlider({
  trackId,
  currentTurnUserId,
  currentUserId,
  otherUserName,
  currentUserName,
}: TrackSliderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [optimisticIsMyTurn, setOptimisticIsMyTurn] = useState<boolean | null>(null)

  // Calculate base isMyTurn from server props
  const serverIsMyTurn = currentTurnUserId === currentUserId

  // Reset optimistic state when server props change (refresh completed)
  useEffect(() => {
    if (optimisticIsMyTurn !== null && optimisticIsMyTurn === serverIsMyTurn) {
      // Server has caught up with our optimistic update
      setOptimisticIsMyTurn(null)
    }
  }, [currentTurnUserId, serverIsMyTurn, optimisticIsMyTurn])

  // Use optimistic state if available, otherwise use server value
  const isMyTurn = optimisticIsMyTurn !== null ? optimisticIsMyTurn : serverIsMyTurn

  const handleToggle = async (targetIsMyTurn: boolean) => {
    console.log('handleToggle called:', { targetIsMyTurn, isMyTurn, trackId })

    // Don't toggle if clicking on already active side
    if (targetIsMyTurn === isMyTurn) {
      console.log('Already active - not toggling')
      return
    }

    console.log('Proceeding with toggle')

    // Optimistically update UI immediately
    setOptimisticIsMyTurn(targetIsMyTurn)
    setLoading(true)

    try {
      console.log('Calling API:', `/api/tracks/${trackId}/toggle`)
      const response = await fetch(`/api/tracks/${trackId}/toggle`, {
        method: 'POST',
      })

      console.log('API response:', response.status, response.ok)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Toggle failed:', errorData)
        alert('Failed to toggle turn')
        // Revert optimistic update on failure
        setOptimisticIsMyTurn(null)
        setLoading(false)
        return
      }

      const data = await response.json()
      console.log('Toggle successful:', data)

      // Don't clear optimistic state here - let useEffect do it when server catches up
      console.log('Calling router.refresh()')
      router.refresh()
      console.log('router.refresh() called')
    } catch (err) {
      console.error('Toggle error:', err)
      alert('Failed to toggle turn')
      // Revert optimistic update on error
      setOptimisticIsMyTurn(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full">
      {/* Slider container */}
      <div className="relative h-16 bg-gray-200 rounded-full overflow-hidden">
        {/* Sliding indicator */}
        <div
          className={`absolute top-0 bottom-0 w-1/2 bg-british-racing-green rounded-full transition-all duration-300 z-0 ${
            isMyTurn ? 'left-0' : 'left-1/2'
          }`}
        />

        {/* Buttons */}
        <div className="absolute inset-0 flex z-10">
          {/* Your turn button */}
          <button
            onClick={() => handleToggle(true)}
            disabled={loading}
            className={`relative flex-1 flex items-center justify-center font-medium transition-colors duration-300 ${
              isMyTurn ? 'text-white' : 'text-gray-700'
            } disabled:opacity-50 cursor-pointer z-20`}
          >
            {currentUserName}
          </button>

          {/* Their turn button */}
          <button
            onClick={() => handleToggle(false)}
            disabled={loading}
            className={`relative flex-1 flex items-center justify-center font-medium transition-colors duration-300 ${
              !isMyTurn ? 'text-white' : 'text-gray-700'
            } disabled:opacity-50 cursor-pointer z-20`}
          >
            {otherUserName}
          </button>
        </div>
      </div>

      {/* Status text below slider */}
      <div className="mt-2 text-center text-sm text-gray-600">
        {isMyTurn ? "It's your turn!" : `It's ${otherUserName}'s turn!`}
      </div>
    </div>
  )
}
