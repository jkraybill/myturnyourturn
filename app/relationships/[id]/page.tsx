import { redirect } from 'next/navigation'
import { getCurrentUser, isDemoMode } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ToggleButton from '@/components/ToggleButton'
import AddTrackForm from '@/components/AddTrackForm'
import DemoModeBanner from '@/components/DemoModeBanner'

export default async function RelationshipPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin')
  }

  const isDemo = await isDemoMode()

  const relationship = await prisma.relationship.findUnique({
    where: { id: params.id },
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
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  if (!relationship) {
    redirect('/dashboard')
  }

  // Verify user is part of the relationship
  if (
    relationship.user1Id !== user.id &&
    relationship.user2Id !== user.id
  ) {
    redirect('/dashboard')
  }

  const otherUser =
    relationship.user1Id === user.id
      ? relationship.user2
      : relationship.user1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Mode Banner */}
      {isDemo && <DemoModeBanner />}

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
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {otherUser.nickname || otherUser.name}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Add track form */}
        <div className="mb-6">
          <AddTrackForm relationshipId={relationship.id} />
        </div>

        {/* Tracks list */}
        {relationship.tracks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg mb-2">No tracks yet</p>
            <p className="text-gray-400">Add a track to start tracking!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {relationship.tracks.map((track) => {
              const isMyTurn = track.currentTurnUserId === user.id

              return (
                <div
                  key={track.id}
                  className="bg-white rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">
                      {track.name === 'custom'
                        ? track.customName
                        : track.name.charAt(0).toUpperCase() +
                          track.name.slice(1)}
                    </h3>
                    <Link
                      href={`/tracks/${track.id}`}
                      className="text-british-racing-green hover:underline text-sm"
                    >
                      View History
                    </Link>
                  </div>

                  <div className="mb-4">
                    <div
                      className={`text-center py-3 px-4 rounded-lg ${
                        isMyTurn
                          ? 'bg-british-racing-green/10 text-british-racing-green'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">
                        {isMyTurn ? "It's your turn!" : "It's their turn"}
                      </span>
                    </div>
                  </div>

                  <ToggleButton trackId={track.id} />
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
