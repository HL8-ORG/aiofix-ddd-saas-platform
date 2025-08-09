/**
 * @file tenant-validator.spec.ts
 * @description 租户验证器的单元测试文件
 */
import { TenantValidator } from '../tenant-validator'
import { CreateTenantCommandDto } from '../../commands/create-tenant.command'
import { GetTenantByIdQueryDto } from '../../queries/get-tenant-by-id.query'
import { TenantDto } from '../../dto/tenant.dto'

describe('TenantValidator', () => {
  let validator: TenantValidator

  beforeEach(() => {
    validator = new TenantValidator()
  })

  describe('validateCreateTenant', () => {
    let validCreateData: any

    beforeEach(() => {
      validCreateData = {
        name: '测试租户',
        code: 'test_tenant',
        description: '这是一个测试租户',
        adminUserInfo: {
          username: 'admin',
          email: 'admin@test.com',
          password: 'password123',
          firstName: 'Admin',
          lastName: 'User',
        },
        settings: {
          maxUsers: 100,
        },
        metadata: {
          source: 'web',
        },
      }
    })

    it('应该验证有效的创建租户数据', async () => {
      const dto = new CreateTenantCommandDto()
      Object.assign(dto, validCreateData)

      const result = await validator.validateCreateTenant(dto)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
    })

    it('应该拒绝空的租户名称', async () => {
      const invalidData = { ...validCreateData, name: '' }
      const dto = new CreateTenantCommandDto()
      Object.assign(dto, invalidData)

      const result = await validator.validateCreateTenant(dto)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('租户名称长度不能少于2个字符')
    })

    it('应该拒绝空的租户编码', async () => {
      const invalidData = { ...validCreateData, code: '' }
      const dto = new CreateTenantCommandDto()
      Object.assign(dto, invalidData)

      const result = await validator.validateCreateTenant(dto)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('租户编码必须以字母开头，只能包含字母、数字和下划线')
    })

    it('应该拒绝无效的邮箱格式', async () => {
      const invalidData = {
        ...validCreateData,
        adminUserInfo: { ...validCreateData.adminUserInfo, email: 'invalid-email' },
      }
      const dto = new CreateTenantCommandDto()
      Object.assign(dto, invalidData)

      const result = await validator.validateCreateTenant(dto)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('管理员邮箱格式不正确')
    })

    it('应该拒绝过短的密码', async () => {
      const invalidData = {
        ...validCreateData,
        adminUserInfo: { ...validCreateData.adminUserInfo, password: '123' },
      }
      const dto = new CreateTenantCommandDto()
      Object.assign(dto, invalidData)

      const result = await validator.validateCreateTenant(dto)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('密码长度不能少于6个字符')
    })
  })

  describe('validateActivateTenant', () => {
    let validActivateData: any

    beforeEach(() => {
      validActivateData = {
        tenantId: 'tenant-123',
        reason: '激活测试租户',
        activatedBy: 'admin-456',
      }
    })

    it('应该验证有效的激活租户数据', async () => {
      const result = await validator.validateActivateTenant(validActivateData)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
    })

    it('应该拒绝空的租户ID', async () => {
      const invalidData = { ...validActivateData, tenantId: '' }

      const result = await validator.validateActivateTenant(invalidData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('租户ID不能为空')
    })

    it('应该拒绝空的激活者ID', async () => {
      const invalidData = { ...validActivateData, activatedBy: '' }

      const result = await validator.validateActivateTenant(invalidData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('激活操作者ID不能为空')
    })
  })

  describe('validateTenantAccess', () => {
    let mockTenant: any
    let requestedBy: string

    beforeEach(() => {
      mockTenant = {
        id: 'tenant-123',
        name: { getValue: () => '测试租户' },
        code: { getValue: () => 'test_tenant' },
        status: 'ACTIVE',
        isDeleted: () => false,
        isSuspended: () => false,
      }
      requestedBy = 'user-456'
    })

    it('应该验证有效的租户访问权限', () => {
      const result = validator.validateTenantAccess(mockTenant, requestedBy)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
    })

    it('应该拒绝访问已删除的租户', () => {
      const deletedTenant = {
        ...mockTenant,
        status: 'DELETED',
        isDeleted: () => true,
      }

      const result = validator.validateTenantAccess(deletedTenant, requestedBy)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('租户已被删除，无法访问')
    })

    it('应该拒绝访问已暂停的租户', () => {
      const suspendedTenant = {
        ...mockTenant,
        status: 'SUSPENDED',
        isSuspended: () => true,
      }

      const result = validator.validateTenantAccess(suspendedTenant, requestedBy)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('租户状态为 SUSPENDED，无法访问')
    })
  })

  describe('validateTenantCodeUniqueness', () => {
    it('应该验证租户编码唯一性', async () => {
      const code = 'test_tenant'
      const existingTenants = [
        {
          code: { getValue: () => 'other_tenant' },
          name: { getValue: () => '其他租户' },
          status: { getValue: () => 'ACTIVE' },
          adminUserId: { getValue: () => 'admin-1' },
          settings: { getValue: () => ({}) },
        } as any,
        {
          code: { getValue: () => 'another_tenant' },
          name: { getValue: () => '另一个租户' },
          status: { getValue: () => 'ACTIVE' },
          adminUserId: { getValue: () => 'admin-2' },
          settings: { getValue: () => ({}) },
        } as any,
      ]

      const result = await validator.validateTenantCodeUniqueness(code, existingTenants)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该拒绝重复的租户编码', async () => {
      const code = 'test_tenant'
      const existingTenants = [
        {
          code: { getValue: () => 'other_tenant' },
          name: { getValue: () => '其他租户' },
          status: { getValue: () => 'ACTIVE' },
          adminUserId: { getValue: () => 'admin-1' },
          settings: { getValue: () => ({}) },
        } as any,
        {
          code: { getValue: () => 'test_tenant' },
          name: { getValue: () => '测试租户' },
          status: { getValue: () => 'ACTIVE' },
          adminUserId: { getValue: () => 'admin-2' },
          settings: { getValue: () => ({}) },
        } as any,
      ]

      const result = await validator.validateTenantCodeUniqueness(code, existingTenants)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('租户编码 test_tenant 已存在')
    })
  })

  describe('validateTenantNameUniqueness', () => {
    it('应该验证租户名称唯一性', async () => {
      const name = '测试租户'
      const existingTenants = [
        {
          name: { getValue: () => '其他租户' },
          code: { getValue: () => 'other_tenant' },
          status: { getValue: () => 'ACTIVE' },
          adminUserId: { getValue: () => 'admin-1' },
          settings: { getValue: () => ({}) },
        } as any,
        {
          name: { getValue: () => '另一个租户' },
          code: { getValue: () => 'another_tenant' },
          status: { getValue: () => 'ACTIVE' },
          adminUserId: { getValue: () => 'admin-2' },
          settings: { getValue: () => ({}) },
        } as any,
      ]

      const result = await validator.validateTenantNameUniqueness(name, existingTenants)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该拒绝重复的租户名称', async () => {
      const name = '测试租户'
      const existingTenants = [
        {
          name: { getValue: () => '其他租户' },
          code: { getValue: () => 'other_tenant' },
          status: { getValue: () => 'ACTIVE' },
          adminUserId: { getValue: () => 'admin-1' },
          settings: { getValue: () => ({}) },
        } as any,
        {
          name: { getValue: () => '测试租户' },
          code: { getValue: () => 'test_tenant' },
          status: { getValue: () => 'ACTIVE' },
          adminUserId: { getValue: () => 'admin-2' },
          settings: { getValue: () => ({}) },
        } as any,
      ]

      const result = await validator.validateTenantNameUniqueness(name, existingTenants)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('租户名称 测试租户 已存在')
    })
  })
})
