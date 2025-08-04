import type { User } from '@/modules/iam/users/domain/entities/user.entity'
import { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import { Test, type TestingModule } from '@nestjs/testing'
import { SearchUsersUseCase } from '../search-users.use-case'

/**
 * @description 搜索用户用例的单元测试
 */
describe('SearchUsersUseCase', () => {
  let useCase: SearchUsersUseCase
  let userRepository: jest.Mocked<UserRepository>

  const mockUserRepository = {
    findWithPagination: jest.fn(),
    findAll: jest.fn(),
    findBySearch: jest.fn(),
    findByUsernameString: jest.fn(),
    findByEmailString: jest.fn(),
    findByPhoneString: jest.fn(),
    findByOrganizationId: jest.fn(),
    findByRoleId: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchUsersUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile()

    useCase = module.get<SearchUsersUseCase>(SearchUsersUseCase)
    userRepository = module.get(UserRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    const tenantId = 'tenant-1'
    const page = 1
    const limit = 10

    it('应该成功搜索用户', async () => {
      // Arrange
      const searchTerm = 'test'
      const mockResult = {
        users: [
          { id: 'user-1', username: 'testuser1' },
          { id: 'user-2', username: 'testuser2' },
        ] as unknown as User[],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      userRepository.findWithPagination.mockResolvedValue(mockResult)

      // Act
      const result = await useCase.execute(searchTerm, tenantId, page, limit)

      // Assert
      expect(result).toEqual(mockResult)
      expect(userRepository.findWithPagination).toHaveBeenCalledWith(
        page,
        limit,
        tenantId,
        { search: searchTerm },
      )
    })

    it('应该正确处理空搜索结果', async () => {
      // Arrange
      const searchTerm = 'nonexistent'
      const mockResult = {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }

      userRepository.findWithPagination.mockResolvedValue(mockResult)

      // Act
      const result = await useCase.execute(searchTerm, tenantId, page, limit)

      // Assert
      expect(result).toEqual(mockResult)
      expect(result.users).toEqual([])
      expect(result.total).toBe(0)
    })

    it('应该正确处理分页', async () => {
      // Arrange
      const searchTerm = 'test'
      const mockResult = {
        users: Array.from({ length: 10 }, (_, i) => ({
          id: `user-${i}`,
          username: `testuser${i}`,
        })) as unknown as User[],
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
      }

      userRepository.findWithPagination.mockResolvedValue(mockResult)

      // Act
      const result = await useCase.execute(searchTerm, tenantId, 2, 10)

      // Assert
      expect(result).toEqual(mockResult)
      expect(result.users).toHaveLength(10)
      expect(result.total).toBe(25)
      expect(result.page).toBe(2)
      expect(result.totalPages).toBe(3)
    })
  })

  describe('executeAdvancedSearch', () => {
    const tenantId = 'tenant-1'
    const page = 1
    const limit = 10

    it('应该成功执行高级搜索', async () => {
      // Arrange
      const searchCriteria = {
        keyword: 'test',
        status: 'ACTIVE',
        organizationId: 'org-1',
        roleId: 'role-1',
      }

      const mockResult = {
        users: [
          { id: 'user-1', username: 'testuser', email: 'test@example.com' },
        ] as unknown as User[],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      userRepository.findWithPagination.mockResolvedValue(mockResult)

      // Act
      const result = await useCase.executeAdvancedSearch(
        searchCriteria,
        tenantId,
        page,
        limit,
      )

      // Assert
      expect(result).toEqual(mockResult)
      expect(userRepository.findWithPagination).toHaveBeenCalledWith(
        page,
        limit,
        tenantId,
        {
          search: searchCriteria.keyword,
          status: searchCriteria.status,
          organizationId: searchCriteria.organizationId,
          roleId: searchCriteria.roleId,
        },
        undefined,
      )
    })

    it('应该正确处理部分搜索条件', async () => {
      // Arrange
      const searchCriteria = {
        keyword: 'test',
        status: 'ACTIVE',
      }

      const mockResult = {
        users: [{ id: 'user-1', username: 'testuser' }] as unknown as User[],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      userRepository.findWithPagination.mockResolvedValue(mockResult)

      // Act
      const result = await useCase.executeAdvancedSearch(
        searchCriteria,
        tenantId,
        page,
        limit,
      )

      // Assert
      expect(result).toEqual(mockResult)
      expect(userRepository.findWithPagination).toHaveBeenCalledWith(
        page,
        limit,
        tenantId,
        {
          search: searchCriteria.keyword,
          status: searchCriteria.status,
          organizationId: undefined,
          roleId: undefined,
        },
        undefined,
      )
    })
  })

  describe('executeGetUserSuggestions', () => {
    const tenantId = 'tenant-1'
    const query = 'test'
    const limit = 5

    it('应该成功获取用户建议', async () => {
      // Arrange
      const mockUsers = [
        {
          id: 'user-1',
          username: { getValue: jest.fn().mockReturnValue('testuser1') },
          email: { getValue: jest.fn().mockReturnValue('test1@example.com') },
          firstName: 'John',
          lastName: 'Doe',
        },
        {
          id: 'user-2',
          username: { getValue: jest.fn().mockReturnValue('testuser2') },
          email: { getValue: jest.fn().mockReturnValue('test2@example.com') },
          firstName: 'Jane',
          lastName: 'Smith',
        },
      ] as any[]

      userRepository.findBySearch.mockResolvedValue(mockUsers)

      // Act
      const result = await useCase.executeGetUserSuggestions(
        query,
        tenantId,
        limit,
      )

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 'user-1',
        username: 'testuser1',
        email: 'test1@example.com',
        displayName: 'John Doe',
      })
      expect(result[1]).toEqual({
        id: 'user-2',
        username: 'testuser2',
        email: 'test2@example.com',
        displayName: 'Jane Smith',
      })
    })

    it('应该正确处理空查询', async () => {
      // Arrange
      const query = ''
      const mockUsers = [] as any[]

      userRepository.findBySearch.mockResolvedValue(mockUsers)

      // Act
      const result = await useCase.executeGetUserSuggestions(
        query,
        tenantId,
        limit,
      )

      // Assert
      expect(result).toEqual([])
    })

    it('应该正确处理没有匹配结果的情况', async () => {
      // Arrange
      const query = 'nonexistent'
      const mockUsers = [] as any[]

      userRepository.findBySearch.mockResolvedValue(mockUsers)

      // Act
      const result = await useCase.executeGetUserSuggestions(
        query,
        tenantId,
        limit,
      )

      // Assert
      expect(result).toEqual([])
    })

    it('应该正确处理用户没有firstName和lastName的情况', async () => {
      // Arrange
      const mockUsers = [
        {
          id: 'user-1',
          username: { getValue: jest.fn().mockReturnValue('testuser1') },
          email: { getValue: jest.fn().mockReturnValue('test1@example.com') },
          firstName: undefined,
          lastName: undefined,
        },
      ] as any[]

      userRepository.findBySearch.mockResolvedValue(mockUsers)

      // Act
      const result = await useCase.executeGetUserSuggestions(
        query,
        tenantId,
        limit,
      )

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'user-1',
        username: 'testuser1',
        email: 'test1@example.com',
        displayName: 'undefined undefined',
      })
    })
  })

  describe('executeSearchByUsername', () => {
    const tenantId = 'tenant-1'
    const username = 'testuser'

    it('应该成功根据用户名搜索', async () => {
      // Arrange
      const mockUsers = [
        { id: 'user-1', username: 'testuser1' },
        { id: 'user-2', username: 'testuser2' },
      ] as unknown as User[]

      userRepository.findByUsernameString.mockResolvedValue(mockUsers[0])

      // Act
      const result = await useCase.executeSearchByUsername(username, tenantId)

      // Assert
      expect(result).toEqual([mockUsers[0]])
      expect(userRepository.findByUsernameString).toHaveBeenCalledWith(
        username,
        tenantId,
      )
    })
  })

  describe('executeSearchByEmail', () => {
    const tenantId = 'tenant-1'
    const email = 'test@example.com'

    it('应该成功根据邮箱搜索', async () => {
      // Arrange
      const mockUsers = [
        { id: 'user-1', email: 'test1@example.com' },
        { id: 'user-2', email: 'test2@example.com' },
      ] as unknown as User[]

      userRepository.findByEmailString.mockResolvedValue(mockUsers[0])

      // Act
      const result = await useCase.executeSearchByEmail(email, tenantId)

      // Assert
      expect(result).toEqual([mockUsers[0]])
      expect(userRepository.findByEmailString).toHaveBeenCalledWith(
        email,
        tenantId,
      )
    })
  })

  describe('executeSearchByPhone', () => {
    const tenantId = 'tenant-1'
    const phone = '138'

    it('应该成功根据手机号搜索', async () => {
      // Arrange
      const mockUsers = [
        { id: 'user-1', phone: '13812345678' },
        { id: 'user-2', phone: '13887654321' },
      ] as unknown as User[]

      userRepository.findByPhoneString.mockResolvedValue(mockUsers[0])

      // Act
      const result = await useCase.executeSearchByPhone(phone, tenantId)

      // Assert
      expect(result).toEqual([mockUsers[0]])
      expect(userRepository.findByPhoneString).toHaveBeenCalledWith(
        phone,
        tenantId,
      )
    })
  })

  describe('executeSearchByOrganization', () => {
    const tenantId = 'tenant-1'
    const organizationId = 'org-1'

    it('应该成功根据组织搜索', async () => {
      // Arrange
      const mockUsers = [
        { id: 'user-1', username: 'orguser1' },
        { id: 'user-2', username: 'orguser2' },
      ] as unknown as User[]

      userRepository.findByOrganizationId.mockResolvedValue(mockUsers)

      // Act
      const result = await useCase.executeSearchByOrganization(
        organizationId,
        tenantId,
      )

      // Assert
      expect(result).toEqual(mockUsers)
      expect(userRepository.findByOrganizationId).toHaveBeenCalledWith(
        organizationId,
        tenantId,
      )
    })
  })

  describe('executeSearchByRole', () => {
    const tenantId = 'tenant-1'
    const roleId = 'role-1'

    it('应该成功根据角色搜索', async () => {
      // Arrange
      const mockUsers = [
        { id: 'user-1', username: 'roleuser1' },
        { id: 'user-2', username: 'roleuser2' },
      ] as unknown as User[]

      userRepository.findByRoleId.mockResolvedValue(mockUsers)

      // Act
      const result = await useCase.executeSearchByRole(roleId, tenantId)

      // Assert
      expect(result).toEqual(mockUsers)
      expect(userRepository.findByRoleId).toHaveBeenCalledWith(roleId, tenantId)
    })
  })
})
