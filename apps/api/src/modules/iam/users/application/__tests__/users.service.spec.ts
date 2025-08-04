import type { UserRepository } from '../../domain/repositories/user.repository'
import type { AssignRoleToUserUseCase } from '../use-cases/assign-role-to-user.use-case'
import type { AssignUserToOrganizationUseCase } from '../use-cases/assign-user-to-organization.use-case'
import type { CreateUserUseCase } from '../use-cases/create-user.use-case'
import type { DeleteUserUseCase } from '../use-cases/delete-user.use-case'
import type { GetUserStatisticsUseCase } from '../use-cases/get-user-statistics.use-case'
import type { GetUserUseCase } from '../use-cases/get-user.use-case'
import type { GetUsersUseCase } from '../use-cases/get-users.use-case'
import type { SearchUsersUseCase } from '../use-cases/search-users.use-case'
import type { UpdateUserStatusUseCase } from '../use-cases/update-user-status.use-case'
import type { UpdateUserUseCase } from '../use-cases/update-user.use-case'
import { UsersService } from '../users.service'

/**
 * @description UsersService单元测试
 */
describe('UsersService', () => {
  let service: UsersService
  let mockUserRepository: jest.Mocked<UserRepository>
  let mockCreateUserUseCase: jest.Mocked<CreateUserUseCase>
  let mockGetUserUseCase: jest.Mocked<GetUserUseCase>
  let mockGetUsersUseCase: jest.Mocked<GetUsersUseCase>
  let mockUpdateUserUseCase: jest.Mocked<UpdateUserUseCase>
  let mockUpdateUserStatusUseCase: jest.Mocked<UpdateUserStatusUseCase>
  let mockDeleteUserUseCase: jest.Mocked<DeleteUserUseCase>
  let mockAssignUserToOrganizationUseCase: jest.Mocked<AssignUserToOrganizationUseCase>
  let mockAssignRoleToUserUseCase: jest.Mocked<AssignRoleToUserUseCase>
  let mockSearchUsersUseCase: jest.Mocked<SearchUsersUseCase>
  let mockGetUserStatisticsUseCase: jest.Mocked<GetUserStatisticsUseCase>

  beforeEach(async () => {
    // 创建所有 mock 对象
    mockUserRepository = {
      findById: jest.fn(),
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findWithPagination: jest.fn(),
      findActive: jest.fn(),
      findLocked: jest.fn(),
      findByDateRange: jest.fn(),
      findByOrganizationId: jest.fn(),
      findByRoleId: jest.fn(),
      countByStatus: jest.fn(),
      countByOrganization: jest.fn(),
      countByRole: jest.fn(),
      countByDateRange: jest.fn(),
      countByTenant: jest.fn(),
      getActiveUserCount: jest.fn(),
      getNewUserCount: jest.fn(),
      getDeletedUserCount: jest.fn(),
      findBySearch: jest.fn(),
      findByUsernameString: jest.fn(),
      findByEmailString: jest.fn(),
      findByPhoneString: jest.fn(),
    } as any

    mockCreateUserUseCase = {
      execute: jest.fn(),
    } as any

    mockGetUserUseCase = {
      execute: jest.fn(),
      executeByUsername: jest.fn(),
      executeByEmail: jest.fn(),
    } as any

    mockGetUsersUseCase = {
      execute: jest.fn(),
      executeAllUsers: jest.fn(),
      executeActiveUsers: jest.fn(),
    } as any

    mockUpdateUserUseCase = {
      execute: jest.fn(),
    } as any

    mockUpdateUserStatusUseCase = {
      executeActivate: jest.fn(),
      executeSuspend: jest.fn(),
    } as any

    mockDeleteUserUseCase = {
      execute: jest.fn(),
      executeRestore: jest.fn(),
    } as any

    mockAssignUserToOrganizationUseCase = {
      execute: jest.fn(),
      executeRemoveFromOrganization: jest.fn(),
      executeGetUsersByOrganization: jest.fn(),
      executeGetUserOrganizations: jest.fn(),
    } as any

    mockAssignRoleToUserUseCase = {
      execute: jest.fn(),
      executeRemoveRole: jest.fn(),
      executeGetUsersByRole: jest.fn(),
      executeGetUserRoles: jest.fn(),
    } as any

    mockSearchUsersUseCase = {
      execute: jest.fn(),
      executeAdvancedSearch: jest.fn(),
      executeGetUserSuggestions: jest.fn(),
    } as any

    mockGetUserStatisticsUseCase = {
      execute: jest.fn(),
      executeByStatus: jest.fn(),
      executeByOrganization: jest.fn(),
      executeByRole: jest.fn(),
    } as any

    // 直接创建 UsersService 实例
    service = new UsersService(
      mockUserRepository,
      mockCreateUserUseCase,
      mockGetUserUseCase,
      mockGetUsersUseCase,
      mockUpdateUserUseCase,
      mockUpdateUserStatusUseCase,
      mockDeleteUserUseCase,
      mockAssignUserToOrganizationUseCase,
      mockAssignRoleToUserUseCase,
      mockSearchUsersUseCase,
      mockGetUserStatisticsUseCase,
    )
  })

  it('应该被定义', () => {
    expect(service).toBeDefined()
  })

  describe('createUser', () => {
    it('应该成功创建用户', async () => {
      // Arrange
      const mockUser = { id: 'user-1' }
      mockCreateUserUseCase.execute.mockResolvedValue(mockUser as any)

      // Act
      const result = await service.createUser(
        'testuser',
        'test@example.com',
        'Test',
        'User',
        'tenant-1',
        'admin-1',
        'password-hash',
      )

      // Assert
      expect(result).toEqual(mockUser)
      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(
        {
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          passwordHash: 'password-hash',
          phone: undefined,
          displayName: undefined,
          avatar: undefined,
          organizationIds: undefined,
          roleIds: undefined,
          preferences: undefined,
        },
        'tenant-1',
        'admin-1',
      )
    })
  })

  describe('getUserById', () => {
    it('应该成功根据ID获取用户', async () => {
      // Arrange
      const mockUser = { id: 'user-1' }
      mockGetUserUseCase.execute.mockResolvedValue(mockUser as any)

      // Act
      const result = await service.getUserById('user-1', 'tenant-1')

      // Assert
      expect(result).toEqual(mockUser)
      expect(mockGetUserUseCase.execute).toHaveBeenCalledWith(
        'user-1',
        'tenant-1',
      )
    })
  })

  describe('getUserByUsername', () => {
    it('应该成功根据用户名获取用户', async () => {
      // Arrange
      const mockUser = { id: 'user-1' }
      mockGetUserUseCase.executeByUsername.mockResolvedValue(mockUser as any)

      // Act
      const result = await service.getUserByUsername('testuser', 'tenant-1')

      // Assert
      expect(result).toEqual(mockUser)
      expect(mockGetUserUseCase.executeByUsername).toHaveBeenCalledWith(
        'testuser',
        'tenant-1',
      )
    })
  })

  describe('getUserByEmail', () => {
    it('应该成功根据邮箱获取用户', async () => {
      // Arrange
      const mockUser = { id: 'user-1' }
      mockGetUserUseCase.executeByEmail.mockResolvedValue(mockUser as any)

      // Act
      const result = await service.getUserByEmail(
        'test@example.com',
        'tenant-1',
      )

      // Assert
      expect(result).toEqual(mockUser)
      expect(mockGetUserUseCase.executeByEmail).toHaveBeenCalledWith(
        'test@example.com',
        'tenant-1',
      )
    })
  })

  describe('getAllUsers', () => {
    it('应该成功获取所有用户', async () => {
      // Arrange
      const mockUsers = [{ id: 'user-1' }, { id: 'user-2' }]
      mockGetUsersUseCase.executeAllUsers.mockResolvedValue(mockUsers as any)

      // Act
      const result = await service.getAllUsers('tenant-1')

      // Assert
      expect(result).toEqual(mockUsers)
      expect(mockGetUsersUseCase.executeAllUsers).toHaveBeenCalledWith(
        'tenant-1',
      )
    })
  })

  describe('getActiveUsers', () => {
    it('应该成功获取激活用户', async () => {
      // Arrange
      const mockUsers = [{ id: 'user-1' }]
      mockGetUsersUseCase.executeActiveUsers.mockResolvedValue(mockUsers as any)

      // Act
      const result = await service.getActiveUsers('tenant-1')

      // Assert
      expect(result).toEqual(mockUsers)
      expect(mockGetUsersUseCase.executeActiveUsers).toHaveBeenCalledWith(
        'tenant-1',
      )
    })
  })

  describe('getUsersWithPagination', () => {
    it('应该成功分页获取用户', async () => {
      // Arrange
      const mockResult = {
        users: [{ id: 'user-1' }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }
      mockGetUsersUseCase.execute.mockResolvedValue(mockResult as any)

      // Act
      const result = await service.getUsersWithPagination('tenant-1', 1, 10)

      // Assert
      expect(result).toEqual(mockResult)
      expect(mockGetUsersUseCase.execute).toHaveBeenCalledWith(
        'tenant-1',
        1,
        10,
      )
    })
  })

  describe('activateUser', () => {
    it('应该成功激活用户', async () => {
      // Arrange
      const mockUser = { id: 'user-1' }
      mockUpdateUserStatusUseCase.executeActivate.mockResolvedValue(
        mockUser as any,
      )

      // Act
      const result = await service.activateUser('user-1', 'tenant-1', 'admin-1')

      // Assert
      expect(result).toEqual(mockUser)
      expect(mockUpdateUserStatusUseCase.executeActivate).toHaveBeenCalledWith(
        'user-1',
        'tenant-1',
        'admin-1',
      )
    })
  })

  describe('suspendUser', () => {
    it('应该成功禁用用户', async () => {
      // Arrange
      const mockUser = { id: 'user-1' }
      mockUpdateUserStatusUseCase.executeSuspend.mockResolvedValue(
        mockUser as any,
      )

      // Act
      const result = await service.suspendUser(
        'user-1',
        'tenant-1',
        'admin-1',
        '违反使用条款',
      )

      // Assert
      expect(result).toEqual(mockUser)
      expect(mockUpdateUserStatusUseCase.executeSuspend).toHaveBeenCalledWith(
        'user-1',
        'tenant-1',
        'admin-1',
        '违反使用条款',
      )
    })
  })

  describe('updateUserInfo', () => {
    it('应该成功更新用户基本信息', async () => {
      // Arrange
      const mockUser = { id: 'user-1' }
      mockUpdateUserUseCase.execute.mockResolvedValue(mockUser as any)

      // Act
      const result = await service.updateUserInfo(
        'user-1',
        'tenant-1',
        'Updated',
        'User',
        'Updated User',
        'https://example.com/avatar.jpg',
      )

      // Assert
      expect(result).toEqual(mockUser)
      expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith(
        'user-1',
        {
          firstName: 'Updated',
          lastName: 'User',
          displayName: 'Updated User',
          avatar: 'https://example.com/avatar.jpg',
        },
        'tenant-1',
      )
    })
  })

  describe('updateUserContactInfo', () => {
    it('应该成功更新用户联系信息', async () => {
      // Arrange
      const mockUser = { id: 'user-1' }
      mockUpdateUserUseCase.execute.mockResolvedValue(mockUser as any)

      // Act
      const result = await service.updateUserContactInfo(
        'user-1',
        'tenant-1',
        'new@example.com',
        '13987654321',
      )

      // Assert
      expect(result).toEqual(mockUser)
      expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith(
        'user-1',
        { email: 'new@example.com', phone: '13987654321' },
        'tenant-1',
      )
    })
  })

  describe('deleteUser', () => {
    it('应该成功删除用户', async () => {
      // Arrange
      mockDeleteUserUseCase.execute.mockResolvedValue(true)

      // Act
      const result = await service.deleteUser('user-1', 'tenant-1', 'admin-1')

      // Assert
      expect(result).toBe(true)
      expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith(
        'user-1',
        'tenant-1',
        'admin-1',
      )
    })
  })

  describe('restoreUser', () => {
    it('应该成功恢复用户', async () => {
      // Arrange
      mockDeleteUserUseCase.executeRestore.mockResolvedValue(true)

      // Act
      const result = await service.restoreUser('user-1', 'tenant-1', 'admin-1')

      // Assert
      expect(result).toBe(true)
      expect(mockDeleteUserUseCase.executeRestore).toHaveBeenCalledWith(
        'user-1',
        'tenant-1',
        'admin-1',
      )
    })
  })

  describe('assignUserToOrganization', () => {
    it('应该成功分配用户到组织', async () => {
      // Arrange
      const mockUser = { id: 'user-1' }
      mockAssignUserToOrganizationUseCase.execute.mockResolvedValue(
        mockUser as any,
      )

      // Act
      const result = await service.assignUserToOrganization(
        'user-1',
        'tenant-1',
        'org-1',
        'admin-1',
      )

      // Assert
      expect(result).toEqual(mockUser)
      expect(mockAssignUserToOrganizationUseCase.execute).toHaveBeenCalledWith(
        'user-1',
        'org-1',
        'tenant-1',
        'admin-1',
      )
    })
  })

  describe('removeUserFromOrganization', () => {
    it('应该成功从组织移除用户', async () => {
      // Arrange
      const mockUser = { id: 'user-1' }
      mockAssignUserToOrganizationUseCase.executeRemoveFromOrganization.mockResolvedValue(
        mockUser as any,
      )

      // Act
      const result = await service.removeUserFromOrganization(
        'user-1',
        'tenant-1',
        'org-1',
        'admin-1',
      )

      // Assert
      expect(result).toEqual(mockUser)
      expect(
        mockAssignUserToOrganizationUseCase.executeRemoveFromOrganization,
      ).toHaveBeenCalledWith('user-1', 'org-1', 'tenant-1', 'admin-1')
    })
  })

  describe('assignRoleToUser', () => {
    it('应该成功分配角色给用户', async () => {
      // Arrange
      const mockUser = { id: 'user-1' }
      mockAssignRoleToUserUseCase.execute.mockResolvedValue(mockUser as any)

      // Act
      const result = await service.assignRoleToUser(
        'user-1',
        'tenant-1',
        'role-1',
        'admin-1',
      )

      // Assert
      expect(result).toEqual(mockUser)
      expect(mockAssignRoleToUserUseCase.execute).toHaveBeenCalledWith(
        'user-1',
        'role-1',
        'tenant-1',
        'admin-1',
      )
    })
  })

  describe('removeRoleFromUser', () => {
    it('应该成功移除用户角色', async () => {
      // Arrange
      const mockUser = { id: 'user-1' }
      mockAssignRoleToUserUseCase.executeRemoveRole.mockResolvedValue(
        mockUser as any,
      )

      // Act
      const result = await service.removeRoleFromUser(
        'user-1',
        'tenant-1',
        'role-1',
        'admin-1',
      )

      // Assert
      expect(result).toEqual(mockUser)
      expect(
        mockAssignRoleToUserUseCase.executeRemoveRole,
      ).toHaveBeenCalledWith('user-1', 'role-1', 'tenant-1', 'admin-1')
    })
  })

  describe('searchUsers', () => {
    it('应该成功搜索用户', async () => {
      // Arrange
      const mockResult = {
        users: [{ id: 'user-1' }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }
      mockSearchUsersUseCase.execute.mockResolvedValue(mockResult as any)

      // Act
      const result = await service.searchUsers('test', 'tenant-1', 1, 10)

      // Assert
      expect(result).toEqual(mockResult)
      expect(mockSearchUsersUseCase.execute).toHaveBeenCalledWith(
        'test',
        'tenant-1',
        1,
        10,
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
      const mockResult = {
        users: [{ id: 'user-1' }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }
      mockSearchUsersUseCase.executeAdvancedSearch.mockResolvedValue(
        mockResult as any,
      )

      // Act
      const result = await service.searchUsersAdvanced(
        searchCriteria,
        'tenant-1',
        1,
        10,
      )

      // Assert
      expect(result).toEqual(mockResult)
      expect(mockSearchUsersUseCase.executeAdvancedSearch).toHaveBeenCalledWith(
        searchCriteria,
        'tenant-1',
        1,
        10,
      )
    })
  })

  describe('getUserSuggestions', () => {
    it('应该成功获取用户建议', async () => {
      // Arrange
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
      const result = await service.getUserSuggestions('test', 'tenant-1', 5)

      // Assert
      expect(result).toEqual(mockSuggestions)
      expect(
        mockSearchUsersUseCase.executeGetUserSuggestions,
      ).toHaveBeenCalledWith('test', 'tenant-1', 5)
    })
  })

  describe('getUsersByOrganization', () => {
    it('应该成功获取组织下的用户', async () => {
      // Arrange
      const mockUsers = [{ id: 'user-1' }]
      mockAssignUserToOrganizationUseCase.executeGetUsersByOrganization.mockResolvedValue(
        mockUsers as any,
      )

      // Act
      const result = await service.getUsersByOrganization('org-1', 'tenant-1')

      // Assert
      expect(result).toEqual(mockUsers)
      expect(
        mockAssignUserToOrganizationUseCase.executeGetUsersByOrganization,
      ).toHaveBeenCalledWith('org-1', 'tenant-1')
    })
  })

  describe('getUsersByRole', () => {
    it('应该成功获取拥有角色的用户', async () => {
      // Arrange
      const mockUsers = [{ id: 'user-1' }]
      mockAssignRoleToUserUseCase.executeGetUsersByRole.mockResolvedValue(
        mockUsers as any,
      )

      // Act
      const result = await service.getUsersByRole('role-1', 'tenant-1')

      // Assert
      expect(result).toEqual(mockUsers)
      expect(
        mockAssignRoleToUserUseCase.executeGetUsersByRole,
      ).toHaveBeenCalledWith('role-1', 'tenant-1')
    })
  })

  describe('getUserOrganizations', () => {
    it('应该成功获取用户所属组织', async () => {
      // Arrange
      const mockOrganizations = ['org-1', 'org-2']
      mockAssignUserToOrganizationUseCase.executeGetUserOrganizations.mockResolvedValue(
        mockOrganizations,
      )

      // Act
      const result = await service.getUserOrganizations('user-1', 'tenant-1')

      // Assert
      expect(result).toEqual(mockOrganizations)
      expect(
        mockAssignUserToOrganizationUseCase.executeGetUserOrganizations,
      ).toHaveBeenCalledWith('user-1', 'tenant-1')
    })
  })

  describe('getUserRoles', () => {
    it('应该成功获取用户角色', async () => {
      // Arrange
      const mockRoles = ['role-1', 'role-2']
      mockAssignRoleToUserUseCase.executeGetUserRoles.mockResolvedValue(
        mockRoles,
      )

      // Act
      const result = await service.getUserRoles('user-1', 'tenant-1')

      // Assert
      expect(result).toEqual(mockRoles)
      expect(
        mockAssignRoleToUserUseCase.executeGetUserRoles,
      ).toHaveBeenCalledWith('user-1', 'tenant-1')
    })
  })

  describe('getUserStatistics', () => {
    it('应该成功获取用户统计信息', async () => {
      // Arrange
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
      const result = await service.getUserStatistics('tenant-1')

      // Assert
      expect(result).toEqual(mockStats)
      expect(mockGetUserStatisticsUseCase.execute).toHaveBeenCalledWith(
        'tenant-1',
      )
    })
  })

  describe('getUserStatisticsByStatus', () => {
    it('应该成功获取按状态分组的统计信息', async () => {
      // Arrange
      const mockStats = [
        { status: 'ACTIVE', count: 80, percentage: 80 },
        { status: 'SUSPENDED', count: 5, percentage: 5 },
      ]
      mockGetUserStatisticsUseCase.executeByStatus.mockResolvedValue(mockStats)

      // Act
      const result = await service.getUserStatisticsByStatus('tenant-1')

      // Assert
      expect(result).toEqual(mockStats)
      expect(mockGetUserStatisticsUseCase.executeByStatus).toHaveBeenCalledWith(
        'tenant-1',
      )
    })
  })

  describe('getUserStatisticsByOrganization', () => {
    it('应该成功获取按组织分组的统计信息', async () => {
      // Arrange
      const mockStats = [
        { organizationId: 'org-1', userCount: 50 },
        { organizationId: 'org-2', userCount: 30 },
      ]
      mockGetUserStatisticsUseCase.executeByOrganization.mockResolvedValue(
        mockStats,
      )

      // Act
      const result = await service.getUserStatisticsByOrganization('tenant-1')

      // Assert
      expect(result).toEqual(mockStats)
      expect(
        mockGetUserStatisticsUseCase.executeByOrganization,
      ).toHaveBeenCalledWith('tenant-1')
    })
  })

  describe('getUserStatisticsByRole', () => {
    it('应该成功获取按角色分组的统计信息', async () => {
      // Arrange
      const mockStats = [
        { roleId: 'role-1', userCount: 40 },
        { roleId: 'role-2', userCount: 30 },
      ]
      mockGetUserStatisticsUseCase.executeByRole.mockResolvedValue(mockStats)

      // Act
      const result = await service.getUserStatisticsByRole('tenant-1')

      // Assert
      expect(result).toEqual(mockStats)
      expect(mockGetUserStatisticsUseCase.executeByRole).toHaveBeenCalledWith(
        'tenant-1',
      )
    })
  })
})
