import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

// DELETE /api/relationships/[id] - Delete a relationship
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth()
    const { id } = await params

    // Verify relationship exists and user is part of it
    const relationship = await prisma.relationship.findUnique({
      where: { id },
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

    // Delete relationship (cascade will delete tracks and history)
    await prisma.relationship.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete relationship' },
      { status: 500 }
    )
  }
}
