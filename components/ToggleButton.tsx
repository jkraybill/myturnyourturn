'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ToggleButton({ trackId }: { trackId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/tracks/${trackId}/toggle`, {
        method: 'POST',
      })

      if (!response.ok) {
        alert('Failed to toggle turn')
        setLoading(false)
        return
      }

      router.refresh()
    } catch (err) {
      alert('Failed to toggle turn')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="w-full bg-british-racing-green text-white py-4 rounded-lg font-medium text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {loading ? 'Toggling...' : 'Toggle Turn'}
    </button>
  )
}
