import { prisma } from '@/lib/prisma'
import { seedDemoData, getDemoUser, cleanupDemoData } from '@/lib/demo'

describe('Demo Data Management', () => {
  beforeEach(async () => {
    // Clean up any existing demo data
    await cleanupDemoData()
  })

  afterEach(async () => {
    // Clean up after each test
    await cleanupDemoData()
  })

  test('should seed demo data with two users', async () => {
    await seedDemoData()

    const demoUser = await getDemoUser()
    expect(demoUser).toBeDefined()
    expect(demoUser.email).toBe('demo@myturnyourturn.app')
    expect(demoUser.uniqueIdentifier).toBe('demo_user')

    // Check friend exists
    const friend = await prisma.user.findUnique({
      where: { email: 'demo_friend@myturnyourturn.app' },
    })
    expect(friend).toBeDefined()
    expect(friend?.uniqueIdentifier).toBe('demo_friend')
  })

  test('should create a relationship between demo users', async () => {
    await seedDemoData()

    const demoUser = await getDemoUser()
    const relationships = await prisma.relationship.findMany({
      where: {
        OR: [{ user1Id: demoUser.id }, { user2Id: demoUser.id }],
      },
    })

    expect(relationships.length).toBe(1)
  })

  test('should create multiple tracks (coffee, lunch, beer, custom)', async () => {
    await seedDemoData()

    const demoUser = await getDemoUser()
    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ user1Id: demoUser.id }, { user2Id: demoUser.id }],
      },
      include: {
        tracks: true,
      },
    })

    expect(relationship?.tracks.length).toBeGreaterThanOrEqual(4)

    // Check for specific track types
    const trackNames = relationship?.tracks.map((t) => t.name)
    expect(trackNames).toContain('coffee')
    expect(trackNames).toContain('lunch')
    expect(trackNames).toContain('beer')
    expect(trackNames).toContain('custom')
  })

  test('should create history entries for some tracks', async () => {
    await seedDemoData()

    const historyCount = await prisma.history.count()
    expect(historyCount).toBeGreaterThan(0)
  })

  test('should be idempotent - calling twice should not duplicate', async () => {
    await seedDemoData()
    await seedDemoData()

    const demoUsers = await prisma.user.findMany({
      where: {
        email: { in: ['demo@myturnyourturn.app', 'demo_friend@myturnyourturn.app'] },
      },
    })

    expect(demoUsers.length).toBe(2)
  })

  test('should cleanup all demo data', async () => {
    await seedDemoData()

    // Verify data exists
    let demoUser = await getDemoUser()
    expect(demoUser).toBeDefined()

    // Cleanup
    await cleanupDemoData()

    // Verify data is gone
    demoUser = await prisma.user.findUnique({
      where: { email: 'demo@myturnyourturn.app' },
    })
    expect(demoUser).toBeNull()

    const demoFriend = await prisma.user.findUnique({
      where: { email: 'demo_friend@myturnyourturn.app' },
    })
    expect(demoFriend).toBeNull()
  })

  test('should have tracks with varying current turn states', async () => {
    await seedDemoData()

    const demoUser = await getDemoUser()
    const tracks = await prisma.track.findMany({
      include: {
        relationship: true,
      },
    })

    // Some tracks should have demo user's turn, some should have friend's turn
    const demoUserTurnCount = tracks.filter(
      (t) => t.currentTurnUserId === demoUser.id
    ).length
    const friendTurnCount = tracks.length - demoUserTurnCount

    expect(demoUserTurnCount).toBeGreaterThan(0)
    expect(friendTurnCount).toBeGreaterThan(0)
  })
})
