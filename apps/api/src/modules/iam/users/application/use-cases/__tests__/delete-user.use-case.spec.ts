import { User } from '@/modules/iam/users/domain/entities/user.entity'
import { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import {
  UserStatus,
  UserStatusValue,
} from '@/modules/iam/users/domain/value-objects/user-status.value-object'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { DeleteUserUseCase } from '../delete-user.use-case'

/**
 * @description 删除用户用例的单元测试
 */
describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase
  let userRepository: jest.Mocked<UserRepository>

  const mockUserRepository = {
    findById: jest.fn(),
    delete: jest.fn(),
    hardDelete: jest.fn(),
    restore: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile()

    useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase)
    userRepository = module.get(UserRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    const userId = 'user-1'
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功软删除用户', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          canDelete: jest.fn().mockReturnValue(true),
        },
      } as any

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.delete.mockResolvedValue(true)

      // Act
      const result = await useCase.execute(userId, tenantId, adminUserId)

      // Assert
      expect(result).toBe(true)
      expect(userRepository.findById).toHaveBeenCalledWith(userId, tenantId)
      expect(userRepository.delete).toHaveBeenCalledWith(userId, tenantId)
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.execute(userId, tenantId, adminUserId),
      ).rejects.toThrow(NotFoundException)
      await expect(
        useCase.execute(userId, tenantId, adminUserId),
      ).rejects.toThrow('用户不存在')
    })

    it('当尝试删除自己时应该抛出BadRequestException', async () => {
      // Arrange
      const mockUser = {
        id: 'admin-1', // 与adminUserId相同
        status: {
          canDelete: jest.fn().mockReturnValue(true),
        },
      } as any

      userRepository.findById.mockResolvedValue(mockUser)

      // Act & Assert
      await expect(
        useCase.execute(userId, tenantId, adminUserId),
      ).rejects.toThrow(BadRequestException)
      await expect(
        useCase.execute(userId, tenantId, adminUserId),
      ).rejects.toThrow('不能删除自己的账户')
    })

    it('当用户状态不允许删除时应该抛出BadRequestException', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          canDelete: jest.fn().mockReturnValue(false),
          getValue: jest.fn().mockReturnValue('PENDING'),
        },
      } as any

      userRepository.findById.mockResolvedValue(mockUser)

      // Act & Assert
      await expect(
        useCase.execute(userId, tenantId, adminUserId),
      ).rejects.toThrow(BadRequestException)
      await expect(
        useCase.execute(userId, tenantId, adminUserId),
      ).rejects.toThrow('用户状态为 PENDING，无法删除')
    })
  })

  describe('executeHardDelete', () => {
    const userId = 'user-1'
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功硬删除用户', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          canDelete: jest.fn().mockReturnValue(true),
        },
      } as any

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.hardDelete.mockResolvedValue(true)

      // Act
      const result = await useCase.executeHardDelete(
        userId,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(true)
      expect(userRepository.findById).toHaveBeenCalledWith(userId, tenantId)
      expect(userRepository.hardDelete).toHaveBeenCalledWith(userId, tenantId)
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.executeHardDelete(userId, tenantId, adminUserId),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('executeBatchDelete', () => {
    const userIds = ['user-1', 'user-2', 'user-3']
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功批量删除用户', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          canDelete: jest.fn().mockReturnValue(true),
        },
      } as any

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.delete.mockResolvedValue(true)

      // Act
      const result = await useCase.executeBatchDelete(
        userIds,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result.success).toEqual(['user-1', 'user-2', 'user-3'])
      expect(result.failed).toEqual([])
      expect(userRepository.findById).toHaveBeenCalledTimes(3)
      expect(userRepository.delete).toHaveBeenCalledTimes(3)
    })

    it('应该正确处理部分失败的批量删除', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          canDelete: jest.fn().mockReturnValue(true),
        },
      } as any

      userRepository.findById
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null) // 第二个用户不存在
        .mockResolvedValueOnce(mockUser)
      userRepository.delete
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)

      // Act
      const result = await useCase.executeBatchDelete(
        userIds,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result.success).toEqual(['user-1'])
      expect(result.failed).toEqual(['user-2', 'user-3'])
    })
  })

  describe('executeRestore', () => {
    const userId = 'user-1'
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功恢复已删除的用户', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          isDeleted: jest.fn().mockReturnValue(true),
        },
      } as any

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.restore.mockResolvedValue(true)

      // Act
      const result = await useCase.executeRestore(userId, tenantId, adminUserId)

      // Assert
      expect(result).toBe(true)
      expect(userRepository.findById).toHaveBeenCalledWith(userId, tenantId)
      expect(userRepository.restore).toHaveBeenCalledWith(userId, tenantId)
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.executeRestore(userId, tenantId, adminUserId),
      ).rejects.toThrow(NotFoundException)
    })

    it('当用户未被删除时应该抛出BadRequestException', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          isDeleted: jest.fn().mockReturnValue(false),
        },
      } as any

      userRepository.findById.mockResolvedValue(mockUser)

      // Act & Assert
      await expect(
        useCase.executeRestore(userId, tenantId, adminUserId),
      ).rejects.toThrow(BadRequestException)
      await expect(
        useCase.executeRestore(userId, tenantId, adminUserId),
      ).rejects.toThrow('用户未被删除，无法恢复')
    })
  })

  describe('executePermanentDelete', () => {
    const userId = 'user-1'
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'
    const reason = '违反使用条款'

    it('应该成功永久删除用户', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          isDeleted: jest.fn().mockReturnValue(true),
        },
      } as any

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.hardDelete.mockResolvedValue(true)

      // Act
      const result = await useCase.executePermanentDelete(
        userId,
        tenantId,
        adminUserId,
        reason,
      )

      // Assert
      expect(result).toBe(true)
      expect(userRepository.findById).toHaveBeenCalledWith(userId, tenantId)
      expect(userRepository.hardDelete).toHaveBeenCalledWith(userId, tenantId)
    })

    it('当用户未被软删除时应该抛出BadRequestException', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          isDeleted: jest.fn().mockReturnValue(false),
        },
      } as any

      userRepository.findById.mockResolvedValue(mockUser)

      // Act & Assert
      await expect(
        useCase.executePermanentDelete(userId, tenantId, adminUserId, reason),
      ).rejects.toThrow(BadRequestException)
      await expect(
        useCase.executePermanentDelete(userId, tenantId, adminUserId, reason),
      ).rejects.toThrow('只能永久删除已被软删除的用户')
    })
  })
})
