import { prisma } from '@/lib/prisma'
import { DELETE } from '@/app/api/tracks/[id]/route'
import { NextRequest } from 'next/server'

// Mock session
jest.mock('@/lib/session', () => ({
  requireAuth: jest.fn(),
}))

const { requireAuth } = require('@/lib/session')

describe('DELETE /api/tracks/[id]', () => {
  let user1Id: string
  let user2Id: string
  let user3Id: string
  let relationshipId: string
  let trackId: string

  beforeEach(async () => {
    // Create test users
    const user1 = await prisma.user.create({
      data: {
        email: 'track-delete-user1@test.com',
        uniqueIdentifier: 'track-delete-user1',
        name: 'User One',
      },
    })
    user1Id = user1.id

    const user2 = await prisma.user.create({
      data: {
        email: 'track-delete-user2@test.com',
        uniqueIdentifier: 'track-delete-user2',
        name: 'User Two',
      },
    })
    user2Id = user2.id

    // Create third user (not in relationship)
    const user3 = await prisma.user.create({
      data: {
        email: 'track-delete-user3@test.com',
        uniqueIdentifier: 'track-delete-user3',
        name: 'User Three',
      },
    })
    user3Id = user3.id

    // Create relationship between user1 and user2
    const relationship = await prisma.relationship.create({
      data: {
        user1Id,
        user2Id,
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
    await prisma.history.deleteMany()
    await prisma.track.deleteMany()
    await prisma.relationship.deleteMany()
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'track-delete-user1@test.com',
            'track-delete-user2@test.com',
            'track-delete-user3@test.com',
          ],
        },
      },
    })
    jest.clearAllMocks()
  })

  test('should successfully delete track when user is part of relationship', async () => {
    requireAuth.mockResolvedValue({ id: user1Id })

    const request = new NextRequest('http://localhost:3000/api/tracks/' + trackId)
    const response = await DELETE(request, { params: { id: trackId } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)

    // Verify track is deleted
    const track = await prisma.track.findUnique({
      where: { id: trackId },
    })
    expect(track).toBeNull()
  })

  test('should cascade delete history when track is deleted', async () => {
    requireAuth.mockResolvedValue({ id: user1Id })

    // Create history entries
    await prisma.history.create({
      data: {
        trackId,
        fromUserId: user1Id,
        toUserId: user2Id,
        timestamp: new Date(),
      },
    })

    await prisma.history.create({
      data: {
        trackId,
        fromUserId: user2Id,
        toUserId: user1Id,
        timestamp: new Date(),
      },
    })

    // Verify history exists
    const historyBefore = await prisma.history.count({
      where: { trackId },
    })
    expect(historyBefore).toBe(2)

    // Delete track
    const request = new NextRequest('http://localhost:3000/api/tracks/' + trackId)
    const response = await DELETE(request, { params: { id: trackId } })

    expect(response.status).toBe(200)

    // Verify history is deleted
    const historyAfter = await prisma.history.count({
      where: { trackId },
    })
    expect(historyAfter).toBe(0)
  })

  test('should return 404 when track does not exist', async () => {
    requireAuth.mockResolvedValue({ id: user1Id })

    const fakeTrackId = '00000000-0000-0000-0000-000000000000'
    const request = new NextRequest('http://localhost:3000/api/tracks/' + fakeTrackId)
    const response = await DELETE(request, { params: { id: fakeTrackId } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Track not found')
  })

  test('should return 403 when user is not part of relationship', async () => {
    // User3 is not part of the relationship
    requireAuth.mockResolvedValue({ id: user3Id })

    const request = new NextRequest('http://localhost:3000/api/tracks/' + trackId)
    const response = await DELETE(request, { params: { id: trackId } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden')

    // Verify track was NOT deleted
    const track = await prisma.track.findUnique({
      where: { id: trackId },
    })
    expect(track).not.toBeNull()
  })

  test('should allow either user in relationship to delete track', async () => {
    // Test with user2 (the other user in the relationship)
    requireAuth.mockResolvedValue({ id: user2Id })

    const request = new NextRequest('http://localhost:3000/api/tracks/' + trackId)
    const response = await DELETE(request, { params: { id: trackId } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)

    // Verify track is deleted
    const track = await prisma.track.findUnique({
      where: { id: trackId },
    })
    expect(track).toBeNull()
  })
})
