/**
 * @file tenant-domain.service.spec.ts
 * @description 租户领域服务的单元测试文件
 */
import { Test, type TestingModule } from '@nestjs/testing'

import { Tenant } from '../../entities/tenant.entity'
import { TenantStatus } from '../../entities/tenant.entity'
import {
  TenantAlreadyExistsException,
  TenantCannotBeActivatedException,
  TenantCannotBeRestoredException,
  TenantCannotBeSuspendedException,
  TenantNotFoundException,
  TenantOperationNotAllowedException,
} from '../../exceptions/tenant-domain.exception'
import type { ITenantRepository } from '../../repositories/tenant.repository.interface'
import { TenantCode } from '../../value-objects/tenant-code.vo'
import { TenantName } from '../../value-objects/tenant-name.vo'
import { TenantDomainService } from '../tenant-domain.service'

describe('TenantDomainService', () => {
  let service: TenantDomainService
  let mockTenantRepository: jest.Mocked<ITenantRepository>

  beforeEach(async () => {
    const mockRepository = {
      findByName: jest.fn(),
      findByCode: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      findWithPagination: jest.fn(),
      exists: jest.fn(),
      existsByCode: jest.fn(),
      existsByName: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findActiveTenants: jest.fn(),
      findPendingTenants: jest.fn(),
      findSuspendedTenants: jest.fn(),
      findDeletedTenants: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantDomainService,
        {
          provide: 'ITenantRepository',
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<TenantDomainService>(TenantDomainService)
    mockTenantRepository = module.get('ITenantRepository')
  })

  describe('validateTenantCreation', () => {
    it('应该通过有效的租户创建验证', async () => {
      // Arrange
      const name = new TenantName('测试租户')
      const code = new TenantCode('test_tenant')
      const adminUserId = '123e4567-e89b-12d3-a456-426614174001'

      mockTenantRepository.findByName.mockResolvedValue(null)
      mockTenantRepository.findByCode.mockResolvedValue(null)

      // Act & Assert
      await expect(
        service.validateTenantCreation(name, code, adminUserId),
      ).resolves.not.toThrow()
    })

    it('应该拒绝已存在的租户名称', async () => {
      // Arrange
      const name = new TenantName('已存在租户')
      const code = new TenantCode('test_tenant')
      const adminUserId = '123e4567-e89b-12d3-a456-426614174001'

      const existingTenant = new Tenant('123e4567-e89b-12d3-a456-426614174002', name, code, '123e4567-e89b-12d3-a456-426614174003')
      mockTenantRepository.findByName.mockResolvedValue(existingTenant)
      mockTenantRepository.findByCode.mockResolvedValue(null)

      // Act & Assert
      await expect(
        service.validateTenantCreation(name, code, adminUserId),
      ).rejects.toThrow(TenantAlreadyExistsException)
    })

    it('应该拒绝已存在的租户编码', async () => {
      // Arrange
      const name = new TenantName('新租户')
      const code = new TenantCode('existing_code')
      const adminUserId = '123e4567-e89b-12d3-a456-426614174001'

      const existingTenant = new Tenant('123e4567-e89b-12d3-a456-426614174002', name, code, '123e4567-e89b-12d3-a456-426614174003')
      mockTenantRepository.findByName.mockResolvedValue(null)
      mockTenantRepository.findByCode.mockResolvedValue(existingTenant)

      // Act & Assert
      await expect(
        service.validateTenantCreation(name, code, adminUserId),
      ).rejects.toThrow(TenantAlreadyExistsException)
    })

    it('应该拒绝空的管理员用户ID', async () => {
      // Arrange
      const name = new TenantName('测试租户')
      const code = new TenantCode('test_tenant')
      const adminUserId = ''

      mockTenantRepository.findByName.mockResolvedValue(null)
      mockTenantRepository.findByCode.mockResolvedValue(null)

      // Act & Assert
      await expect(
        service.validateTenantCreation(name, code, adminUserId),
      ).rejects.toThrow('Admin user ID is required')
    })
  })

  describe('validateTenantActivation', () => {
    it('应该通过有效的租户激活验证', () => {
      // Arrange
      const tenant = new Tenant(
        'tenant-123',
        new TenantName('测试租户'),
        new TenantCode('test_tenant'),
        'admin-123',
      )
      tenant.status = TenantStatus.PENDING
      const activatedBy = 'admin-456'

      // Act & Assert
      expect(() =>
        service.validateTenantActivation(tenant, activatedBy),
      ).not.toThrow()
    })

    it('应该拒绝激活非PENDING状态的租户', () => {
      // Arrange
      const tenant = new Tenant(
        'tenant-123',
        new TenantName('测试租户'),
        new TenantCode('test_tenant'),
        'admin-123',
      )
      tenant.status = TenantStatus.ACTIVE
      const activatedBy = 'admin-456'

      // Act & Assert
      expect(() =>
        service.validateTenantActivation(tenant, activatedBy),
      ).toThrow(TenantCannotBeActivatedException)
    })

    it('应该拒绝空的操作者ID', () => {
      // Arrange
      const tenant = new Tenant(
        'tenant-123',
        new TenantName('测试租户'),
        new TenantCode('test_tenant'),
        'admin-123',
      )
      tenant.status = TenantStatus.PENDING
      const activatedBy = ''

      // Act & Assert
      expect(() =>
        service.validateTenantActivation(tenant, activatedBy),
      ).toThrow('Activated by user ID is required')
    })

    it('应该拒绝null租户', () => {
      // Arrange
      const activatedBy = 'admin-456'

      // Act & Assert
      expect(() =>
        service.validateTenantActivation(null as any, activatedBy),
      ).toThrow(TenantNotFoundException)
    })
  })

  describe('validateTenantSuspension', () => {
    it('应该通过有效的租户禁用验证', () => {
      // Arrange
      const tenant = new Tenant(
        'tenant-123',
        new TenantName('测试租户'),
        new TenantCode('test_tenant'),
        'admin-123',
      )
      tenant.status = TenantStatus.ACTIVE
      const suspendedBy = 'admin-456'

      // Act & Assert
      expect(() =>
        service.validateTenantSuspension(tenant, suspendedBy),
      ).not.toThrow()
    })

    it('应该拒绝禁用非ACTIVE状态的租户', () => {
      // Arrange
      const tenant = new Tenant(
        'tenant-123',
        new TenantName('测试租户'),
        new TenantCode('test_tenant'),
        'admin-123',
      )
      tenant.status = TenantStatus.PENDING
      const suspendedBy = 'admin-456'

      // Act & Assert
      expect(() =>
        service.validateTenantSuspension(tenant, suspendedBy),
      ).toThrow(TenantCannotBeSuspendedException)
    })
  })

  describe('validateTenantSettingsUpdate', () => {
    it('应该通过有效的配置更新验证', () => {
      // Arrange
      const tenant = new Tenant(
        'tenant-123',
        new TenantName('测试租户'),
        new TenantCode('test_tenant'),
        'admin-123',
      )
      tenant.status = TenantStatus.ACTIVE
      const settings = { theme: 'dark', language: 'zh-CN' }
      const updatedBy = 'admin-456'

      // Act & Assert
      expect(() =>
        service.validateTenantSettingsUpdate(tenant, settings, updatedBy),
      ).not.toThrow()
    })

    it('应该拒绝非ACTIVE状态租户的配置更新', () => {
      // Arrange
      const tenant = new Tenant(
        'tenant-123',
        new TenantName('测试租户'),
        new TenantCode('test_tenant'),
        'admin-123',
      )
      tenant.status = TenantStatus.PENDING
      const settings = { theme: 'dark' }
      const updatedBy = 'admin-456'

      // Act & Assert
      expect(() =>
        service.validateTenantSettingsUpdate(tenant, settings, updatedBy),
      ).toThrow(TenantOperationNotAllowedException)
    })

    it('应该拒绝无效的配置对象', () => {
      // Arrange
      const tenant = new Tenant(
        'tenant-123',
        new TenantName('测试租户'),
        new TenantCode('test_tenant'),
        'admin-123',
      )
      tenant.status = TenantStatus.ACTIVE
      const settings = null as any
      const updatedBy = 'admin-456'

      // Act & Assert
      expect(() =>
        service.validateTenantSettingsUpdate(tenant, settings, updatedBy),
      ).toThrow('Settings must be a valid object')
    })

    it('应该拒绝无效的主题设置', () => {
      // Arrange
      const tenant = new Tenant(
        'tenant-123',
        new TenantName('测试租户'),
        new TenantCode('test_tenant'),
        'admin-123',
      )
      tenant.status = TenantStatus.ACTIVE
      const settings = { theme: 'invalid-theme' }
      const updatedBy = 'admin-456'

      // Act & Assert
      expect(() =>
        service.validateTenantSettingsUpdate(tenant, settings, updatedBy),
      ).toThrow('Invalid theme setting')
    })

    it('应该拒绝无效的语言设置', () => {
      // Arrange
      const tenant = new Tenant(
        'tenant-123',
        new TenantName('测试租户'),
        new TenantCode('test_tenant'),
        'admin-123',
      )
      tenant.status = TenantStatus.ACTIVE
      const settings = { language: 'invalid-language' }
      const updatedBy = 'admin-456'

      // Act & Assert
      expect(() =>
        service.validateTenantSettingsUpdate(tenant, settings, updatedBy),
      ).toThrow('Invalid language setting')
    })
  })

  describe('状态转换验证', () => {
    it('应该正确检查租户是否可以激活', () => {
      // Arrange
      const pendingTenant = new Tenant(
        'tenant-123',
        new TenantName('测试租户'),
        new TenantCode('test_tenant'),
        'admin-123',
      )
      pendingTenant.status = TenantStatus.PENDING

      const activeTenant = new Tenant(
        'tenant-456',
        new TenantName('测试租户2'),
        new TenantCode('test_tenant2'),
        'admin-456',
      )
      activeTenant.status = TenantStatus.ACTIVE

      // Act & Assert
      expect(service.canTenantBeActivated(pendingTenant)).toBe(true)
      expect(service.canTenantBeActivated(activeTenant)).toBe(false)
    })

    it('应该正确检查租户是否可以禁用', () => {
      // Arrange
      const activeTenant = new Tenant(
        'tenant-123',
        new TenantName('测试租户'),
        new TenantCode('test_tenant'),
        'admin-123',
      )
      activeTenant.status = TenantStatus.ACTIVE

      const pendingTenant = new Tenant(
        'tenant-456',
        new TenantName('测试租户2'),
        new TenantCode('test_tenant2'),
        'admin-456',
      )
      pendingTenant.status = TenantStatus.PENDING

      // Act & Assert
      expect(service.canTenantBeSuspended(activeTenant)).toBe(true)
      expect(service.canTenantBeSuspended(pendingTenant)).toBe(false)
    })

    it('应该正确检查租户是否可以删除', () => {
      // Arrange
      const activeTenant = new Tenant(
        'tenant-123',
        new TenantName('测试租户'),
        new TenantCode('test_tenant'),
        'admin-123',
      )
      activeTenant.status = TenantStatus.ACTIVE

      const deletedTenant = new Tenant(
        'tenant-456',
        new TenantName('测试租户2'),
        new TenantCode('test_tenant2'),
        'admin-456',
      )
      deletedTenant.status = TenantStatus.DELETED

      // Act & Assert
      expect(service.canTenantBeDeleted(activeTenant)).toBe(true)
      expect(service.canTenantBeDeleted(deletedTenant)).toBe(false)
    })

    it('应该正确检查租户是否可以恢复', () => {
      // Arrange
      const deletedTenant = new Tenant(
        'tenant-123',
        new TenantName('测试租户'),
        new TenantCode('test_tenant'),
        'admin-123',
      )
      deletedTenant.status = TenantStatus.DELETED

      const activeTenant = new Tenant(
        'tenant-456',
        new TenantName('测试租户2'),
        new TenantCode('test_tenant2'),
        'admin-456',
      )
      activeTenant.status = TenantStatus.ACTIVE

      // Act & Assert
      expect(service.canTenantBeRestored(deletedTenant)).toBe(true)
      expect(service.canTenantBeRestored(activeTenant)).toBe(false)
    })
  })

  describe('状态转换规则', () => {
    it('应该返回正确的PENDING状态转换', () => {
      // Act
      const transitions = service.getTenantStatusTransitions(
        TenantStatus.PENDING,
      )

      // Assert
      expect(transitions).toEqual([
        TenantStatus.ACTIVE,
        TenantStatus.SUSPENDED,
        TenantStatus.DELETED,
      ])
    })

    it('应该返回正确的ACTIVE状态转换', () => {
      // Act
      const transitions = service.getTenantStatusTransitions(
        TenantStatus.ACTIVE,
      )

      // Assert
      expect(transitions).toEqual([
        TenantStatus.SUSPENDED,
        TenantStatus.DELETED,
      ])
    })

    it('应该返回正确的SUSPENDED状态转换', () => {
      // Act
      const transitions = service.getTenantStatusTransitions(
        TenantStatus.SUSPENDED,
      )

      // Assert
      expect(transitions).toEqual([TenantStatus.ACTIVE, TenantStatus.DELETED])
    })

    it('应该返回正确的DELETED状态转换', () => {
      // Act
      const transitions = service.getTenantStatusTransitions(
        TenantStatus.DELETED,
      )

      // Assert
      expect(transitions).toEqual([TenantStatus.SUSPENDED])
    })

    it('应该正确验证状态转换的有效性', () => {
      // Act & Assert
      expect(
        service.isValidStatusTransition(
          TenantStatus.PENDING,
          TenantStatus.ACTIVE,
        ),
      ).toBe(true)
      expect(
        service.isValidStatusTransition(
          TenantStatus.PENDING,
          TenantStatus.DELETED,
        ),
      ).toBe(true)
      expect(
        service.isValidStatusTransition(
          TenantStatus.ACTIVE,
          TenantStatus.PENDING,
        ),
      ).toBe(false)
      expect(
        service.isValidStatusTransition(
          TenantStatus.DELETED,
          TenantStatus.ACTIVE,
        ),
      ).toBe(false)
    })
  })
})
