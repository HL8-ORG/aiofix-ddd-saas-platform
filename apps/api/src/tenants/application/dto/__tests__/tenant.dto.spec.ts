import 'reflect-metadata'

/**
 * @file tenant.dto.spec.ts
 * @description 租户DTO的单元测试文件
 */
import { TenantDto } from '../tenant.dto'
import { AdminUserDto } from '../admin-user.dto'
import { TenantSettingsDto } from '../tenant-settings.dto'
import { TenantStatisticsDto } from '../tenant-statistics.dto'

describe('TenantDto', () => {
  let validDtoData: any

  beforeEach(() => {
    validDtoData = {
      id: 'tenant-123',
      name: '测试租户',
      code: 'test_tenant',
      description: '这是一个测试租户',
      status: 'ACTIVE',
      settings: {
        maxUsers: 100,
        features: ['feature1', 'feature2'],
      },
      adminUserId: 'admin-456',
      adminUser: {
        id: 'admin-456',
        username: 'admin',
        email: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
      },
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
      createdBy: 'system',
      updatedBy: 'admin-456',
    }
  })

  describe('构造函数', () => {
    it('应该正确创建DTO对象', () => {
      const dto = new TenantDto()
      Object.assign(dto, validDtoData)

      expect(dto.id).toBe('tenant-123')
      expect(dto.name).toBe('测试租户')
      expect(dto.code).toBe('test_tenant')
      expect(dto.description).toBe('这是一个测试租户')
      expect(dto.status).toBe('ACTIVE')
      expect(dto.adminUserId).toBe('admin-456')
      expect(dto.createdBy).toBe('system')
      expect(dto.updatedBy).toBe('admin-456')
    })

    it('应该正确处理嵌套的adminUser对象', () => {
      const dto = new TenantDto()
      Object.assign(dto, validDtoData)

      expect(dto.adminUser).toBeDefined()
      expect(dto.adminUser?.id).toBe('admin-456')
      expect(dto.adminUser?.username).toBe('admin')
      expect(dto.adminUser?.email).toBe('admin@test.com')
      expect(dto.adminUser?.firstName).toBe('Admin')
      expect(dto.adminUser?.lastName).toBe('User')
    })
  })

  describe('fromEntity方法', () => {
    it('应该从领域实体创建DTO', () => {
      // 模拟领域实体
      const mockEntity = {
        id: 'tenant-123',
        name: '测试租户',
        code: 'test_tenant',
        description: '这是一个测试租户',
        status: 'ACTIVE',
        settings: { maxUsers: 100 },
        adminUserId: 'admin-456',
        adminUser: {
          id: 'admin-456',
          username: 'admin',
          email: 'admin@test.com',
          firstName: 'Admin',
          lastName: 'User',
        },
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
        createdBy: 'system',
        updatedBy: 'admin-456',
      }

      const dto = TenantDto.fromEntity(mockEntity as any)

      expect(dto.id).toBe('tenant-123')
      expect(dto.name).toBe('测试租户')
      expect(dto.code).toBe('test_tenant')
      expect(dto.description).toBe('这是一个测试租户')
      expect(dto.status).toBe('ACTIVE')
      expect(dto.adminUserId).toBe('admin-456')
      expect(dto.adminUser?.id).toBe('admin-456')
      expect(dto.adminUser?.username).toBe('admin')
      expect(dto.adminUser?.email).toBe('admin@test.com')
      expect(dto.adminUser?.firstName).toBe('Admin')
      expect(dto.adminUser?.lastName).toBe('User')
      expect(dto.createdBy).toBe('system')
      expect(dto.updatedBy).toBe('admin-456')
    })
  })

  describe('toJSON方法', () => {
    it('应该返回正确的JSON对象', () => {
      const dto = new TenantDto()
      Object.assign(dto, validDtoData)

      // 确保 adminUser 是 AdminUserDto 实例
      if (dto.adminUser) {
        dto.adminUser = new AdminUserDto()
        Object.assign(dto.adminUser, validDtoData.adminUser)
      }

      const json = dto.toJSON()

      expect(json).toEqual({
        id: 'tenant-123',
        name: '测试租户',
        code: 'test_tenant',
        description: '这是一个测试租户',
        status: 'ACTIVE',
        settings: {
          maxUsers: 100,
          features: ['feature1', 'feature2'],
        },
        adminUserId: 'admin-456',
        adminUser: {
          id: 'admin-456',
          username: 'admin',
          email: 'admin@test.com',
          firstName: 'Admin',
          lastName: 'User',
        },
        createdAt: validDtoData.createdAt,
        updatedAt: validDtoData.updatedAt,
        createdBy: 'system',
        updatedBy: 'admin-456',
      })
    })
  })
})

