import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

// GET /api/tracks/[id] - Get track with history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth()
    const { id } = params

    const track = await prisma.track.findUnique({
      where: { id },
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
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }

    // Verify current user is part of the relationship
    if (
      track.relationship.user1Id !== currentUser.id &&
      track.relationship.user2Id !== currentUser.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(track)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch track' },
      { status: 500 }
    )
  }
}

// DELETE /api/tracks/[id] - Delete a track
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth()
    const { id } = params

    // Verify track exists and user is part of the relationship
    const track = await prisma.track.findUnique({
      where: { id },
      include: {
        relationship: true,
      },
    })

    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }

    // Verify current user is part of the relationship
    if (
      track.relationship.user1Id !== currentUser.id &&
      track.relationship.user2Id !== currentUser.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete track (cascade will delete history)
    await prisma.track.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete track' },
      { status: 500 }
    )
  }
}
