import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

export async function isDemoMode() {
  const cookieStore = await cookies()
  const demoMode = cookieStore.get('demo_mode')
  return demoMode?.value === 'true'
}

export async function getDemoUserFromCookie() {
  const cookieStore = await cookies()
  const demoUserId = cookieStore.get('demo_user_id')
  if (!demoUserId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: demoUserId.value },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
    },
  })

  return user
}

export async function getCurrentUser() {
  // Check if in demo mode first
  if (await isDemoMode()) {
    return await getDemoUserFromCookie()
  }

  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}
