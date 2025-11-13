'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteTrackButton({ trackId }: { trackId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this track? All history will be lost.')) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/tracks/${trackId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        alert('Failed to delete track')
        setLoading(false)
        return
      }

      router.refresh()
    } catch (err) {
      alert('Failed to delete track')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
