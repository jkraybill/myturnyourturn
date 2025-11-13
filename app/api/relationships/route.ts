import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

// GET /api/relationships - Get all relationships for current user
export async function GET() {
  try {
    const currentUser = await requireAuth()

    const relationships = await prisma.relationship.findMany({
      where: {
        OR: [{ user1Id: currentUser.id }, { user2Id: currentUser.id }],
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

    return NextResponse.json(relationships)
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

// POST /api/relationships - Create a new relationship
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth()
    const body = await request.json()
    const { user2Id } = body

    if (!user2Id) {
      return NextResponse.json(
        { error: 'user2Id required' },
        { status: 400 }
      )
    }

    // Validate user2 exists
    const user2 = await prisma.user.findUnique({
      where: { id: user2Id },
    })

    if (!user2) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if relationship already exists (in either direction)
    const existing = await prisma.relationship.findFirst({
      where: {
        OR: [
          { user1Id: currentUser.id, user2Id: user2Id },
          { user1Id: user2Id, user2Id: currentUser.id },
        ],
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Relationship already exists' },
        { status: 400 }
      )
    }

    // Create relationship
    const relationship = await prisma.relationship.create({
      data: {
        user1Id: currentUser.id,
        user2Id: user2Id,
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
      },
    })

    return NextResponse.json(relationship, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create relationship' },
      { status: 500 }
    )
  }
}
