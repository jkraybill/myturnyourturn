import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

// POST /api/tracks - Create a new track
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth()
    const body = await request.json()
    const { relationshipId, name, customName } = body

    // Validate required fields
    if (!relationshipId || !name) {
      return NextResponse.json(
        { error: 'relationshipId and name required' },
        { status: 400 }
      )
    }

    // Validate name is one of the allowed values
    const validNames = ['coffee', 'lunch', 'beer', 'custom']
    if (!validNames.includes(name)) {
      return NextResponse.json(
        { error: 'Invalid track name. Must be coffee, lunch, beer, or custom' },
        { status: 400 }
      )
    }

    // If name is custom, customName is required
    if (name === 'custom' && !customName) {
      return NextResponse.json(
        { error: 'customName required for custom tracks' },
        { status: 400 }
      )
    }

    // Verify relationship exists and user is part of it
    const relationship = await prisma.relationship.findUnique({
      where: { id: relationshipId },
    })

    if (!relationship) {
      return NextResponse.json(
        { error: 'Relationship not found' },
        { status: 404 }
      )
    }

    // Verify current user is part of the relationship
    if (
      relationship.user1Id !== currentUser.id &&
      relationship.user2Id !== currentUser.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Create track with current user having the first turn
    const track = await prisma.track.create({
      data: {
        relationshipId,
        name,
        customName: name === 'custom' ? customName : null,
        currentTurnUserId: currentUser.id,
      },
      include: {
        currentTurnUser: {
          select: {
            id: true,
            name: true,
            nickname: true,
          },
        },
      },
    })

    return NextResponse.json(track, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create track' },
      { status: 500 }
    )
  }
}
