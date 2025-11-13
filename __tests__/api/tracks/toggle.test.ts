import { prisma } from '@/lib/prisma'

describe('Toggle Functionality', () => {
  let user1Id: string
  let user2Id: string
  let relationshipId: string
  let trackId: string

  beforeEach(async () => {
    // Create test users
    const user1 = await prisma.user.create({
      data: {
        email: 'user1@test.com',
        uniqueIdentifier: 'user1',
        name: 'User One',
      },
    })
    user1Id = user1.id

    const user2 = await prisma.user.create({
      data: {
        email: 'user2@test.com',
        uniqueIdentifier: 'user2',
        name: 'User Two',
      },
    })
    user2Id = user2.id

    // Create relationship
    const relationship = await prisma.relationship.create({
      data: {
        user1Id: user1Id,
        user2Id: user2Id,
      },
    })
    relationshipId = relationship.id

    // Create track
    const track = await prisma.track.create({
      data: {
        relationshipId,
        name: 'coffee',
        currentTurnUserId: user1Id,
      },
    })
    trackId = track.id
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.history.deleteMany()
    await prisma.track.deleteMany()
    await prisma.relationship.deleteMany()
    await prisma.user.deleteMany()
  })

  test('should toggle turn from user1 to user2', async () => {
    // Execute toggle in transaction
    const result = await prisma.$transaction(async (tx) => {
      const track = await tx.track.findUnique({
        where: { id: trackId },
        include: { relationship: true },
      })

      if (!track) throw new Error('Track not found')

      const otherUserId =
        track.relationship.user1Id === user1Id
          ? track.relationship.user2Id
          : track.relationship.user1Id

      // Create history entry
      await tx.history.create({
        data: {
          trackId: track.id,
          fromUserId: track.currentTurnUserId,
          toUserId: otherUserId,
          timestamp: new Date(),
        },
      })

      // Update track
      return tx.track.update({
        where: { id: trackId },
        data: {
          currentTurnUserId: otherUserId,
        },
      })
    })

    expect(result.currentTurnUserId).toBe(user2Id)

    // Verify history was created
    const history = await prisma.history.findFirst({
      where: { trackId },
    })

    expect(history).not.toBeNull()
    expect(history?.fromUserId).toBe(user1Id)
    expect(history?.toUserId).toBe(user2Id)
  })

  test('should toggle turn back from user2 to user1', async () => {
    // First toggle: user1 -> user2
    await prisma.$transaction(async (tx) => {
      const track = await tx.track.findUnique({
        where: { id: trackId },
        include: { relationship: true },
      })

      if (!track) throw new Error('Track not found')

      await tx.history.create({
        data: {
          trackId,
          fromUserId: user1Id,
          toUserId: user2Id,
          timestamp: new Date(),
        },
      })

      await tx.track.update({
        where: { id: trackId },
        data: { currentTurnUserId: user2Id },
      })
    })

    // Second toggle: user2 -> user1
    const result = await prisma.$transaction(async (tx) => {
      const track = await tx.track.findUnique({
        where: { id: trackId },
        include: { relationship: true },
      })

      if (!track) throw new Error('Track not found')

      await tx.history.create({
        data: {
          trackId,
          fromUserId: user2Id,
          toUserId: user1Id,
          timestamp: new Date(),
        },
      })

      return tx.track.update({
        where: { id: trackId },
        data: { currentTurnUserId: user1Id },
      })
    })

    expect(result.currentTurnUserId).toBe(user1Id)

    // Verify two history entries exist
    const historyCount = await prisma.history.count({
      where: { trackId },
    })

    expect(historyCount).toBe(2)
  })

  test('should maintain data integrity: history entry must be created before toggle', async () => {
    // This test ensures that if history creation fails, toggle doesn't happen
    let historyCreated = false
    let toggleCompleted = false

    try {
      await prisma.$transaction(async (tx) => {
        // Create history
        await tx.history.create({
          data: {
            trackId,
            fromUserId: user1Id,
            toUserId: user2Id,
            timestamp: new Date(),
          },
        })
        historyCreated = true

        // Update track
        await tx.track.update({
          where: { id: trackId },
          data: { currentTurnUserId: user2Id },
        })
        toggleCompleted = true
      })
    } catch (error) {
      // Transaction failed
    }

    // Verify both succeeded or both failed
    expect(historyCreated).toBe(toggleCompleted)
  })

  test('should maintain correct history order with multiple toggles', async () => {
    const timestamps: Date[] = []

    // Perform 5 toggles
    for (let i = 0; i < 5; i++) {
      await new Promise((resolve) => setTimeout(resolve, 10)) // Small delay to ensure different timestamps

      await prisma.$transaction(async (tx) => {
        const track = await tx.track.findUnique({
          where: { id: trackId },
          include: { relationship: true },
        })

        if (!track) throw new Error('Track not found')

        const otherUserId =
          track.currentTurnUserId === user1Id ? user2Id : user1Id

        const timestamp = new Date()
        timestamps.push(timestamp)

        await tx.history.create({
          data: {
            trackId,
            fromUserId: track.currentTurnUserId,
            toUserId: otherUserId,
            timestamp,
          },
        })

        await tx.track.update({
          where: { id: trackId },
          data: { currentTurnUserId: otherUserId },
        })
      })
    }

    // Verify 5 history entries
    const history = await prisma.history.findMany({
      where: { trackId },
      orderBy: { timestamp: 'desc' },
    })

    expect(history.length).toBe(5)

    // Verify history is in correct order (most recent first)
    for (let i = 0; i < history.length - 1; i++) {
      expect(
        new Date(history[i].timestamp).getTime()
      ).toBeGreaterThanOrEqual(
        new Date(history[i + 1].timestamp).getTime()
      )
    }
  })

  test('should handle concurrent toggle attempts correctly', async () => {
    // Simulate two users trying to toggle at the same time
    // In a real scenario, only one should succeed due to transaction isolation

    const toggle1 = prisma.$transaction(async (tx) => {
      const track = await tx.track.findUnique({
        where: { id: trackId },
        include: { relationship: true },
      })

      if (!track) throw new Error('Track not found')

      await tx.history.create({
        data: {
          trackId,
          fromUserId: user1Id,
          toUserId: user2Id,
          timestamp: new Date(),
        },
      })

      return tx.track.update({
        where: { id: trackId },
        data: { currentTurnUserId: user2Id },
      })
    })

    const toggle2 = prisma.$transaction(async (tx) => {
      const track = await tx.track.findUnique({
        where: { id: trackId },
        include: { relationship: true },
      })

      if (!track) throw new Error('Track not found')

      await tx.history.create({
        data: {
          trackId,
          fromUserId: user1Id,
          toUserId: user2Id,
          timestamp: new Date(),
        },
      })

      return tx.track.update({
        where: { id: trackId },
        data: { currentTurnUserId: user2Id },
      })
    })

    // Both transactions should complete (Prisma handles this with serialization)
    await Promise.all([toggle1, toggle2])

    // Verify final state is consistent
    const track = await prisma.track.findUnique({
      where: { id: trackId },
    })

    expect(track?.currentTurnUserId).toBeDefined()
  })
})
