import { TenantCode } from '../../value-objects/tenant-code.vo'
import { TenantName } from '../../value-objects/tenant-name.vo'
/**
 * @file tenant.entity.spec.ts
 * @description 租户实体的单元测试文件
 */
import { Tenant, TenantStatus } from '../tenant.entity'

describe('Tenant', () => {
  let tenant: Tenant
  let tenantName: TenantName
  let tenantCode: TenantCode

  beforeEach(() => {
    tenantName = new TenantName('测试租户')
    tenantCode = new TenantCode('test_tenant')
    tenant = new Tenant(
      '123e4567-e89b-12d3-a456-426614174000',
      tenantName,
      tenantCode,
      '123e4567-e89b-12d3-a456-426614174001',
      '测试租户描述',
      { theme: 'dark', language: 'zh-CN' },
    )
  })

  describe('构造函数', () => {
    it('应该成功创建租户实体', () => {
      expect(tenant).toBeInstanceOf(Tenant)
      expect(tenant.name).toBe(tenantName)
      expect(tenant.code).toBe(tenantCode)
      expect(tenant.adminUserId).toBe('123e4567-e89b-12d3-a456-426614174001')
      expect(tenant.description).toBe('测试租户描述')
      expect(tenant.status).toBe(TenantStatus.PENDING)
      expect(tenant.settings).toEqual({ theme: 'dark', language: 'zh-CN' })
    })

    it('应该使用默认值创建租户实体', () => {
      const defaultTenant = new Tenant(
        '123e4567-e89b-12d3-a456-426614174002',
        tenantName,
        tenantCode,
        '123e4567-e89b-12d3-a456-426614174003',
      )

      expect(defaultTenant.description).toBeUndefined()
      expect(defaultTenant.settings).toEqual({})
      expect(defaultTenant.status).toBe(TenantStatus.PENDING)
    })
  })

  describe('状态管理', () => {
    describe('activate', () => {
      it('应该成功激活租户', () => {
        tenant.activate('123e4567-e89b-12d3-a456-426614174001')
        expect(tenant.status).toBe(TenantStatus.ACTIVE)
        expect(tenant.isActive()).toBe(true)
      })

      it('应该拒绝重复激活', () => {
        tenant.activate('123e4567-e89b-12d3-a456-426614174001')
        expect(() => tenant.activate('123e4567-e89b-12d3-a456-426614174001')).toThrow('租户已经是激活状态')
      })

      it('应该拒绝激活已删除的租户', () => {
        tenant.delete('123e4567-e89b-12d3-a456-426614174001')
        expect(() => tenant.activate('123e4567-e89b-12d3-a456-426614174001')).toThrow(
          '已删除的租户无法激活',
        )
      })
    })

    describe('suspend', () => {
      it('应该成功禁用租户', () => {
        tenant.suspend('123e4567-e89b-12d3-a456-426614174001')
        expect(tenant.status).toBe(TenantStatus.SUSPENDED)
        expect(tenant.isSuspended()).toBe(true)
      })

      it('应该拒绝重复禁用', () => {
        tenant.suspend('123e4567-e89b-12d3-a456-426614174001')
        expect(() => tenant.suspend('123e4567-e89b-12d3-a456-426614174001')).toThrow('租户已经是禁用状态')
      })

      it('应该拒绝禁用已删除的租户', () => {
        tenant.delete('123e4567-e89b-12d3-a456-426614174001')
        expect(() => tenant.suspend('123e4567-e89b-12d3-a456-426614174001')).toThrow(
          '已删除的租户无法禁用',
        )
      })
    })

    describe('delete', () => {
      it('应该成功删除租户', () => {
        tenant.delete('123e4567-e89b-12d3-a456-426614174001')
        expect(tenant.status).toBe(TenantStatus.DELETED)
      })

      it('应该拒绝重复删除', () => {
        tenant.delete('123e4567-e89b-12d3-a456-426614174001')
        expect(() => tenant.delete('123e4567-e89b-12d3-a456-426614174001')).toThrow('租户已经是删除状态')
      })
    })

    describe('restore', () => {
      it('应该成功恢复已删除的租户', () => {
        tenant.delete('admin-123')
        tenant.restore('admin-123')
        expect(tenant.status).toBe(TenantStatus.SUSPENDED)
      })

      it('应该拒绝恢复非删除状态的租户', () => {
        expect(() => tenant.restore('admin-123')).toThrow(
          '只有已删除的租户才能恢复',
        )
      })
    })
  })

  describe('配置管理', () => {
    describe('updateSettings', () => {
      it('应该成功更新租户配置', () => {
        const newSettings = { theme: 'light', language: 'en-US' }
        tenant.updateSettings(newSettings, '123e4567-e89b-12d3-a456-426614174001')
        expect(tenant.settings).toEqual({ theme: 'light', language: 'en-US' })
      })

      it('应该合并配置而不是替换', () => {
        const newSettings = { language: 'en-US' }
        tenant.updateSettings(newSettings, '123e4567-e89b-12d3-a456-426614174001')
        expect(tenant.settings).toEqual({ theme: 'dark', language: 'en-US' })
      })
    })

    describe('setSetting', () => {
      it('应该成功设置单个配置项', () => {
        tenant.setSetting('timezone', 'UTC', '123e4567-e89b-12d3-a456-426614174001')
        expect(tenant.getSetting('timezone')).toBe('UTC')
      })
    })

    describe('getSetting', () => {
      it('应该成功获取配置项', () => {
        expect(tenant.getSetting('theme')).toBe('dark')
        expect(tenant.getSetting('language')).toBe('zh-CN')
      })

      it('应该返回undefined对于不存在的配置项', () => {
        expect(tenant.getSetting('nonexistent')).toBeUndefined()
      })
    })
  })

  describe('验证方法', () => {
    it('应该验证有效的租户', () => {
      expect(() => tenant.validate()).not.toThrow()
    })

    it('应该拒绝没有名称的租户', () => {
      const invalidTenant = new Tenant(
        '123e4567-e89b-12d3-a456-426614174000',
        null as any,
        tenantCode,
        '123e4567-e89b-12d3-a456-426614174001',
      )
      expect(() => invalidTenant.validate()).toThrow('租户名称不能为空')
    })

    it('应该拒绝没有编码的租户', () => {
      const invalidTenant = new Tenant(
        '123e4567-e89b-12d3-a456-426614174000',
        tenantName,
        null as any,
        '123e4567-e89b-12d3-a456-426614174001',
      )
      expect(() => invalidTenant.validate()).toThrow('租户编码不能为空')
    })

    it('应该拒绝没有管理员的租户', () => {
      const invalidTenant = new Tenant('123e4567-e89b-12d3-a456-426614174000', tenantName, tenantCode, '')
      expect(() => invalidTenant.validate()).toThrow('租户管理员不能为空')
    })
  })

  describe('业务键', () => {
    it('应该返回正确的业务键', () => {
      expect(tenant.getBusinessKey()).toBe('123e4567-e89b-12d3-a456-426614174000:test_tenant')
    })
  })

  describe('JSON序列化', () => {
    it('应该正确序列化为JSON', () => {
      const json = tenant.toJSON()
      expect(json).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '测试租户',
        code: 'test_tenant',
        description: '测试租户描述',
        status: TenantStatus.PENDING,
        adminUserId: '123e4567-e89b-12d3-a456-426614174001',
        settings: { theme: 'dark', language: 'zh-CN' },
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: undefined,
        version: 1,
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        createdBy: undefined,
        updatedBy: undefined,
      })
    })
  })

  describe('状态检查方法', () => {
    it('应该正确检查激活状态', () => {
      expect(tenant.isActive()).toBe(false)
      tenant.activate('123e4567-e89b-12d3-a456-426614174001')
      expect(tenant.isActive()).toBe(true)
    })

    it('应该正确检查禁用状态', () => {
      expect(tenant.isSuspended()).toBe(false)
      tenant.suspend('123e4567-e89b-12d3-a456-426614174001')
      expect(tenant.isSuspended()).toBe(true)
    })
  })

  describe('边界条件测试', () => {
    it('应该处理空配置', () => {
      const emptyTenant = new Tenant(
        '123e4567-e89b-12d3-a456-426614174000',
        tenantName,
        tenantCode,
        '123e4567-e89b-12d3-a456-426614174001',
      )
      expect(emptyTenant.settings).toEqual({})
    })

    it('应该处理复杂配置', () => {
      const complexSettings = {
        theme: 'dark',
        language: 'zh-CN',
        features: {
          sso: true,
          mfa: false,
        },
        limits: {
          users: 1000,
          storage: '10GB',
        },
      }

      tenant.updateSettings(complexSettings, '123e4567-e89b-12d3-a456-426614174001')
      expect(tenant.settings).toEqual(complexSettings)
    })
  })
})
