import { Test, type TestingModule } from '@nestjs/testing'
import type { User } from '../../domain/entities/user.entity'
import { UserStatusValue } from '../../domain/value-objects/user-status.value-object'
import { UsersService } from '../users.service'

/**
 * @description UsersService简化单元测试
 *
 * 测试重点：
 * 1. 验证服务正确调用相应的use cases
 * 2. 验证参数传递的正确性
 * 3. 验证返回值的正确性
 */
describe('UsersService (Simplified)', () => {
  let service: UsersService

  const mockUserRepository = {
    findById: jest.fn(),
    save: jest.fn(),
    findAll: jest.fn(),
  }

  const mockCreateUserUseCase = {
    execute: jest.fn(),
  }

  const mockGetUserUseCase = {
    execute: jest.fn(),
    executeByUsername: jest.fn(),
    executeByEmail: jest.fn(),
  }

  const mockGetUsersUseCase = {
    execute: jest.fn(),
    executeAllUsers: jest.fn(),
    executeActiveUsers: jest.fn(),
  }

  const mockUpdateUserUseCase = {
    execute: jest.fn(),
  }

  const mockUpdateUserStatusUseCase = {
    executeActivate: jest.fn(),
    executeSuspend: jest.fn(),
  }

  const mockDeleteUserUseCase = {
    execute: jest.fn(),
    executeRestore: jest.fn(),
  }

  const mockAssignUserToOrganizationUseCase = {
    execute: jest.fn(),
    executeRemoveFromOrganization: jest.fn(),
    executeGetUsersByOrganization: jest.fn(),
    executeGetUserOrganizations: jest.fn(),
  }

  const mockAssignRoleToUserUseCase = {
    execute: jest.fn(),
    executeRemoveRole: jest.fn(),
    executeGetUsersByRole: jest.fn(),
    executeGetUserRoles: jest.fn(),
  }

  const mockSearchUsersUseCase = {
    execute: jest.fn(),
    executeAdvancedSearch: jest.fn(),
    executeGetUserSuggestions: jest.fn(),
  }

  const mockGetUserStatisticsUseCase = {
    execute: jest.fn(),
    executeByStatus: jest.fn(),
    executeByOrganization: jest.fn(),
    executeByRole: jest.fn(),
  }

  const mockUser = {
    id: 'user-1',
    username: { getValue: jest.fn().mockReturnValue('testuser') },
    email: { getValue: jest.fn().mockReturnValue('test@example.com') },
    firstName: 'Test',
    lastName: 'User',
    status: new UserStatusValue('ACTIVE' as any),
  } as unknown as User

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: 'CreateUserUseCase',
          useValue: mockCreateUserUseCase,
        },
        {
          provide: 'GetUserUseCase',
          useValue: mockGetUserUseCase,
        },
        {
          provide: 'GetUsersUseCase',
          useValue: mockGetUsersUseCase,
        },
        {
          provide: 'UpdateUserUseCase',
          useValue: mockUpdateUserUseCase,
        },
        {
          provide: 'UpdateUserStatusUseCase',
          useValue: mockUpdateUserStatusUseCase,
        },
        {
          provide: 'DeleteUserUseCase',
          useValue: mockDeleteUserUseCase,
        },
        {
          provide: 'AssignUserToOrganizationUseCase',
          useValue: mockAssignUserToOrganizationUseCase,
        },
        {
          provide: 'AssignRoleToUserUseCase',
          useValue: mockAssignRoleToUserUseCase,
        },
        {
          provide: 'SearchUsersUseCase',
          useValue: mockSearchUsersUseCase,
        },
        {
          provide: 'GetUserStatisticsUseCase',
          useValue: mockGetUserStatisticsUseCase,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createUser', () => {
    it('应该成功创建用户', async () => {
      // Arrange
      const createUserData = {
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: 'hashedPassword',
        phone: '13812345678',
        displayName: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        organizationIds: ['org-1'],
        roleIds: ['role-1'],
        preferences: { theme: 'dark' },
      }
      const tenantId = 'tenant-1'
      const adminUserId = 'admin-1'

      mockCreateUserUseCase.execute.mockResolvedValue(mockUser)

      // Act
      const result = await service.createUser(
        createUserData.username,
        createUserData.email,
        createUserData.firstName,
        createUserData.lastName,
        tenantId,
        adminUserId,
        createUserData.passwordHash,
        createUserData.phone,
        createUserData.displayName,
        createUserData.avatar,
        createUserData.organizationIds,
        createUserData.roleIds,
        createUserData.preferences,
      )

      // Assert
      expect(result).toBe(mockUser)
      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(
        {
          username: createUserData.username,
          email: createUserData.email,
          firstName: createUserData.firstName,
          lastName: createUserData.lastName,
          passwordHash: createUserData.passwordHash,
          phone: createUserData.phone,
          displayName: createUserData.displayName,
          avatar: createUserData.avatar,
          organizationIds: createUserData.organizationIds,
          roleIds: createUserData.roleIds,
          preferences: createUserData.preferences,
        },
        tenantId,
        adminUserId,
      )
    })
  })

  describe('getUserById', () => {
    it('应该成功根据ID获取用户', async () => {
      // Arrange
      const userId = 'user-1'
      const tenantId = 'tenant-1'

      mockGetUserUseCase.execute.mockResolvedValue(mockUser)

      // Act
      const result = await service.getUserById(userId, tenantId)

      // Assert
      expect(result).toBe(mockUser)
      expect(mockGetUserUseCase.execute).toHaveBeenCalledWith(userId, tenantId)
    })
  })

  describe('getUserByUsername', () => {
    it('应该成功根据用户名获取用户', async () => {
      // Arrange
      const username = 'testuser'
      const tenantId = 'tenant-1'

      mockGetUserUseCase.executeByUsername.mockResolvedValue(mockUser)

      // Act
      const result = await service.getUserByUsername(username, tenantId)

      // Assert
      expect(result).toBe(mockUser)
      expect(mockGetUserUseCase.executeByUsername).toHaveBeenCalledWith(
        username,
        tenantId,
      )
    })
  })

  describe('getUserByEmail', () => {
    it('应该成功根据邮箱获取用户', async () => {
      // Arrange
      const email = 'test@example.com'
      const tenantId = 'tenant-1'

      mockGetUserUseCase.executeByEmail.mockResolvedValue(mockUser)

      // Act
      const result = await service.getUserByEmail(email, tenantId)

      // Assert
      expect(result).toBe(mockUser)
      expect(mockGetUserUseCase.executeByEmail).toHaveBeenCalledWith(
        email,
        tenantId,
      )
    })
  })

  describe('getAllUsers', () => {
    it('应该成功获取所有用户', async () => {
      // Arrange
      const tenantId = 'tenant-1'
      const mockUsers = [mockUser]

      mockGetUsersUseCase.executeAllUsers.mockResolvedValue(mockUsers)

      // Act
      const result = await service.getAllUsers(tenantId)

      // Assert
      expect(result).toBe(mockUsers)
      expect(mockGetUsersUseCase.executeAllUsers).toHaveBeenCalledWith(tenantId)
    })
  })

  describe('getActiveUsers', () => {
    it('应该成功获取激活用户', async () => {
      // Arrange
      const tenantId = 'tenant-1'
      const mockUsers = [mockUser]

      mockGetUsersUseCase.executeActiveUsers.mockResolvedValue(mockUsers)

      // Act
      const result = await service.getActiveUsers(tenantId)

      // Assert
      expect(result).toBe(mockUsers)
      expect(mockGetUsersUseCase.executeActiveUsers).toHaveBeenCalledWith(
        tenantId,
      )
    })
  })

  describe('getUsersWithPagination', () => {
    it('应该成功分页获取用户', async () => {
      // Arrange
      const tenantId = 'tenant-1'
      const page = 1
      const limit = 10
      const mockResult = {
        users: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      mockGetUsersUseCase.execute.mockResolvedValue(mockResult)

      // Act
      const result = await service.getUsersWithPagination(tenantId, page, limit)

      // Assert
      expect(result).toBe(mockResult)
      expect(mockGetUsersUseCase.execute).toHaveBeenCalledWith(
        tenantId,
        page,
        limit,
      )
    })
  })

  describe('activateUser', () => {
    it('应该成功激活用户', async () => {
      // Arrange
      const userId = 'user-1'
      const tenantId = 'tenant-1'
      const adminUserId = 'admin-1'

      mockUpdateUserStatusUseCase.executeActivate.mockResolvedValue(mockUser)

      // Act
      const result = await service.activateUser(userId, tenantId, adminUserId)

      // Assert
      expect(result).toBe(mockUser)
      expect(mockUpdateUserStatusUseCase.executeActivate).toHaveBeenCalledWith(
        userId,
        tenantId,
        adminUserId,
      )
    })
  })

  describe('suspendUser', () => {
    it('应该成功禁用用户', async () => {
      // Arrange
      const userId = 'user-1'
      const tenantId = 'tenant-1'
      const adminUserId = 'admin-1'
      const reason = '违反使用条款'

      mockUpdateUserStatusUseCase.executeSuspend.mockResolvedValue(mockUser)

      // Act
      const result = await service.suspendUser(
        userId,
        tenantId,
        adminUserId,
        reason,
      )

      // Assert
      expect(result).toBe(mockUser)
      expect(mockUpdateUserStatusUseCase.executeSuspend).toHaveBeenCalledWith(
        userId,
        tenantId,
        adminUserId,
        reason,
      )
    })
  })

  describe('updateUserInfo', () => {
    it('应该成功更新用户基本信息', async () => {
      // Arrange
      const userId = 'user-1'
      const tenantId = 'tenant-1'
      const firstName = 'Updated'
      const lastName = 'User'
      const displayName = 'Updated User'
      const avatar = 'https://example.com/new-avatar.jpg'

      mockUpdateUserUseCase.execute.mockResolvedValue(mockUser)

      // Act
      const result = await service.updateUserInfo(
        userId,
        tenantId,
        firstName,
        lastName,
        displayName,
        avatar,
      )

      // Assert
      expect(result).toBe(mockUser)
      expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith(
        userId,
        {
          firstName,
          lastName,
          displayName,
          avatar,
        },
        tenantId,
      )
    })
  })

  describe('updateUserContactInfo', () => {
    it('应该成功更新用户联系信息（包含手机号）', async () => {
      // Arrange
      const userId = 'user-1'
      const tenantId = 'tenant-1'
      const email = 'newemail@example.com'
      const phone = '13987654321'

      mockUpdateUserUseCase.execute.mockResolvedValue(mockUser)

      // Act
      const result = await service.updateUserContactInfo(
        userId,
        tenantId,
        email,
        phone,
      )

      // Assert
      expect(result).toBe(mockUser)
      expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith(
        userId,
        { email, phone },
        tenantId,
      )
    })

    it('应该成功更新用户联系信息（不包含手机号）', async () => {
      // Arrange
      const userId = 'user-1'
      const tenantId = 'tenant-1'
      const email = 'newemail@example.com'

      mockUpdateUserUseCase.execute.mockResolvedValue(mockUser)

      // Act
      const result = await service.updateUserContactInfo(
        userId,
        tenantId,
        email,
      )

      // Assert
      expect(result).toBe(mockUser)
      expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith(
        userId,
        { email },
        tenantId,
      )
    })
  })

  describe('deleteUser', () => {
    it('应该成功删除用户', async () => {
      // Arrange
      const userId = 'user-1'
      const tenantId = 'tenant-1'
      const adminUserId = 'admin-1'

      mockDeleteUserUseCase.execute.mockResolvedValue(true)

      // Act
      const result = await service.deleteUser(userId, tenantId, adminUserId)

      // Assert
      expect(result).toBe(true)
      expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith(
        userId,
        tenantId,
        adminUserId,
      )
    })
  })

  describe('restoreUser', () => {
    it('应该成功恢复用户', async () => {
      // Arrange
      const userId = 'user-1'
      const tenantId = 'tenant-1'
      const adminUserId = 'admin-1'

      mockDeleteUserUseCase.executeRestore.mockResolvedValue(true)

      // Act
      const result = await service.restoreUser(userId, tenantId, adminUserId)

      // Assert
      expect(result).toBe(true)
      expect(mockDeleteUserUseCase.executeRestore).toHaveBeenCalledWith(
        userId,
        tenantId,
        adminUserId,
      )
    })
  })

  describe('assignUserToOrganization', () => {
    it('应该成功分配用户到组织', async () => {
      // Arrange
      const userId = 'user-1'
      const tenantId = 'tenant-1'
      const organizationId = 'org-1'
      const adminUserId = 'admin-1'

      mockAssignUserToOrganizationUseCase.execute.mockResolvedValue(mockUser)

      // Act
      const result = await service.assignUserToOrganization(
        userId,
        tenantId,
        organizationId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(mockUser)
      expect(mockAssignUserToOrganizationUseCase.execute).toHaveBeenCalledWith(
        userId,
        organizationId,
        tenantId,
        adminUserId,
      )
    })
  })

  describe('removeUserFromOrganization', () => {
    it('应该成功从组织移除用户', async () => {
      // Arrange
      const userId = 'user-1'
      const tenantId = 'tenant-1'
      const organizationId = 'org-1'
      const adminUserId = 'admin-1'

      mockAssignUserToOrganizationUseCase.executeRemoveFromOrganization.mockResolvedValue(
        mockUser,
      )

      // Act
      const result = await service.removeUserFromOrganization(
        userId,
        tenantId,
        organizationId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(mockUser)
      expect(
        mockAssignUserToOrganizationUseCase.executeRemoveFromOrganization,
      ).toHaveBeenCalledWith(userId, organizationId, tenantId, adminUserId)
    })
  })

  describe('assignRoleToUser', () => {
    it('应该成功分配角色给用户', async () => {
      // Arrange
      const userId = 'user-1'
      const tenantId = 'tenant-1'
      const roleId = 'role-1'
      const adminUserId = 'admin-1'

      mockAssignRoleToUserUseCase.execute.mockResolvedValue(mockUser)

      // Act
      const result = await service.assignRoleToUser(
        userId,
        tenantId,
        roleId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(mockUser)
      expect(mockAssignRoleToUserUseCase.execute).toHaveBeenCalledWith(
        userId,
        roleId,
        tenantId,
        adminUserId,
      )
    })
  })

  describe('removeRoleFromUser', () => {
    it('应该成功移除用户角色', async () => {
      // Arrange
      const userId = 'user-1'
      const tenantId = 'tenant-1'
      const roleId = 'role-1'
      const adminUserId = 'admin-1'

      mockAssignRoleToUserUseCase.executeRemoveRole.mockResolvedValue(mockUser)

      // Act
      const result = await service.removeRoleFromUser(
        userId,
        tenantId,
        roleId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(mockUser)
      expect(
        mockAssignRoleToUserUseCase.executeRemoveRole,
      ).toHaveBeenCalledWith(userId, roleId, tenantId, adminUserId)
    })
  })

  describe('searchUsers', () => {
    it('应该成功搜索用户', async () => {
      // Arrange
      const searchTerm = 'test'
      const tenantId = 'tenant-1'
      const page = 1
      const limit = 10
      const mockResult = {
        users: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      mockSearchUsersUseCase.execute.mockResolvedValue(mockResult)

      // Act
      const result = await service.searchUsers(
        searchTerm,
        tenantId,
        page,
        limit,
      )

      // Assert
      expect(result).toBe(mockResult)
      expect(mockSearchUsersUseCase.execute).toHaveBeenCalledWith(
        searchTerm,
        tenantId,
        page,
        limit,
      )
    })
  })

  describe('searchUsersAdvanced', () => {
    it('应该成功执行高级搜索', async () => {
      // Arrange
      const searchCriteria = {
        keyword: 'test',
        status: 'ACTIVE',
        organizationId: 'org-1',
        roleId: 'role-1',
      }
      const tenantId = 'tenant-1'
      const page = 1
      const limit = 10
      const mockResult = {
        users: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      mockSearchUsersUseCase.executeAdvancedSearch.mockResolvedValue(mockResult)

      // Act
      const result = await service.searchUsersAdvanced(
        searchCriteria,
        tenantId,
        page,
        limit,
      )

      // Assert
      expect(result).toBe(mockResult)
      expect(mockSearchUsersUseCase.executeAdvancedSearch).toHaveBeenCalledWith(
        searchCriteria,
        tenantId,
        page,
        limit,
      )
    })
  })

  describe('getUserSuggestions', () => {
    it('应该成功获取用户建议', async () => {
      // Arrange
      const query = 'test'
      const tenantId = 'tenant-1'
      const limit = 5
      const mockSuggestions = [
        {
          id: 'user-1',
          username: 'testuser',
          displayName: 'Test User',
          email: 'test@example.com',
        },
      ]

      mockSearchUsersUseCase.executeGetUserSuggestions.mockResolvedValue(
        mockSuggestions,
      )

      // Act
      const result = await service.getUserSuggestions(query, tenantId, limit)

      // Assert
      expect(result).toBe(mockSuggestions)
      expect(
        mockSearchUsersUseCase.executeGetUserSuggestions,
      ).toHaveBeenCalledWith(query, tenantId, limit)
    })
  })

  describe('getUsersByOrganization', () => {
    it('应该成功获取组织下的用户', async () => {
      // Arrange
      const organizationId = 'org-1'
      const tenantId = 'tenant-1'
      const mockUsers = [mockUser]

      mockAssignUserToOrganizationUseCase.executeGetUsersByOrganization.mockResolvedValue(
        mockUsers,
      )

      // Act
      const result = await service.getUsersByOrganization(
        organizationId,
        tenantId,
      )

      // Assert
      expect(result).toBe(mockUsers)
      expect(
        mockAssignUserToOrganizationUseCase.executeGetUsersByOrganization,
      ).toHaveBeenCalledWith(organizationId, tenantId)
    })
  })

  describe('getUsersByRole', () => {
    it('应该成功获取拥有角色的用户', async () => {
      // Arrange
      const roleId = 'role-1'
      const tenantId = 'tenant-1'
      const mockUsers = [mockUser]

      mockAssignRoleToUserUseCase.executeGetUsersByRole.mockResolvedValue(
        mockUsers,
      )

      // Act
      const result = await service.getUsersByRole(roleId, tenantId)

      // Assert
      expect(result).toBe(mockUsers)
      expect(
        mockAssignRoleToUserUseCase.executeGetUsersByRole,
      ).toHaveBeenCalledWith(roleId, tenantId)
    })
  })

  describe('getUserOrganizations', () => {
    it('应该成功获取用户所属组织', async () => {
      // Arrange
      const userId = 'user-1'
      const tenantId = 'tenant-1'
      const mockOrganizations = ['org-1', 'org-2']

      mockAssignUserToOrganizationUseCase.executeGetUserOrganizations.mockResolvedValue(
        mockOrganizations,
      )

      // Act
      const result = await service.getUserOrganizations(userId, tenantId)

      // Assert
      expect(result).toBe(mockOrganizations)
      expect(
        mockAssignUserToOrganizationUseCase.executeGetUserOrganizations,
      ).toHaveBeenCalledWith(userId, tenantId)
    })
  })

  describe('getUserRoles', () => {
    it('应该成功获取用户角色', async () => {
      // Arrange
      const userId = 'user-1'
      const tenantId = 'tenant-1'
      const mockRoles = ['role-1', 'role-2']

      mockAssignRoleToUserUseCase.executeGetUserRoles.mockResolvedValue(
        mockRoles,
      )

      // Act
      const result = await service.getUserRoles(userId, tenantId)

      // Assert
      expect(result).toBe(mockRoles)
      expect(
        mockAssignRoleToUserUseCase.executeGetUserRoles,
      ).toHaveBeenCalledWith(userId, tenantId)
    })
  })

  describe('getUserStatistics', () => {
    it('应该成功获取用户统计信息', async () => {
      // Arrange
      const tenantId = 'tenant-1'
      const mockStats = {
        totalUsers: 100,
        activeUsers: 80,
        pendingUsers: 10,
        suspendedUsers: 5,
        deletedUsers: 5,
        lockedUsers: 2,
        usersWithFailedLoginAttempts: 3,
        recentUsers: 15,
        userGrowthRate: 0.05,
      }

      mockGetUserStatisticsUseCase.execute.mockResolvedValue(mockStats)

      // Act
      const result = await service.getUserStatistics(tenantId)

      // Assert
      expect(result).toBe(mockStats)
      expect(mockGetUserStatisticsUseCase.execute).toHaveBeenCalledWith(
        tenantId,
      )
    })
  })

  describe('getUserStatisticsByStatus', () => {
    it('应该成功获取按状态分组的统计信息', async () => {
      // Arrange
      const tenantId = 'tenant-1'
      const mockStats = [
        { status: 'ACTIVE', count: 80, percentage: 80 },
        { status: 'SUSPENDED', count: 5, percentage: 5 },
      ]

      mockGetUserStatisticsUseCase.executeByStatus.mockResolvedValue(mockStats)

      // Act
      const result = await service.getUserStatisticsByStatus(tenantId)

      // Assert
      expect(result).toBe(mockStats)
      expect(mockGetUserStatisticsUseCase.executeByStatus).toHaveBeenCalledWith(
        tenantId,
      )
    })
  })

  describe('getUserStatisticsByOrganization', () => {
    it('应该成功获取按组织分组的统计信息', async () => {
      // Arrange
      const tenantId = 'tenant-1'
      const mockStats = [
        { organizationId: 'org-1', userCount: 50 },
        { organizationId: 'org-2', userCount: 30 },
      ]

      mockGetUserStatisticsUseCase.executeByOrganization.mockResolvedValue(
        mockStats,
      )

      // Act
      const result = await service.getUserStatisticsByOrganization(tenantId)

      // Assert
      expect(result).toBe(mockStats)
      expect(
        mockGetUserStatisticsUseCase.executeByOrganization,
      ).toHaveBeenCalledWith(tenantId)
    })
  })

  describe('getUserStatisticsByRole', () => {
    it('应该成功获取按角色分组的统计信息', async () => {
      // Arrange
      const tenantId = 'tenant-1'
      const mockStats = [
        { roleId: 'role-1', userCount: 40 },
        { roleId: 'role-2', userCount: 30 },
      ]

      mockGetUserStatisticsUseCase.executeByRole.mockResolvedValue(mockStats)

      // Act
      const result = await service.getUserStatisticsByRole(tenantId)

      // Assert
      expect(result).toBe(mockStats)
      expect(mockGetUserStatisticsUseCase.executeByRole).toHaveBeenCalledWith(
        tenantId,
      )
    })
  })
})
