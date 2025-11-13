import { prisma } from '@/lib/prisma'
import { DELETE } from '@/app/api/user/account/route'
import { NextRequest } from 'next/server'

// Mock session
jest.mock('@/lib/session', () => ({
  requireAuth: jest.fn(),
}))

// Mock cookies
jest.mock('next/headers', () => ({
  cookies: () => ({
    delete: jest.fn(),
  }),
}))

const { requireAuth } = require('@/lib/session')

describe('DELETE /api/user/account', () => {
  let userId: string

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'account-delete-api@test.com',
        uniqueIdentifier: 'account-delete-api-user',
        name: 'Account Delete Test User',
      },
    })
    userId = user.id
  })

  afterEach(async () => {
    await prisma.user.deleteMany({
      where: { email: 'account-delete-api@test.com' },
    })
    jest.clearAllMocks()
  })

  test('should successfully delete user account via API', async () => {
    requireAuth.mockResolvedValue({ id: userId })

    const response = await DELETE()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)

    // Verify user is deleted
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    expect(user).toBeNull()
  })

  test('should cascade delete relationships when user account is deleted', async () => {
    requireAuth.mockResolvedValue({ id: userId })

    // Create another user and relationship
    const user2 = await prisma.user.create({
      data: {
        email: 'user2-account-delete@test.com',
        uniqueIdentifier: 'user2-account-delete',
        name: 'User Two',
      },
    })

    const relationship = await prisma.relationship.create({
      data: {
        user1Id: userId,
        user2Id: user2.id,
      },
    })

    // Delete account
    const response = await DELETE()
    expect(response.status).toBe(200)

    // Verify relationship is deleted (cascade)
    const rel = await prisma.relationship.findUnique({
      where: { id: relationship.id },
    })
    expect(rel).toBeNull()

    // Clean up user2
    await prisma.user.delete({ where: { id: user2.id } })
  })

  test('should cascade delete tracks and history when user account is deleted', async () => {
    requireAuth.mockResolvedValue({ id: userId })

    // Create another user
    const user2 = await prisma.user.create({
      data: {
        email: 'user2-account-delete@test.com',
        uniqueIdentifier: 'user2-account-delete',
        name: 'User Two',
      },
    })

    // Create relationship
    const relationship = await prisma.relationship.create({
      data: {
        user1Id: userId,
        user2Id: user2.id,
      },
    })

    // Create track
    const track = await prisma.track.create({
      data: {
        relationshipId: relationship.id,
        name: 'coffee',
        currentTurnUserId: userId,
      },
    })

    // Create history
    await prisma.history.create({
      data: {
        trackId: track.id,
        fromUserId: userId,
        toUserId: user2.id,
        timestamp: new Date(),
      },
    })

    // Verify data exists
    const historyBefore = await prisma.history.count({
      where: { trackId: track.id },
    })
    expect(historyBefore).toBe(1)

    // Delete account
    const response = await DELETE()
    expect(response.status).toBe(200)

    // Verify track is deleted (cascade from relationship delete)
    const trackExists = await prisma.track.findUnique({
      where: { id: track.id },
    })
    expect(trackExists).toBeNull()

    // Verify history is deleted (cascade from track delete)
    const historyAfter = await prisma.history.count({
      where: { trackId: track.id },
    })
    expect(historyAfter).toBe(0)

    // Clean up user2
    await prisma.user.delete({ where: { id: user2.id } })
  })
})
