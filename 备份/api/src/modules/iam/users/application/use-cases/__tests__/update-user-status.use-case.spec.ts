import { User } from '@/modules/iam/users/domain/entities/user.entity'
import { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import {
  UserStatus,
  UserStatusValue,
} from '@/modules/iam/users/domain/value-objects/user-status.value-object'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { UpdateUserStatusUseCase } from '../update-user-status.use-case'

/**
 * @description 更新用户状态用例的单元测试
 */
describe('UpdateUserStatusUseCase', () => {
  let useCase: UpdateUserStatusUseCase
  let userRepository: jest.Mocked<UserRepository>

  const mockUserRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserStatusUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile()

    useCase = module.get<UpdateUserStatusUseCase>(UpdateUserStatusUseCase)
    userRepository = module.get(UserRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    const userId = 'user-1'
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功更新用户状态为激活', async () => {
      // Arrange
      const newStatus = new UserStatusValue(UserStatus.ACTIVE)
      const mockUser = {
        id: 'user-1',
        status: {
          getValue: jest.fn().mockReturnValue('PENDING'),
        },
        activate: jest.fn(),
        suspend: jest.fn(),
        markAsDeleted: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.execute(
        userId,
        newStatus,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(userRepository.findById).toHaveBeenCalledWith(userId, tenantId)
      expect(mockUser.activate).toHaveBeenCalled()
      expect(userRepository.save).toHaveBeenCalledWith(mockUser)
    })

    it('应该成功更新用户状态为禁用', async () => {
      // Arrange
      const newStatus = new UserStatusValue(UserStatus.SUSPENDED)
      const mockUser = {
        id: 'user-1',
        status: {
          getValue: jest.fn().mockReturnValue('ACTIVE'),
        },
        activate: jest.fn(),
        suspend: jest.fn(),
        markAsDeleted: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.execute(
        userId,
        newStatus,
        tenantId,
        adminUserId,
        '违反使用条款',
      )

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(mockUser.suspend).toHaveBeenCalled()
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      const newStatus = new UserStatusValue(UserStatus.ACTIVE)
      userRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.execute(userId, newStatus, tenantId, adminUserId),
      ).rejects.toThrow(NotFoundException)
    })

    it('当尝试修改自己的状态时应该抛出BadRequestException', async () => {
      // Arrange
      const newStatus = new UserStatusValue(UserStatus.ACTIVE)
      const mockUser = {
        id: 'admin-1', // 与adminUserId相同
        status: {
          getValue: jest.fn().mockReturnValue('PENDING'),
        },
        activate: jest.fn(),
        suspend: jest.fn(),
        markAsDeleted: jest.fn(),
      } as any

      userRepository.findById.mockResolvedValue(mockUser)

      // Act & Assert
      await expect(
        useCase.execute(userId, newStatus, tenantId, adminUserId),
      ).rejects.toThrow(BadRequestException)
      await expect(
        useCase.execute(userId, newStatus, tenantId, adminUserId),
      ).rejects.toThrow('不能修改自己的状态')
    })

    it('当状态转换无效时应该抛出BadRequestException', async () => {
      // Arrange
      const newStatus = new UserStatusValue(UserStatus.DELETED)
      const mockUser = {
        id: 'user-1',
        status: {
          getValue: jest.fn().mockReturnValue('ACTIVE'),
        },
        activate: jest.fn(),
        suspend: jest.fn(),
        markAsDeleted: jest.fn(),
      } as any

      userRepository.findById.mockResolvedValue(mockUser)

      // Act & Assert
      await expect(
        useCase.execute(userId, newStatus, tenantId, adminUserId),
      ).rejects.toThrow(BadRequestException)
      await expect(
        useCase.execute(userId, newStatus, tenantId, adminUserId),
      ).rejects.toThrow('无效的状态转换：从 ACTIVE 到 DELETED')
    })
  })

  describe('executeActivate', () => {
    const userId = 'user-1'
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功激活用户', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          getValue: jest.fn().mockReturnValue('PENDING'),
        },
        activate: jest.fn(),
        suspend: jest.fn(),
        markAsDeleted: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.executeActivate(
        userId,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(mockUser.activate).toHaveBeenCalled()
    })
  })

  describe('executeSuspend', () => {
    const userId = 'user-1'
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'
    const reason = '违反使用条款'

    it('应该成功禁用用户', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          getValue: jest.fn().mockReturnValue('ACTIVE'),
        },
        activate: jest.fn(),
        suspend: jest.fn(),
        markAsDeleted: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.executeSuspend(
        userId,
        tenantId,
        adminUserId,
        reason,
      )

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(mockUser.suspend).toHaveBeenCalled()
    })
  })

  describe('executeBatchStatusUpdate', () => {
    const userIds = ['user-1', 'user-2', 'user-3']
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'
    const newStatus = new UserStatusValue(UserStatus.ACTIVE)

    it('应该成功批量更新用户状态', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          getValue: jest.fn().mockReturnValue('PENDING'),
        },
        activate: jest.fn(),
        suspend: jest.fn(),
        markAsDeleted: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.executeBatchStatusUpdate(
        userIds,
        newStatus,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result.success).toEqual(['user-1', 'user-2', 'user-3'])
      expect(result.failed).toEqual([])
      expect(userRepository.findById).toHaveBeenCalledTimes(3)
      expect(userRepository.save).toHaveBeenCalledTimes(3)
    })

    it('应该正确处理部分失败的批量更新', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          getValue: jest.fn().mockReturnValue('PENDING'),
        },
        activate: jest.fn(),
        suspend: jest.fn(),
        markAsDeleted: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null) // 第二个用户不存在
        .mockResolvedValueOnce(mockUser)
      userRepository.save
        .mockResolvedValueOnce(updatedMockUser)
        .mockResolvedValueOnce(updatedMockUser)

      // Act
      const result = await useCase.executeBatchStatusUpdate(
        userIds,
        newStatus,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result.success).toEqual(['user-1', 'user-3'])
      expect(result.failed).toEqual(['user-2'])
    })
  })

  describe('executeLockUser', () => {
    const userId = 'user-1'
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'
    const duration = 30
    const reason = '登录失败次数过多'

    it('应该成功锁定用户', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          getValue: jest.fn().mockReturnValue('ACTIVE'),
        },
        activate: jest.fn(),
        suspend: jest.fn(),
        markAsDeleted: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.executeLockUser(
        userId,
        tenantId,
        adminUserId,
        duration,
        reason,
      )

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(mockUser.suspend).toHaveBeenCalled()
    })
  })

  describe('executeUnlockUser', () => {
    const userId = 'user-1'
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功解锁用户', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          getValue: jest.fn().mockReturnValue('SUSPENDED'),
        },
        activate: jest.fn(),
        suspend: jest.fn(),
        markAsDeleted: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.executeUnlockUser(
        userId,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(mockUser.activate).toHaveBeenCalled()
    })
  })

  describe('executeResetFailedLoginAttempts', () => {
    const userId = 'user-1'
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功重置登录失败次数', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          getValue: jest.fn().mockReturnValue('ACTIVE'),
        },
        activate: jest.fn(),
        suspend: jest.fn(),
        markAsDeleted: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.executeResetFailedLoginAttempts(
        userId,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(userRepository.findById).toHaveBeenCalledWith(userId, tenantId)
      expect(userRepository.save).toHaveBeenCalledWith(mockUser)
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.executeResetFailedLoginAttempts(userId, tenantId, adminUserId),
      ).rejects.toThrow(NotFoundException)
    })
  })
})