describe('AdminUserDto', () => {
  let validAdminUserData: any

  beforeEach(() => {
    validAdminUserData = {
      id: 'admin-456',
      username: 'admin',
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
    }
  })

  describe('fromEntity方法', () => {
    it('应该从领域实体创建AdminUserDto', () => {
      const mockEntity = {
        id: 'admin-456',
        username: 'admin',
        email: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
      }

      const dto = AdminUserDto.fromEntity(mockEntity as any)

      expect(dto.id).toBe('admin-456')
      expect(dto.username).toBe('admin')
      expect(dto.email).toBe('admin@test.com')
      expect(dto.firstName).toBe('Admin')
      expect(dto.lastName).toBe('User')
    })
  })

  describe('toJSON方法', () => {
    it('应该返回正确的JSON对象', () => {
      const dto = new AdminUserDto()
      Object.assign(dto, validAdminUserData)

      const json = dto.toJSON()

      expect(json).toEqual(validAdminUserData)
    })
  })
})

describe('TenantSettingsDto', () => {
  let validSettingsData: any

  beforeEach(() => {
    validSettingsData = {
      settings: {
        maxUsers: 100,
        features: ['feature1', 'feature2'],
        theme: 'dark',
        language: 'zh-CN',
      },
      updatedAt: new Date('2024-01-02T00:00:00Z'),
      updatedBy: 'admin-456',
    }
  })

  describe('fromEntity方法', () => {
    it('应该从领域实体创建TenantSettingsDto', () => {
      const mockEntity = {
        settings: { maxUsers: 100, features: ['feature1', 'feature2'] },
        updatedAt: new Date('2024-01-02T00:00:00Z'),
        updatedBy: 'admin-456',
      }

      const dto = TenantSettingsDto.fromEntity(mockEntity as any)

      expect(dto.settings).toEqual({ maxUsers: 100, features: ['feature1', 'feature2'] })
      expect(dto.updatedAt).toEqual(new Date('2024-01-02T00:00:00Z'))
      expect(dto.updatedBy).toBe('admin-456')
    })
  })

  describe('toJSON方法', () => {
    it('应该返回正确的JSON对象', () => {
      const dto = new TenantSettingsDto()
      Object.assign(dto, validSettingsData)

      const json = dto.toJSON()

      expect(json).toEqual(validSettingsData)
    })
  })
})

describe('TenantStatisticsDto', () => {
  let validStatisticsData: any

  beforeEach(() => {
    validStatisticsData = {
      totalUsers: 50,
      activeUsers: 30,
      totalOrganizations: 5,
      totalRoles: 10,
      lastLoginTime: new Date('2024-01-02T12:00:00Z'),
      createdDate: new Date('2024-01-01T00:00:00Z'),
    }
  })

  describe('fromEntity方法', () => {
    it('应该从领域实体创建TenantStatisticsDto', () => {
      const mockEntity = {
        totalUsers: 50,
        activeUsers: 30,
        totalOrganizations: 5,
        totalRoles: 10,
        lastLoginTime: new Date('2024-01-02T12:00:00Z'),
        createdDate: new Date('2024-01-01T00:00:00Z'),
      }

      const dto = TenantStatisticsDto.fromEntity(mockEntity as any)

      expect(dto.totalUsers).toBe(50)
      expect(dto.activeUsers).toBe(30)
      expect(dto.totalOrganizations).toBe(5)
      expect(dto.totalRoles).toBe(10)
      expect(dto.lastLoginTime).toEqual(new Date('2024-01-02T12:00:00Z'))
      expect(dto.createdDate).toEqual(new Date('2024-01-01T00:00:00Z'))
    })
  })

  describe('toJSON方法', () => {
    it('应该返回正确的JSON对象', () => {
      const dto = new TenantStatisticsDto()
      Object.assign(dto, validStatisticsData)

      const json = dto.toJSON()

      expect(json).toEqual(validStatisticsData)
    })
  })
})
