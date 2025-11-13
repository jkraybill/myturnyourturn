import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function TrackPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin')
  }

  const track = await prisma.track.findUnique({
    where: { id: params.id },
    include: {
      relationship: {
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
        },
      },
      currentTurnUser: {
        select: {
          id: true,
          name: true,
          nickname: true,
        },
      },
      history: {
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              nickname: true,
            },
          },
          toUser: {
            select: {
              id: true,
              name: true,
              nickname: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      },
    },
  })

  if (!track) {
    redirect('/dashboard')
  }

  // Verify user is part of the relationship
  if (
    track.relationship.user1Id !== user.id &&
    track.relationship.user2Id !== user.id
  ) {
    redirect('/dashboard')
  }

  const otherUser =
    track.relationship.user1Id === user.id
      ? track.relationship.user2
      : track.relationship.user1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-british-racing-green text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href={`/relationships/${track.relationshipId}`}
            className="hover:opacity-80"
          >
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
              {track.name === 'custom'
                ? track.customName
                : track.name.charAt(0).toUpperCase() + track.name.slice(1)}
            </h1>
            <p className="text-sm opacity-90">
              with {otherUser.nickname || otherUser.name}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Current status */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold mb-3">Current Status</h2>
          <div
            className={`text-center py-4 px-4 rounded-lg ${
              track.currentTurnUserId === user.id
                ? 'bg-british-racing-green/10 text-british-racing-green'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <span className="font-medium text-lg">
              {track.currentTurnUserId === user.id
                ? "It's your turn!"
                : "It's their turn"}
            </span>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">History</h2>

          {track.history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No history yet. Toggle the turn to start tracking!
            </p>
          ) : (
            <div className="space-y-3">
              {track.history.map((entry) => {
                const fromName =
                  entry.fromUser.id === user.id
                    ? 'You'
                    : entry.fromUser.nickname || entry.fromUser.name

                const toName =
                  entry.toUser.id === user.id
                    ? 'you'
                    : entry.toUser.nickname || entry.toUser.name

                const date = new Date(entry.timestamp)
                const formattedDate = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year:
                    date.getFullYear() !== new Date().getFullYear()
                      ? 'numeric'
                      : undefined,
                })
                const formattedTime = date.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })

                return (
                  <div
                    key={entry.id}
                    className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-gray-900">
                        {fromName} paid, turn switched to {toName}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{formattedDate}</div>
                      <div>{formattedTime}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
