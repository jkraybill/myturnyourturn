import { prisma } from '@/lib/prisma'

describe('Account Deletion', () => {
  let userId: string

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'delete-test@test.com',
        uniqueIdentifier: 'delete-test-user',
        name: 'Delete Test User',
      },
    })
    userId = user.id
  })

  afterEach(async () => {
    // Clean up any remaining data
    await prisma.user.deleteMany({
      where: { email: 'delete-test@test.com' },
    })
  })

  test('should delete user account', async () => {
    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    })

    // Verify user is deleted
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    expect(user).toBeNull()
  })

  test('should cascade delete relationships when user is deleted', async () => {
    // Create another user
    const user2 = await prisma.user.create({
      data: {
        email: 'user2-delete@test.com',
        uniqueIdentifier: 'user2-delete',
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

    // Delete first user
    await prisma.user.delete({
      where: { id: userId },
    })

    // Verify relationship is deleted
    const rel = await prisma.relationship.findUnique({
      where: { id: relationship.id },
    })

    expect(rel).toBeNull()

    // Clean up user2
    await prisma.user.delete({
      where: { id: user2.id },
    })
  })

  test('should cascade delete tracks and history when user is deleted', async () => {
    // Create another user
    const user2 = await prisma.user.create({
      data: {
        email: 'user2-delete@test.com',
        uniqueIdentifier: 'user2-delete',
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

    // Delete first user
    await prisma.user.delete({
      where: { id: userId },
    })

    // Verify track is deleted (cascade from relationship delete)
    const trackExists = await prisma.track.findUnique({
      where: { id: track.id },
    })

    expect(trackExists).toBeNull()

    // Verify history is deleted (cascade from track delete)
    const historyCount = await prisma.history.count({
      where: { trackId: track.id },
    })

    expect(historyCount).toBe(0)

    // Clean up user2
    await prisma.user.delete({
      where: { id: user2.id },
    })
  })
})
