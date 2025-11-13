import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

// GET /api/user/profile - Get current user's profile
export async function GET() {
  try {
    const currentUser = await requireAuth()

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        uniqueIdentifier: true,
        image: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

// PATCH /api/user/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await requireAuth()
    const body = await request.json()

    const { nickname, uniqueIdentifier } = body

    // Validate uniqueIdentifier if provided
    if (uniqueIdentifier) {
      const existing = await prisma.user.findUnique({
        where: { uniqueIdentifier },
      })

      if (existing && existing.id !== currentUser.id) {
        return NextResponse.json(
          { error: 'Unique identifier already taken' },
          { status: 400 }
        )
      }
    }

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        nickname: nickname || undefined,
        uniqueIdentifier: uniqueIdentifier || undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        uniqueIdentifier: true,
        image: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
