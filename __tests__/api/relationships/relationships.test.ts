import { prisma } from '@/lib/prisma'

describe('Relationship Management', () => {
  let user1Id: string
  let user2Id: string

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
  })

  afterEach(async () => {
    await prisma.relationship.deleteMany()
    await prisma.user.deleteMany()
  })

  test('should create a relationship between two users', async () => {
    const relationship = await prisma.relationship.create({
      data: {
        user1Id,
        user2Id,
      },
    })

    expect(relationship).toBeDefined()
    expect(relationship.user1Id).toBe(user1Id)
    expect(relationship.user2Id).toBe(user2Id)
  })

  test('should not allow duplicate relationships', async () => {
    // Create first relationship
    await prisma.relationship.create({
      data: {
        user1Id,
        user2Id,
      },
    })

    // Attempt to create duplicate
    await expect(
      prisma.relationship.create({
        data: {
          user1Id,
          user2Id,
        },
      })
    ).rejects.toThrow()
  })

  test('should cascade delete tracks and history when relationship is deleted', async () => {
    // Create relationship
    const relationship = await prisma.relationship.create({
      data: {
        user1Id,
        user2Id,
      },
    })

    // Create track
    const track = await prisma.track.create({
      data: {
        relationshipId: relationship.id,
        name: 'coffee',
        currentTurnUserId: user1Id,
      },
    })

    // Create history entry
    await prisma.history.create({
      data: {
        trackId: track.id,
        fromUserId: user1Id,
        toUserId: user2Id,
        timestamp: new Date(),
      },
    })

    // Delete relationship
    await prisma.relationship.delete({
      where: { id: relationship.id },
    })

    // Verify track was deleted
    const trackCount = await prisma.track.count({
      where: { id: track.id },
    })
    expect(trackCount).toBe(0)

    // Verify history was deleted
    const historyCount = await prisma.history.count({
      where: { trackId: track.id },
    })
    expect(historyCount).toBe(0)
  })

  test('should find relationships for a specific user', async () => {
    // Create multiple relationships
    const user3 = await prisma.user.create({
      data: {
        email: 'user3@test.com',
        uniqueIdentifier: 'user3',
        name: 'User Three',
      },
    })

    await prisma.relationship.create({
      data: {
        user1Id,
        user2Id,
      },
    })

    await prisma.relationship.create({
      data: {
        user1Id,
        user2Id: user3.id,
      },
    })

    // Find all relationships for user1
    const relationships = await prisma.relationship.findMany({
      where: {
        OR: [{ user1Id }, { user2Id: user1Id }],
      },
    })

    expect(relationships.length).toBe(2)
  })
})
