import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

// GET /api/user/search?identifier=xxx - Search for user by unique identifier
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const identifier = searchParams.get('identifier')

    if (!identifier) {
      return NextResponse.json(
        { error: 'Identifier parameter required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { uniqueIdentifier: identifier },
      select: {
        id: true,
        name: true,
        nickname: true,
        uniqueIdentifier: true,
        image: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Don't return current user
    if (user.id === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot search for yourself' },
        { status: 400 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
