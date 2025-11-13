import { prisma } from './prisma'

const DEMO_USER_EMAIL = 'demo@myturnyourturn.app'
const DEMO_FRIEND_EMAIL = 'demo_friend@myturnyourturn.app'
const DEMO_FRIEND2_EMAIL = 'demo_friend2@myturnyourturn.app'
const DEMO_FRIEND3_EMAIL = 'demo_friend3@myturnyourturn.app'
const DEMO_FRIEND4_EMAIL = 'demo_friend4@myturnyourturn.app'

const ALL_DEMO_EMAILS = [
  DEMO_USER_EMAIL,
  DEMO_FRIEND_EMAIL,
  DEMO_FRIEND2_EMAIL,
  DEMO_FRIEND3_EMAIL,
  DEMO_FRIEND4_EMAIL,
]

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
            email: { in: ALL_DEMO_EMAILS },
          },
        },
        {
          toUser: {
            email: { in: ALL_DEMO_EMAILS },
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
              email: { in: ALL_DEMO_EMAILS },
            },
          },
          {
            user2: {
              email: { in: ALL_DEMO_EMAILS },
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
            email: { in: ALL_DEMO_EMAILS },
          },
        },
        {
          user2: {
            email: { in: ALL_DEMO_EMAILS },
          },
        },
      ],
    },
  })

  await prisma.user.deleteMany({
    where: {
      email: { in: ALL_DEMO_EMAILS },
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

  // Create demo friends
  const demoFriend = await prisma.user.create({
    data: {
      email: DEMO_FRIEND_EMAIL,
      emailVerified: new Date(),
      name: 'Alex',
      nickname: 'Alex',
      uniqueIdentifier: 'alex_demo',
      image: null,
    },
  })

  const demoFriend2 = await prisma.user.create({
    data: {
      email: DEMO_FRIEND2_EMAIL,
      emailVerified: new Date(),
      name: 'Sarah',
      nickname: 'Sarah',
      uniqueIdentifier: 'sarah_demo',
      image: null,
    },
  })

  const demoFriend3 = await prisma.user.create({
    data: {
      email: DEMO_FRIEND3_EMAIL,
      emailVerified: new Date(),
      name: 'Jordan',
      nickname: 'Jordan',
      uniqueIdentifier: 'jordan_demo',
      image: null,
    },
  })

  const demoFriend4 = await prisma.user.create({
    data: {
      email: DEMO_FRIEND4_EMAIL,
      emailVerified: new Date(),
      name: 'Taylor',
      nickname: 'Taylor',
      uniqueIdentifier: 'taylor_demo',
      image: null,
    },
  })

  // Create relationships
  const relationship = await prisma.relationship.create({
    data: {
      user1Id: demoUser.id,
      user2Id: demoFriend.id,
    },
  })

  const relationship2 = await prisma.relationship.create({
    data: {
      user1Id: demoUser.id,
      user2Id: demoFriend2.id,
    },
  })

  const relationship3 = await prisma.relationship.create({
    data: {
      user1Id: demoUser.id,
      user2Id: demoFriend3.id,
    },
  })

  const relationship4 = await prisma.relationship.create({
    data: {
      user1Id: demoUser.id,
      user2Id: demoFriend4.id,
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

  // Create tracks for Sarah (relationship2)
  const sarahCoffeeTrack = await prisma.track.create({
    data: {
      relationshipId: relationship2.id,
      name: 'coffee',
      currentTurnUserId: demoUser.id, // Your turn
    },
  })

  const sarahLunchTrack = await prisma.track.create({
    data: {
      relationshipId: relationship2.id,
      name: 'lunch',
      currentTurnUserId: demoFriend2.id, // Sarah's turn
    },
  })

  // Sarah history
  await prisma.history.create({
    data: {
      trackId: sarahCoffeeTrack.id,
      fromUserId: demoFriend2.id,
      toUserId: demoUser.id,
      timestamp: twoDaysAgo,
    },
  })

  // Create tracks for Jordan (relationship3)
  const jordanBeerTrack = await prisma.track.create({
    data: {
      relationshipId: relationship3.id,
      name: 'beer',
      currentTurnUserId: demoFriend3.id, // Jordan's turn
    },
  })

  const jordanCustomTrack = await prisma.track.create({
    data: {
      relationshipId: relationship3.id,
      name: 'custom',
      customName: 'Game Night',
      currentTurnUserId: demoUser.id, // Your turn
    },
  })

  // Jordan history
  await prisma.history.create({
    data: {
      trackId: jordanBeerTrack.id,
      fromUserId: demoUser.id,
      toUserId: demoFriend3.id,
      timestamp: oneDayAgo,
    },
  })

  // Create tracks for Taylor (relationship4)
  const taylorCoffeeTrack = await prisma.track.create({
    data: {
      relationshipId: relationship4.id,
      name: 'coffee',
      currentTurnUserId: demoFriend4.id, // Taylor's turn
    },
  })

  const taylorLunchTrack = await prisma.track.create({
    data: {
      relationshipId: relationship4.id,
      name: 'lunch',
      currentTurnUserId: demoUser.id, // Your turn
    },
  })

  const taylorCustomTrack = await prisma.track.create({
    data: {
      relationshipId: relationship4.id,
      name: 'custom',
      customName: 'Workout',
      currentTurnUserId: demoFriend4.id, // Taylor's turn
    },
  })

  // Taylor history
  await prisma.history.create({
    data: {
      trackId: taylorCoffeeTrack.id,
      fromUserId: demoUser.id,
      toUserId: demoFriend4.id,
      timestamp: threeDaysAgo,
    },
  })

  await prisma.history.create({
    data: {
      trackId: taylorLunchTrack.id,
      fromUserId: demoFriend4.id,
      toUserId: demoUser.id,
      timestamp: oneDayAgo,
    },
  })
}
