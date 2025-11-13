'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DiscoverPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [foundUser, setFoundUser] = useState<any>(null)
  const [error, setError] = useState('')
  const [searching, setSearching] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFoundUser(null)

    if (!identifier.trim()) {
      setError('Please enter a unique identifier')
      return
    }

    setSearching(true)

    try {
      const response = await fetch(
        `/api/user/search?identifier=${encodeURIComponent(identifier.trim())}`
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'User not found')
        setSearching(false)
        return
      }

      setFoundUser(data)
    } catch (err) {
      setError('Failed to search for user')
    } finally {
      setSearching(false)
    }
  }

  const handleCreateRelationship = async () => {
    if (!foundUser) return

    setCreating(true)
    setError('')

    try {
      const response = await fetch('/api/relationships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user2Id: foundUser.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create relationship')
        setCreating(false)
        return
      }

      router.push(`/relationships/${data.id}`)
    } catch (err) {
      setError('Failed to create relationship')
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-british-racing-green text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="hover:opacity-80">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">Find Friend</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSearch} className="mb-8">
          <label
            htmlFor="identifier"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Enter their unique identifier
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-british-racing-green focus:border-transparent"
              placeholder="e.g., john_doe"
            />
            <button
              type="submit"
              disabled={searching}
              className="px-6 py-3 bg-british-racing-green text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {foundUser && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              {foundUser.image ? (
                <img
                  src={foundUser.image}
                  alt={foundUser.name || ''}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                  {foundUser.name?.[0] || '?'}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold">
                  {foundUser.nickname || foundUser.name}
                </h3>
                <p className="text-gray-600">@{foundUser.uniqueIdentifier}</p>
              </div>
            </div>

            <button
              onClick={handleCreateRelationship}
              disabled={creating}
              className="w-full bg-british-racing-green text-white py-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {creating ? 'Adding...' : 'Add as Friend'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
