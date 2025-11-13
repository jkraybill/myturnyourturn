'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfileSetupPage() {
  const router = useRouter()
  const [uniqueIdentifier, setUniqueIdentifier] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!uniqueIdentifier.trim()) {
      setError('Unique identifier is required')
      return
    }

    // Validate identifier format (alphanumeric and hyphens/underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(uniqueIdentifier)) {
      setError(
        'Unique identifier can only contain letters, numbers, hyphens, and underscores'
      )
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uniqueIdentifier: uniqueIdentifier.trim(),
          nickname: nickname.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update profile')
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError('Failed to update profile')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-british-racing-green mb-2">
            Welcome!
          </h1>
          <p className="text-gray-600">
            Let's set up your profile so friends can find you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="uniqueIdentifier"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Unique Identifier *
            </label>
            <input
              type="text"
              id="uniqueIdentifier"
              value={uniqueIdentifier}
              onChange={(e) => setUniqueIdentifier(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-british-racing-green focus:border-transparent"
              placeholder="e.g., john_doe or johndoe123"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Your friends will use this to find and connect with you
            </p>
          </div>

          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nickname (optional)
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-british-racing-green focus:border-transparent"
              placeholder="How friends should call you"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-british-racing-green text-white py-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
