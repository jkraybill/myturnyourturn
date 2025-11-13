'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (err) {
      console.error('Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        'Are you sure you want to delete your account? This will permanently delete all your relationships, tracks, and history. This action cannot be undone.'
      )
    ) {
      return
    }

    // Second confirmation
    if (
      !confirm(
        'This is your final warning. All your data will be permanently deleted. Are you absolutely sure?'
      )
    ) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
      })

      if (!response.ok) {
        alert('Failed to delete account')
        setDeleting(false)
        return
      }

      // Redirect to signin page after successful deletion
      router.push('/auth/signin')
    } catch (err) {
      alert('Failed to delete account')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Profile not found</div>
      </div>
    )
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
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Info */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4 mb-6">
            {profile.image ? (
              <img
                src={profile.image}
                alt="Profile"
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl">
                {profile.name?.[0] || '?'}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              {profile.nickname && (
                <p className="text-gray-600">"{profile.nickname}"</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Email
              </label>
              <p className="text-gray-900">{profile.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Unique Identifier
              </label>
              <p className="text-gray-900">{profile.uniqueIdentifier}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              href="/profile/setup"
              className="inline-block bg-british-racing-green text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-red-200">
          <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
          <p className="text-gray-600 mb-4">
            Once you delete your account, there is no going back. All your
            relationships, tracks, and history will be permanently deleted.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </main>
    </div>
  )
}
