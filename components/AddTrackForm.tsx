'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddTrackForm({
  relationshipId,
}: {
  relationshipId: string
}) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [trackType, setTrackType] = useState('coffee')
  const [customName, setCustomName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          relationshipId,
          name: trackType,
          customName: trackType === 'custom' ? customName : undefined,
        }),
      })

      if (!response.ok) {
        alert('Failed to create track')
        setLoading(false)
        return
      }

      setShowForm(false)
      setTrackType('coffee')
      setCustomName('')
      router.refresh()
    } catch (err) {
      alert('Failed to create track')
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-british-racing-green text-white px-6 py-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        + Add Track
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4">Add New Track</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Track Type
        </label>
        <select
          value={trackType}
          onChange={(e) => setTrackType(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-british-racing-green focus:border-transparent"
        >
          <option value="coffee">Coffee</option>
          <option value="lunch">Lunch</option>
          <option value="beer">Beer</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {trackType === 'custom' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Name
          </label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-british-racing-green focus:border-transparent"
            placeholder="e.g., Dinner, Movies, etc."
            required
          />
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            setShowForm(false)
            setTrackType('coffee')
            setCustomName('')
          }}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-british-racing-green text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>
    </form>
  )
}
