import { generateUuid } from '@/shared/domain/utils/uuid.util'
import { CountPermissionsUseCase } from '../../use-cases/count-permissions.use-case'
import { PermissionRepository } from '../../../domain/repositories/permission.repository'
import { Permission } from '../../../domain/entities/permission.entity'
import { PermissionType } from '../../../domain/value-objects/permission-type.value-object'
import { PermissionAction } from '../../../domain/value-objects/permission-action.value-object'
import { PermissionStatus } from '../../../domain/value-objects/permission-status.value-object'

/**
 * @description 统计权限数量用例测试
 * 测试统计权限数量用例的业务逻辑和筛选功能
 */
describe('统计权限数量用例测试', () => {
  let countPermissionsUseCase: CountPermissionsUseCase
  let mockPermissionRepository: jest.Mocked<PermissionRepository>
  const tenantId = generateUuid()
  const organizationId = generateUuid()
  const adminUserId = generateUuid()

  beforeEach(() => {
    mockPermissionRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      findByCodeAndTenant: jest.fn(),
      findByNameAndTenant: jest.fn(),
      findAll: jest.fn(),
      findByIds: jest.fn(),
      findByTenantId: jest.fn(),
      findByOrganizationId: jest.fn(),
      findByType: jest.fn(),
      findByAction: jest.fn(),
      findByStatus: jest.fn(),
      findByResource: jest.fn(),
      findByModule: jest.fn(),
      findByRoleId: jest.fn(),
      findByParentPermissionId: jest.fn(),
      findByChildPermissionId: jest.fn(),
      findByTags: jest.fn(),
      findByExpiresAt: jest.fn(),
      findByCreatedAt: jest.fn(),
      findByUpdatedAt: jest.fn(),
      findByDeletedAt: jest.fn(),
      findByKeyword: jest.fn(),
      count: jest.fn(),
      countByTenantId: jest.fn(),
      countByOrganizationId: jest.fn(),
      countByType: jest.fn(),
      countByAction: jest.fn(),
      countByStatus: jest.fn(),
      countByResource: jest.fn(),
      countByModule: jest.fn(),
      countByRoleId: jest.fn(),
      countByParentPermissionId: jest.fn(),
      countByChildPermissionId: jest.fn(),
      countByTags: jest.fn(),
      countByExpiresAt: jest.fn(),
      countByCreatedAt: jest.fn(),
      countByUpdatedAt: jest.fn(),
      countByDeletedAt: jest.fn(),
      countByKeyword: jest.fn(),
      exists: jest.fn(),
      existsByCode: jest.fn(),
      existsByCodeAndTenant: jest.fn(),
      existsByNameAndTenant: jest.fn(),
      existsByTenantId: jest.fn(),
      existsByOrganizationId: jest.fn(),
      existsByType: jest.fn(),
      existsByAction: jest.fn(),
      existsByStatus: jest.fn(),
      existsByResource: jest.fn(),
      existsByModule: jest.fn(),
      existsByRoleId: jest.fn(),
      existsByParentPermissionId: jest.fn(),
      existsByChildPermissionId: jest.fn(),
      existsByTags: jest.fn(),
      existsByExpiresAt: jest.fn(),
      existsByCreatedAt: jest.fn(),
      existsByUpdatedAt: jest.fn(),
      existsByDeletedAt: jest.fn(),
      existsByKeyword: jest.fn(),
      update: jest.fn(),
      updateById: jest.fn(),
      updateByCode: jest.fn(),
      updateByCodeAndTenant: jest.fn(),
      updateByNameAndTenant: jest.fn(),
      updateByTenantId: jest.fn(),
      updateByOrganizationId: jest.fn(),
      updateByType: jest.fn(),
      updateByAction: jest.fn(),
      updateByStatus: jest.fn(),
      updateByResource: jest.fn(),
      updateByModule: jest.fn(),
      updateByRoleId: jest.fn(),
      updateByParentPermissionId: jest.fn(),
      updateByChildPermissionId: jest.fn(),
      updateByTags: jest.fn(),
      updateByExpiresAt: jest.fn(),
      updateByCreatedAt: jest.fn(),
      updateByUpdatedAt: jest.fn(),
      updateByDeletedAt: jest.fn(),
      updateByKeyword: jest.fn(),
      delete: jest.fn(),
      deleteById: jest.fn(),
      deleteByCode: jest.fn(),
      deleteByCodeAndTenant: jest.fn(),
      deleteByNameAndTenant: jest.fn(),
      deleteByTenantId: jest.fn(),
      deleteByOrganizationId: jest.fn(),
      deleteByType: jest.fn(),
      deleteByAction: jest.fn(),
      deleteByStatus: jest.fn(),
      deleteByResource: jest.fn(),
      deleteByModule: jest.fn(),
      deleteByRoleId: jest.fn(),
      deleteByParentPermissionId: jest.fn(),
      deleteByChildPermissionId: jest.fn(),
      deleteByTags: jest.fn(),
      deleteByExpiresAt: jest.fn(),
      deleteByCreatedAt: jest.fn(),
      deleteByUpdatedAt: jest.fn(),
      deleteByDeletedAt: jest.fn(),
      deleteByKeyword: jest.fn(),
      softDelete: jest.fn(),
      softDeleteById: jest.fn(),
      softDeleteByCode: jest.fn(),
      softDeleteByCodeAndTenant: jest.fn(),
      softDeleteByNameAndTenant: jest.fn(),
      softDeleteByTenantId: jest.fn(),
      softDeleteByOrganizationId: jest.fn(),
      softDeleteByType: jest.fn(),
      softDeleteByAction: jest.fn(),
      softDeleteByStatus: jest.fn(),
      softDeleteByResource: jest.fn(),
      softDeleteByModule: jest.fn(),
      softDeleteByRoleId: jest.fn(),
      softDeleteByParentPermissionId: jest.fn(),
      softDeleteByChildPermissionId: jest.fn(),
      softDeleteByTags: jest.fn(),
      softDeleteByExpiresAt: jest.fn(),
      softDeleteByCreatedAt: jest.fn(),
      softDeleteByUpdatedAt: jest.fn(),
      softDeleteByDeletedAt: jest.fn(),
      softDeleteByKeyword: jest.fn(),
      restore: jest.fn(),
      restoreById: jest.fn(),
      restoreByCode: jest.fn(),
      restoreByCodeAndTenant: jest.fn(),
      restoreByNameAndTenant: jest.fn(),
      restoreByTenantId: jest.fn(),
      restoreByOrganizationId: jest.fn(),
      restoreByType: jest.fn(),
      restoreByAction: jest.fn(),
      restoreByStatus: jest.fn(),
      restoreByResource: jest.fn(),
      restoreByModule: jest.fn(),
      restoreByRoleId: jest.fn(),
      restoreByParentPermissionId: jest.fn(),
      restoreByChildPermissionId: jest.fn(),
      restoreByTags: jest.fn(),
      restoreByExpiresAt: jest.fn(),
      restoreByCreatedAt: jest.fn(),
      restoreByUpdatedAt: jest.fn(),
      restoreByDeletedAt: jest.fn(),
      restoreByKeyword: jest.fn(),
      clear: jest.fn(),
      clearByTenantId: jest.fn(),
      clearByOrganizationId: jest.fn(),
      clearByType: jest.fn(),
      clearByAction: jest.fn(),
      clearByStatus: jest.fn(),
      clearByResource: jest.fn(),
      clearByModule: jest.fn(),
      clearByRoleId: jest.fn(),
      clearByParentPermissionId: jest.fn(),
      clearByChildPermissionId: jest.fn(),
      clearByTags: jest.fn(),
      clearByExpiresAt: jest.fn(),
      clearByCreatedAt: jest.fn(),
      clearByUpdatedAt: jest.fn(),
      clearByDeletedAt: jest.fn(),
      clearByKeyword: jest.fn(),
    }

    countPermissionsUseCase = new CountPermissionsUseCase(mockPermissionRepository)
  })

  describe('统计权限数量', () => {
    it('应该统计所有权限数量', async () => {
      const mockPermissions = [
        new Permission(generateUuid(), '权限1', 'PERMISSION_1', PermissionType.API, PermissionAction.READ, tenantId, adminUserId),
        new Permission(generateUuid(), '权限2', 'PERMISSION_2', PermissionType.MENU, PermissionAction.CREATE, tenantId, adminUserId),
        new Permission(generateUuid(), '权限3', 'PERMISSION_3', PermissionType.BUTTON, PermissionAction.UPDATE, tenantId, adminUserId),
      ]

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: mockPermissions,
        total: 3,
      })

      const result = await countPermissionsUseCase.execute({
        tenantId,
      })

      expect(result).toBe(3)
      expect(mockPermissionRepository.findAll).toHaveBeenCalledWith(tenantId, undefined, 1, 10000)
    })

    it('应该按类型统计权限数量', async () => {
      mockPermissionRepository.countByType.mockResolvedValue(5)

      const result = await countPermissionsUseCase.execute({
        tenantId,
        type: PermissionType.API,
      })

      expect(result).toBe(5)
      expect(mockPermissionRepository.countByType).toHaveBeenCalledWith(PermissionType.API, tenantId, undefined)
    })

    it('应该按状态统计权限数量', async () => {
      mockPermissionRepository.countByStatus.mockResolvedValue(3)

      const result = await countPermissionsUseCase.execute({
        tenantId,
        status: PermissionStatus.ACTIVE,
      })

      expect(result).toBe(3)
      expect(mockPermissionRepository.countByStatus).toHaveBeenCalledWith(PermissionStatus.ACTIVE, tenantId, undefined)
    })

    it('应该按操作统计权限数量', async () => {
      const mockPermissions = [
        new Permission(generateUuid(), '权限1', 'PERMISSION_1', PermissionType.API, PermissionAction.READ, tenantId, adminUserId),
        new Permission(generateUuid(), '权限2', 'PERMISSION_2', PermissionType.MENU, PermissionAction.READ, tenantId, adminUserId),
      ]

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: mockPermissions,
        total: 2,
      })

      const result = await countPermissionsUseCase.execute({
        tenantId,
        action: PermissionAction.READ,
      })

      expect(result).toBe(2)
    })

    it('应该按资源统计权限数量', async () => {
      const mockPermissions = [
        new Permission(generateUuid(), '权限1', 'PERMISSION_1', PermissionType.API, PermissionAction.READ, tenantId, adminUserId, undefined, organizationId, 'users'),
        new Permission(generateUuid(), '权限2', 'PERMISSION_2', PermissionType.MENU, PermissionAction.CREATE, tenantId, adminUserId, undefined, organizationId, 'users'),
      ]

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: mockPermissions,
        total: 2,
      })

      const result = await countPermissionsUseCase.execute({
        tenantId,
        resource: 'users',
      })

      expect(result).toBe(2)
    })

    it('应该按模块统计权限数量', async () => {
      const mockPermissions = [
        new Permission(generateUuid(), '权限1', 'PERMISSION_1', PermissionType.API, PermissionAction.READ, tenantId, adminUserId, undefined, organizationId, 'users', 'iam'),
        new Permission(generateUuid(), '权限2', 'PERMISSION_2', PermissionType.MENU, PermissionAction.CREATE, tenantId, adminUserId, undefined, organizationId, 'roles', 'iam'),
      ]

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: mockPermissions,
        total: 2,
      })

      const result = await countPermissionsUseCase.execute({
        tenantId,
        module: 'iam',
      })

      expect(result).toBe(2)
    })

    it('应该按管理员统计权限数量', async () => {
      const mockPermissions = [
        new Permission(generateUuid(), '权限1', 'PERMISSION_1', PermissionType.API, PermissionAction.READ, tenantId, adminUserId),
      ]

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: mockPermissions,
        total: 1,
      })

      const result = await countPermissionsUseCase.execute({
        tenantId,
        adminUserId,
      })

      expect(result).toBe(1)
    })

    it('应该按父权限统计权限数量', async () => {
      const parentId = generateUuid()
      const mockPermissions = [
        new Permission(generateUuid(), '权限1', 'PERMISSION_1', PermissionType.API, PermissionAction.READ, tenantId, adminUserId),
      ]

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: mockPermissions,
        total: 1,
      })

      const result = await countPermissionsUseCase.execute({
        tenantId,
        parentPermissionId: parentId,
      })

      expect(result).toBe(1)
    })

    it('应该按系统权限标志统计权限数量', async () => {
      const mockPermissions = [
        new Permission(generateUuid(), '权限1', 'PERMISSION_1', PermissionType.API, PermissionAction.READ, tenantId, adminUserId),
      ]

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: mockPermissions,
        total: 1,
      })

      const result = await countPermissionsUseCase.execute({
        tenantId,
        isSystemPermission: true,
      })

      expect(result).toBe(1)
    })

    it('应该按默认权限标志统计权限数量', async () => {
      const mockPermissions = [
        new Permission(generateUuid(), '权限1', 'PERMISSION_1', PermissionType.API, PermissionAction.READ, tenantId, adminUserId),
      ]

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: mockPermissions,
        total: 1,
      })

      const result = await countPermissionsUseCase.execute({
        tenantId,
        isDefaultPermission: false,
      })

      expect(result).toBe(1)
    })
  })

  describe('多条件筛选', () => {
    it('应该支持多个筛选条件组合', async () => {
      const mockPermissions = [
        new Permission(generateUuid(), '权限1', 'PERMISSION_1', PermissionType.API, PermissionAction.READ, tenantId, adminUserId, undefined, organizationId, 'users', 'iam'),
      ]

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: mockPermissions,
        total: 1,
      })

      const result = await countPermissionsUseCase.execute({
        tenantId,
        organizationId,
        action: PermissionAction.READ,
        resource: 'users',
        module: 'iam',
      })

      expect(result).toBe(1)
    })

    it('应该正确处理空结果', async () => {
      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: [],
        total: 0,
      })

      const result = await countPermissionsUseCase.execute({
        tenantId,
        action: PermissionAction.DELETE,
      })

      expect(result).toBe(0)
    })

    it('应该正确处理筛选条件不匹配', async () => {
      const mockPermissions = [
        new Permission(generateUuid(), '权限1', 'PERMISSION_1', PermissionType.API, PermissionAction.READ, tenantId, adminUserId),
        new Permission(generateUuid(), '权限2', 'PERMISSION_2', PermissionType.MENU, PermissionAction.CREATE, tenantId, adminUserId),
      ]

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: mockPermissions,
        total: 2,
      })

      const result = await countPermissionsUseCase.execute({
        tenantId,
        action: PermissionAction.DELETE, // 不匹配任何权限
      })

      expect(result).toBe(0)
    })
  })

  describe('错误处理', () => {
    it('应该处理仓储层错误', async () => {
      mockPermissionRepository.findAll.mockRejectedValue(new Error('数据库连接失败'))

      await expect(
        countPermissionsUseCase.execute({
          tenantId,
        }),
      ).rejects.toThrow('数据库连接失败')
    })

    it('应该处理按类型统计时的错误', async () => {
      mockPermissionRepository.countByType.mockRejectedValue(new Error('统计失败'))

      await expect(
        countPermissionsUseCase.execute({
          tenantId,
          type: PermissionType.API,
        }),
      ).rejects.toThrow('统计失败')
    })

    it('应该处理按状态统计时的错误', async () => {
      mockPermissionRepository.countByStatus.mockRejectedValue(new Error('状态统计失败'))

      await expect(
        countPermissionsUseCase.execute({
          tenantId,
          status: PermissionStatus.ACTIVE,
        }),
      ).rejects.toThrow('状态统计失败')
    })
  })

  describe('边界条件', () => {
    it('应该处理大量权限数据', async () => {
      const mockPermissions = Array.from({ length: 1000 }, (_, index) =>
        new Permission(generateUuid(), `权限${index}`, `PERMISSION_${index}`, PermissionType.API, PermissionAction.READ, tenantId, adminUserId)
      )

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: mockPermissions,
        total: 1000,
      })

      const result = await countPermissionsUseCase.execute({
        tenantId,
      })

      expect(result).toBe(1000)
    })

    it('应该处理租户ID为空的情况', async () => {
      await expect(
        countPermissionsUseCase.execute({
          tenantId: '',
        }),
      ).rejects.toThrow()
    })

    it('应该处理无效的筛选条件', async () => {
      const mockPermissions = [
        new Permission(generateUuid(), '权限1', 'PERMISSION_1', PermissionType.API, PermissionAction.READ, tenantId, adminUserId),
      ]

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: mockPermissions,
        total: 1,
      })

      const result = await countPermissionsUseCase.execute({
        tenantId,
        resource: 'invalid-resource',
      })

      expect(result).toBe(0)
    })
  })
}) 