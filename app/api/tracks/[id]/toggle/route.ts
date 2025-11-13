import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

// POST /api/tracks/[id]/toggle - Toggle whose turn it is
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth()
    const { id: trackId } = params

    // Use a transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
      // Get track with relationship
      const track = await tx.track.findUnique({
        where: { id: trackId },
        include: {
          relationship: true,
        },
      })

      if (!track) {
        throw new Error('Track not found')
      }

      // Verify current user is part of the relationship
      if (
        track.relationship.user1Id !== currentUser.id &&
        track.relationship.user2Id !== currentUser.id
      ) {
        throw new Error('Forbidden')
      }

      // Determine the other user in the relationship
      const otherUserId =
        track.relationship.user1Id === currentUser.id
          ? track.relationship.user2Id
          : track.relationship.user1Id

      // Determine who the turn is switching FROM and TO
      const fromUserId = track.currentTurnUserId
      const toUserId = otherUserId

      // Create history entry (append-only audit trail)
      const historyEntry = await tx.history.create({
        data: {
          trackId: track.id,
          fromUserId,
          toUserId,
          timestamp: new Date(),
        },
      })

      // Update track to switch turn
      const updatedTrack = await tx.track.update({
        where: { id: trackId },
        data: {
          currentTurnUserId: toUserId,
        },
        include: {
          currentTurnUser: {
            select: {
              id: true,
              name: true,
              nickname: true,
            },
          },
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
        },
      })

      return { track: updatedTrack, historyEntry }
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Track not found') {
        return NextResponse.json(
          { error: 'Track not found' },
          { status: 404 }
        )
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to toggle turn' },
      { status: 500 }
    )
  }
}
