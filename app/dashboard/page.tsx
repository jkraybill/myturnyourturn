import { redirect } from 'next/navigation'
import { getCurrentUser, isDemoMode } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DemoModeBanner from '@/components/DemoModeBanner'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin')
  }

  const isDemo = await isDemoMode()

  // Get user's full profile
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
  })

  // If user hasn't set up their unique identifier, redirect to profile (skip for demo)
  if (!isDemo && !profile?.uniqueIdentifier) {
    redirect('/profile/setup')
  }

  // Get user's relationships
  const relationships = await prisma.relationship.findMany({
    where: {
      OR: [{ user1Id: user.id }, { user2Id: user.id }],
    },
    include: {
      user1: {
        select: {
          id: true,
          name: true,
          nickname: true,
          image: true,
        },
      },
      user2: {
        select: {
          id: true,
          name: true,
          nickname: true,
          image: true,
        },
      },
      tracks: {
        include: {
          currentTurnUser: {
            select: {
              id: true,
              name: true,
              nickname: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Mode Banner */}
      {isDemo && <DemoModeBanner />}

      {/* Header */}
      <header className="bg-british-racing-green text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">MyTurnYourTurn</h1>
          <Link
            href="/profile"
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            {profile.image ? (
              <img
                src={profile.image}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <span className="text-lg">{profile.name?.[0] || '?'}</span>
            )}
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Add relationship button */}
        <div className="mb-6 flex gap-3">
          <Link
            href="/discover"
            className="flex-1 bg-british-racing-green text-white px-6 py-4 rounded-lg text-center font-medium hover:opacity-90 transition-opacity"
          >
            + Find Friend
          </Link>
        </div>

        {/* Relationships list */}
        {relationships.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              No relationships yet
            </p>
            <p className="text-gray-400">
              Find a friend to start tracking whose turn it is!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {relationships.map((rel) => {
              const otherUser =
                rel.user1Id === user.id ? rel.user2 : rel.user1

              return (
                <Link
                  key={rel.id}
                  href={`/relationships/${rel.id}`}
                  className="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {otherUser.image ? (
                        <img
                          src={otherUser.image}
                          alt={otherUser.name || ''}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl">
                          {otherUser.name?.[0] || '?'}
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-lg">
                          {otherUser.nickname || otherUser.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {rel.tracks.length} track
                          {rel.tracks.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>

                  {/* Track previews */}
                  {rel.tracks.length > 0 && (
                    <div className="space-y-2">
                      {rel.tracks.slice(0, 3).map((track) => (
                        <div
                          key={track.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {track.name === 'custom'
                              ? track.customName
                              : track.name.charAt(0).toUpperCase() +
                                track.name.slice(1)}
                          </span>
                          <span className="font-medium">
                            {track.currentTurnUserId === user.id
                              ? 'Your turn'
                              : 'Their turn'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
