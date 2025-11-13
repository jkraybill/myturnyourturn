import { prisma } from '@/lib/prisma'

describe('User Management', () => {
  afterEach(async () => {
    await prisma.user.deleteMany()
  })

  test('should create a user with unique identifier', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        uniqueIdentifier: 'testuser',
        name: 'Test User',
      },
    })

    expect(user).toBeDefined()
    expect(user.uniqueIdentifier).toBe('testuser')
  })

  test('should not allow duplicate unique identifiers', async () => {
    await prisma.user.create({
      data: {
        email: 'user1@example.com',
        uniqueIdentifier: 'testuser',
        name: 'User One',
      },
    })

    await expect(
      prisma.user.create({
        data: {
          email: 'user2@example.com',
          uniqueIdentifier: 'testuser',
          name: 'User Two',
        },
      })
    ).rejects.toThrow()
  })

  test('should not allow duplicate emails', async () => {
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        uniqueIdentifier: 'user1',
        name: 'User One',
      },
    })

    await expect(
      prisma.user.create({
        data: {
          email: 'test@example.com',
          uniqueIdentifier: 'user2',
          name: 'User Two',
        },
      })
    ).rejects.toThrow()
  })

  test('should find user by unique identifier', async () => {
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        uniqueIdentifier: 'findme',
        name: 'Test User',
      },
    })

    const user = await prisma.user.findUnique({
      where: { uniqueIdentifier: 'findme' },
    })

    expect(user).toBeDefined()
    expect(user?.name).toBe('Test User')
  })

  test('should update user nickname and unique identifier', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        uniqueIdentifier: 'original',
        name: 'Test User',
      },
    })

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        nickname: 'Cool Nickname',
        uniqueIdentifier: 'updated',
      },
    })

    expect(updated.nickname).toBe('Cool Nickname')
    expect(updated.uniqueIdentifier).toBe('updated')
  })
})
