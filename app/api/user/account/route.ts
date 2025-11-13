import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { cookies } from 'next/headers'

// DELETE /api/user/account - Delete user account
export async function DELETE() {
  try {
    const currentUser = await requireAuth()

    // Delete user (cascade will delete relationships, tracks, and history)
    await prisma.user.delete({
      where: { id: currentUser.id },
    })

    // Clear session cookies
    const cookieStore = await cookies()
    cookieStore.delete('demo_mode')
    cookieStore.delete('demo_user_id')

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
