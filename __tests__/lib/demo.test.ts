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

  test('should seed demo data with five users (1 demo user + 4 friends)', async () => {
    await seedDemoData()

    const demoUser = await getDemoUser()
    expect(demoUser).toBeDefined()
    expect(demoUser.email).toBe('demo@myturnyourturn.app')
    expect(demoUser.uniqueIdentifier).toBe('demo_user')

    // Check all friends exist
    const friend1 = await prisma.user.findUnique({
      where: { email: 'demo_friend@myturnyourturn.app' },
    })
    expect(friend1).toBeDefined()
    expect(friend1?.uniqueIdentifier).toBe('alex_demo')

    const friend2 = await prisma.user.findUnique({
      where: { email: 'demo_friend2@myturnyourturn.app' },
    })
    expect(friend2).toBeDefined()
    expect(friend2?.name).toBe('Sarah')

    const friend3 = await prisma.user.findUnique({
      where: { email: 'demo_friend3@myturnyourturn.app' },
    })
    expect(friend3).toBeDefined()
    expect(friend3?.name).toBe('Jordan')

    const friend4 = await prisma.user.findUnique({
      where: { email: 'demo_friend4@myturnyourturn.app' },
    })
    expect(friend4).toBeDefined()
    expect(friend4?.name).toBe('Taylor')
  })

  test('should create 4 relationships (demo user with each friend)', async () => {
    await seedDemoData()

    const demoUser = await getDemoUser()
    const relationships = await prisma.relationship.findMany({
      where: {
        OR: [{ user1Id: demoUser.id }, { user2Id: demoUser.id }],
      },
    })

    expect(relationships.length).toBe(4)
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
        email: {
          in: [
            'demo@myturnyourturn.app',
            'demo_friend@myturnyourturn.app',
            'demo_friend2@myturnyourturn.app',
            'demo_friend3@myturnyourturn.app',
            'demo_friend4@myturnyourturn.app',
          ],
        },
      },
    })

    expect(demoUsers.length).toBe(5)
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

  test('should create tracks for all 4 friends', async () => {
    await seedDemoData()

    const demoUser = await getDemoUser()
    const relationships = await prisma.relationship.findMany({
      where: {
        OR: [{ user1Id: demoUser.id }, { user2Id: demoUser.id }],
      },
      include: {
        tracks: true,
        user1: true,
        user2: true,
      },
    })

    // Verify each relationship has tracks
    expect(relationships.length).toBe(4)
    relationships.forEach((rel) => {
      expect(rel.tracks.length).toBeGreaterThan(0)
    })

    // Verify total track count (Alex: 4, Sarah: 2, Jordan: 2, Taylor: 3 = 11 tracks)
    const totalTracks = relationships.reduce(
      (sum, rel) => sum + rel.tracks.length,
      0
    )
    expect(totalTracks).toBe(11)
  })

  test('should have correct friend names and identifiers', async () => {
    await seedDemoData()

    const alex = await prisma.user.findUnique({
      where: { uniqueIdentifier: 'alex_demo' },
    })
    expect(alex?.name).toBe('Alex')

    const sarah = await prisma.user.findUnique({
      where: { uniqueIdentifier: 'sarah_demo' },
    })
    expect(sarah?.name).toBe('Sarah')

    const jordan = await prisma.user.findUnique({
      where: { uniqueIdentifier: 'jordan_demo' },
    })
    expect(jordan?.name).toBe('Jordan')

    const taylor = await prisma.user.findUnique({
      where: { uniqueIdentifier: 'taylor_demo' },
    })
    expect(taylor?.name).toBe('Taylor')
  })
})
