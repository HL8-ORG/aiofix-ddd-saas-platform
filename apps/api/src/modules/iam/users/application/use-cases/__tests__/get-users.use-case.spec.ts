import type { User } from '@/modules/iam/users/domain/entities/user.entity'
import { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import {
  UserStatus,
  UserStatusValue,
} from '@/modules/iam/users/domain/value-objects/user-status.value-object'
import { Test, type TestingModule } from '@nestjs/testing'
import { GetUsersUseCase } from '../get-users.use-case'

/**
 * @description 获取用户列表用例的单元测试
 */
describe('GetUsersUseCase', () => {
  let useCase: GetUsersUseCase
  let userRepository: jest.Mocked<UserRepository>

  const mockUserRepository = {
    findWithPagination: jest.fn(),
    findActive: jest.fn(),
    findSuspended: jest.fn(),
    findDeleted: jest.fn(),
    findAll: jest.fn(),
    findByOrganizationId: jest.fn(),
    findByRoleId: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUsersUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile()

    useCase = module.get<GetUsersUseCase>(GetUsersUseCase)
    userRepository = module.get(UserRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    const tenantId = 'tenant-1'
    const page = 1
    const limit = 10

    it('应该成功获取所有用户', async () => {
      // Arrange
      const mockUsers = [
        { id: 'user-1', username: 'user1' },
        { id: 'user-2', username: 'user2' },
      ] as unknown as User[]

      userRepository.findAll.mockResolvedValue(mockUsers)

      // Act
      const result = await useCase.execute(tenantId, page, limit)

      // Assert
      expect(result.users).toEqual(mockUsers)
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(1)
      expect(userRepository.findAll).toHaveBeenCalledWith(tenantId)
    })

    it('应该成功根据搜索条件获取用户', async () => {
      // Arrange
      const filters = { search: 'test' }
      const mockResult = {
        users: [{ id: 'user-1', username: 'testuser' }] as unknown as User[],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      userRepository.findWithPagination.mockResolvedValue(mockResult)

      // Act
      const result = await useCase.execute(tenantId, page, limit, filters)

      // Assert
      expect(result).toEqual(mockResult)
      expect(userRepository.findWithPagination).toHaveBeenCalledWith(
        page,
        limit,
        tenantId,
        { search: 'test' },
      )
    })

    it('应该成功根据状态过滤获取用户', async () => {
      // Arrange
      const filters = { status: new UserStatusValue(UserStatus.ACTIVE) }
      const mockUsers = [
        { id: 'user-1', username: 'activeuser' },
      ] as unknown as User[]

      userRepository.findActive.mockResolvedValue(mockUsers)

      // Act
      const result = await useCase.execute(tenantId, page, limit, filters)

      // Assert
      expect(result.users).toEqual(mockUsers)
      expect(result.total).toBe(1)
      expect(userRepository.findActive).toHaveBeenCalledWith(tenantId)
    })

    it('应该成功根据组织过滤获取用户', async () => {
      // Arrange
      const filters = { organizationId: 'org-1' }
      const mockUsers = [
        { id: 'user-1', username: 'orguser' },
      ] as unknown as User[]

      userRepository.findByOrganizationId.mockResolvedValue(mockUsers)

      // Act
      const result = await useCase.execute(tenantId, page, limit, filters)

      // Assert
      expect(result.users).toEqual(mockUsers)
      expect(result.total).toBe(1)
      expect(userRepository.findByOrganizationId).toHaveBeenCalledWith(
        'org-1',
        tenantId,
      )
    })

    it('应该成功根据角色过滤获取用户', async () => {
      // Arrange
      const filters = { roleId: 'role-1' }
      const mockUsers = [
        { id: 'user-1', username: 'roleuser' },
      ] as unknown as User[]

      userRepository.findByRoleId.mockResolvedValue(mockUsers)

      // Act
      const result = await useCase.execute(tenantId, page, limit, filters)

      // Assert
      expect(result.users).toEqual(mockUsers)
      expect(result.total).toBe(1)
      expect(userRepository.findByRoleId).toHaveBeenCalledWith(
        'role-1',
        tenantId,
      )
    })

    it('应该正确处理分页', async () => {
      // Arrange
      const mockUsers = Array.from({ length: 25 }, (_, i) => ({
        id: `user-${i}`,
        username: `user${i}`,
      })) as unknown as User[]

      userRepository.findAll.mockResolvedValue(mockUsers)

      // Act
      const result = await useCase.execute(tenantId, 2, 10)

      // Assert
      expect(result.users).toHaveLength(10)
      expect(result.total).toBe(25)
      expect(result.page).toBe(2)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(3)
    })

    it('应该正确处理空结果', async () => {
      // Arrange
      userRepository.findAll.mockResolvedValue([])

      // Act
      const result = await useCase.execute(tenantId, page, limit)

      // Assert
      expect(result.users).toEqual([])
      expect(result.total).toBe(0)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(0)
    })

    it('应该正确处理null结果', async () => {
      // Arrange
      userRepository.findAll.mockResolvedValue(null as any)

      // Act
      const result = await useCase.execute(tenantId, page, limit)

      // Assert
      expect(result.users).toEqual([])
      expect(result.total).toBe(0)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(0)
    })
  })

  describe('executeActiveUsers', () => {
    const tenantId = 'tenant-1'

    it('应该成功获取活跃用户列表', async () => {
      // Arrange
      const mockUsers = [
        { id: 'user-1', username: 'activeuser1' },
        { id: 'user-2', username: 'activeuser2' },
      ] as unknown as User[]

      userRepository.findActive.mockResolvedValue(mockUsers)

      // Act
      const result = await useCase.executeActiveUsers(tenantId)

      // Assert
      expect(result).toEqual(mockUsers)
      expect(userRepository.findActive).toHaveBeenCalledWith(tenantId)
    })
  })

  describe('executeAllUsers', () => {
    const tenantId = 'tenant-1'

    it('应该成功获取所有用户列表', async () => {
      // Arrange
      const mockUsers = [
        { id: 'user-1', username: 'user1' },
        { id: 'user-2', username: 'user2' },
        { id: 'user-3', username: 'user3' },
      ] as unknown as User[]

      userRepository.findAll.mockResolvedValue(mockUsers)

      // Act
      const result = await useCase.executeAllUsers(tenantId)

      // Assert
      expect(result).toEqual(mockUsers)
      expect(userRepository.findAll).toHaveBeenCalledWith(tenantId)
    })
  })

  describe('状态过滤测试', () => {
    const tenantId = 'tenant-1'
    const page = 1
    const limit = 10

    it('应该正确处理ACTIVE状态过滤', async () => {
      // Arrange
      const filters = { status: new UserStatusValue(UserStatus.ACTIVE) }
      const mockUsers = [
        { id: 'user-1', username: 'activeuser' },
      ] as unknown as User[]

      userRepository.findActive.mockResolvedValue(mockUsers)

      // Act
      const result = await useCase.execute(tenantId, page, limit, filters)

      // Assert
      expect(result.users).toEqual(mockUsers)
      expect(userRepository.findActive).toHaveBeenCalledWith(tenantId)
    })

    it('应该正确处理SUSPENDED状态过滤', async () => {
      // Arrange
      const filters = { status: new UserStatusValue(UserStatus.SUSPENDED) }
      const mockUsers = [
        { id: 'user-1', username: 'suspendeduser' },
      ] as unknown as User[]

      userRepository.findSuspended.mockResolvedValue(mockUsers)

      // Act
      const result = await useCase.execute(tenantId, page, limit, filters)

      // Assert
      expect(result.users).toEqual(mockUsers)
      expect(userRepository.findSuspended).toHaveBeenCalledWith(tenantId)
    })

    it('应该正确处理DELETED状态过滤', async () => {
      // Arrange
      const filters = { status: new UserStatusValue(UserStatus.DELETED) }
      const mockUsers = [
        { id: 'user-1', username: 'deleteduser' },
      ] as unknown as User[]

      userRepository.findDeleted.mockResolvedValue(mockUsers)

      // Act
      const result = await useCase.execute(tenantId, page, limit, filters)

      // Assert
      expect(result.users).toEqual(mockUsers)
      expect(userRepository.findDeleted).toHaveBeenCalledWith(tenantId)
    })

    it('应该正确处理PENDING状态过滤', async () => {
      // Arrange
      const filters = { status: new UserStatusValue(UserStatus.PENDING) }
      const mockUsers = [
        { id: 'user-1', username: 'pendinguser' },
      ] as unknown as User[]

      userRepository.findAll.mockResolvedValue(mockUsers)

      // Act
      const result = await useCase.execute(tenantId, page, limit, filters)

      // Assert
      expect(result.users).toEqual(mockUsers)
      expect(userRepository.findAll).toHaveBeenCalledWith(tenantId)
    })
  })
})
