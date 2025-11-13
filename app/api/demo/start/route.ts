import { NextResponse } from 'next/server'
import { seedDemoData, getDemoUser } from '@/lib/demo'
import { cookies } from 'next/headers'

// POST /api/demo/start - Start demo mode
export async function POST() {
  try {
    // Seed demo data (idempotent)
    await seedDemoData()

    // Get demo user
    const demoUser = await getDemoUser()

    // Set demo mode cookie
    const cookieStore = await cookies()
    cookieStore.set('demo_mode', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    // Set demo user ID cookie
    cookieStore.set('demo_user_id', demoUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return NextResponse.json({
      success: true,
      message: 'Demo mode started',
      userId: demoUser.id,
    })
  } catch (error) {
    console.error('Error starting demo mode:', error)
    return NextResponse.json(
      { error: 'Failed to start demo mode' },
      { status: 500 }
    )
  }
}
