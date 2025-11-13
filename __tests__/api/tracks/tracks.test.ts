import { prisma } from '@/lib/prisma'

describe('Track Management', () => {
  let user1Id: string
  let user2Id: string
  let relationshipId: string

  beforeEach(async () => {
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

    const relationship = await prisma.relationship.create({
      data: {
        user1Id,
        user2Id,
      },
    })
    relationshipId = relationship.id
  })

  afterEach(async () => {
    await prisma.history.deleteMany()
    await prisma.track.deleteMany()
    await prisma.relationship.deleteMany()
    await prisma.user.deleteMany()
  })

  test('should create a standard track (coffee)', async () => {
    const track = await prisma.track.create({
      data: {
        relationshipId,
        name: 'coffee',
        currentTurnUserId: user1Id,
      },
    })

    expect(track).toBeDefined()
    expect(track.name).toBe('coffee')
    expect(track.customName).toBeNull()
  })

  test('should create a custom track with custom name', async () => {
    const track = await prisma.track.create({
      data: {
        relationshipId,
        name: 'custom',
        customName: 'Dinner',
        currentTurnUserId: user1Id,
      },
    })

    expect(track).toBeDefined()
    expect(track.name).toBe('custom')
    expect(track.customName).toBe('Dinner')
  })

  test('should create multiple tracks for same relationship', async () => {
    await prisma.track.create({
      data: {
        relationshipId,
        name: 'coffee',
        currentTurnUserId: user1Id,
      },
    })

    await prisma.track.create({
      data: {
        relationshipId,
        name: 'lunch',
        currentTurnUserId: user2Id,
      },
    })

    await prisma.track.create({
      data: {
        relationshipId,
        name: 'beer',
        currentTurnUserId: user1Id,
      },
    })

    const tracks = await prisma.track.findMany({
      where: { relationshipId },
    })

    expect(tracks.length).toBe(3)
  })

  test('should delete track and cascade delete history', async () => {
    const track = await prisma.track.create({
      data: {
        relationshipId,
        name: 'coffee',
        currentTurnUserId: user1Id,
      },
    })

    // Create history entries
    await prisma.history.create({
      data: {
        trackId: track.id,
        fromUserId: user1Id,
        toUserId: user2Id,
        timestamp: new Date(),
      },
    })

    await prisma.history.create({
      data: {
        trackId: track.id,
        fromUserId: user2Id,
        toUserId: user1Id,
        timestamp: new Date(),
      },
    })

    // Delete track
    await prisma.track.delete({
      where: { id: track.id },
    })

    // Verify history was deleted
    const historyCount = await prisma.history.count({
      where: { trackId: track.id },
    })

    expect(historyCount).toBe(0)
  })

  test('should maintain correct current turn user', async () => {
    const track = await prisma.track.create({
      data: {
        relationshipId,
        name: 'coffee',
        currentTurnUserId: user1Id,
      },
    })

    expect(track.currentTurnUserId).toBe(user1Id)

    // Update turn
    const updated = await prisma.track.update({
      where: { id: track.id },
      data: {
        currentTurnUserId: user2Id,
      },
    })

    expect(updated.currentTurnUserId).toBe(user2Id)
  })

  test('should find all tracks for a relationship', async () => {
    await prisma.track.createMany({
      data: [
        {
          relationshipId,
          name: 'coffee',
          currentTurnUserId: user1Id,
        },
        {
          relationshipId,
          name: 'lunch',
          currentTurnUserId: user2Id,
        },
      ],
    })

    const tracks = await prisma.track.findMany({
      where: { relationshipId },
    })

    expect(tracks.length).toBe(2)
  })
})
