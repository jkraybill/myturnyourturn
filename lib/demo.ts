import { prisma } from './prisma'

const DEMO_USER_EMAIL = 'demo@myturnyourturn.app'
const DEMO_FRIEND_EMAIL = 'demo_friend@myturnyourturn.app'

export async function getDemoUser() {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  })

  if (!user) {
    throw new Error('Demo user not found. Run seedDemoData first.')
  }

  return user
}

export async function cleanupDemoData() {
  // Delete in order to respect foreign key constraints
  // First delete history, then tracks, then relationships, then users
  await prisma.history.deleteMany({
    where: {
      OR: [
        {
          fromUser: {
            email: { in: [DEMO_USER_EMAIL, DEMO_FRIEND_EMAIL] },
          },
        },
        {
          toUser: {
            email: { in: [DEMO_USER_EMAIL, DEMO_FRIEND_EMAIL] },
          },
        },
      ],
    },
  })

  await prisma.track.deleteMany({
    where: {
      relationship: {
        OR: [
          {
            user1: {
              email: { in: [DEMO_USER_EMAIL, DEMO_FRIEND_EMAIL] },
            },
          },
          {
            user2: {
              email: { in: [DEMO_USER_EMAIL, DEMO_FRIEND_EMAIL] },
            },
          },
        ],
      },
    },
  })

  await prisma.relationship.deleteMany({
    where: {
      OR: [
        {
          user1: {
            email: { in: [DEMO_USER_EMAIL, DEMO_FRIEND_EMAIL] },
          },
        },
        {
          user2: {
            email: { in: [DEMO_USER_EMAIL, DEMO_FRIEND_EMAIL] },
          },
        },
      ],
    },
  })

  await prisma.user.deleteMany({
    where: {
      email: { in: [DEMO_USER_EMAIL, DEMO_FRIEND_EMAIL] },
    },
  })
}

export async function seedDemoData() {
  // Check if demo data already exists
  const existingDemoUser = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  })

  if (existingDemoUser) {
    // Demo data already exists, return early (idempotent)
    return
  }

  // Create demo user
  const demoUser = await prisma.user.create({
    data: {
      email: DEMO_USER_EMAIL,
      emailVerified: new Date(),
      name: 'Demo User',
      nickname: 'Demo',
      uniqueIdentifier: 'demo_user',
      image: null,
    },
  })

  // Create demo friend
  const demoFriend = await prisma.user.create({
    data: {
      email: DEMO_FRIEND_EMAIL,
      emailVerified: new Date(),
      name: 'Alex',
      nickname: 'Alex',
      uniqueIdentifier: 'demo_friend',
      image: null,
    },
  })

  // Create relationship
  const relationship = await prisma.relationship.create({
    data: {
      user1Id: demoUser.id,
      user2Id: demoFriend.id,
    },
  })

  // Create tracks
  const coffeeTrack = await prisma.track.create({
    data: {
      relationshipId: relationship.id,
      name: 'coffee',
      currentTurnUserId: demoFriend.id, // Friend's turn
    },
  })

  const lunchTrack = await prisma.track.create({
    data: {
      relationshipId: relationship.id,
      name: 'lunch',
      currentTurnUserId: demoUser.id, // Your turn
    },
  })

  const beerTrack = await prisma.track.create({
    data: {
      relationshipId: relationship.id,
      name: 'beer',
      currentTurnUserId: demoFriend.id, // Friend's turn
    },
  })

  const customTrack = await prisma.track.create({
    data: {
      relationshipId: relationship.id,
      name: 'custom',
      customName: 'Movie Night',
      currentTurnUserId: demoUser.id, // Your turn
    },
  })

  // Create some history entries to show the app has been used
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

  // Coffee history - showing several toggles
  await prisma.history.create({
    data: {
      trackId: coffeeTrack.id,
      fromUserId: demoUser.id,
      toUserId: demoFriend.id,
      timestamp: threeDaysAgo,
    },
  })

  await prisma.history.create({
    data: {
      trackId: coffeeTrack.id,
      fromUserId: demoFriend.id,
      toUserId: demoUser.id,
      timestamp: twoDaysAgo,
    },
  })

  await prisma.history.create({
    data: {
      trackId: coffeeTrack.id,
      fromUserId: demoUser.id,
      toUserId: demoFriend.id,
      timestamp: oneDayAgo,
    },
  })

  // Lunch history
  await prisma.history.create({
    data: {
      trackId: lunchTrack.id,
      fromUserId: demoFriend.id,
      toUserId: demoUser.id,
      timestamp: twoDaysAgo,
    },
  })

  // Beer history
  await prisma.history.create({
    data: {
      trackId: beerTrack.id,
      fromUserId: demoUser.id,
      toUserId: demoFriend.id,
      timestamp: oneDayAgo,
    },
  })
}
